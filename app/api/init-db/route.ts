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
        role ENUM('admin', 'client', 'staff') DEFAULT 'client',
        designation VARCHAR(255) DEFAULT 'Staff',
        company_name VARCHAR(255) DEFAULT NULL,
        logo_url VARCHAR(500) DEFAULT NULL,
        bolna_sub_account_id VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    try { await connection.query("ALTER TABLE users ADD COLUMN designation VARCHAR(255) DEFAULT 'Staff'"); } catch (e) {}
    try { await connection.query("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'client', 'staff') DEFAULT 'client'"); } catch (e) {}
    try { await connection.query("ALTER TABLE users ADD COLUMN company_name VARCHAR(255) DEFAULT NULL"); } catch (e) {}
    try { await connection.query("ALTER TABLE users ADD COLUMN logo_url VARCHAR(500) DEFAULT NULL"); } catch (e) {}

    await connection.query(`
      CREATE TABLE IF NOT EXISTS plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        allocated_credits INT NOT NULL,
        features TEXT, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    try { await connection.query("ALTER TABLE plans ADD COLUMN features TEXT"); } catch (e) {}

    await connection.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        balance DECIMAL(10, 2) DEFAULT 0.00,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        razorpay_order_id VARCHAR(255),
        razorpay_payment_id VARCHAR(255),
        plan_name VARCHAR(100),
        amount DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
        failure_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        portal_name VARCHAR(255) DEFAULT 'AI Portal Pro',
        support_email VARCHAR(255) DEFAULT 'support@company.com',
        bolna_api_key VARCHAR(255) DEFAULT ''
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        subject VARCHAR(255) NOT NULL,
        status ENUM('open', 'closed') DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS ticket_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        sender_id INT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    const [existingPlans]: any = await connection.query('SELECT COUNT(*) as count FROM plans');
    if (existingPlans[0].count === 0) {
      const defaultFeatures = JSON.stringify(["Full Analytics", "Premium Support"]);
      await connection.query(`
        INSERT INTO plans (name, price, allocated_credits, features) VALUES 
        ('Basic', 49.99, 500, ?),
        ('Growth', 99.99, 1200, ?),
        ('Premium', 199.99, 3000, ?)
      `, [defaultFeatures, defaultFeatures, defaultFeatures]);
    }

    connection.release();

    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully with client branding columns!' 
    });

  } catch (error: any) {
    console.error('DB Init Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to initialize database', error: error.message }, { status: 500 });
  }
}