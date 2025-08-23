import { Result } from '../../../shared/Result';
import { User, Email } from '../User';
import { UserRepository } from '../UserRepository';
import { EventRepository } from '../../DomainEvent/EventRepository';
import { UserLoggedIn } from '../event';

// Input payload type
export type AuthenticateUserPayload = {
  email: string;
  password: string;
};

// Dependency injection type
export type AuthenticateUserDependencies = {
  userRepository: UserRepository;
  eventRepository?: EventRepository;
};

// Return type
export type AuthenticateUserResult = {
  user: User;
};

// Feature function
export async function authenticateUser(
  payload: AuthenticateUserPayload,
  dependencies: AuthenticateUserDependencies
): Promise<Result<AuthenticateUserResult>> {
  const { userRepository, eventRepository } = dependencies;

  // 1. Validate input and create value objects
  const emailResult = Email.create(payload.email);
  if (emailResult.isFailure()) {
    return Result.fail('Invalid credentials');
  }

  if (!payload.password || typeof payload.password !== 'string') {
    return Result.fail('Invalid credentials');
  }

  // 2. Find user by email
  const user = await userRepository.findByEmail(emailResult.value);
  if (!user) {
    return Result.fail('Invalid credentials');
  }

  // 3. Verify password
  const isValid = await user.authenticate(payload.password);
  if (!isValid) {
    return Result.fail('Invalid credentials');
  }

  // 4. Update last login
  const updatedUser = user.updateLastLogin();
  const savedUserResult = await userRepository.save(updatedUser);
  if (savedUserResult.isFailure()) {
    return Result.fail(savedUserResult.error);
  }

  // 5. Publish domain event (optional)
  if (eventRepository) {
    const eventResult = await eventRepository.publish(
      new UserLoggedIn(savedUserResult.value.id)
    );
    if (eventResult.isFailure()) {
      // Log the error but don't fail the authentication
      console.error('Failed to publish UserLoggedIn event:', eventResult.error);
    }
  }

  return Result.success({
    user: savedUserResult.value
  });
}