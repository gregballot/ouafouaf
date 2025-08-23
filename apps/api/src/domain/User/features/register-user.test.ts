import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { registerUser } from './register-user';
import { UserRepository } from '../UserRepository';
import { EventRepository } from '../../DomainEvent/EventRepository';

// Mock transaction interface for tests
interface MockTransaction {
  query: any;
}

describe('Register User Feature', () => {
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

  describe('successful registration', () => {
    it('should register new user successfully', async () => {
      // Arrange: Mock that email doesn't exist and user creation succeeds
      mockTransaction.query
        .mockResolvedValueOnce({ rows: [] }) // findByEmail returns empty
        .mockResolvedValueOnce({ rows: [] }) // findById returns empty (new user)
        .mockResolvedValueOnce({}) // insert succeeds
        .mockResolvedValueOnce({}); // event insert succeeds

      // Act
      const result = await registerUser(
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
      expect(result.value.user.id).toBeDefined();

      // Verify database calls
      expect(mockTransaction.query).toHaveBeenCalledTimes(4);
      
      // Check that UserRegistered event was published
      const eventCall = mockTransaction.query.mock.calls[3];
      expect(eventCall[0]).toContain('INSERT INTO domain_events');
      const eventData = JSON.parse(eventCall[1][2]);
      expect(eventData.eventName).toBe('UserRegistered');
      expect(eventData.email).toBe('test@example.com');
    });

    it('should register user without event repository', async () => {
      // Arrange
      mockTransaction.query
        .mockResolvedValueOnce({ rows: [] }) // findByEmail returns empty
        .mockResolvedValueOnce({ rows: [] }) // findById returns empty
        .mockResolvedValueOnce({}); // insert succeeds

      // Act
      const result = await registerUser(
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
      const result = await registerUser(
        {
          email: 'invalid-email',
          password: 'validpassword123'
        },
        {
          userRepository
        }
      );

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBe('Invalid email format');
      expect(mockTransaction.query).not.toHaveBeenCalled();
    });

    it('should fail with invalid password', async () => {
      const result = await registerUser(
        {
          email: 'test@example.com',
          password: 'short'
        },
        {
          userRepository
        }
      );

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBe('Password must be at least 8 characters long');
      expect(mockTransaction.query).not.toHaveBeenCalled();
    });
  });

  describe('business rule violations', () => {
    it('should fail when user already exists', async () => {
      // Arrange: Mock that email already exists
      mockTransaction.query.mockResolvedValueOnce({
        rows: [{
          id: 'existing-id',
          email: 'test@example.com',
          password_hash: '$2b$12$hashedpassword',
          created_at: new Date(),
          updated_at: new Date(),
          last_login: null
        }]
      });

      // Act
      const result = await registerUser(
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
      expect(result.error).toBe('User already exists');
      expect(mockTransaction.query).toHaveBeenCalledTimes(1); // Only the findByEmail call
    });
  });

  describe('database failures', () => {
    it('should fail when database save fails', async () => {
      // Arrange
      mockTransaction.query
        .mockResolvedValueOnce({ rows: [] }) // findByEmail succeeds
        .mockResolvedValueOnce({ rows: [] }) // findById succeeds
        .mockRejectedValueOnce(new Error('Database error')); // insert fails

      // Act
      const result = await registerUser(
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
      // Arrange
      mockTransaction.query
        .mockResolvedValueOnce({ rows: [] }) // findByEmail succeeds
        .mockResolvedValueOnce({ rows: [] }) // findById succeeds  
        .mockResolvedValueOnce({}) // user insert succeeds
        .mockRejectedValueOnce(new Error('Event publish failed')); // event insert fails

      // Spy on console.error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      const result = await registerUser(
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
        'Failed to publish UserRegistered event:',
        'Failed to publish event: Event publish failed'
      );

      consoleSpy.mockRestore();
    });
  });
});