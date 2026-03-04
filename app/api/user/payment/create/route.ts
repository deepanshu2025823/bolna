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
    if (!userId) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const body = await request.json(); 
    const amount = Number(body.amount);
    const planName = body.planName || 'Basic';
    const minutesToAdd = body.minutesToAdd || 0;
    const isTopup = body.isTopup || false; 

    const connection = await pool.getConnection();

    if (isTopup) {
      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), 
        currency: 'USD', 
        receipt: `receipt_${Date.now()}`,
        notes: {
          userId: userId.toString(),
          planName: planName,
          minutesToAdd: minutesToAdd.toString(),
          isTopup: 'true'
        }
      });

      await connection.query(
        'INSERT INTO transactions (user_id, razorpay_order_id, plan_name, amount, status) VALUES (?, ?, ?, ?, ?)',
        [userId, order.id, planName, amount, 'pending']
      );
      connection.release();

      return NextResponse.json({ success: true, isTopup: true, order });
    } 

    else {
      let rzpPlanId = '';
      const nameLower = planName.toLowerCase();
      
      if (nameLower.includes('basic')) {
        rzpPlanId = 'plan_SMt2tNCwLdFR4b';
      } else if (nameLower.includes('growth')) {
        rzpPlanId = 'plan_SMt481DFct7vO0';
      } else if (nameLower.includes('premium')) {
        rzpPlanId = 'plan_SMt4kgOzJ6gso4';
      } else {
        connection.release();
        return NextResponse.json({ success: false, message: "Invalid Plan Configuration." }, { status: 400 });
      }

      const subscription = await razorpay.subscriptions.create({
        plan_id: rzpPlanId,
        customer_notify: 1,
        total_count: 120, 
        notes: {
          userId: userId.toString(),
          planName: planName,
          minutesToAdd: minutesToAdd.toString(),
          isTopup: 'false'
        }
      });

      await connection.query(
        'INSERT INTO transactions (user_id, razorpay_order_id, plan_name, amount, status) VALUES (?, ?, ?, ?, ?)',
        [userId, subscription.id, planName, amount, 'pending']
      );
      connection.release();

      return NextResponse.json({ success: true, isTopup: false, subscription });
    }
    
  } catch (error: any) {
    console.error("Razorpay Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}