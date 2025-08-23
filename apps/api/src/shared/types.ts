// Transaction interface for our domain
export interface Transaction {
  query(sql: string, params?: any[]): Promise<any>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  release(): void;
  isCompleted: boolean;
}

// Extend Fastify request interface
declare module 'fastify' {
  interface FastifyRequest {
    transaction: Transaction;
  }
}