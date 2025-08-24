import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { initializeDatabase } from './database';
import { createKyselyInstance } from '../shared/kysely';
import { registerErrorHandler } from '../shared/error-handler';
import { registerRoutes } from '../routes';
import { registerSwagger } from './swagger';
import { cookieAuthMiddleware } from '../middleware/cookie-auth';
import { env } from './env';
import { logger } from '../lib/logger';
import '../shared/types'; // Import Fastify interface extensions

export async function createServer(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: env.NODE_ENV !== 'test',
  }).withTypeProvider<TypeBoxTypeProvider>();

  logger.initialize(fastify.log);

  initializeDatabase();
  createKyselyInstance();

  registerErrorHandler(fastify);

  // Register cookie plugin
  await fastify.register(cookie, {
    secret: env.JWT_SECRET, // Used for signed cookies (optional)
  });

  await fastify.register(cors, {
    origin:
      env.NODE_ENV === 'production'
        ? env.PRODUCTION_DOMAIN
          ? [env.PRODUCTION_DOMAIN]
          : true
        : true,
    credentials: true,
  });

  // Register auth decorator
  fastify.decorate('auth', cookieAuthMiddleware);

  await registerSwagger(fastify);

  await fastify.register(registerRoutes);

  return fastify;
}
