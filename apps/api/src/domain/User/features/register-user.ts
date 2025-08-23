import { User, Email, Password } from '../User';
import { UserRepository } from '../UserRepository';
import { EventRepository } from '../../DomainEvent/EventRepository';
import { UserRegistered } from '../event';
import { logger } from '../../../lib/logger';

export interface RegisterUserPayload {
  email: string;
  password: string;
}

interface Dependencies {
  userRepository: UserRepository;
  eventRepository?: EventRepository;
}

export interface RegisterUserResult {
  user: User;
}
export async function registerUser(
  payload: RegisterUserPayload,
  dependencies: Dependencies
): Promise<RegisterUserResult> {
  const { userRepository, eventRepository } = dependencies;

  const email = Email.create(payload.email);
  const password = await Password.create(payload.password);

  await userRepository.assertEmailUnique(email);

  const user = await User.create({ email, password });

  const savedUser = await userRepository.save(user);
  if (eventRepository) {
    try {
      await eventRepository.publish(
        new UserRegistered(savedUser.id, savedUser.email.toString())
      );
    } catch (error) {
      logger.error('Failed to publish UserRegistered event:', error instanceof Error ? error : new Error(String(error)));
    }
  }

  return {
    user: savedUser
  };
}
