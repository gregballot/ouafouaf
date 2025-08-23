import { Result } from '../../shared/Result';
import { AllDomainEvents } from './index';

// Simple Transaction interface
interface Transaction {
  query(sql: string, params: any[]): Promise<any>;
}

export class EventRepository {
  constructor(private transaction: Transaction) {}

  async publish(event: AllDomainEvents): Promise<Result<void>> {
    try {
      await this.transaction.query(`
        INSERT INTO domain_events (id, event_name, event_data, occurred_at)
        VALUES ($1, $2, $3, $4)
      `, [
        crypto.randomUUID(),
        event.eventName,
        JSON.stringify(event),
        event.occurredAt
      ]);

      return Result.success(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return Result.fail(`Failed to publish event: ${message}`);
    }
  }

  async findByAggregateId(aggregateId: string): Promise<AllDomainEvents[]> {
    try {
      const result = await this.transaction.query(`
        SELECT event_name, event_data, occurred_at
        FROM domain_events
        WHERE event_data::jsonb @> $1
        ORDER BY occurred_at ASC
      `, [JSON.stringify({ userId: aggregateId })]);

      return result.rows.map((row: any) => JSON.parse(row.event_data));
    } catch (error) {
      console.error('Error finding events by aggregate ID:', error);
      return [];
    }
  }
}