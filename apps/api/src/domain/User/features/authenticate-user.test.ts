import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { authenticateUser } from './authenticate-user';
import { UserRepository } from '../UserRepository';
import { EventRepository } from '../../DomainEvent/EventRepository';
import { UserBuilder } from '../UserBuilder';

// Mock transaction interface for tests
interface MockTransaction {
  query: any;
}

describe('Authenticate User Feature', () => {
  let mockTransaction: MockTransaction;
  let userRepository: UserRepository;
  let eventRepository: EventRepository;

  beforeEach(() => {
    mockTransaction = {
      query: vi.fn()
    };
    userRepository = new UserRepository(mockTransaction as any);
    eventRepository = new EventRepository(mockTransaction as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('successful authentication', () => {
    it('should authenticate user with valid credentials', async () => {
      // Create a test user with known password
      const testUser = await new UserBuilder()
        .withEmail('test@example.com')
        .withPassword('validpassword123')
        .build();

      const userState = testUser.getInternalState();

      // Arrange: Mock finding the user
      mockTransaction.query
        .mockResolvedValueOnce({
          rows: [{
            id: userState.id,
            email: userState.email,
            password_hash: userState.passwordHash,
            created_at: userState.createdAt,
            updated_at: userState.updatedAt,
            last_login: userState.lastLogin
          }]
        }) // findByEmail returns user
        .mockResolvedValueOnce({
          rows: [{
            id: userState.id,
            email: userState.email,
            password_hash: userState.passwordHash,
            created_at: userState.createdAt,
            updated_at: userState.updatedAt,
            last_login: userState.lastLogin
          }]
        }) // findById returns user (for update check)
        .mockResolvedValueOnce({}) // update succeeds
        .mockResolvedValueOnce({}); // event insert succeeds

      // Act
      const result = await authenticateUser(
        {
          email: 'test@example.com',
          password: 'validpassword123'
        },
        {
          userRepository,
          eventRepository
        }
      );

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.value.user.email.toString()).toBe('test@example.com');
      expect(result.value.user.lastLogin).toBeInstanceOf(Date);

      // Verify database calls
      expect(mockTransaction.query).toHaveBeenCalledTimes(4);
      
      // Check that UserLoggedIn event was published
      const eventCall = mockTransaction.query.mock.calls[3];
      expect(eventCall[0]).toContain('INSERT INTO domain_events');
      const eventData = JSON.parse(eventCall[1][2]);
      expect(eventData.eventName).toBe('UserLoggedIn');
    });

    it('should authenticate user without event repository', async () => {
      // Create a test user with known password
      const testUser = await new UserBuilder()
        .withEmail('test@example.com')
        .withPassword('validpassword123')
        .build();

      const userState = testUser.getInternalState();

      // Arrange
      mockTransaction.query
        .mockResolvedValueOnce({
          rows: [{
            id: userState.id,
            email: userState.email,
            password_hash: userState.passwordHash,
            created_at: userState.createdAt,
            updated_at: userState.updatedAt,
            last_login: userState.lastLogin
          }]
        }) // findByEmail returns user
        .mockResolvedValueOnce({
          rows: [{
            id: userState.id,
            email: userState.email,
            password_hash: userState.passwordHash,
            created_at: userState.createdAt,
            updated_at: userState.updatedAt,
            last_login: userState.lastLogin
          }]
        }) // findById for update check
        .mockResolvedValueOnce({}); // update succeeds

      // Act
      const result = await authenticateUser(
        {
          email: 'test@example.com',
          password: 'validpassword123'
        },
        {
          userRepository
          // No event repository
        }
      );

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(mockTransaction.query).toHaveBeenCalledTimes(3); // No event call
    });
  });

  describe('validation failures', () => {
    it('should fail with invalid email', async () => {
      const result = await authenticateUser(
        {
          email: 'invalid-email',
          password: 'validpassword123'
        },
        {
          userRepository
        }
      );

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBe('Invalid credentials');
      expect(mockTransaction.query).not.toHaveBeenCalled();
    });

    it('should fail with empty password', async () => {
      const result = await authenticateUser(
        {
          email: 'test@example.com',
          password: ''
        },
        {
          userRepository
        }
      );

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBe('Invalid credentials');
      expect(mockTransaction.query).not.toHaveBeenCalled();
    });
  });

  describe('authentication failures', () => {
    it('should fail when user not found', async () => {
      // Arrange: Mock user not found
      mockTransaction.query.mockResolvedValueOnce({ rows: [] });

      // Act
      const result = await authenticateUser(
        {
          email: 'nonexistent@example.com',
          password: 'anypassword'
        },
        {
          userRepository
        }
      );

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.error).toBe('Invalid credentials');
      expect(mockTransaction.query).toHaveBeenCalledTimes(1);
    });

    it('should fail with incorrect password', async () => {
      // Create a test user with known password
      const testUser = await new UserBuilder()
        .withEmail('test@example.com')
        .withPassword('validpassword123')
        .build();

      const userState = testUser.getInternalState();

      // Arrange: Mock finding the user
      mockTransaction.query.mockResolvedValueOnce({
        rows: [{
          id: userState.id,
          email: userState.email,
          password_hash: userState.passwordHash,
          created_at: userState.createdAt,
          updated_at: userState.updatedAt,
          last_login: userState.lastLogin
        }]
      });

      // Act
      const result = await authenticateUser(
        {
          email: 'test@example.com',
          password: 'wrongpassword'
        },
        {
          userRepository
        }
      );

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.error).toBe('Invalid credentials');
      expect(mockTransaction.query).toHaveBeenCalledTimes(1); // Only the findByEmail call
    });
  });

  describe('database failures', () => {
    it('should fail when user update fails', async () => {
      // Create a test user with known password
      const testUser = await new UserBuilder()
        .withEmail('test@example.com')
        .withPassword('validpassword123')
        .build();

      const userState = testUser.getInternalState();

      // Arrange
      mockTransaction.query
        .mockResolvedValueOnce({
          rows: [{
            id: userState.id,
            email: userState.email,
            password_hash: userState.passwordHash,
            created_at: userState.createdAt,
            updated_at: userState.updatedAt,
            last_login: userState.lastLogin
          }]
        }) // findByEmail succeeds
        .mockResolvedValueOnce({
          rows: [{
            id: userState.id,
            email: userState.email,
            password_hash: userState.passwordHash,
            created_at: userState.createdAt,
            updated_at: userState.updatedAt,
            last_login: userState.lastLogin
          }]
        }) // findById succeeds
        .mockRejectedValueOnce(new Error('Database error')); // update fails

      // Act
      const result = await authenticateUser(
        {
          email: 'test@example.com',
          password: 'validpassword123'
        },
        {
          userRepository
        }
      );

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.error).toContain('Failed to save user');
    });

    it('should continue when event publishing fails', async () => {
      // Create a test user with known password
      const testUser = await new UserBuilder()
        .withEmail('test@example.com')
        .withPassword('validpassword123')
        .build();

      const userState = testUser.getInternalState();

      // Arrange
      mockTransaction.query
        .mockResolvedValueOnce({
          rows: [{
            id: userState.id,
            email: userState.email,
            password_hash: userState.passwordHash,
            created_at: userState.createdAt,
            updated_at: userState.updatedAt,
            last_login: userState.lastLogin
          }]
        }) // findByEmail succeeds
        .mockResolvedValueOnce({
          rows: [{
            id: userState.id,
            email: userState.email,
            password_hash: userState.passwordHash,
            created_at: userState.createdAt,
            updated_at: userState.updatedAt,
            last_login: userState.lastLogin
          }]
        }) // findById succeeds
        .mockResolvedValueOnce({}) // update succeeds
        .mockRejectedValueOnce(new Error('Event publish failed')); // event insert fails

      // Spy on console.error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      const result = await authenticateUser(
        {
          email: 'test@example.com',
          password: 'validpassword123'
        },
        {
          userRepository,
          eventRepository
        }
      );

      // Assert
      expect(result.isSuccess()).toBe(true); // Should still succeed
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to publish UserLoggedIn event:',
        'Failed to publish event: Event publish failed'
      );

      consoleSpy.mockRestore();
    });
  });
});