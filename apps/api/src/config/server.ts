import Fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { env } from './env'
import { swaggerConfig, swaggerUiConfig } from './swagger'
import { initializeDatabase } from './database'
import { getConnection } from '@repo/database'
import '../shared/types' // Import Fastify interface extensions

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

  // Transaction management hooks
  fastify.addHook('onRequest', async (request) => {
    try {
      const client = await getConnection()
      await client.query('BEGIN')
      
      request.transaction = {
        query: (sql: string, params?: any[]) => client.query(sql, params) as any,
        commit: async () => {
          await client.query('COMMIT')
        },
        rollback: async () => {
          await client.query('ROLLBACK')
        },
        release: () => client.release(),
        isCompleted: false
      }
    } catch (error) {
      fastify.log.error({ error }, 'Failed to create transaction')
      throw error
    }
  })

  fastify.addHook('onResponse', async (request) => {
    if (request.transaction && !request.transaction.isCompleted) {
      try {
        await request.transaction.commit()
        request.transaction.isCompleted = true
      } catch (error) {
        fastify.log.error({ error }, 'Failed to commit transaction')
        // Try to rollback
        try {
          await request.transaction.rollback()
        } catch (rollbackError) {
          fastify.log.error({ rollbackError }, 'Failed to rollback after commit failure')
        }
      } finally {
        request.transaction.release()
      }
    }
  })

  fastify.addHook('onError', async (request) => {
    if (request.transaction && !request.transaction.isCompleted) {
      try {
        await request.transaction.rollback()
        request.transaction.isCompleted = true
      } catch (rollbackError) {
        fastify.log.error({ rollbackError }, 'Failed to rollback transaction')
      } finally {
        request.transaction.release()
      }
    }
  })

  return fastify
}