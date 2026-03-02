// app/api/admin/settings/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

async function getAdminId() {
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
    const adminId = await getAdminId();
    if (!adminId) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const connection = await pool.getConnection();

    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        portal_name VARCHAR(255) DEFAULT 'AI Portal Pro',
        support_email VARCHAR(255) DEFAULT 'support@company.com',
        bolna_api_key VARCHAR(255) DEFAULT ''
      )
    `);

    const [settingsCheck]: any = await connection.query('SELECT * FROM settings LIMIT 1');
    if (settingsCheck.length === 0) {
      await connection.query("INSERT INTO settings (portal_name, support_email) VALUES ('AI Portal Pro', 'support@company.com')");
    }

    const [settings]: any = await connection.query('SELECT * FROM settings LIMIT 1');
    
    const [admin]: any = await connection.query('SELECT name, email FROM users WHERE id = ?', [adminId]);

    connection.release();

    return NextResponse.json({ 
      success: true, 
      data: {
        settings: settings[0],
        admin: admin[0]
      }
    });
  } catch (error: any) {
    console.error('Settings GET Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const adminId = await getAdminId();
    if (!adminId) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { tab } = body;
    const connection = await pool.getConnection();

    if (tab === 'general') {
      const { portal_name, support_email, admin_name } = body;
      await connection.query('UPDATE settings SET portal_name = ?, support_email = ?', [portal_name, support_email]);
      await connection.query('UPDATE users SET name = ? WHERE id = ?', [admin_name, adminId]);
      
    } else if (tab === 'api') {
      const { bolna_api_key } = body;
      await connection.query('UPDATE settings SET bolna_api_key = ?', [bolna_api_key]);

    } else if (tab === 'security') {
      const { current_password, new_password } = body;
      
      const [users]: any = await connection.query('SELECT password FROM users WHERE id = ?', [adminId]);
      const validPassword = await bcrypt.compare(current_password, users[0].password);
      
      if (!validPassword) {
        connection.release();
        return NextResponse.json({ success: false, message: 'Current password is incorrect.' }, { status: 400 });
      }

      const hashedNewPassword = await bcrypt.hash(new_password, 10);
      await connection.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, adminId]);
    }

    connection.release();
    return NextResponse.json({ success: true, message: 'Settings updated successfully!' });

  } catch (error: any) {
    console.error('Settings PUT Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update settings.' }, { status: 500 });
  }
}