import { Result } from '../../../shared/Result';
import { User, Email, Password } from '../User';
import { UserRepository } from '../UserRepository';
import { EventRepository } from '../../DomainEvent/EventRepository';
import { UserRegistered } from '../event';

// Input payload type
export type RegisterUserPayload = {
  email: string;
  password: string;
};

// Dependency injection type
export type RegisterUserDependencies = {
  userRepository: UserRepository;
  eventRepository?: EventRepository;
};

// Return type
export type RegisterUserResult = {
  user: User;
};

// Feature function
export async function registerUser(
  payload: RegisterUserPayload,
  dependencies: RegisterUserDependencies
): Promise<Result<RegisterUserResult>> {
  const { userRepository, eventRepository } = dependencies;

  // 1. Validate input and create value objects
  const emailResult = Email.create(payload.email);
  if (emailResult.isFailure()) {
    return Result.fail(emailResult.error);
  }

  const passwordResult = await Password.create(payload.password);
  if (passwordResult.isFailure()) {
    return Result.fail(passwordResult.error);
  }

  // 2. Business rule: Email must be unique
  const isUnique = await userRepository.isEmailUnique(emailResult.value);
  if (!isUnique) {
    return Result.fail('User already exists');
  }

  // 3. Create user entity
  const userResult = await User.create(emailResult.value, passwordResult.value);
  if (userResult.isFailure()) {
    return Result.fail(userResult.error);
  }

  // 4. Persist the user
  const savedUserResult = await userRepository.save(userResult.value);
  if (savedUserResult.isFailure()) {
    return Result.fail(savedUserResult.error);
  }

  // 5. Publish domain event (optional)
  if (eventRepository) {
    const eventResult = await eventRepository.publish(
      new UserRegistered(savedUserResult.value.id, savedUserResult.value.email.toString())
    );
    if (eventResult.isFailure()) {
      // Log the error but don't fail the registration
      console.error('Failed to publish UserRegistered event:', eventResult.error);
    }
  }

  return Result.success({
    user: savedUserResult.value
  });
}