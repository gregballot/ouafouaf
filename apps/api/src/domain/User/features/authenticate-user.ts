import { User, Email } from '../User';
import { UserRepository } from '../UserRepository';
import { EventRepository } from '../../DomainEvent/EventRepository';
import { UserLoggedIn } from '../event';
import { InvalidCredentialsError } from '../../../shared/errors';
import { logger } from '../../../lib/logger';

export interface AuthenticateUserPayload {
  email: string;
  password: string;
}

interface Dependencies {
  userRepository: UserRepository;
  eventRepository?: EventRepository;
}

export interface AuthenticateUserResult {
  user: User;
}
export async function authenticateUser(
  payload: AuthenticateUserPayload,
  dependencies: Dependencies
): Promise<AuthenticateUserResult> {
  const { userRepository, eventRepository } = dependencies;

  const email = Email.create(payload.email);

  if (!payload.password || typeof payload.password !== 'string') {
    throw new InvalidCredentialsError();
  }

  const user = await userRepository.findByEmail(email);

  let isValid = false;
  if (user) {
    isValid = await user.authenticate(payload.password);
  } else {
    const bcrypt = await import('bcrypt');
    await bcrypt.compare(payload.password, '$2b$12$dummy.hash.to.prevent.timing.attacks.with.consistent.work.factor');
  }

  if (!user || !isValid) {
    throw new InvalidCredentialsError();
  }

  user.updateLastLogin();

  const savedUser = await userRepository.save(user);
  if (eventRepository) {
    try {
      await eventRepository.publish(
        new UserLoggedIn(savedUser.id)
      );
    } catch (error) {
      logger.error('Failed to publish UserLoggedIn event:', error instanceof Error ? error : new Error(String(error)));
    }
  }

  return {
    user: savedUser
  };
}
