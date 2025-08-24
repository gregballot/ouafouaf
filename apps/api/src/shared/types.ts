import { Transaction as KyselyTransaction } from 'kysely';
import { Database } from './database-types';
import { cookieAuthMiddleware } from '../middleware/cookie-auth';

// Extend Fastify interfaces
declare module 'fastify' {
  interface FastifyRequest {
    transaction: KyselyTransaction<Database>;
    user?: {
      id: string;
      email: string;
    };
  }

  interface FastifyInstance {
    auth: typeof cookieAuthMiddleware;
  }
}
