// app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { SignJWT } from 'jose';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const connection = await pool.getConnection();

    const [users]: any = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    connection.release();

    if (users.length === 0) {
      return NextResponse.json({ success: true, message: 'If this email is registered, a reset link has been sent.' });
    }

    const user = users[0];

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('15m')
      .sign(secret);

    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px; text-align: center;">
        <h2 style="color: #1e293b; text-align: center;">Password Reset Request</h2>
        <p style="color: #475569; font-size: 16px;">Hello ${user.name},</p>
        <p style="color: #475569; font-size: 16px;">We received a request to reset your password for your AI Voice Portal account. Click the button below to choose a new password. This link is valid for <strong>15 minutes</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 14px; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `;

    const emailResult = await sendEmail(user.email, 'Reset Your Password - AI Voice Portal', 'Click the link to reset your password.', htmlContent);

    if (!emailResult.success) {
      throw new Error('Failed to send email');
    }

    return NextResponse.json({ success: true, message: 'If this email is registered, a reset link has been sent.' });

  } catch (error: any) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json({ success: false, message: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}