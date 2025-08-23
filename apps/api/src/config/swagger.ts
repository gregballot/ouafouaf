import { FastifyInstance } from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { env } from './env'

export async function registerSwagger(fastify: FastifyInstance): Promise<void> {
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
}
