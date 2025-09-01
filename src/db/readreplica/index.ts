import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

// Check if environment variable is set
if (!process.env.READ_REPLICA_DATABASE_URL) {
  console.error("READ_REPLICA_DATABASE_URL environment variable is not set!");
  throw new Error("READ_REPLICA_DATABASE_URL environment variable is required");
}

// Parse the database URL to extract individual components
function parseDatabaseUrl(url: string) {
  try {
    // Remove the mysql:// prefix
    const cleanUrl = url.replace('mysql://', '');

    // Split by @ to separate credentials from host
    const [credentials, hostAndDb] = cleanUrl.split('@');

    if (!credentials || !hostAndDb) {
      throw new Error('Invalid database URL format');
    }

    // Split credentials by : to get username and password
    const [username, password] = credentials.split(':');

    // Split hostAndDb by / to get host and database name
    const [hostPort, database] = hostAndDb.split('/');

    // Split hostPort by : to get host and port
    const [host, port] = hostPort.split(':');

    return {
      host: host || 'localhost',
      port: parseInt(port) || 3306,
      user: username,
      password: password,
      database: database
    };
  } catch (error) {
    console.error('Error parsing database URL:', error);
    throw new Error('Failed to parse database URL');
  }
}

// Parse the database URL
const dbConfig = parseDatabaseUrl(process.env.READ_REPLICA_DATABASE_URL!);
const pool = mysql.createPool({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  connectionLimit: 2,
  queueLimit: 10,
  multipleStatements: false,
  dateStrings: true,
  charset: 'utf8mb4',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
})

// Test the connection once on startup
pool.getConnection()
  .then(connection => {
    console.log('Read replica database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error("Read replica database connection failed:", err);
  });

export const db = drizzle(pool);

// Graceful shutdown handling
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});

// Export pool for monitoring
export { pool as readReplicaPool, db as dbReadReplica };
