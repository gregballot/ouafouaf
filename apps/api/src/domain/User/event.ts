import { DomainEvent } from '../DomainEvent/DomainEvent';

export class UserRegistered implements DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly occurredAt: Date = new Date()
  ) {}

  eventName = 'UserRegistered' as const;

  get aggregateId(): string {
    return this.userId;
  }
}

export class UserLoggedIn implements DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly occurredAt: Date = new Date()
  ) {}

  eventName = 'UserLoggedIn' as const;

  get aggregateId(): string {
    return this.userId;
  }
}

// Export union type for this subdomain
export type UserEvents = UserRegistered | UserLoggedIn;