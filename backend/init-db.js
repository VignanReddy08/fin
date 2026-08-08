import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

async function initDb() {
  console.log('Connecting to MySQL...');
  
  // Connect without a specific database to create it
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'klu123'
  });

  try {
    console.log('Creating database agenticfi_db if not exists...');
    await connection.query('CREATE DATABASE IF NOT EXISTS agenticfi_db');
    
    // Switch to the database
    await connection.query('USE agenticfi_db');
    
    console.log('Creating users table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255) UNIQUE,
        mobile VARCHAR(255) UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        isActive BOOLEAN DEFAULT true,
        isVerified BOOLEAN DEFAULT false,
        mobileVerified BOOLEAN DEFAULT false,
        emailVerified BOOLEAN DEFAULT false,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        department VARCHAR(255),
        designation VARCHAR(255),
        profileCompleted BOOLEAN DEFAULT false,
        mfaEnabled BOOLEAN DEFAULT false,
        lastLogin DATETIME,
        loginCount INT DEFAULT 0
      )
    `);

    console.log('Creating invitations table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS invitations (
        id VARCHAR(255) PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        mobile VARCHAR(255),
        department VARCHAR(255),
        designation VARCHAR(255),
        role VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        token VARCHAR(255) UNIQUE NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        expiresAt DATETIME NOT NULL,
        acceptedAt DATETIME,
        cancelledAt DATETIME
      )
    `);

    console.log('Inserting default Super Administrator...');
    const adminPasswordHash = await bcrypt.hash('klu123', 10);
    
    await connection.query(`
      INSERT IGNORE INTO users 
      (id, fullName, email, username, mobile, password, role, isActive, isVerified, emailVerified, profileCompleted) 
      VALUES 
      ('sa-001', 'Super Administrator', 'superadmin@agenticfi.com', 'root', '9999999999', ?, 'super_admin', true, true, true, true)
    `, [adminPasswordHash]);

    console.log('Database initialization successful!');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    await connection.end();
  }
}

initDb();
