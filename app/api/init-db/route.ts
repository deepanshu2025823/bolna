// app/api/init-db/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const connection = await pool.getConnection();

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'client') DEFAULT 'client',
        bolna_sub_account_id VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        allocated_credits INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        balance DECIMAL(10, 2) DEFAULT 0.00,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    const [existingPlans]: any = await connection.query('SELECT COUNT(*) as count FROM plans');
    if (existingPlans[0].count === 0) {
      await connection.query(`
        INSERT INTO plans (name, price, allocated_credits) VALUES 
        ('Basic', 49.99, 500),
        ('Growth', 99.99, 1200),
        ('Premium', 199.99, 3000)
      `);
    }

    connection.release();

    return NextResponse.json({ 
      success: true, 
      message: 'Database tables and default plans created successfully!' 
    });

  } catch (error: any) {
    console.error('DB Init Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to initialize database', 
      error: error.message 
    }, { status: 500 });
  }
}