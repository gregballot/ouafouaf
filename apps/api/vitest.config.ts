import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],

    // Use test environment variables
    env: {
      NODE_ENV: 'test',
    },

    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'src/**/*.test.ts',
        'src/**/*.d.ts',
        'vitest.config.ts',
      ],
    },

    // Test timeout for integration tests with database
    testTimeout: 10000,

    // Setup files run before each test file
    setupFiles: ['./src/shared/test-utils/setup.ts'],

    // Global setup runs once before all tests
    globalSetup: './src/shared/test-utils/global-setup.ts',

    // Run tests sequentially to avoid database conflicts initially
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
});
