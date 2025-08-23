import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Create a single, reusable postgres client
// This ensures only one connection is maintained across the application
const client = postgres(process.env.WRITE_REPLICA_DATABASE_URL!, {
    max: 1, // Limit to 1 connection
    idle_timeout: 20,
    connect_timeout: 10,
})

export const db = drizzle(client, { schema });

process.on('SIGINT', async () => {
    await client.end();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await client.end();
    process.exit(0);
});

