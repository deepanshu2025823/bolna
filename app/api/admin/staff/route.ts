// app/api/admin/staff/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const connection = await pool.getConnection();
    
    const [staff]: any = await connection.query(`
      SELECT id, name, email, designation, permissions, created_at 
      FROM users 
      WHERE role = 'staff'
      ORDER BY created_at DESC
    `);
    
    connection.release();

    const parsedStaff = staff.map((member: any) => ({
      ...member,
      permissions: member.permissions ? JSON.parse(member.permissions) : []
    }));

    return NextResponse.json({ success: true, data: parsedStaff });
  } catch (error: any) {
    console.error('Staff fetch error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, designation, permissions } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: 'Name, Email, and Password are required.' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    const [existing]: any = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      connection.release();
      return NextResponse.json({ success: false, message: 'Email already exists.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const permissionsString = permissions ? JSON.stringify(permissions) : JSON.stringify([]);

    await connection.query(
      'INSERT INTO users (name, email, password, role, designation, permissions) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'staff', designation || 'Staff', permissionsString]
    );

    connection.release();
    return NextResponse.json({ success: true, message: 'Staff member added successfully!' });
  } catch (error: any) {
    console.error('Staff create error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create staff.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, password, designation, permissions } = body;

    if (!id || !name || !email) {
      return NextResponse.json({ success: false, message: 'ID, Name, and Email are required.' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    const [existing]: any = await connection.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
    if (existing.length > 0) {
      connection.release();
      return NextResponse.json({ success: false, message: 'Email already used by another account.' }, { status: 400 });
    }

    const permissionsString = permissions ? JSON.stringify(permissions) : JSON.stringify([]);

    await connection.query(
      'UPDATE users SET name = ?, email = ?, designation = ?, permissions = ? WHERE id = ?', 
      [name, email, designation, permissionsString, id]
    );

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      await connection.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    }

    connection.release();
    return NextResponse.json({ success: true, message: 'Staff updated successfully!' });
  } catch (error: any) {
    console.error('Staff update error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update staff.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, message: 'Staff ID is required.' }, { status: 400 });

    const connection = await pool.getConnection();
    await connection.query('DELETE FROM users WHERE id = ? AND role = "staff"', [id]);
    connection.release();

    return NextResponse.json({ success: true, message: 'Staff deleted successfully!' });
  } catch (error: any) {
    console.error('Staff delete error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete staff.' }, { status: 500 });
  }
}