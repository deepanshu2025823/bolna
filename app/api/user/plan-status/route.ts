// app/api/user/plan-status/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, hasPurchased: false });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId;

    const connection = await pool.getConnection();
    const [transactions]: any = await connection.query(
      'SELECT id FROM transactions WHERE user_id = ? AND status = "success" LIMIT 1', 
      [userId]
    );
    connection.release();

    return NextResponse.json({ 
      success: true, 
      hasPurchased: transactions.length > 0 
    });
    
  } catch (error) {
    console.error('Error checking plan status:', error);
    return NextResponse.json({ success: false, hasPurchased: false });
  }
}