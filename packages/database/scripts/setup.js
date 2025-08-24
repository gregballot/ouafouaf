#!/usr/bin/env node

import pg from 'pg';

const { Client } = pg;

async function setupDatabase() {
  // First connect to postgres database to create the ouafouaf database
  const adminClient = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres'
  });

  try {
    await adminClient.connect();
    console.log('📦 Connected to PostgreSQL server');

    // Determine which database to create based on DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ouafouaf';
    const dbName = new URL(databaseUrl).pathname.slice(1); // Remove leading slash

    // Check if database exists
    const { rows } = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]
    );

    if (rows.length === 0) {
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`🗄️  Created ${dbName} database`);
    } else {
      console.log(`✅ Database ${dbName} already exists`);
    }

  } catch (error) {
    console.error('💥 Setup failed:', error.message);
    process.exit(1);
  } finally {
    await adminClient.end();
  }

  // Now run migrations on the ouafouaf database
  console.log('🚀 Running migrations...');

  // Import and run the migrate script
  try {
    await import('./migrate.js');
  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();