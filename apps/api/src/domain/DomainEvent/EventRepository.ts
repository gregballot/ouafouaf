import { Transaction } from 'kysely';
import { Database } from '../../shared/database-types';
import { AllDomainEvents } from './index';
import { DatabaseError } from '../../shared/errors';

export class EventRepository {
  // Always work within a transaction
  constructor(private trx: Transaction<Database>) {}

  async publish(event: AllDomainEvents): Promise<void> {
    try {
      await this.trx
        .insertInto('domain_events')
        .values({
          id: crypto.randomUUID(),
          aggregate_id: event.aggregateId,
          event_name: event.eventName,
          event_data: JSON.stringify(event),
          occurred_at: event.occurredAt,
          created_at: new Date(),
        })
        .execute();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new DatabaseError(`Failed to publish event: ${message}`, error);
    }
  }

  async findByAggregateId(aggregateId: string): Promise<AllDomainEvents[]> {
    try {
      const rows = await this.trx
        .selectFrom('domain_events')
        .select(['event_name', 'event_data', 'occurred_at'])
        .where('aggregate_id', '=', aggregateId)
        .orderBy('occurred_at', 'asc')
        .execute();

      return rows.map((row) => {
        // If event_data is already an object (JSONB), return it directly
        // If it's a string, parse it
        if (typeof row.event_data === 'string') {
          return JSON.parse(row.event_data);
        }
        return row.event_data;
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new DatabaseError(
        `Failed to find events by aggregate ID: ${message}`,
        error
      );
    }
  }
}
