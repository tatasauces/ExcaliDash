import { createClient } from '@libsql/client';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

/**
 * Helper to strip single or double quotes from the start and end of a string
 */
const cleanEnvVar = (val?: string) => {
  if (!val) return val;
  return val.replace(/^['"]|['"]$/g, '').trim();
};

const FALLBACK_SQL = `
-- CreateTable
CREATE TABLE IF NOT EXISTS "Collection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Drawing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "elements" TEXT NOT NULL,
    "appState" TEXT NOT NULL,
    "files" TEXT NOT NULL DEFAULT '{}',
    "preview" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "collectionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Drawing_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Library" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "items" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
`;

async function sync() {
  const url = cleanEnvVar(process.env.TURSO_DATABASE_URL);
  const authToken = cleanEnvVar(process.env.TURSO_AUTH_TOKEN);

  if (!url) {
    console.error('Error: TURSO_DATABASE_URL is not set');
    process.exit(1);
  }

  console.log(`Connecting to Turso at ${url}...`);
  const client = createClient({ url, authToken });

  try {
    let sql = '';
    try {
      console.log('Attempting to generate SQL from Prisma schema using CLI...');
      // We need a dummy DATABASE_URL for the prisma command to work
      sql = execSync(
        'DATABASE_URL="file:./dummy.db" npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script',
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
      );
    } catch (cliError) {
      console.warn('Prisma CLI failed to generate SQL (possibly due to engine issues).');
      console.warn('Falling back to built-in schema SQL...');
      sql = FALLBACK_SQL;
    }

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
