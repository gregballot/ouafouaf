import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { initializeDatabase } from './database'
import { createKyselyInstance } from '../shared/kysely'
import { registerErrorHandler } from '../shared/error-handler'
import { registerRoutes } from '../routes'
import { env } from './env'
import { logger } from '../lib/logger'
import '../shared/types' // Import Fastify interface extensions

export async function createServer(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: env.NODE_ENV !== 'test'
  }).withTypeProvider<TypeBoxTypeProvider>()

  // Initialize logger singleton with Fastify logger
  logger.initialize(fastify.log)

  // Initialize database and Kysely
  initializeDatabase()
  createKyselyInstance()

  // Register error handler first
  registerErrorHandler(fastify)

  // CORS configuration
  await fastify.register(cors, {
    origin: env.NODE_ENV === 'production'
      ? ['https://your-domain.vercel.app']
      : true,
    credentials: true
  })

  // Swagger documentation
  if (env.NODE_ENV !== 'production') {
    await fastify.register(swagger, {
      openapi: {
        info: {
          title: 'Ouafouaf API',
          description: 'API documentation for Ouafouaf',
          version: '1.0.0'
        }
      }
    })

    await fastify.register(swaggerUI, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'full',
        deepLinking: false
      }
    })
  }

  // No transaction hooks needed - we handle transactions in routes using withTransaction()

  // Register routes
  await fastify.register(registerRoutes)

  return fastify
}