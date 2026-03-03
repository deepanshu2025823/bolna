// app/api/admin/plans/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const connection = await pool.getConnection();

    try {
      await connection.query("ALTER TABLE plans ADD COLUMN features TEXT");
    } catch (e) {
    }

    const [plans]: any = await connection.query('SELECT * FROM plans ORDER BY price ASC');
    connection.release();

    const formattedPlans = plans.map((plan: any) => {
      let parsedFeatures = [];
      try {
        parsedFeatures = plan.features ? JSON.parse(plan.features) : [];
      } catch (err) {
        parsedFeatures = [];
      }
      return {
        ...plan,
        features: parsedFeatures
      };
    });

    return NextResponse.json({ success: true, data: formattedPlans });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, price, allocated_credits, features } = await request.json();
    const connection = await pool.getConnection();
    
    const featuresStr = JSON.stringify(Array.isArray(features) ? features : []);

    await connection.query(
      'INSERT INTO plans (name, price, allocated_credits, features) VALUES (?, ?, ?, ?)',
      [name, price, allocated_credits, featuresStr]
    );
    connection.release();
    return NextResponse.json({ success: true, message: 'Plan created successfully!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to create plan.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, price, allocated_credits, features } = await request.json();
    const connection = await pool.getConnection();

    const featuresStr = JSON.stringify(Array.isArray(features) ? features : []);

    await connection.query(
      'UPDATE plans SET name = ?, price = ?, allocated_credits = ?, features = ? WHERE id = ?',
      [name, price, allocated_credits, featuresStr, id]
    );
    connection.release();
    return NextResponse.json({ success: true, message: 'Plan updated successfully!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update plan.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM plans WHERE id = ?', [id]);
    connection.release();
    return NextResponse.json({ success: true, message: 'Plan deleted successfully!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to delete plan.' }, { status: 500 });
  }
}