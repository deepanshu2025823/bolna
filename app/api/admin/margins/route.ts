// app/api/admin/margins/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const connection = await pool.getConnection();

    // 1. Fetch Clients Data
    const [clients]: any = await connection.query(`
      SELECT u.id, u.name, u.email, u.created_at, COALESCE(w.balance, 0) as balance 
      FROM users u 
      LEFT JOIN wallets w ON u.id = w.user_id 
      WHERE u.role = 'client'
      ORDER BY u.created_at DESC
    `);
    
    connection.release();

    let totalSeconds = 0;
    let totalBolnaCost = 0; // Exact real cost billed by Bolna
    const bolnaApiKey = process.env.BOLNA_API_KEY;

    if (bolnaApiKey) {
      try {
        // 🚀 NEW: Correct Usage API for precise billing 🚀
        const response = await fetch('https://api.bolna.ai/sub-accounts/all/usage', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${bolnaApiKey}` },
          cache: 'no-store'
        });
        
        if (response.ok) {
          const bolnaData = await response.json();
          const usages = Array.isArray(bolnaData) ? bolnaData : [];
          
          usages.forEach((usage: any) => {
            totalSeconds += (Number(usage.total_duration) || 0);
            // Bolna api seedha "total_cost" deta hai, hum usi ko use karenge hardcoded 0.05 ki jagah
            totalBolnaCost += (Number(usage.total_cost) || 0); 
          });
        } else {
          console.error("Bolna margins fetch error:", await response.text());
        }
      } catch (err) {
        console.error("Bolna fetch failed for margins", err);
      }
    }
    
    // 2. Calculate Minutes
    const totalAIMinutes = Math.ceil(totalSeconds / 60);
    
    // 3. Revenue Calculation (As per your business logic: $0.50 per minute)
    const clientPricePerMinute = 0.50; 
    const totalRevenue = totalAIMinutes * clientPricePerMinute;

    // 4. Exact Profit & Margin Calculation
    const netProfit = totalRevenue - totalBolnaCost;
    
    let marginPercentage = '0.0';
    if (totalRevenue > 0) {
      marginPercentage = ((netProfit / totalRevenue) * 100).toFixed(1);
    } else if (totalBolnaCost > 0) {
      marginPercentage = '-100.0'; // Loss scenario if costs occurred but 0 revenue
    }

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