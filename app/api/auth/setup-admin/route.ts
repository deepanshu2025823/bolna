// app/api/auth/setup-admin/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const connection = await pool.getConnection();
    
    const [existingAdmin]: any = await connection.query('SELECT * FROM users WHERE email = ?', ['mr.deepanshujoshi@gmail.com']);
    
    if (existingAdmin.length > 0) {
      connection.release();
      return NextResponse.json({ message: 'Admin already exists!' });
    }

    const hashedPassword = await bcrypt.hash('1234567890', 10);
    await connection.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Deepanshu Joshi', 'mr.deepanshujoshi@gmail.com', hashedPassword, 'admin']
    );

    connection.release();
    return NextResponse.json({ success: true, message: 'Admin account created! Email: mr.deepanshujoshi@gmail.com | Pass: 1234567890' });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}