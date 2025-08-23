import { DomainEvent } from '../DomainEvent/DomainEvent';

export class UserRegistered implements DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly occurredAt: Date = new Date()
  ) {}

  eventName = 'UserRegistered' as const;
}

export class UserLoggedIn implements DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly occurredAt: Date = new Date()
  ) {}

  eventName = 'UserLoggedIn' as const;
}

// Export union type for this subdomain
export type UserEvents = UserRegistered | UserLoggedIn;