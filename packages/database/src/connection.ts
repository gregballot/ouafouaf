import { Pool, type PoolClient } from 'pg';
import type { DatabaseConfig } from './types';

let pool: Pool | null = null;

export function createPool(config: DatabaseConfig): Pool {
  if (pool) {
    return pool;
  }

  pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  return pool;
}

export async function getConnection(): Promise<PoolClient> {
  if (!pool) {
    throw new Error('Database pool not initialized. Call createPool() first.');
  }
  return pool.connect();
}