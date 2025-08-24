#!/usr/bin/env node

import pg from 'pg';

const { Client } = pg;

async function resetDatabase() {
  const client = new Client({
    connectionString:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/ouafouaf',
  });

  try {
    await client.connect();
    console.log('📦 Connected to database');

    // Drop all tables and extensions
    await client.query(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        -- Drop all tables
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
        LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;

        -- Drop migrations table if exists
        DROP TABLE IF EXISTS migrations CASCADE;
      END $$;
    `);

    console.log('🗑️  Dropped all tables');
    console.log('✅ Database reset complete');
  } catch (error) {
    console.error('💥 Reset failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

resetDatabase();
