// app/api/user/payment/create/route.ts
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
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
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("CRITICAL: Razorpay keys are missing!");
      return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const body = await request.json(); 
    const amount = Number(body.amount);
    const planName = body.planName || 'Custom Plan';
    
    if (!amount || isNaN(amount)) {
      return NextResponse.json({ success: false, message: "Invalid amount provided." }, { status: 400 });
    }

    const amountInINR = Math.round(amount * 83); 
    const amountInPaise = amountInINR * 100;

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    const connection = await pool.getConnection();
    await connection.query(
      'INSERT INTO transactions (user_id, razorpay_order_id, plan_name, amount, status) VALUES (?, ?, ?, ?, ?)',
      [userId, order.id, planName, amount, 'pending']
    );
    connection.release();

    return NextResponse.json({ success: true, order });
    
  } catch (error: any) {
    console.error("Razorpay Create Order Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}