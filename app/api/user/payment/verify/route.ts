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
    const body = await request.json();
    const { 
      razorpay_subscription_id, 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      minutesToAdd, 
      planName,
      isTopup
    } = body;
    
    const userId = await getUserId();
    
    if (!userId) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    let bodyStr = "";
    if (isTopup) {
      bodyStr = razorpay_order_id + "|" + razorpay_payment_id;
    } else {
      bodyStr = razorpay_payment_id + "|" + razorpay_subscription_id;
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(bodyStr.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, message: 'Invalid payment signature' }, { status: 400 });
    }

    const targetOrderId = isTopup ? razorpay_order_id : razorpay_subscription_id;
    const connection = await pool.getConnection();
    
    await connection.query(
      'UPDATE transactions SET status = ?, razorpay_payment_id = ? WHERE razorpay_order_id = ?',
      ['success', razorpay_payment_id, targetOrderId]
    );

    await connection.query('UPDATE wallets SET balance = balance + ? WHERE user_id = ?', [minutesToAdd, userId]);
    
    const [users]: any = await connection.query('SELECT name, email FROM users WHERE id = ?', [userId]);
    connection.release();

    if (users.length > 0) {
      const isTopupEmailText = isTopup ? 'One-time Top-up' : 'Auto-pay Subscription';
      const isTopupEmailRenewalText = isTopup ? '' : '<p>Your plan will auto-renew next month.</p>';
      const emailHtml = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">Payment Successful! 🎉</h2>
          <p>Hi ${users[0].name},</p>
          <p>Your ${isTopupEmailText} for <strong>${planName}</strong> is now active.</p>
          <p><strong>${minutesToAdd} Minutes</strong> have been instantly credited to your AI Portal account.</p>
          <p>Transaction ID: ${razorpay_payment_id}</p>
          <br/>
          ${isTopupEmailRenewalText}
          <p>Thank you for your business!</p>
        </div>
      `;
      await sendEmail(users[0].email, `${isTopupEmailText} Active - ${minutesToAdd} Minutes Added`, '', emailHtml);
    }

    return NextResponse.json({ success: true, message: 'Payment verified and minutes added!' });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ success: false, message: 'Verification failed' }, { status: 500 });
  }
}