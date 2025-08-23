// Test setup file
import { beforeAll, afterAll, vi } from 'vitest'

// Mock environment variables for tests
beforeAll(() => {
  vi.stubEnv('NODE_ENV', 'test')
  vi.stubEnv('JWT_SECRET', 'test-jwt-secret-at-least-32-characters-long-for-testing')
  vi.stubEnv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/ouafouaf_test')
})

afterAll(() => {
  vi.unstubAllEnvs()
})