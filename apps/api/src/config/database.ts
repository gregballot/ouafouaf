import { createPool } from '@repo/database';
import { env } from './env';
import { logger } from '../lib/logger';

export function initializeDatabase() {
  if (env.DATABASE_URL) {
    try {
      const dbUrl = new URL(env.DATABASE_URL);

      // Validate required components
      if (!dbUrl.hostname) {
        throw new Error('DATABASE_URL missing hostname');
      }
      if (!dbUrl.username) {
        throw new Error('DATABASE_URL missing username');
      }
      if (!dbUrl.password) {
        throw new Error('DATABASE_URL missing password');
      }

      // Validate and parse database name
      const database = dbUrl.pathname.slice(1);
      if (!database) {
        throw new Error('DATABASE_URL missing database name');
      }

      // Validate and parse port
      const port = dbUrl.port ? parseInt(dbUrl.port, 10) : 5432;
      if (isNaN(port) || port <= 0 || port > 65535) {
        throw new Error('DATABASE_URL has invalid port number');
      }

      createPool({
        host: dbUrl.hostname,
        port,
        database,
        user: dbUrl.username,
        password: dbUrl.password,
      });
    } catch (error) {
      logger.error(
        'Failed to parse DATABASE_URL:',
        error instanceof Error ? error : new Error(String(error))
      );
      throw new Error(
        `Invalid DATABASE_URL: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  } else {
    createPool({
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
    });
  }
}
