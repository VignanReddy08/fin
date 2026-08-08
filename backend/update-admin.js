import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

async function updateAdmin() {
  console.log('Connecting to MySQL...');
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'klu123',
    database: 'agenticfi_db'
  });

  try {
    console.log('Removing existing super_admin accounts...');
    await connection.query(`DELETE FROM users WHERE role = 'super_admin'`);

    console.log('Creating new admin credential...');
    const adminPasswordHash = await bcrypt.hash('2300033208', 10);
    
    await connection.query(`
      INSERT INTO users 
      (id, fullName, email, username, mobile, password, role, isActive, isVerified, emailVerified, profileCompleted) 
      VALUES 
      ('sa-new', 'Super Administrator', 'admin@agenticfi.com', '2300033208', '2300033208', ?, 'super_admin', true, true, true, true)
    `, [adminPasswordHash]);

    console.log('Admin credentials updated successfully!');
  } catch (err) {
    console.error('Error updating admin:', err);
  } finally {
    await connection.end();
  }
}

updateAdmin();
