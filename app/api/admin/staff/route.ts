// app/api/admin/staff/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const connection = await pool.getConnection();

    try {
      await connection.query("ALTER TABLE users ADD COLUMN designation VARCHAR(255) DEFAULT 'Staff'");
    } catch (e) {
    }

    const [staff]: any = await connection.query(`
      SELECT id, name, email, designation, created_at 
      FROM users 
      WHERE role = 'staff'
      ORDER BY created_at DESC
    `);
    connection.release();

    return NextResponse.json({ success: true, data: staff });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, password, designation } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: 'All fields are required.' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    const [existing]: any = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      connection.release();
      return NextResponse.json({ success: false, message: 'Email already exists.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const finalDesignation = designation || 'Support Staff';

    await connection.query(
      'INSERT INTO users (name, email, password, role, designation) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'staff', finalDesignation]
    );

    connection.release();
    return NextResponse.json({ success: true, message: 'Staff added successfully!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to add staff.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, email, password, designation } = await request.json();
    const connection = await pool.getConnection();

    const [existing]: any = await connection.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
    if (existing.length > 0) {
      connection.release();
      return NextResponse.json({ success: false, message: 'Email already used.' }, { status: 400 });
    }

    await connection.query('UPDATE users SET name = ?, email = ?, designation = ? WHERE id = ?', [name, email, designation, id]);

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      await connection.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    }

    connection.release();
    return NextResponse.json({ success: true, message: 'Staff updated successfully!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update staff.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const connection = await pool.getConnection();
    
    if (id) {
      await connection.query("DELETE FROM users WHERE id = ? AND role = 'staff'", [id]);
      connection.release();
      return NextResponse.json({ success: true, message: 'Staff deleted successfully!' });
    }
    
    connection.release();
    return NextResponse.json({ success: false, message: 'Invalid request.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to delete.' }, { status: 500 });
  }
}