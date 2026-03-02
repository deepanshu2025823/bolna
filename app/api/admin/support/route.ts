// app/api/admin/support/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const connection = await pool.getConnection();
    const [tickets]: any = await connection.query(`
      SELECT t.*, u.name as client_name, u.email as client_email 
      FROM tickets t 
      JOIN users u ON t.client_id = u.id 
      ORDER BY 
        CASE WHEN t.status = 'open' THEN 1 ELSE 2 END, 
        t.created_at DESC
    `);
    connection.release();

    return NextResponse.json({ success: true, data: tickets });
  } catch (error: any) {
    console.error('Admin Tickets API Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();
    const connection = await pool.getConnection();
    await connection.query('UPDATE tickets SET status = ? WHERE id = ?', [status, id]);
    connection.release();
    return NextResponse.json({ success: true, message: `Ticket marked as ${status}` });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update status' }, { status: 500 });
  }
}