// app/api/admin/plans/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const connection = await pool.getConnection();
    const [plans]: any = await connection.query('SELECT * FROM plans ORDER BY price ASC');
    connection.release();

    return NextResponse.json({ success: true, data: plans });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, price, allocated_credits } = await request.json();

    if (!id || price === undefined || !allocated_credits) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE plans SET price = ?, allocated_credits = ? WHERE id = ?',
      [price, allocated_credits, id]
    );
    connection.release();

    return NextResponse.json({ success: true, message: 'Plan updated successfully!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update plan.' }, { status: 500 });
  }
}