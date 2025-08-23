import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { initializeDatabase } from './database'
import { createKyselyInstance } from '../shared/kysely'
import { registerErrorHandler } from '../shared/error-handler'
import { registerRoutes } from '../routes'
import { registerSwagger } from './swagger'
import { env } from './env'
import { logger } from '../lib/logger'
import '../shared/types' // Import Fastify interface extensions

export async function createServer(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: env.NODE_ENV !== 'test'
  }).withTypeProvider<TypeBoxTypeProvider>()

  logger.initialize(fastify.log)

  initializeDatabase()
  createKyselyInstance()

  registerErrorHandler(fastify)

  await fastify.register(cors, {
    origin: env.NODE_ENV === 'production'
      ? (env.PRODUCTION_DOMAIN ? [env.PRODUCTION_DOMAIN] : true)
      : true,
    credentials: true
  })

  await registerSwagger(fastify)

  await fastify.register(registerRoutes)

  return fastify
}
