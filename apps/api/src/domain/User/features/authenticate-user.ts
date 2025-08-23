import { User, Email } from '../User';
import { UserRepository } from '../UserRepository';
import { EventRepository } from '../../DomainEvent/EventRepository';
import { UserLoggedIn } from '../event';
import { InvalidCredentialsError } from '../../../shared/errors';
import { logger } from '../../../lib/logger';

// Input payload type
export interface AuthenticateUserPayload {
  email: string;
  password: string;
}

// Dependency injection type
export interface AuthenticateUserDependencies {
  userRepository: UserRepository;
  eventRepository?: EventRepository;
}

// Return type
export interface AuthenticateUserResult {
  user: User;
}

// Feature function - clean and simple, no Result pattern
export async function authenticateUser(
  payload: AuthenticateUserPayload,
  dependencies: AuthenticateUserDependencies
): Promise<AuthenticateUserResult> {
  const { userRepository, eventRepository } = dependencies;

  // 1. Validate input and create value objects (throws on validation error)
  const email = Email.create(payload.email);

  if (!payload.password || typeof payload.password !== 'string') {
    throw new InvalidCredentialsError();
  }

  // 2. Find user by email (returns null if not found)
  const user = await userRepository.findByEmail(email);

  // 3. Verify password - always perform password hashing to prevent timing attacks
  let isValid = false;
  if (user) {
    isValid = await user.authenticate(payload.password);
  } else {
    // Perform a dummy bcrypt operation to normalize timing
    // even when user doesn't exist
    const bcrypt = await import('bcrypt');
    await bcrypt.compare(payload.password, '$2b$12$dummy.hash.to.prevent.timing.attacks.with.consistent.work.factor');
  }

  if (!user || !isValid) {
    throw new InvalidCredentialsError();
  }

  // 4. Update last login
  const updatedUser = user.updateLastLogin();

  // 5. Save updated user (throws DatabaseError on failure)
  const savedUser = await userRepository.save(updatedUser);

  // 6. Publish domain event (optional, don't fail authentication if this fails)
  if (eventRepository) {
    try {
      await eventRepository.publish(
        new UserLoggedIn(savedUser.id)
      );
    } catch (error) {
      // Log the error but don't fail the authentication
      logger.error('Failed to publish UserLoggedIn event:', error instanceof Error ? error : new Error(String(error)));
    }
  }

  return {
    user: savedUser
  };
}