import { describe, it, expect, beforeEach } from 'vitest';
import { authenticateUser } from './authenticate-user';
import { UserRepository } from '../UserRepository';
import { EventRepository } from '../../DomainEvent/EventRepository';
import { UserBuilder } from '../UserBuilder';
import { User } from '../User';
import { withTransaction } from '../../../shared/transaction';

describe('Authenticate User Feature - Integration Tests', () => {
  let testUser: User;

  beforeEach(async () => {
    await withTransaction(async (trx) => {
      const userRepository = new UserRepository(trx);

      testUser = await new UserBuilder()
        .withEmail('test@example.com')
        .withPassword('validpassword123')
        .build();

      await userRepository.save(testUser);
    });
  });
  describe('successful authentication', () => {
    it('should authenticate user with valid credentials', async () => {
      // Act: Authenticate the user
      const result = await withTransaction(async (trx) => {
        const userRepository = new UserRepository(trx);
        const eventRepository = new EventRepository(trx);

        return await authenticateUser(
          {
            email: 'test@example.com',
            password: 'validpassword123',
          },
          {
            userRepository,
            eventRepository,
          }
        );
      });

      // Assert - check returned user
      expect(result.user.email.toString()).toBe('test@example.com');
      expect(result.user.lastLogin).toBeInstanceOf(Date);
      expect(result.user.id).toBe(testUser.id);

      // Assert - verify lastLogin was updated in database
      await withTransaction(async (trx) => {
        const userRepository = new UserRepository(trx);
        const updatedUser = await userRepository.findById(testUser.id);

        expect(updatedUser).toBeTruthy();
        expect(updatedUser!.lastLogin).toBeInstanceOf(Date);
        expect(updatedUser!.lastLogin!.getTime()).toBeGreaterThan(
          Date.now() - 5000
        ); // Within last 5 seconds
      });

      // Assert - verify domain event was published
      await withTransaction(async (trx) => {
        const eventRepository = new EventRepository(trx);
        const events = await eventRepository.findByAggregateId(testUser.id);

        expect(events).toHaveLength(1);
        expect(events[0].eventName).toBe('UserLoggedIn');
      });
    });

    it('should authenticate user without event repository', async () => {
      // Act: Authenticate the user without event repository
      const result = await withTransaction(async (trx) => {
        const userRepository = new UserRepository(trx);

        return await authenticateUser(
          {
            email: 'test@example.com',
            password: 'validpassword123',
          },
          {
            userRepository,
            // No event repository
          }
        );
      });

      // Assert - user should still be authenticated
      expect(result.user.email.toString()).toBe('test@example.com');

      // Assert - no events should be published
      await withTransaction(async (trx) => {
        const eventRepository = new EventRepository(trx);
        const events = await eventRepository.findByAggregateId(testUser.id);

        expect(events).toHaveLength(0);
      });
    });
  });

  describe('validation failures', () => {
    it('should fail with invalid email', async () => {
      await expect(
        withTransaction(async (trx) => {
          const userRepository = new UserRepository(trx);

          return await authenticateUser(
            {
              email: 'invalid-email',
              password: 'validpassword123',
            },
            {
              userRepository,
            }
          );
        })
      ).rejects.toThrow('Invalid email format');
    });
  });

  describe('authentication failures', () => {
    it('should fail when user not found', async () => {
      await expect(
        withTransaction(async (trx) => {
          const userRepository = new UserRepository(trx);

          return await authenticateUser(
            {
              email: 'nonexistent@example.com',
              password: 'anypassword',
            },
            {
              userRepository,
            }
          );
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should fail with incorrect password', async () => {
      // testUser is already created in beforeEach, just test with wrong password
      await expect(
        withTransaction(async (trx) => {
          const userRepository = new UserRepository(trx);

          return await authenticateUser(
            {
              email: 'test@example.com',
              password: 'wrongpassword',
            },
            {
              userRepository,
            }
          );
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('timing attack protection', () => {
    it('should take similar time for non-existent users', async () => {
      // This test ensures timing attack protection is working
      // We test that both non-existent user and wrong password scenarios
      // take similar time due to the dummy bcrypt operation

      const startTime1 = Date.now();
      await expect(
        withTransaction(async (trx) => {
          const userRepository = new UserRepository(trx);

          return await authenticateUser(
            {
              email: 'nonexistent@example.com',
              password: 'anypassword',
            },
            {
              userRepository,
            }
          );
        })
      ).rejects.toThrow('Invalid credentials');
      const duration1 = Date.now() - startTime1;

      // testUser is already created in beforeEach

      const startTime2 = Date.now();
      await expect(
        withTransaction(async (trx) => {
          const userRepository = new UserRepository(trx);

          return await authenticateUser(
            {
              email: 'test@example.com',
              password: 'wrongpassword',
            },
            {
              userRepository,
            }
          );
        })
      ).rejects.toThrow('Invalid credentials');
      const duration2 = Date.now() - startTime2;

      // Both should take at least 50ms (bcrypt time) and be within reasonable range of each other
      expect(duration1).toBeGreaterThan(50);
      expect(duration2).toBeGreaterThan(50);
      expect(Math.abs(duration1 - duration2)).toBeLessThan(100); // Within 100ms difference
    });
  });
});
