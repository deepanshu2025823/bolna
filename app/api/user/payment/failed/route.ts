// app/api/user/payment/failed/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

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

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { razorpay_order_id, razorpay_payment_id, reason } = await request.json();

    if (razorpay_order_id) {
      const connection = await pool.getConnection();
      await connection.query(
        'UPDATE transactions SET status = ?, razorpay_payment_id = ?, failure_reason = ? WHERE razorpay_order_id = ?',
        ['failed', razorpay_payment_id || null, reason, razorpay_order_id]
      );
      connection.release();
    }

    return NextResponse.json({ success: true, message: 'Failure logged' });
  } catch (error: any) {
    console.error("Log failure error:", error);
    return NextResponse.json({ success: false, message: 'Failed to log error' }, { status: 500 });
  }
}