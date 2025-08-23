// Test setup file
import { beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { createKyselyInstance, getDb } from '../shared/kysely'
import { initializeDatabase } from '../config/database'
import { logger } from '../lib/logger'

// Mock logger for tests to avoid console noise
const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn()
}

// Mock environment variables for tests
beforeAll(async () => {
  vi.stubEnv('NODE_ENV', 'test')
  vi.stubEnv('JWT_SECRET', 'test-jwt-secret-at-least-32-characters-long-for-testing')
  vi.stubEnv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/ouafouaf_test')

  // Initialize logger with mock to avoid console noise during tests
  logger.initialize(mockLogger)

  // Initialize database connection
  initializeDatabase()
  createKyselyInstance()
})

beforeEach(async () => {
  // Clean up database before each test
  const db = getDb()
  await db.deleteFrom('domain_events').execute()
  await db.deleteFrom('users').execute()
})

afterAll(async () => {
  // Clean up database connection and environment
  const db = getDb()
  await db.destroy()
  vi.unstubAllEnvs()
})
