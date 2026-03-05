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
    if (!userId) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const connection = await pool.getConnection();

    const [users]: any = await connection.query('SELECT name, email, company_name, logo_url FROM users WHERE id = ?', [userId]);
    
    const [settings]: any = await connection.query('SELECT custom_domain FROM settings LIMIT 1');
    
    connection.release();

    if (users.length === 0) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    return NextResponse.json({ 
      success: true, 
      data: {
        ...users[0],
        admin_target_domain: settings && settings.length > 0 && settings[0].custom_domain ? settings[0].custom_domain : 'cname.vercel-dns.com'
      } 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { tab } = body;
    const connection = await pool.getConnection();

    if (tab === 'profile') {
      const { name } = body;
      await connection.query('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
    } 
    else if (tab === 'branding') {
      const { company_name, logo_url } = body;
      await connection.query('UPDATE users SET company_name = ?, logo_url = ? WHERE id = ?', [company_name, logo_url, userId]);
    }
    else if (tab === 'security') {
      const { currentPassword, newPassword } = body;
      
      const [users]: any = await connection.query('SELECT password FROM users WHERE id = ?', [userId]);
      const validPassword = await bcrypt.compare(currentPassword, users[0].password);
      
      if (!validPassword) {
        connection.release();
        return NextResponse.json({ success: false, message: 'Current password is incorrect.' }, { status: 400 });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await connection.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId]);
    }

    connection.release();
    return NextResponse.json({ success: true, message: 'Profile updated successfully!' });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update profile.' }, { status: 500 });
  }
}