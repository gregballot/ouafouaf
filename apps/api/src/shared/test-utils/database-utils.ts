import { getDb } from '../kysely';
import { getPool } from '@repo/database';
import { sql } from 'kysely';
import pg from 'pg';

const { Client } = pg;

/**
 * Set up test database - create database and run migrations
 */
export async function setupTestDatabase(): Promise<void> {
  // First connect to postgres database to create the test database
  const adminClient = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
  });

  try {
    await adminClient.connect();
    console.log('📦 Connected to PostgreSQL server for test setup');

    // Check if test database exists
    const { rows } = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = 'ouafouaf_test'"
    );

    if (rows.length === 0) {
      await adminClient.query('CREATE DATABASE ouafouaf_test');
      console.log('🗄️  Created ouafouaf_test database');
    }
  } catch (error) {
    console.error(
      '💥 Test database setup failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  } finally {
    await adminClient.end();
  }

  // The migrations will be handled by the global setup
  // For now, just inform that we need to run migrations manually
  console.log(
    '🚀 Test database ready - ensure migrations are run with `pnpm db:test:migrate`'
  );
}

/**
 * Clear all data from test database tables
 * Uses TRUNCATE for fast cleanup between tests
 */
export async function clearTestDatabase(): Promise<void> {
  try {
    const db = getDb();

    // Simple approach: delete all data and reset sequences
    await db.transaction().execute(async (trx) => {
      // Clear in correct order (domain_events first, then users)
      await trx.deleteFrom('domain_events').execute();
      await trx.deleteFrom('users').execute();

      // Reset sequences if they exist
      await sql`SELECT setval(pg_get_serial_sequence('users', 'id'), 1, false)`
        .execute(trx)
        .catch(() => {
          // Ignore if sequence doesn't exist (UUID primary keys don't have sequences)
        });
    });
  } catch (error) {
    console.error(
      '💥 Failed to clear test database:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
}

/**
 * Tear down test database (optional cleanup after test suite)
 */
export async function teardownTestDatabase(): Promise<void> {
  try {
    // Close all database connections if pool exists
    try {
      const pool = getPool();
      await pool.end();
      console.log('🔌 Closed database connections');
    } catch (poolError) {
      // Pool might not be initialized or already closed - this is normal during teardown
      console.log('🔌 Database pool already closed or not initialized');
    }
  } catch (error) {
    console.error(
      '⚠️ Warning during test database teardown:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    // Don't throw - this is cleanup
  }
}
