// app/api/admin/users/login-as/route.ts
import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { targetUserId } = await request.json();

    if (!targetUserId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    const [users]: any = await connection.query('SELECT * FROM users WHERE id = ?', [targetUserId]);
    connection.release();

    if (users.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const cookieStore = await cookies();

    const currentAdminToken = cookieStore.get('auth_token')?.value;
    if (currentAdminToken) {
      cookieStore.set('admin_backup_token', currentAdminToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, 
      });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ userId: targetUserId, role: users[0].role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    cookieStore.set('auth_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, 
    });

    return NextResponse.json({ success: true, message: 'Switched to account successfully' });
  } catch (error: any) {
    console.error("Login As Error:", error);
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 });
  }
}