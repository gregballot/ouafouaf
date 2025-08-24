#!/usr/bin/env node

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Client } = pg;

async function runMigrations() {
  const client = new Client({
    connectionString:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/ouafouaf',
  });

  try {
    await client.connect();
    console.log('📦 Connected to database');

    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Get already executed migrations
    const { rows: executedMigrations } = await client.query(
      'SELECT filename FROM migrations ORDER BY filename'
    );
    const executedSet = new Set(executedMigrations.map((row) => row.filename));

    // Read migration files
    const migrationsDir = join(__dirname, '../migrations');
    const files = await readdir(migrationsDir);
    const migrationFiles = files.filter((file) => file.endsWith('.sql')).sort();

    console.log(`📄 Found ${migrationFiles.length} migration files`);

    let executedCount = 0;

    for (const file of migrationFiles) {
      if (executedSet.has(file)) {
        console.log(`⏭️  Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`🚀 Executing ${file}...`);

      const filePath = join(migrationsDir, file);
      const sql = await readFile(filePath, 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO migrations (filename) VALUES ($1)', [
          file,
        ]);
        await client.query('COMMIT');
        console.log(`✅ Successfully executed ${file}`);
        executedCount++;
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Error executing ${file}:`, error.message);
        throw error;
      }
    }

    if (executedCount === 0) {
      console.log('✨ Database is up to date');
    } else {
      console.log(`🎉 Successfully executed ${executedCount} migrations`);
    }
  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
