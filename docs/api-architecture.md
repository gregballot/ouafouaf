# Domain-Driven Design + Hexagonal Architecture Guidelines

This document outlines our pragmatic approach to DDD and Hexagonal Architecture, emphasizing simplicity and maintainability over theoretical purity.

## Core Principles

### Subdomain-First Organization

Organize code by business domains (bounded contexts) rather than technical layers. Each subdomain contains all related business logic, data access, and domain concepts.

### Type-Safe Database Access

Use Kysely for type-safe SQL queries with full TypeScript integration. Database schema types are centrally defined and provide compile-time safety.

### Domain Error Management

Use custom domain errors that automatically map to HTTP status codes. Features throw specific errors instead of returning Result objects, making the code cleaner and more direct.

### Simplified Dependency Management

Use direct instantiation in route handlers rather than complex DI containers. Dependencies are clear and traceable.

### Transaction-Per-Feature Pattern

Each feature function executes within its own database transaction using `withTransaction()`. This ensures atomic operations and automatic rollback on errors.

## Directory Structure

```
src/
├── routes/
│   ├── [resource].ts           # HTTP route handlers
│   └── [resource].test.ts      # Route integration tests
├── domain/
│   ├── [SubdomainName]/        # Business domain (User, Order, Product, etc.)
│   │   ├── [Entity].ts         # Domain entity + inline value objects
│   │   ├── [Entity].test.ts    # Entity unit tests
│   │   ├── [Entity]Builder.ts  # Test data builder
│   │   ├── [Entity]Repository.ts # Data persistence with Kysely
│   │   ├── event.ts            # Domain-specific events
│   │   └── features/
│   │       ├── [feature-name].ts     # Business use case
│   │       └── [feature-name].test.ts # Feature integration tests
│   └── DomainEvent/
│       ├── DomainEvent.ts      # Base event interface
│       ├── EventRepository.ts  # Event infrastructure with Kysely
│       └── index.ts            # Type-safe event aggregation
└── shared/
    ├── database-types.ts       # Kysely database schema types
    ├── kysely.ts               # Kysely instance configuration
    ├── transaction.ts          # Transaction management helpers
    ├── errors.ts               # Domain errors with HTTP mapping
    ├── error-handler.ts        # Global Fastify error handler
    └── types.ts                # Shared type definitions
```

## Entity Design Patterns

### Entity Structure

```typescript
// domain/[Subdomain]/[Entity].ts

// Inline Value Objects
export class Email {
  private constructor(private readonly value: string) {}

  static create(value: string): Email {
    if (!value || typeof value !== 'string') {
      throw new InvalidEmailError();
    }

    const trimmed = value.trim().toLowerCase();
    if (!this.isValidEmail(trimmed)) {
      throw new InvalidEmailError();
    }

    return new Email(trimmed);
  }

  toString(): string { return this.value; }
  equals(other: Email): boolean { return this.value === other.value; }

  private static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
  }
}

// Entity constructor parameters - typed object
export interface [Entity]ConstructorParams {
  id: string;
  email: Email;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Create[Entity]Params {
  email: Email;
  passwordHash: string;
}

// Main Entity
export class [Entity] {
  public readonly id: string;
  public readonly email: Email;
  public readonly passwordHash: string; // sensitive field
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(params: [Entity]ConstructorParams) {
    this.id = params.id;
    this.email = params.email;
    this.passwordHash = params.passwordHash;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  static async create(params: Create[Entity]Params): Promise<[Entity]> {
    const now = new Date();
    return new [Entity]({
      id: crypto.randomUUID(),
      email: params.email,
      passwordHash: params.passwordHash,
      createdAt: now,
      updatedAt: now
    });
  }

  // Public state getter - excludes sensitive fields
  get details() {
    return {
      id: this.id,
      email: this.email.toString(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Business methods - return new instances for immutability
  public businessMethod(): [Entity] {
    return new [Entity]({
      id: this.id,
      email: this.email,
      passwordHash: this.passwordHash,
      createdAt: this.createdAt,
      updatedAt: new Date()
    });
  }

  // For persistence - exposes internal state including sensitive fields
  public getInternalState() {
    return {
      id: this.id,
      email: this.email.toString(),
      passwordHash: this.passwordHash,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
```

### Key Patterns

- **Private constructors** with static `create()` factory methods
- **Typed object parameters** for maintainable entity creation
- **Direct exception throwing** for clean error handling
- **Inline value objects** to avoid file explosion
- **getInternalState()** method for repository persistence
- **Domain validation** in entity creation and business methods

## Repository Pattern

### Repository Interface

```typescript
// domain/[Subdomain]/[Entity]Repository.ts
export class [Entity]Repository {
  constructor(private trx: Transaction<Database>) {}

  // Smart save - handles both create and update
  async save(entity: [Entity]): Promise<[Entity]> {
    const state = entity.getInternalState();

    try {
      // Check if entity exists using Kysely
      const existing = await this.trx
        .selectFrom('[table]')
        .select('id')
        .where('id', '=', state.id)
        .executeTakeFirst();

      if (existing) {
        // Update existing
        await this.trx
          .updateTable('[table]')
          .set({
            email: state.email,
            password_hash: state.passwordHash,
            updated_at: state.updatedAt
          })
          .where('id', '=', state.id)
          .execute();
      } else {
        // Create new
        await this.trx
          .insertInto('[table]')
          .values({
            id: state.id,
            email: state.email,
            password_hash: state.passwordHash,
            created_at: state.createdAt,
            updated_at: state.updatedAt
          })
          .execute();
      }

      return entity;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new DatabaseError(`Failed to save [entity]: ${message}`, error);
    }
  }

  async findById(id: string): Promise<[Entity] | null> {
    try {
      const row = await this.trx
        .selectFrom('[table]')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();

      return row ? this.mapRowToEntity(row) : null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new DatabaseError(`Failed to find [entity] by id: ${message}`, error);
    }
  }

  async findBy[Criteria](criteria: ValueObject): Promise<[Entity] | null> {
    try {
      const row = await this.trx
        .selectFrom('[table]')
        .selectAll()
        .where('[criteria_column]', '=', criteria.toString())
        .executeTakeFirst();

      return row ? this.mapRowToEntity(row) : null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new DatabaseError(`Failed to find [entity] by [criteria]: ${message}`, error);
    }
  }

  private mapRowToEntity(row: [Table]Row): [Entity] {
    return new [Entity]({
      id: row.id,
      email: Email.create(row.email),
      passwordHash: row.password_hash,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }
}
```

### Key Patterns

- **Transaction injection** with Kysely types in constructor
- **Smart save method** handles create/update logic
- **Direct exception throwing** for error handling
- **Kysely query builder** for type-safe database operations
- **Value objects** as query parameters
- **Null return** for not-found cases
- **Private mapping methods** for domain reconstruction

## Feature Functions

### Feature Structure

```typescript
// domain/[Subdomain]/features/[feature-name].ts
import { logger } from '../../../lib/logger';

// Input payload type
export interface [Feature]Payload {
  property1: string;
  property2: number;
  // ... other input properties
}

// Dependency injection type
export interface [Feature]Dependencies {
  [entity]Repository: [Entity]Repository;
  eventRepository?: EventRepository;
  // ... other dependencies
}

// Return type
export interface [Feature]Result {
  [entity]: [Entity];
  // ... other return properties
}

// Feature function - clean and simple, no Result pattern
export async function [featureName](
  payload: [Feature]Payload,
  dependencies: [Feature]Dependencies
): Promise<[Feature]Result> {
  const { [entity]Repository, eventRepository } = dependencies;

  // 1. Validate input and create value objects (throws on validation error)
  const valueObject = ValueObject.create(payload.property);

  // 2. Business logic and domain operations
  const entity = await [entity]Repository.findBy[Criteria](valueObject);
  if (!entity) {
    throw new [Entity]NotFoundError();
  }

  // 3. Domain operations
  const updatedEntity = entity.businessMethod(valueObject);

  // 4. Persist changes (throws DatabaseError on failure)
  const savedEntity = await [entity]Repository.save(updatedEntity);

  // 5. Publish domain events (optional, don't fail feature if this fails)
  if (eventRepository) {
    try {
      await eventRepository.publish(
        new [Entity][Action](savedEntity.id)
      );
    } catch (error) {
      // Log the error but don't fail the feature
      logger.error('Failed to publish [Entity][Action] event:', error instanceof Error ? error : new Error(String(error)));
    }
  }

  return {
    [entity]: savedEntity
  };
}
```

### Key Patterns

- **Typed interfaces** for input, dependencies, and return types
- **Direct exception throwing** for clean error handling
- **Value object validation** early in the function (throws on error)
- **Singleton logger** for error logging instead of dependency injection
- **Domain event publishing** with error isolation
- **Clear business rule enforcement** with specific domain errors

## Event Architecture

### Domain Events

```typescript
// domain/[Subdomain]/event.ts
import { DomainEvent } from '../DomainEvent/DomainEvent';

export class [Entity][Action] implements DomainEvent {
  constructor(
    public readonly [entity]Id: string,
    public readonly additionalData: string,
    public readonly occurredAt: Date = new Date()
  ) {}

  eventName = '[Entity][Action]' as const;

  get aggregateId(): string {
    return this.[entity]Id;
  }
}

// Export union type for this subdomain
export type [Subdomain]Events = [Entity][Action] | [Entity][OtherAction];
```

### Base Domain Event Interface

```typescript
// domain/DomainEvent/DomainEvent.ts
export interface DomainEvent {
  eventName: string;
  occurredAt: Date;
  aggregateId: string;
}
```

### Event Infrastructure

```typescript
// domain/DomainEvent/index.ts
import { [Subdomain]Events } from '../[Subdomain]/event';

// Type-safe union of ALL domain events
export type AllDomainEvents = [Subdomain]Events; // Add more as needed

// Re-export everything
export * from './DomainEvent';
export * from './EventRepository';
export * from '../[Subdomain]/event';
```

## Testing Patterns

### Entity Unit Tests

```typescript
// domain/[Subdomain]/[Entity].test.ts
describe('[Entity]', () => {
  describe('creation', () => {
    it('should create [entity] with valid data', () => {
      const valueObject = ValueObject.create('valid-value');
      expect(valueObject.isSuccess()).toBe(true);

      const entity = [Entity].create(valueObject.value);
      expect(entity.isSuccess()).toBe(true);
      expect(entity.value.id).toBeDefined();
    });

    it('should fail with invalid data', () => {
      const valueObject = ValueObject.create('invalid-value');
      expect(valueObject.isFailure()).toBe(true);
    });
  });

  describe('business methods', () => {
    it('should perform business operation correctly', () => {
      const entity = [Entity].create(validData).value;
      const result = entity.businessMethod(validInput);

      expect(result.isSuccess()).toBe(true);
      // Assert on business rule outcomes
    });
  });

  describe('getInternalState', () => {
    it('should expose all data needed for persistence', () => {
      const entity = [Entity].create(validData).value;
      const state = entity.getInternalState();

      expect(state).toMatchObject({
        id: expect.any(String),
        property: 'expected-value',
        createdAt: expect.any(Date),
      });
    });
  });
});
```

### Feature Integration Tests

We use a **clean slate testing approach** with a dedicated test database:

#### Test Database Philosophy

- **Complete isolation**: Tests use `ouafouaf_test` database, completely separate from development data
- **Clean slate per test**: Each test starts with an empty database and creates its own test data
- **Real database operations**: No mocking of repositories or database operations
- **Test utilities**: Centralized test infrastructure in `src/shared/test-utils/`

#### Test Structure Pattern

```typescript
// domain/[Subdomain]/features/[feature-name].test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { authenticateUser } from './authenticate-user';
import { UserRepository } from '../UserRepository';
import { EventRepository } from '../../DomainEvent/EventRepository';
import { UserBuilder } from '../UserBuilder';
import { User } from '../User';
import { withTransaction } from '../../../shared/transaction';

describe('Authenticate User Feature - Integration Tests', () => {
  let testUser: User;

  beforeEach(async () => {
    // Create test data using withTransaction
    await withTransaction(async (trx) => {
      const userRepository = new UserRepository(trx);

      testUser = await new UserBuilder()
        .withEmail('test@example.com')
        .withPassword('validpassword123')
        .build();

      await userRepository.save(testUser);
    });
  });

  it('should authenticate user with valid credentials', async () => {
    // Test the feature using withTransaction
    const result = await withTransaction(async (trx) => {
      const userRepository = new UserRepository(trx);
      const eventRepository = new EventRepository(trx);

      return await authenticateUser(
        { email: 'test@example.com', password: 'validpassword123' },
        { userRepository, eventRepository }
      );
    });

    // Verify returned data
    expect(result.user.email.toString()).toBe('test@example.com');
    expect(result.user.lastLogin).toBeInstanceOf(Date);

    // Verify database state changes
    await withTransaction(async (trx) => {
      const userRepository = new UserRepository(trx);
      const updatedUser = await userRepository.findById(testUser.id);
      expect(updatedUser!.lastLogin).toBeInstanceOf(Date);
    });

    // Verify domain events were published
    await withTransaction(async (trx) => {
      const eventRepository = new EventRepository(trx);
      const events = await eventRepository.findByAggregateId(testUser.id);
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('UserLoggedIn');
    });
  });

  it('should fail with invalid credentials', async () => {
    await expect(
      withTransaction(async (trx) => {
        const userRepository = new UserRepository(trx);

        return await authenticateUser(
          { email: 'test@example.com', password: 'wrongpassword' },
          { userRepository }
        );
      })
    ).rejects.toThrow('Invalid credentials');
  });
});
```

#### Key Testing Patterns

- **beforeEach setup**: Create fresh test data for each test using `withTransaction()`
- **Complete workflow testing**: Test the entire feature flow from input to database state
- **Domain event verification**: Verify that domain events are properly published
- **Error scenario testing**: Test both success and failure paths
- **Builder pattern**: Use entity builders for consistent test data creation

### Builder Pattern

```typescript
// domain/[Subdomain]/[Entity]Builder.ts
export class [Entity]Builder {
  private property1 = 'default-value';
  private property2 = 123;

  with[Property1](value: string): [Entity]Builder {
    this.property1 = value;
    return this;
  }

  with[Property2](value: number): [Entity]Builder {
    this.property2 = value;
    return this;
  }

  build(): [Entity] {
    const valueObject = ValueObject.create(this.property1);
    if (valueObject.isFailure()) {
      throw new Error(`Invalid test data: ${valueObject.error}`);
    }

    const entity = [Entity].create(valueObject.value, this.property2);
    if (entity.isFailure()) {
      throw new Error(`Invalid test entity: ${entity.error}`);
    }

    return entity.value;
  }
}
```

## Route Handler Pattern

### HTTP Routes

```typescript
// routes/[resource].ts
export async function [resource]Routes(fastify: FastifyInstance) {
  // Route with transaction management
  fastify.post('/[endpoint]', async (request, reply) => {
    // Instantiate dependencies with transaction
    const [entity]Repository = new [Entity]Repository(request.transaction);
    const eventRepository = new EventRepository(request.transaction);

    // Execute feature
    const result = await [featureName](
      {
        property: request.body.property
        // ... map request body to payload
      },
      {
        [entity]Repository,
        eventRepository
      }
    );

    return reply.status(201).send({
      [entity]: {
        id: result.value.[entity].id,
        // ... map entity to response format
      }
    });
  });
}
```

## Transaction Management

### Fastify Hooks Setup

```typescript
// config/database.ts or similar
fastify.addHook('onRequest', async (request) => {
  request.transaction = await db.transaction();
});

fastify.addHook('onResponse', async (request, reply) => {
  if (request.transaction && !request.transaction.isCompleted) {
    await request.transaction.commit();
  }
});

fastify.addHook('onError', async (request, reply, error) => {
  if (request.transaction && !request.transaction.isCompleted) {
    await request.transaction.rollback();
  }
});
```

## Logging Architecture

### Singleton Logger Pattern

Instead of injecting logger dependencies into feature functions, we use a singleton logger service that can be initialized with the appropriate logger implementation.

```typescript
// lib/logger.ts
interface Logger {
  info: (message: string, ...args: any[]) => void;
  error: (message: string, error?: Error) => void;
  warn: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

class LoggerService implements Logger {
  private static instance: LoggerService;
  private logger: Logger | null = null;

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  initialize(logger: Logger): void {
    this.logger = logger;
  }

  error(message: string, error?: Error): void {
    if (this.logger) {
      this.logger.error(message, error);
    } else {
      console.error(message, error);
    }
  }
}

export const logger = LoggerService.getInstance();
```

### Usage in Features

```typescript
// In server initialization
logger.initialize(fastify.log);

// In feature functions
import { logger } from '../../../lib/logger';

export async function someFeature() {
  try {
    await eventRepository.publish(event);
  } catch (error) {
    logger.error(
      'Failed to publish event:',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}
```

### Key Benefits

- **No dependency injection noise** - features stay clean
- **Centralized logging** - consistent across the application
- **Testable** - can be mocked for tests
- **Framework agnostic** - can work with any logger implementation

## Database Access with Kysely

### Schema Types

Define database schema types centrally for type safety across all queries:

```typescript
// shared/database-types.ts
export interface UsersTable {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  last_login: Date | null;
}

export interface Database {
  users: UsersTable;
  domain_events: DomainEventsTable;
}
```

### Repository Pattern with Kysely

```typescript
// domain/User/UserRepository.ts
import { Kysely, Transaction } from 'kysely';
import { Database } from '../../shared/database-types';

export class UserRepository {
  constructor(private db: Kysely<Database> | Transaction<Database>) {}

  async save(user: User): Promise<User> {
    const state = user.getInternalState();

    const existing = await this.db
      .selectFrom('users')
      .select('id')
      .where('id', '=', state.id)
      .executeTakeFirst();

    if (existing) {
      await this.db
        .updateTable('users')
        .set({
          email: state.email,
          password_hash: state.passwordHash,
          updated_at: state.updatedAt,
          last_login: state.lastLogin,
        })
        .where('id', '=', state.id)
        .execute();
    } else {
      await this.db
        .insertInto('users')
        .values({
          id: state.id,
          email: state.email,
          password_hash: state.passwordHash,
          created_at: state.createdAt,
          updated_at: state.updatedAt,
          last_login: state.lastLogin,
        })
        .execute();
    }

    return user;
  }
}
```

### Transaction Management

```typescript
// routes/auth.ts
import { withTransaction } from '../shared/transaction';

export async function authRoutes(fastify: FastifyInstance) {
  server.post('/signup', async (request, reply) => {
    const result = await withTransaction(async (trx) => {
      const userRepository = new UserRepository(trx);
      const eventRepository = new EventRepository(trx);

      return await registerUser(payload, { userRepository, eventRepository });
    });

    // Handle success response
  });
}
```

## Domain Error Management

### Error Hierarchy

```typescript
// shared/errors.ts
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;

  toResponse() {
    return {
      error: {
        message: this.message,
        code: this.code,
      },
    };
  }
}

export class UserAlreadyExistsError extends DomainError {
  readonly code = 'USER_EXISTS';
  readonly httpStatus = 409;

  constructor() {
    super('User already exists');
  }
}
```

### Feature Error Handling

Features now throw domain errors instead of returning Result objects:

```typescript
// domain/User/features/register-user.ts
export async function registerUser(
  payload: RegisterUserPayload,
  dependencies: RegisterUserDependencies
): Promise<RegisterUserResult> {
  const emailResult = Email.create(payload.email);
  if (emailResult.isFailure()) {
    throw new InvalidEmailError();
  }

  await userRepository.assertEmailUnique(emailResult.value);
  // ... rest of implementation
}
```

### Global Error Handler

```typescript
// shared/error-handler.ts
export function registerErrorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler(async (error, request, reply) => {
    if (isDomainError(error)) {
      return reply.status(error.httpStatus).send(error.toResponse());
    }

    // Handle other errors...
  });
}
```

## Code Quality Guidelines

### Domain Encapsulation

- **Never expose internal state**: Domain entities should not expose their internal structure via `getInternalState()` to API responses
- **Public interfaces**: Create dedicated getters or `details` properties for external consumption
- **Example**: `user.details` instead of `user.getInternalState()` in API responses

### Dependency Injection Patterns

- **Simple naming**: Use `Dependencies` instead of verbose exported names like `FeatureFunctionDependencies`
- **Internal types**: Keep dependency interfaces internal to feature modules - don't export them unless needed elsewhere
- **Clean signatures**: Feature functions should accept simple, focused dependency objects

### Testing Patterns

- **Shared test setup**: Use `beforeEach` to initialize transaction, repositories, and test data
- **Global test variables**: Declare shared test variables (transaction, repositories, test entities) at the describe block level
- **Avoid repetition**: Don't recreate the same test users/repositories in every test - set them up once per test suite

### Entity State Management

- **In-place updates**: Entity methods like `updateLastLogin()` should modify the entity state directly, not return new instances
- **Consistency**: Keep state management patterns consistent across all entities
- **Testing**: Update tests to expect mutation rather than immutability

### Configuration Organization

- **Separation of concerns**: Extract complex configuration (Swagger, CORS, etc.) into focused, single-purpose files
- **Environment-driven**: Make all environment-dependent values configurable through environment variables
- **No hardcoding**: Avoid hardcoded URLs, database credentials, or other deployment-specific values

## Migration Strategy

When adding new domains or refactoring existing code:

1. **Create domain structure** following the directory conventions
2. **Implement entities** with inline value objects and getInternalState()
3. **Create repository** with smart save() method
4. **Define domain events** in event.ts
5. **Implement features** as functions with typed payloads
6. **Create tests** (entity unit tests, feature integration tests)
7. **Update routes** to use new architecture
8. **Follow code quality guidelines** for encapsulation, testing, and configuration

## Benefits

- **Clear domain boundaries** through subdomain organization
- **Type-safe database queries** with Kysely providing compile-time safety
- **Automatic HTTP error mapping** through domain-specific errors
- **Improved testability** through dependency injection and clear error boundaries
- **Consistent error handling** with centralized error management
- **Transaction safety** with automatic rollback on errors using `withTransaction()`
- **Type safety** with TypeScript throughout the stack
- **Simple dependency management** without complex DI containers
- **Co-located tests** for better maintainability
- **Database schema evolution** with centralized type definitions

## Anti-Patterns to Avoid

- **Don't create infrastructure layer** - keep repositories in domain
- **Don't over-abstract** - prefer simple solutions over complex ones
- **Don't use complex DI frameworks** - direct instantiation is clearer
- **Don't separate value objects unnecessarily** - inline them in entities
- **Don't ignore transactions** - always use `withTransaction()` for atomic operations
- **Don't use generic errors** - throw specific domain errors with proper HTTP mapping
- **Don't write raw SQL** - use Kysely for type safety and maintainability

This architecture balances domain-driven principles with practical implementation concerns, optimizing for maintainability and team productivity over theoretical purity.
