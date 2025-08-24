import { Kysely, PostgresDialect } from 'kysely';
import { Database } from './database-types';
import { getPool } from '@repo/database';

let kyselyInstance: Kysely<Database> | null = null;

// Create Kysely instance using the existing pool
export function createKyselyInstance(): Kysely<Database> {
  if (kyselyInstance) {
    return kyselyInstance;
  }

  const pool = getPool();

  kyselyInstance = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: pool,
    }),
  });

  return kyselyInstance;
}

// Get database instance (lazy initialization)
export function getDb(): Kysely<Database> {
  if (!kyselyInstance) {
    return createKyselyInstance();
  }
  return kyselyInstance;
}
