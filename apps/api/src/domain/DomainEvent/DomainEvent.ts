export interface DomainEvent {
  eventName: string;
  occurredAt: Date;
  aggregateId: string;
}