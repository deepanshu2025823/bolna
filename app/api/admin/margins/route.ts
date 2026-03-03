// app/api/admin/margins/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const connection = await pool.getConnection();

    const [clients]: any = await connection.query(`
      SELECT u.id, u.name, u.email, u.created_at, w.balance 
      FROM users u 
      LEFT JOIN wallets w ON u.id = w.user_id 
      WHERE u.role = 'client'
    `);
    
    connection.release();

    let totalAIMinutes = 0;
    const bolnaApiKey = process.env.BOLNA_API_KEY;

    if (bolnaApiKey) {
      try {
        const response = await fetch('https://api.bolna.dev/v1/executions', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${bolnaApiKey}` }
        });
        
        if (response.ok) {
          const bolnaData = await response.json();
          const rawExecutions = Array.isArray(bolnaData) ? bolnaData : (bolnaData.data || []);
          
          let totalSeconds = 0;
          rawExecutions.forEach((exec: any) => {
            totalSeconds += (exec.duration || 0);
          });
          totalAIMinutes = Math.ceil(totalSeconds / 60);
        }
      } catch (err) {
        console.error("Bolna fetch failed for margins", err);
      }
    }
    
    const clientPricePerMinute = 0.50; 
    const bolnaCostPerMinute = 0.05;   

    const totalRevenue = totalAIMinutes * clientPricePerMinute;
    const totalBolnaCost = totalAIMinutes * bolnaCostPerMinute;
    const netProfit = totalRevenue - totalBolnaCost;
    
    const marginPercentage = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalBolnaCost,
        netProfit,
        marginPercentage,
        clientData: clients 
      }
    });

  } catch (error: any) {
    console.error('Margin API Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch margin data' }, { status: 500 });
  }
}