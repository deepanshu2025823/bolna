// app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'all';

    let timeFilter = '';
    if (timeframe === 'today') {
      timeFilter = 'AND t.created_at >= CURDATE()';
    } else if (timeframe === 'week') {
      timeFilter = 'AND t.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    } else if (timeframe === 'month') {
      timeFilter = 'AND t.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    }

    const connection = await pool.getConnection();
    const bolnaApiKey = process.env.BOLNA_API_KEY;

    if (bolnaApiKey) {
      try {
        const subAccountsRes = await fetch('https://api.bolna.ai/sub-accounts/all', {
          headers: { 'Authorization': `Bearer ${bolnaApiKey}` },
          cache: 'no-store'
        });

        if (subAccountsRes.ok) {
          const bolnaSubAccounts = await subAccountsRes.json();
          if (Array.isArray(bolnaSubAccounts)) {
            const [existingUsers]: any = await connection.query('SELECT bolna_sub_account_id FROM users WHERE role = "client"');
            const existingIds = existingUsers.map((u: any) => u.bolna_sub_account_id);

            let syncCount = 0;
            for (const subAcc of bolnaSubAccounts) {
              if (subAcc.id && !existingIds.includes(subAcc.id)) {
                 const dummyEmail = `imported_${subAcc.id.substring(0,8)}@bolna.local`;
                 const dummyPassword = await bcrypt.hash('imported123', 10); 
                 
                 const [insertRes]: any = await connection.query(
                   'INSERT INTO users (name, email, password, role, bolna_sub_account_id) VALUES (?, ?, ?, ?, ?)',
                   [subAcc.name || 'Bolna Imported User', dummyEmail, dummyPassword, 'client', subAcc.id]
                 );
                 await connection.query('INSERT INTO wallets (user_id, balance) VALUES (?, ?)', [insertRes.insertId, 0.00]);
                 syncCount++;
              }
            }
          }
        }
      } catch (e) {
        console.error("Auto-Sync error:", e);
      }
    }

    const query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        u.bolna_sub_account_id, 
        u.created_at,
        COALESCE(w.balance, 0) as balance,
        (
          SELECT COALESCE(SUM(amount), 0) 
          FROM transactions t 
          WHERE t.user_id = u.id AND t.status = 'success' ${timeFilter}
        ) as amount_spent
      FROM users u
      LEFT JOIN wallets w ON u.id = w.user_id
      WHERE u.role = 'client'
      ORDER BY u.created_at DESC
    `;

    const [users]: any = await connection.query(query);
    connection.release();

    // 🚀 NEW: Fetching BOTH Duration AND Cost from Bolna Usage 🚀
    let bolnaUsageMap: Record<string, { duration: number, cost: number }> = {};
    if (bolnaApiKey) {
      try {
        const usageRes = await fetch('https://api.bolna.ai/sub-accounts/all/usage', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${bolnaApiKey}` },
          cache: 'no-store'
        });

        if (usageRes.ok) {
          const usageData = await usageRes.json();
          if (Array.isArray(usageData)) {
            usageData.forEach((u: any) => {
              if (u.sub_account_id) {
                bolnaUsageMap[u.sub_account_id] = {
                   duration: u.total_duration || 0,
                   cost: u.total_cost || 0
                };
              }
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch Bolna usage:", err);
      }
    }

    const usersWithUsage = users.map((u: any) => {
      const usage = bolnaUsageMap[u.bolna_sub_account_id];
      return {
        ...u,
        minutes_used: usage ? Math.ceil(usage.duration / 60) : 0,
        // 🚀 Replacing Local DB Cost with Real Bolna Cost 🚀
        amount_spent: usage ? Number(usage.cost).toFixed(3) : Number(u.amount_spent).toFixed(3)
      };
    });

    return NextResponse.json({ success: true, data: usersWithUsage });
  } catch (error: any) {
    console.error('Users fetch error:', error);
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

    let bolnaSubAccountId = '';
    const bolnaApiKey = process.env.BOLNA_API_KEY;

    if (!bolnaApiKey) {
      connection.release();
      return NextResponse.json({ success: false, message: 'Bolna API key is missing in server configuration.' }, { status: 500 });
    }

    try {
      const bolnaRes = await fetch('https://api.bolna.ai/sub-accounts/create', { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bolnaApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, allow_concurrent_calls: 10, multi_tenant: false })
      });

      if (!bolnaRes.ok) {
        connection.release();
        return NextResponse.json({ success: false, message: 'Failed to create sub-account on Bolna.' }, { status: 500 });
      }

      const bolnaData = await bolnaRes.json();
      if (bolnaData?.id) bolnaSubAccountId = bolnaData.id; 
      else if (bolnaData?.['sub-account']?.id) bolnaSubAccountId = bolnaData['sub-account'].id; 
      else if (bolnaData?.data?.[0]?.id) bolnaSubAccountId = bolnaData.data[0].id; 
      else {
           connection.release();
           return NextResponse.json({ success: false, message: 'Invalid response from Bolna API.' }, { status: 500 });
      }
    } catch (bolnaError) {
      connection.release();
      return NextResponse.json({ success: false, message: 'Error communicating with Bolna API.' }, { status: 500 });
    }

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

    const bolnaApiKey = process.env.BOLNA_API_KEY;
    if (bolnaApiKey) {
      const [currentUser]: any = await connection.query('SELECT bolna_sub_account_id FROM users WHERE id = ?', [id]);
      const bolnaSubId = currentUser[0]?.bolna_sub_account_id;

      if (bolnaSubId) {
        try {
          await fetch(`https://api.bolna.ai/sub-accounts/${bolnaSubId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${bolnaApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: name, allow_concurrent_calls: 10 })
          });
        } catch (e) {
          console.error("Failed to update Bolna sub-account:", e);
        }
      }
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
    const bolnaApiKey = process.env.BOLNA_API_KEY;

    if (action === 'clear_all') {
      if (bolnaApiKey) {
        const [allClients]: any = await connection.query("SELECT bolna_sub_account_id FROM users WHERE role = 'client'");
        for (const client of allClients) {
          if (client.bolna_sub_account_id) {
            try {
              await fetch(`https://api.bolna.ai/sub-accounts/${client.bolna_sub_account_id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${bolnaApiKey}` }
              });
            } catch (e) {}
          }
        }
      }

      await connection.query("DELETE FROM users WHERE role = 'client'");
      connection.release();
      return NextResponse.json({ success: true, message: 'All client records cleared locally and on Bolna!' });
    } 
    else if (id) {
      if (bolnaApiKey) {
        const [currentUser]: any = await connection.query('SELECT bolna_sub_account_id FROM users WHERE id = ?', [id]);
        const bolnaSubId = currentUser[0]?.bolna_sub_account_id;

        if (bolnaSubId) {
          try {
            await fetch(`https://api.bolna.ai/sub-accounts/${bolnaSubId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${bolnaApiKey}` }
            });
          } catch (e) {
            console.error("Failed to delete Bolna sub-account:", e);
          }
        }
      }

      await connection.query('DELETE FROM users WHERE id = ?', [id]);
      connection.release();
      return NextResponse.json({ success: true, message: 'Client deleted successfully locally and on Bolna!' });
    }

    connection.release();
    return NextResponse.json({ success: false, message: 'Invalid delete request.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to delete data.' }, { status: 500 });
  }
}