// app/api/user/payment/verify/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { sendEmail } from '@/lib/email';

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, minutesToAdd, planName } = await request.json();
    const userId = await getUserId();
    
    if (!userId) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, message: 'Invalid payment signature' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    
    await connection.query(
      'UPDATE transactions SET status = ?, razorpay_payment_id = ? WHERE razorpay_order_id = ?',
      ['success', razorpay_payment_id, razorpay_order_id]
    );

    await connection.query('UPDATE wallets SET balance = balance + ? WHERE user_id = ?', [minutesToAdd, userId]);
    
    const [users]: any = await connection.query('SELECT name, email FROM users WHERE id = ?', [userId]);
    connection.release();

    if (users.length > 0) {
      const emailHtml = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">Payment Successful! 🎉</h2>
          <p>Hi ${users[0].name},</p>
          <p>Your payment for the <strong>${planName}</strong> plan was successful.</p>
          <p><strong>${minutesToAdd} Minutes</strong> have been instantly credited to your AI Portal account.</p>
          <p>Transaction ID: ${razorpay_payment_id}</p>
          <br/>
          <p>Thank you for your business!</p>
        </div>
      `;
      await sendEmail(users[0].email, `Payment Receipt - ${minutesToAdd} Minutes Added`, '', emailHtml);
    }

    return NextResponse.json({ success: true, message: 'Payment verified and minutes added!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Verification failed' }, { status: 500 });
  }
}