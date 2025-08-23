import Fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { env } from './env'
import { swaggerConfig, swaggerUiConfig } from './swagger'
import { initializeDatabase } from './database'

export async function createServer() {
  const fastify = Fastify({
    logger: {
      level: 'info'
    }
  }).withTypeProvider<TypeBoxTypeProvider>()

  // Register plugins
  await fastify.register(cors, {
    origin: env.NODE_ENV === 'production' 
      ? [env.FRONTEND_URL] 
      : true
  })

  await fastify.register(swagger, swaggerConfig)
  await fastify.register(swaggerUi, swaggerUiConfig)

  // Initialize database connection
  initializeDatabase()

  return fastify
}