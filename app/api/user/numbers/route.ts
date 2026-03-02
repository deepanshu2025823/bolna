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

    const bolnaApiKey = process.env.BOLNA_API_KEY;

    if (!bolnaApiKey) {
      return NextResponse.json({ success: false, message: 'Bolna API Key is missing in .env' }, { status: 500 });
    }

    const response = await fetch('https://api.bolna.dev/v1/phone_numbers', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bolnaApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Bolna API Error:', errorText);
      return NextResponse.json({ success: true, data: [] }); 
    }

    const bolnaData = await response.json();
    
    const rawNumbers = Array.isArray(bolnaData) ? bolnaData : (bolnaData.data || []);

    const mappedNumbers = rawNumbers.map((num: any) => ({
      id: num.id || `num_${Math.random().toString(36).substring(7)}`,
      phone: num.phone_number || num.number || 'Unknown Number',
      type: num.type || 'Inbound & Outbound',
      status: num.status || 'Active',
      agent: num.agent_id ? 'Assigned to Agent' : 'Unassigned',
      purchased_on: num.created_at || new Date().toISOString()
    }));

    return NextResponse.json({ success: true, data: mappedNumbers });
  } catch (error: any) {
    console.error('Numbers API Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch phone numbers from Bolna' }, { status: 500 });
  }
}