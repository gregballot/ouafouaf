// Database schema types for Kysely

export interface UsersTable {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  last_login: Date | null;
}

export interface DomainEventsTable {
  id: string;
  aggregate_id: string;
  event_name: string;
  event_data: any; // JSONB - can be object or string
  occurred_at: Date;
  created_at: Date;
}

export interface Database {
  users: UsersTable;
  domain_events: DomainEventsTable;
}
