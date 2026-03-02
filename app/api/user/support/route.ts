// app/api/user/support/route.ts
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

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const connection = await pool.getConnection();
    const [tickets]: any = await connection.query(`
      SELECT id, subject, status, created_at 
      FROM tickets 
      WHERE client_id = ? 
      ORDER BY created_at DESC
    `, [userId]);
    connection.release();

    return NextResponse.json({ success: true, data: tickets });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { subject, contact, message } = await request.json();

    if (!subject || !message) {
      return NextResponse.json({ success: false, message: 'Subject and issue description are required.' }, { status: 400 });
    }

    const firstMessage = contact ? `**Contact Details:** ${contact}\n\n**Issue Description:**\n${message}` : message;

    const connection = await pool.getConnection();
    
    const [ticketResult]: any = await connection.query(
      "INSERT INTO tickets (client_id, subject, status) VALUES (?, ?, 'open')",
      [userId, subject]
    );
    const ticketId = ticketResult.insertId;

    await connection.query(
      'INSERT INTO ticket_messages (ticket_id, sender_id, message) VALUES (?, ?, ?)',
      [ticketId, userId, firstMessage]
    );

    connection.release();
    return NextResponse.json({ success: true, message: 'Support ticket created successfully!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to create ticket.' }, { status: 500 });
  }
}