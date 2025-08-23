import { createServer } from './config/server'
import { registerRoutes } from './routes'
import { env } from './config/env'

const fastify = await createServer()

// Register all routes
await fastify.register(registerRoutes)

// Start server
const start = async () => {
  try {
    const port = env.PORT
    const host = env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'
    
    await fastify.listen({ port, host })

    fastify.log.info(`Server running at http://${host}:${port}`)
    fastify.log.info(`API docs available at http://${host}:${port}/docs`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
