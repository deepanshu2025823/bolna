// app/api/user/support/[id]/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import pool from '@/lib/db';

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

export async function GET(request: Request, context: any) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    
    const { id } = await context.params;

    const connection = await pool.getConnection();

    const [tickets]: any = await connection.query('SELECT * FROM tickets WHERE id = ? AND client_id = ?', [id, userId]);
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
  } catch (error: any) {
    console.error('Chat GET Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request, context: any) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    
    const { id } = await context.params;
    const { message } = await request.json();

    if (!message || message.trim() === '') {
      return NextResponse.json({ success: false, message: 'Message cannot be empty' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    
    const [tickets]: any = await connection.query('SELECT status FROM tickets WHERE id = ? AND client_id = ?', [id, userId]);
    if (tickets.length === 0) {
      connection.release();
      return NextResponse.json({ success: false, message: 'Ticket not found' }, { status: 404 });
    }

    if (tickets[0].status === 'closed') {
      connection.release();
      return NextResponse.json({ success: false, message: 'Cannot reply to a closed ticket.' }, { status: 400 });
    }

    await connection.query('INSERT INTO ticket_messages (ticket_id, sender_id, message) VALUES (?, ?, ?)', [id, userId, message]);

    connection.release();
    return NextResponse.json({ success: true, message: 'Message sent' });
  } catch (error: any) {
    console.error('Chat POST Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send message' }, { status: 500 });
  }
}