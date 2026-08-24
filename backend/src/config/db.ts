import mysql from 'mysql2/promise';
import { env } from './env';

// Create a connection pool to handle multiple concurrent requests
export const pool = mysql.createPool({
  uri: env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to test the connection (optional, can be called at startup)
export const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL Database');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL Connection Failed:', error);
    process.exit(1);
  }
};
