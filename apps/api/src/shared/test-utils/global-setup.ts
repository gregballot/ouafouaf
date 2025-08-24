import { setupTestDatabase, teardownTestDatabase } from './database-utils';

export async function setup() {
  console.log('🔧 Setting up test environment...');

  try {
    // Set up test database
    await setupTestDatabase();
    console.log('✅ Test database setup complete');
  } catch (error) {
    console.error('❌ Test setup failed:', error);
    throw error;
  }
}

export async function teardown() {
  console.log('🧹 Cleaning up test environment...');

  try {
    await teardownTestDatabase();
    console.log('✅ Test cleanup complete');
  } catch (error) {
    console.error('⚠️ Test cleanup warning:', error);
    // Don't throw - this is just cleanup
  }
}