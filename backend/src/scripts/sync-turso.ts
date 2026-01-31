import { createClient } from '@libsql/client';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function sync() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error('Error: TURSO_DATABASE_URL is not set');
    process.exit(1);
  }

  console.log(`Connecting to Turso at ${url}...`);
  const client = createClient({ url, authToken });

  try {
    console.log('Generating SQL from Prisma schema...');
    // We need a dummy DATABASE_URL for the prisma command to work
    const sql = execSync(
      'DATABASE_URL="file:./dummy.db" npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script',
      { encoding: 'utf-8' }
    );

    console.log('Executing SQL on Turso...');
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await client.execute(statement);
    }

    console.log('Successfully synced schema to Turso!');
  } catch (error) {
    console.error('Failed to sync schema:', error);
    process.exit(1);
  } finally {
    client.close();
  }
}

sync();
