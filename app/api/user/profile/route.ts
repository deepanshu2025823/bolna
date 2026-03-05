// app/api/user/profile/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

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

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const connection = await pool.getConnection();
    
    const [users]: any = await connection.query(`
      SELECT u.id, u.name, u.email, u.role, u.company_name, u.logo_url, u.custom_domain, w.balance 
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
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const connection = await pool.getConnection();

    if (body.tab === 'profile') {
      await connection.query('UPDATE users SET name = ? WHERE id = ?', [body.name, userId]);
      connection.release();
      return NextResponse.json({ success: true, message: 'Profile updated successfully' });
    }

    if (body.tab === 'branding') {
      await connection.query('UPDATE users SET company_name = ?, logo_url = ? WHERE id = ?', [body.company_name, body.logo_url, userId]);
      connection.release();
      return NextResponse.json({ success: true, message: 'Branding updated successfully' });
    }

    if (body.tab === 'domain') {
      const [currentUser]: any = await connection.query('SELECT custom_domain FROM users WHERE id = ?', [userId]);
      
      if (currentUser[0]?.custom_domain) {
        connection.release();
        return NextResponse.json({ success: false, message: 'Domain is already locked. Contact Admin to change it.' }, { status: 400 });
      }

      await connection.query('UPDATE users SET custom_domain = ? WHERE id = ?', [body.custom_domain, userId]);
      connection.release();
      return NextResponse.json({ success: true, message: 'Domain locked and iFrame generated successfully.' });
    }

    if (body.tab === 'security') {
      const [users]: any = await connection.query('SELECT password FROM users WHERE id = ?', [userId]);
      if (users.length === 0) {
        connection.release();
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
      }

      const passwordMatch = await bcrypt.compare(body.currentPassword, users[0].password);
      if (!passwordMatch) {
        connection.release();
        return NextResponse.json({ success: false, message: 'Incorrect current password' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(body.newPassword, 10);
      await connection.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
      connection.release();

      return NextResponse.json({ success: true, message: 'Password updated successfully' });
    }

    connection.release();
    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}