import { UserEvents } from '../User/event';

// Type-safe union of ALL domain events
export type AllDomainEvents = UserEvents;

// Re-export everything for convenience
export * from './DomainEvent';
export * from './EventRepository';
export * from '../User/event';