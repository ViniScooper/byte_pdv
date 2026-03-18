import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const config = {
  user: process.env.DB_USER || 'admin_cantina',
  password: process.env.DB_PASSWORD || '@sistemaPDV123',
  server: process.env.DB_SERVER || 'pdvcantina.database.windows.net',
  database: process.env.DB_NAME || 'schema_pdv_cantina',
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

let pool;

export async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
    console.log('Database pool connected to Azure SQL.');
  }
  return pool;
}

export { sql };
