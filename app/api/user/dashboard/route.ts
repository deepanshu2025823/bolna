// app/api/user/dashboard/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import pool from '@/lib/db';

async function getUserBolnaTokenAndBalance() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId;

    const connection = await pool.getConnection();
    const [userRow]: any = await connection.query(
      'SELECT u.bolna_sub_account_id, w.balance FROM users u LEFT JOIN wallets w ON u.id = w.user_id WHERE u.id = ?',
      [userId]
    );
    connection.release();

    if (userRow.length === 0 || !userRow[0].bolna_sub_account_id) return null;

    const subAccountId = userRow[0].bolna_sub_account_id;
    const balance = Number(userRow[0].balance || 0);
    const adminApiKey = process.env.BOLNA_API_KEY;

    const accountsRes = await fetch('https://api.bolna.ai/sub-accounts/all', {
      headers: { 'Authorization': `Bearer ${adminApiKey}` },
      cache: 'no-store'
    });

    let subAccountApiKey = adminApiKey;
    if (accountsRes.ok) {
      const accounts = await accountsRes.json();
      const target = accounts.find((a: any) => a.id === subAccountId);
      if (target && target.api_key) subAccountApiKey = target.api_key;
    }
    
    return { token: subAccountApiKey, balance };
  } catch (err) {
    return null;
  }
}

export async function GET() {
  try {
    const authData = await getUserBolnaTokenAndBalance();
    if (!authData) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { token, balance } = authData;
    const hasBalance = balance > 0;

    if (!hasBalance) {
       return NextResponse.json({ 
           success: true, 
           data: { hasBalance: false, metrics: null, logs: [] } 
       });
    }

    const agentsRes = await fetch('https://api.bolna.ai/v2/agent', {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    });

    let allExecutions: any[] = [];
    if (agentsRes.ok) {
       const agentsData = await agentsRes.json();
       const agents = agentsData.data || agentsData || [];
       
       for (const agent of agents) {
          if (agent.id) {
             const execRes = await fetch(`https://api.bolna.ai/v2/agent/${agent.id}/executions?page_number=1&page_size=50`, {
               headers: { 'Authorization': `Bearer ${token}` },
               cache: 'no-store'
             });
             
             if (execRes.ok) {
                const execData = await execRes.json();
                if (execData.data) {
                   const execsWithAgent = execData.data.map((ex: any) => ({...ex, agent_name: agent.agent_name}));
                   allExecutions = [...allExecutions, ...execsWithAgent];
                }
             }
          }
       }
    }

    allExecutions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const totalExecutions = allExecutions.length;
    let totalDuration = 0;
    let completedCount = 0;

    const formattedLogs = allExecutions.map(exec => {
        const duration = exec.conversation_time || (exec.telephony_data?.duration || 0);
        totalDuration += duration;
        if (exec.status === 'completed') completedCount++;

        return {
           id: exec.id,
           phone: exec.telephony_data?.to_number || exec.telephony_data?.from_number || 'Unknown',
           type: exec.telephony_data?.call_type || 'outbound',
           duration: duration,
           time: new Date(exec.created_at).toLocaleString(),
           status: exec.status,
           recording_url: exec.telephony_data?.recording_url || null, 
           agent_name: exec.agent_name || 'Agent',
           total_cost: exec.total_cost || 0
        };
    });

    const avgDuration = totalExecutions > 0 ? (totalDuration / totalExecutions) : 0;

    return NextResponse.json({ 
        success: true, 
        data: { 
            hasBalance: true, 
            metrics: {
                totalExecutions,
                totalDuration,
                completedCount,
                avgDuration
            }, 
            logs: formattedLogs 
        } 
    });
  } catch (error: any) {
    console.error('Dashboard Executions API Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}