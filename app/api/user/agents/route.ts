// app/api/user/agents/route.ts
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
    return adminApiKey; // Fallback to admin key if sub-account key fails
  } catch (err) {
    return null;
  }
}

export async function GET() {
  try {
    const token = await getUserBolnaToken();
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const res = await fetch('https://api.bolna.ai/v2/agent', {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    });

    if (!res.ok) throw new Error('Failed to fetch agents from Bolna');
    
    const data = await res.json();
    return NextResponse.json({ success: true, data: data.data || data || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = await getUserBolnaToken();
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { agent_name, prompt, welcome_message } = await request.json();

    if (!agent_name) {
      return NextResponse.json({ success: false, message: 'Agent name is required' }, { status: 400 });
    }

    const payload = {
      "agent_config": {
        "agent_name": agent_name,
        "agent_welcome_message": welcome_message || "Hello! How can I assist you today?",
        "agent_type": "other",
        "tasks": [
          {
            "task_type": "conversation",
            "task_config": {
               "hangup_after_silence": 10,
               "voicemail": false
            }
          }
        ]
      },
      "agent_prompts": {
        "system_prompt": prompt || "You are a helpful and polite AI assistant."
      }
    };

    const res = await fetch('https://api.bolna.ai/v2/agent', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const errData = await res.text();
        throw new Error(errData || 'Failed to create agent');
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data });
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

    if (!id) return NextResponse.json({ success: false, message: 'Agent ID required' }, { status: 400 });

    const res = await fetch(`https://api.bolna.ai/v2/agent/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to delete agent');

    return NextResponse.json({ success: true, message: 'Agent deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}