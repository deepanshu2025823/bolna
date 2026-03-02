// app/api/user/numbers/route.ts
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
    const [userRow]: any = await connection.query('SELECT bolna_sub_account_id FROM users WHERE id = ?', [userId]);
    connection.release();

    if (userRow.length === 0) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    const simulatedNumbers = [
      { 
        id: 'num_v8x9a1', 
        phone: '+1 (415) 555-8932', 
        type: 'Inbound & Outbound', 
        status: 'Active', 
        agent: 'Sales AI Pilot',
        purchased_on: '2026-02-15T10:00:00Z'
      },
      { 
        id: 'num_k2m5p9', 
        phone: '+44 7700 900122', 
        type: 'Outbound Only', 
        status: 'Active', 
        agent: 'Customer Support Bot',
        purchased_on: '2026-02-28T14:30:00Z'
      }
    ];

    return NextResponse.json({ success: true, data: simulatedNumbers });
  } catch (error: any) {
    console.error('Numbers API Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch phone numbers' }, { status: 500 });
  }
}