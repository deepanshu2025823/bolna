// app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ success: false, message: 'Invalid request parameters.' }, { status: 400 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    let payload;
    try {
      const verified = await jwtVerify(token, secret);
      payload = verified.payload;
    } catch (err) {
      return NextResponse.json({ success: false, message: 'Reset link is invalid or has expired. Please request a new one.' }, { status: 401 });
    }

    const userId = payload.userId;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const connection = await pool.getConnection();
    await connection.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
    connection.release();

    return NextResponse.json({ success: true, message: 'Password has been successfully reset.' });

  } catch (error: any) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ success: false, message: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}