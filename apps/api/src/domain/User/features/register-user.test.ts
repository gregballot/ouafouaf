import { describe, it, expect } from 'vitest';
import { registerUser } from './register-user';
import { UserRepository } from '../UserRepository';
import { EventRepository } from '../../DomainEvent/EventRepository';
import { UserBuilder } from '../UserBuilder';
import { withTransaction } from '../../../shared/transaction';

describe('Register User Feature - Integration Tests', () => {
  describe('successful registration', () => {
    it('should register new user successfully', async () => {
      const result = await withTransaction(async (trx) => {
        const userRepository = new UserRepository(trx);
        const eventRepository = new EventRepository(trx);

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

        return result;
      });

      // Assert - check returned user
      expect(result.user.email.toString()).toBe('test@example.com');
      expect(result.user.id).toBeDefined();

      // Assert - verify user was saved to database
      await withTransaction(async (trx) => {
        const userRepository = new UserRepository(trx);
        const savedUser = await userRepository.findById(result.user.id);

        expect(savedUser).toBeTruthy();
        expect(savedUser!.email.toString()).toBe('test@example.com');
      });

      // Assert - verify domain event was published
      await withTransaction(async (trx) => {
        const eventRepository = new EventRepository(trx);
        const events = await eventRepository.findByAggregateId(result.user.id);

        expect(events).toHaveLength(1);
        expect(events[0].eventName).toBe('UserRegistered');
        expect((events[0] as any).email).toBe('test@example.com');
      });
    });

    it('should register user without event repository', async () => {
      const result = await withTransaction(async (trx) => {
        const userRepository = new UserRepository(trx);

        return await registerUser(
          {
            email: 'test@example.com',
            password: 'validpassword123'
          },
          {
            userRepository
            // No event repository
          }
        );
      });

      // Assert - user should still be created
      expect(result.user.email.toString()).toBe('test@example.com');

      // Assert - no events should be published
      await withTransaction(async (trx) => {
        const eventRepository = new EventRepository(trx);
        const events = await eventRepository.findByAggregateId(result.user.id);

        expect(events).toHaveLength(0);
      });
    });
  });

  describe('validation failures', () => {
    it('should fail with invalid email', async () => {
      await expect(withTransaction(async (trx) => {
        const userRepository = new UserRepository(trx);

        return await registerUser(
          {
            email: 'invalid-email',
            password: 'validpassword123'
          },
          {
            userRepository
          }
        );
      })).rejects.toThrow('Invalid email format');
    });

    it('should fail with invalid password', async () => {
      await expect(withTransaction(async (trx) => {
        const userRepository = new UserRepository(trx);

        return await registerUser(
          {
            email: 'test@example.com',
            password: 'short'
          },
          {
            userRepository
          }
        );
      })).rejects.toThrow('Password must be at least 8 characters long');
    });
  });

  describe('business rule violations', () => {
    it('should fail when user already exists', async () => {
      // Arrange: Create a user first
      await withTransaction(async (trx) => {
        const userRepository = new UserRepository(trx);
        const existingUser = await new UserBuilder()
          .withEmail('test@example.com')
          .withPassword('existingpassword123')
          .build();
        await userRepository.save(existingUser);
      });

      // Act & Assert: Try to register with same email
      await expect(withTransaction(async (trx) => {
        const userRepository = new UserRepository(trx);

        return await registerUser(
          {
            email: 'test@example.com',
            password: 'validpassword123'
          },
          {
            userRepository
          }
        );
      })).rejects.toThrow('User already exists');
    });
  });
});