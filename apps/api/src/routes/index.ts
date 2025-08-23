import { FastifyInstance } from 'fastify'
import { healthRoutes } from './health'
import { authRoutes } from './auth'

export async function registerRoutes(fastify: FastifyInstance) {
  // Health check routes (no prefix)
  await fastify.register(healthRoutes)

  // API routes with prefix
  await fastify.register(authRoutes, { prefix: '/api/auth' })
}
