import { Transaction } from 'kysely';
import { Database } from './database-types';
import { getDb } from './kysely';

// Helper to execute code within a database transaction
export async function withTransaction<T>(
  fn: (trx: Transaction<Database>) => Promise<T>
): Promise<T> {
  const db = getDb();
  return db.transaction().execute(fn);
}
