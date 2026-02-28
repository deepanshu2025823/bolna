// app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const connection = await pool.getConnection();
    const [users]: any = await connection.query(`
      SELECT u.id, u.name, u.email, u.bolna_sub_account_id, u.created_at, w.balance 
      FROM users u 
      LEFT JOIN wallets w ON u.id = w.user_id 
      WHERE u.role = 'client'
      ORDER BY u.created_at DESC
    `);
    connection.release();

    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: 'All fields are required.' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    const [existing]: any = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      connection.release();
      return NextResponse.json({ success: false, message: 'Email already exists.' }, { status: 400 });
    }

    let bolnaSubAccountId = `simulated_bolna_${Date.now()}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult]: any = await connection.query(
      'INSERT INTO users (name, email, password, role, bolna_sub_account_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'client', bolnaSubAccountId]
    );

    const newUserId = userResult.insertId;
    await connection.query('INSERT INTO wallets (user_id, balance) VALUES (?, ?)', [newUserId, 0.00]);

    connection.release();
    return NextResponse.json({ success: true, message: 'Client created successfully!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to create client.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, email, password, balance } = await request.json();

    if (!id || !name || !email) {
      return NextResponse.json({ success: false, message: 'ID, Name, and Email are required.' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    const [existing]: any = await connection.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
    if (existing.length > 0) {
      connection.release();
      return NextResponse.json({ success: false, message: 'Email already used by another account.' }, { status: 400 });
    }

    await connection.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      await connection.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    }

    if (balance !== undefined) {
      await connection.query('UPDATE wallets SET balance = ? WHERE user_id = ?', [parseFloat(balance), id]);
    }

    connection.release();
    return NextResponse.json({ success: true, message: 'Client updated successfully!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update client.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    const connection = await pool.getConnection();

    if (action === 'clear_all') {
      await connection.query("DELETE FROM users WHERE role = 'client'");
      connection.release();
      return NextResponse.json({ success: true, message: 'All client records cleared!' });
    } 
    else if (id) {
      await connection.query('DELETE FROM users WHERE id = ?', [id]);
      connection.release();
      return NextResponse.json({ success: true, message: 'Client deleted successfully!' });
    }

    connection.release();
    return NextResponse.json({ success: false, message: 'Invalid delete request.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to delete data.' }, { status: 500 });
  }
}