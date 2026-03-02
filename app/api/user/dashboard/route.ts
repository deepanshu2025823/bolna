// app/api/user/dashboard/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import pool from '@/lib/db';

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload.userId;
  } catch (err) {
    return null;
  }
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const connection = await pool.getConnection();
    const [userRow]: any = await connection.query(`
      SELECT w.balance, u.bolna_sub_account_id 
      FROM users u 
      LEFT JOIN wallets w ON u.id = w.user_id 
      WHERE u.id = ?
    `, [userId]);
    connection.release();

    if (userRow.length === 0) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    const balance = Number(userRow[0].balance) || 0;

    if (balance <= 0) {
      return NextResponse.json({ 
        success: true, 
        data: { hasBalance: false }
      });
    }

    const bolnaApiKey = process.env.BOLNA_API_KEY;
    if (!bolnaApiKey) {
       console.error("Missing Bolna API Key in environment variables.");
       return NextResponse.json({ success: false, message: 'API Key missing' }, { status: 500 });
    }

    const response = await fetch('https://api.bolna.dev/v1/executions', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bolnaApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    let rawExecutions = [];
    if (response.ok) {
        const bolnaData = await response.json();
        rawExecutions = Array.isArray(bolnaData) ? bolnaData : (bolnaData.data || bolnaData.executions || []);
    } else {
        console.error('Bolna API Error:', await response.text());
    }

    let totalExecutions = rawExecutions.length;
    let totalDuration = 0;
    let completedCount = 0;

    const mappedLogs = rawExecutions.map((exec: any) => {
        const duration = exec.duration || 0;
        const status = exec.status ? exec.status.toLowerCase() : 'completed';
        
        totalDuration += duration;
        if (status === 'completed' || status === 'success') {
            completedCount++;
        }

        return {
            id: exec.id || exec.execution_id || `exe_${Math.random().toString(36).substring(7)}`,
            phone: exec.customer_number || exec.to || 'Unknown Number',
            type: exec.agent_id ? 'AI Agent Call' : 'Outbound',
            duration: duration,
            time: exec.created_at ? new Date(exec.created_at).toLocaleString() : new Date().toLocaleString(),
            status: status === 'completed' ? 'Completed' : 'Failed'
        };
    });

    const avgDuration = totalExecutions > 0 ? (totalDuration / totalExecutions).toFixed(1) : '0.0';

    return NextResponse.json({
      success: true,
      data: {
        hasBalance: true,
        metrics: {
          totalExecutions,
          totalDuration: totalDuration, 
          avgDuration,
          completedCount
        },
        logs: mappedLogs 
      }
    });

  } catch (error: any) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}