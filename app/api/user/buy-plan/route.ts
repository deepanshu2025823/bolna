// app/api/user/buy-plan/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { planId } = await request.json();
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId;

    const connection = await pool.getConnection();

    const [plans]: any = await connection.query('SELECT * FROM plans WHERE id = ?', [planId]);
    if (plans.length === 0) {
      connection.release();
      return NextResponse.json({ success: false, message: 'Plan not found' }, { status: 404 });
    }
    const plan = plans[0];

    await connection.query('UPDATE wallets SET balance = balance + ? WHERE user_id = ?', [plan.allocated_credits, userId]);

    connection.release();
    return NextResponse.json({ success: true, message: `Successfully purchased ${plan.name} Plan! Added ${plan.allocated_credits} credits.` });

  } catch (error: any) {
    console.error('Buy Plan Error:', error);
    return NextResponse.json({ success: false, message: 'Transaction failed.' }, { status: 500 });
  }
}