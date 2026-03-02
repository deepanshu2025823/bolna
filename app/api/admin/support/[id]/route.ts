// app/api/admin/support/[id]/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import pool from '@/lib/db';

async function getStaffId() {
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

export async function GET(request: Request, context: any) {
  try {
    const { id } = await context.params;
    const connection = await pool.getConnection();
    
    const [tickets]: any = await connection.query(`
      SELECT t.*, u.name as client_name 
      FROM tickets t JOIN users u ON t.client_id = u.id 
      WHERE t.id = ?
    `, [id]);
    
    if (tickets.length === 0) {
      connection.release();
      return NextResponse.json({ success: false, message: 'Ticket not found' }, { status: 404 });
    }

    const [messages]: any = await connection.query(`
      SELECT m.*, u.name as sender_name, u.role as sender_role 
      FROM ticket_messages m 
      JOIN users u ON m.sender_id = u.id 
      WHERE m.ticket_id = ? 
      ORDER BY m.created_at ASC
    `, [id]);

    connection.release();
    return NextResponse.json({ success: true, data: { ticket: tickets[0], messages } });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error fetching chat' }, { status: 500 });
  }
}

export async function POST(request: Request, context: any) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    
    const { id } = await context.params;
    const { message } = await request.json();

    const connection = await pool.getConnection();
    await connection.query(
      'INSERT INTO ticket_messages (ticket_id, sender_id, message) VALUES (?, ?, ?)',
      [id, staffId, message]
    );
    connection.release();

    return NextResponse.json({ success: true, message: 'Reply sent' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to send reply' }, { status: 500 });
  }
}