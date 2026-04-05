// app/api/user/numbers/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import pool from '@/lib/db';

async function getUserBolnaToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId;

    const connection = await pool.getConnection();
    const [userRow]: any = await connection.query('SELECT bolna_sub_account_id FROM users WHERE id = ?', [userId]);
    connection.release();

    if (userRow.length === 0 || !userRow[0].bolna_sub_account_id) return null;

    const subAccountId = userRow[0].bolna_sub_account_id;
    const adminApiKey = process.env.BOLNA_API_KEY;

    const accountsRes = await fetch('https://api.bolna.ai/sub-accounts/all', {
      headers: { 'Authorization': `Bearer ${adminApiKey}` },
      cache: 'no-store'
    });

    if (accountsRes.ok) {
      const accounts = await accountsRes.json();
      const target = accounts.find((a: any) => a.id === subAccountId);
      if (target && target.api_key) return target.api_key;
    }
    
    return adminApiKey; // Fallback
  } catch (err) {
    return null;
  }
}

export async function GET() {
  try {
    const token = await getUserBolnaToken();
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized or missing sub-account API key' }, { status: 401 });
    }

    const response = await fetch('https://api.bolna.ai/phone-numbers/all', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Bolna API Error:', errorText);
      return NextResponse.json({ success: true, data: [] }); 
    }

    const bolnaData = await response.json();
    const rawNumbers = Array.isArray(bolnaData) ? bolnaData : (bolnaData.data || []);

    const mappedNumbers = rawNumbers.map((num: any) => ({
      id: num.id,
      phone: num.phone_number,
      type: num.telephony_provider || 'Provider',
      status: num.rented ? 'Active' : 'Inactive',
      agent: num.agent_id ? 'Assigned to Agent' : 'Unassigned',
      purchased_on: num.created_at,
      price: num.price || '$0.0'
    }));

    return NextResponse.json({ success: true, data: mappedNumbers });
  } catch (error: any) {
    console.error('Numbers API Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch phone numbers from Bolna' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = await getUserBolnaToken();
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    
    const response = await fetch('https://api.bolna.ai/phone-numbers/buy', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || 'Failed to buy number');
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data, message: 'Number purchased successfully!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const token = await getUserBolnaToken();
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, message: 'Phone Number ID required' }, { status: 400 });

    const response = await fetch(`https://api.bolna.ai/phone-numbers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || 'Failed to delete number');
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data, message: 'Number removed successfully!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}