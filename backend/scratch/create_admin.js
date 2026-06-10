import { getPool, sql } from '../src/utils/db.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

async function createAdmin() {
  try {
    const pool = await getPool();
    
    // 1. Ensure the passwordHash column exists in the MySQL User table
    try {
      await pool.query('ALTER TABLE User ADD COLUMN passwordHash VARCHAR(255) NULL');
      console.log('Added missing "passwordHash" column to User table.');
    } catch (e) {
      // Ignore error if column already exists (Error 1060 in MySQL)
      if (!e.message.includes('Duplicate column name') && !e.message.includes('already exists')) {
        console.warn('Warning during schema update:', e.message);
      }
    }

    const email = 'admincantina@gmail.com';
    const password = '123456';
    const name = 'Admin Cantina';

    // Encrypt password using bcrypt with salt rounds 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const checkUser = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id FROM [User] WHERE email = @email');

    if (checkUser.recordset.length > 0) {
      console.log(`User "${email}" already exists in the database!`);
      process.exit(0);
    }

    const id = crypto.randomUUID();
    await pool.request()
      .input('id', sql.NVarChar, id)
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('passwordHash', sql.NVarChar, hashedPassword)
      .input('role', sql.NVarChar, 'ADMIN')
      .query(`INSERT INTO [User] (id, name, email, passwordHash, role, createdAt)
              VALUES (@id, @name, @email, @passwordHash, @role, GETUTCDATE())`);

    console.log(`✅ Master admin user "${email}" successfully created!`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdmin();
