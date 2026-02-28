// app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1 + 1 AS solution');
    connection.release();

    return NextResponse.json({ 
      success: true, 
      message: 'TiDB Connected Successfully!', 
      data: rows 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: 'Database connection failed', 
      error: error.message 
    }, { status: 500 });
  }
}