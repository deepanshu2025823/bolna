// app/api/admin/dashboard/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const connection = await pool.getConnection();

    const [clientCount]: any = await connection.query("SELECT COUNT(*) as count FROM users WHERE role = 'client'");
    const totalClients = clientCount[0].count;

    const [walletData]: any = await connection.query("SELECT SUM(balance) as total_balance FROM wallets w JOIN users u ON w.user_id = u.id WHERE u.role = 'client'");
    const totalBalance = walletData[0].total_balance || 0;

    const [recentActivity]: any = await connection.query(`
      SELECT u.id, u.name, u.email, u.created_at, w.balance 
      FROM users u 
      LEFT JOIN wallets w ON u.id = w.user_id 
      WHERE u.role = 'client' 
      ORDER BY u.created_at DESC 
      LIMIT 5
    `);

    connection.release();

    let totalExecutions = 0;
    let totalAIMinutes = 0;
    const bolnaApiKey = process.env.BOLNA_API_KEY;

    if (bolnaApiKey) {
      try {
        const response = await fetch('https://api.bolna.dev/v1/executions', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${bolnaApiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const bolnaData = await response.json();
          const rawExecutions = Array.isArray(bolnaData) ? bolnaData : (bolnaData.data || []);
          
          totalExecutions = rawExecutions.length;
          
          let totalSeconds = 0;
          rawExecutions.forEach((exec: any) => {
            totalSeconds += (exec.duration || 0);
          });
          totalAIMinutes = Math.ceil(totalSeconds / 60);
        }
      } catch (apiError) {
        console.error("Bolna API fetch failed in Admin Dashboard", apiError);
      }
    }

    const marginPerMinute = 0.15; 
    const netProfit = totalAIMinutes * marginPerMinute;

    return NextResponse.json({
      success: true,
      data: {
        totalClients,
        totalExecutions,     
        totalAIMinutes,      
        netProfit,           
        recentActivity
      }
    });

  } catch (error: any) {
    console.error('Admin Dashboard API Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch dashboard metrics' }, { status: 500 });
  }
}