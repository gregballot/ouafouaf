import Fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { createPool } from '@repo/database'

const fastify = Fastify({
  logger: {
    level: 'info',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty'
    } : undefined
  }
})

// Register plugins
await fastify.register(cors, {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.vercel.app'] 
    : true
})

await fastify.register(swagger, {
  swagger: {
    info: {
      title: 'Ouafouaf API',
      description: 'API for Ouafouaf application',
      version: '1.0.0'
    },
    host: 'localhost:3001',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json']
  }
})

await fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  }
})

// Initialize database connection
if (process.env.DATABASE_URL) {
  const dbUrl = new URL(process.env.DATABASE_URL)
  createPool({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port) || 5432,
    database: dbUrl.pathname.slice(1),
    user: dbUrl.username,
    password: dbUrl.password
  })
} else {
  // Default local configuration
  createPool({
    host: 'localhost',
    port: 5432,
    database: 'ouafouaf',
    user: 'postgres',
    password: 'postgres'
  })
}

// Routes
fastify.get('/health', {
  schema: {
    description: 'Health check endpoint',
    tags: ['health'],
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          timestamp: { type: 'string' }
        }
      }
    }
  }
}, async () => {
  return { 
    status: 'ok',
    timestamp: new Date().toISOString()
  }
})

fastify.get('/api/hello', {
  schema: {
    description: 'Hello world endpoint',
    tags: ['general'],
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      }
    }
  }
}, async () => {
  return { message: 'Hello from Ouafouaf API!' }
})

// Start server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'
    
    await fastify.listen({ port, host })
    fastify.log.info(`Server running at http://${host}:${port}`)
    fastify.log.info(`API docs available at http://${host}:${port}/docs`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()