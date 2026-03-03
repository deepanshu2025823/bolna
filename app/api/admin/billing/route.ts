// app/api/admin/billing/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const connection = await pool.getConnection();

    const [transactions]: any = await connection.query(`
      SELECT t.*, u.name as user_name, u.email as user_email
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    `);
    
    connection.release();

    return NextResponse.json({ success: true, data: transactions });
  } catch (error: any) {
    console.error('Billing API Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch billing data' }, { status: 500 });
  }
}