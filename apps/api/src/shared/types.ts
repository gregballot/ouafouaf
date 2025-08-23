import { Transaction as KyselyTransaction } from 'kysely';
import { Database } from './database-types';

// Extend Fastify request interface
declare module 'fastify' {
  interface FastifyRequest {
    transaction: KyselyTransaction<Database>;
  }
}
