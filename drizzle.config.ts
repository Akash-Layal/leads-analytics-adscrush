import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './src/db/writereplica/migrations',
  schema: './src/db/writereplica/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.WRITE_REPLICA_DATABASE_URL!,
  },
});
