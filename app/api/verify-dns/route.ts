// app/api/verify-dns/route.ts
import { NextResponse } from 'next/server';
import dns from 'dns/promises';

export async function POST(request: Request) {
  try {
    const { domain, expectedTarget } = await request.json();

    if (!domain || !expectedTarget) {
      return NextResponse.json({ success: false, message: 'Domain and target are required' }, { status: 400 });
    }

    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

    try {
      const records = await dns.resolveCname(cleanDomain);
      
      const isMatched = records.some(record => record === expectedTarget || record === expectedTarget + '.');

      if (isMatched) {
        return NextResponse.json({ success: true, message: 'Domain verified successfully!' });
      } else {
        return NextResponse.json({ 
          success: false, 
          message: `CNAME not pointing to correct target. Found: ${records.join(', ')}` 
        }, { status: 400 });
      }

    } catch (dnsError: any) {
      if (dnsError.code === 'ENODATA' || dnsError.code === 'ENOTFOUND') {
         return NextResponse.json({ 
           success: false, 
           message: 'No CNAME records found for this domain yet. DNS propagation may take up to 24-48 hours.' 
         }, { status: 400 });
      }
      throw dnsError;
    }

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to verify DNS. Please ensure your domain is typed correctly.' 
    }, { status: 500 });
  }
}