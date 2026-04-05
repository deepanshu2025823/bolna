// app/api/admin/users/executions/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subAccountId = searchParams.get('sub_account_id');
    const adminApiKey = process.env.BOLNA_API_KEY;

    if (!subAccountId || !adminApiKey) {
      return NextResponse.json({ success: false, message: 'Missing parameters' }, { status: 400 });
    }

    let subAccountApiKey = '';
    const accountsRes = await fetch('https://api.bolna.ai/sub-accounts/all', {
      headers: { 'Authorization': `Bearer ${adminApiKey}` },
      cache: 'no-store'
    });

    if (accountsRes.ok) {
      const accounts = await accountsRes.json();
      const target = accounts.find((a: any) => a.id === subAccountId);
      if (target && target.api_key) {
        subAccountApiKey = target.api_key;
      }
    }

    const tokenToUse = subAccountApiKey || adminApiKey;
    let allExecutions: any[] = [];

    const agentsRes = await fetch('https://api.bolna.ai/v2/agent', {
      headers: { 'Authorization': `Bearer ${tokenToUse}` },
      cache: 'no-store'
    });

    if (agentsRes.ok) {
       const agentsData = await agentsRes.json();
       const agents = agentsData.data || agentsData || [];
       
       for (const agent of agents) {
          if (agent.id) {
             const execRes = await fetch(`https://api.bolna.ai/v2/agent/${agent.id}/executions?page_number=1&page_size=50`, {
               headers: { 'Authorization': `Bearer ${tokenToUse}` },
               cache: 'no-store'
             });
             if (execRes.ok) {
                const execData = await execRes.json();
                if (execData.data) {
                   allExecutions = [...allExecutions, ...execData.data];
                }
             }
          }
       }
    }

    allExecutions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ success: true, data: allExecutions });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}