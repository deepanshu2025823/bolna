// app/api/user/profile/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import pool from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId;

    const connection = await pool.getConnection();
    const [users]: any = await connection.query(`
      SELECT u.id, u.name, u.email, u.bolna_sub_account_id, w.balance 
      FROM users u 
      LEFT JOIN wallets w ON u.id = w.user_id 
      WHERE u.id = ?
    `, [userId]);
    connection.release();

    if (users.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: users[0] });

  } catch (error: any) {
    console.error('Profile API Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch profile' }, { status: 500 });
  }
}