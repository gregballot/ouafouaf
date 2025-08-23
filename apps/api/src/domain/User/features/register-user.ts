import { User, Email, Password } from '../User';
import { UserRepository } from '../UserRepository';
import { EventRepository } from '../../DomainEvent/EventRepository';
import { UserRegistered } from '../event';
import { logger } from '../../../lib/logger';

// Input payload type
export interface RegisterUserPayload {
  email: string;
  password: string;
}

// Dependency injection type
export interface RegisterUserDependencies {
  userRepository: UserRepository;
  eventRepository?: EventRepository;
}

// Return type
export interface RegisterUserResult {
  user: User;
}

// Feature function - clean and simple, no Result pattern
export async function registerUser(
  payload: RegisterUserPayload,
  dependencies: RegisterUserDependencies
): Promise<RegisterUserResult> {
  const { userRepository, eventRepository } = dependencies;

  // 1. Create value objects (throws on validation error)
  const email = Email.create(payload.email);
  const password = await Password.create(payload.password);

  // 2. Business rule: Email must be unique (throws UserAlreadyExistsError)
  await userRepository.assertEmailUnique(email);

  // 3. Create user entity (throws on validation error)
  const user = await User.create({ email, password });

  // 4. Persist the user (throws DatabaseError on failure)
  const savedUser = await userRepository.save(user);

  // 5. Publish domain event (optional, don't fail registration if this fails)
  if (eventRepository) {
    try {
      await eventRepository.publish(
        new UserRegistered(savedUser.id, savedUser.email.toString())
      );
    } catch (error) {
      // Log the error but don't fail the registration
      logger.error('Failed to publish UserRegistered event:', error instanceof Error ? error : new Error(String(error)));
    }
  }

  return {
    user: savedUser
  };
}