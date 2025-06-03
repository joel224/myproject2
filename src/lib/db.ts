
// src/lib/db.ts
import { Pool } from 'pg';

// IMPORTANT: Configure your database connection details here,
// preferably using environment variables.
// Example for local development (ensure you have a .env.local file):
// DATABASE_URL=postgres://youruser:yourpassword@localhost:5432/yourdatabase

let pool: Pool;

function getDbClient() {
  if (!pool) {
    console.log("Attempting to create new DB connection pool...");
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      console.error("DATABASE_URL environment variable is not set.");
      // In a real app, you might throw an error here or handle it gracefully.
      // For now, we'll let operations fail if the DB isn't configured.
      // This mock client will allow the code to run without crashing immediately
      // if DATABASE_URL is not set, but DB operations will fail.
      return {
        query: async (text: string, params?: any[]) => {
          console.error("Database client not initialized. Query will fail:", text, params);
          throw new Error("Database client not initialized. Set DATABASE_URL.");
        },
        connect: async () => {
          console.error("Database client not initialized. Cannot connect.");
          throw new Error("Database client not initialized. Set DATABASE_URL.");
        }
      } as unknown as Pool; // Type assertion for mock
    }

    pool = new Pool({
      connectionString,
      // You might want to add SSL configuration for production connections to Cloud SQL
      // ssl: {
      //   rejectUnauthorized: false, // Or configure CA certs
      // },
    });

    pool.on('connect', () => {
      console.log('Connected to PostgreSQL database!');
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      // process.exit(-1); // Or handle more gracefully
    });
  }
  return pool;
}

// Export a client object that can be used to query the database
export const dbClient = {
  query: (text: string, params?: any[]) => {
    const client = getDbClient();
    return client.query(text, params);
  },
  // You can add more specific helper functions here if needed
  // e.g., for transactions
};

// Test connection (optional, call this at app startup if needed)
export async function testDbConnection() {
  try {
    const client = getDbClient();
    await client.query('SELECT NOW()');
    console.log('Database connection test successful.');
  } catch (error) {
    console.error('Database connection test failed:', error);
  }
}
