// app/api/webhooks/razorpay/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import pool from '@/lib/db';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET!)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);

    if (payload.event === 'subscription.charged') {
      const subscription = payload.payload.subscription.entity;
      const payment = payload.payload.payment.entity;
      
      const userId = subscription.notes?.userId;
      const minutesToAdd = parseInt(subscription.notes?.minutesToAdd || '0');
      const planName = subscription.notes?.planName || 'Plan';

      if (userId && minutesToAdd > 0) {
        const connection = await pool.getConnection();

        await connection.query(
          'INSERT INTO transactions (user_id, razorpay_order_id, razorpay_payment_id, plan_name, amount, status) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, subscription.id, payment.id, planName, (payment.amount / 100), 'success']
        );

        await connection.query('UPDATE wallets SET balance = balance + ? WHERE user_id = ?', [minutesToAdd, userId]);

        const [users]: any = await connection.query('SELECT name, email FROM users WHERE id = ?', [userId]);
        connection.release();

        if (users.length > 0) {
          const emailHtml = `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #2563eb;">Auto-Pay Successful! 🎉</h2>
              <p>Hi ${users[0].name},</p>
              <p>Your monthly auto-renew for the <strong>${planName}</strong> plan was successful.</p>
              <p><strong>${minutesToAdd} Minutes</strong> have been automatically credited to your AI Portal account.</p>
              <br/>
              <p>Thank you for staying with us!</p>
            </div>
          `;
          await sendEmail(users[0].email, `Auto-Pay Success - ${minutesToAdd} Minutes Added`, '', emailHtml);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ success: false, message: 'Webhook failed' }, { status: 500 });
  }
}