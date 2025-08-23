import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'src/**/*.test.ts',
        'src/**/*.d.ts',
        'vitest.config.ts'
      ]
    },
    // Test timeout for integration tests with database
    testTimeout: 10000,
    setupFiles: ['./src/test/setup.ts']
  }
})