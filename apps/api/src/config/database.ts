import { createPool } from '@repo/database'
import { env } from './env'

export function initializeDatabase() {
  if (env.DATABASE_URL) {
    try {
      const dbUrl = new URL(env.DATABASE_URL)
      createPool({
        host: dbUrl.hostname,
        port: parseInt(dbUrl.port) || 5432,
        database: dbUrl.pathname.slice(1),
        user: dbUrl.username,
        password: dbUrl.password
      })
    } catch (error) {
      console.error('Failed to parse DATABASE_URL:', error)
      throw new Error('Invalid DATABASE_URL format')
    }
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
}