import { SwaggerOptions } from '@fastify/swagger'
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui'
import { env } from './env'

export const swaggerConfig: SwaggerOptions = {
  swagger: {
    info: {
      title: 'Ouafouaf API',
      description: 'API for Ouafouaf application',
      version: '1.0.0'
    },
    host: new URL(env.API_URL).host,
    schemes: env.NODE_ENV === 'production' ? ['https'] : ['http'],
    consumes: ['application/json'],
    produces: ['application/json']
  }
}

export const swaggerUiConfig: FastifySwaggerUiOptions = {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  }
}