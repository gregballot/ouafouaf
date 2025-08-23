# Domain-Driven Design + Hexagonal Architecture Guidelines

This document outlines our pragmatic approach to DDD and Hexagonal Architecture, emphasizing simplicity and maintainability over theoretical purity.

## Core Principles

### Subdomain-First Organization
Organize code by business domains (bounded contexts) rather than technical layers. Each subdomain contains all related business logic, data access, and domain concepts.

### Simplified Dependency Management
Use direct instantiation in route handlers rather than complex DI containers. Dependencies are clear and traceable.

### Transaction-Per-Request Pattern
Each HTTP request gets its own database transaction, automatically committed on success or rolled back on error.

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
│   │   ├── [Entity]Repository.ts # Data persistence
│   │   ├── event.ts            # Domain-specific events
│   │   └── features/
│   │       ├── [feature-name].ts     # Business use case
│   │       └── [feature-name].test.ts # Feature integration tests
│   └── DomainEvent/
│       ├── DomainEvent.ts      # Base event interface
│       ├── EventRepository.ts  # Event infrastructure
│       └── index.ts            # Type-safe event aggregation
└── docs/
    ├── architecture.md         # This file
    └── implementation-plan.md  # Current implementation roadmap
```

## Entity Design Patterns

### Entity Structure
```typescript
// domain/[Subdomain]/[Entity].ts

// Inline Value Objects
export class Email {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Result<Email> {
    if (!this.isValidEmail(value)) {
      return Result.fail('Invalid email format');
    }
    return Result.success(new Email(value));
  }
  
  toString(): string { return this.value; }
  
  private static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

// Main Entity
export class [Entity] {
  private constructor(
    public readonly id: string,
    public readonly email: Email,
    // ... other properties
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}
  
  static create(email: Email, /* other params */): Result<[Entity]> {
    // Domain validation logic
    if (!this.isValid(/* params */)) {
      return Result.fail('Validation error message');
    }
    
    return Result.success(new [Entity](
      crypto.randomUUID(),
      email,
      // ... other properties
    ));
  }
  
  // Business methods
  public businessMethod(param: ValueObject): Result<void> {
    // Domain logic here
  }
  
  // For persistence - exposes internal state
  public getInternalState() {
    return {
      id: this.id,
      email: this.email.toString(),
      // ... other serializable properties
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
  
  private static isValid(/* params */): boolean {
    // Validation logic
    return true;
  }
}
```

### Key Patterns
- **Private constructors** with static `create()` factory methods
- **Inline value objects** to avoid file explosion
- **Result pattern** for error handling without exceptions
- **getInternalState()** method for repository persistence
- **Domain validation** in entity creation and business methods

## Repository Pattern

### Repository Interface
```typescript
// domain/[Subdomain]/[Entity]Repository.ts
export class [Entity]Repository {
  constructor(private transaction: Transaction) {}
  
  // Smart save - handles both create and update
  async save(entity: [Entity]): Promise<Result<[Entity]>> {
    const state = entity.getInternalState();
    
    try {
      // Check if entity exists
      const existing = await this.findById(state.id);
      
      if (existing) {
        // Update existing
        await this.transaction.query(`
          UPDATE [table] SET [columns] = [values] WHERE id = $1
        `, [/* mapped values */]);
      } else {
        // Create new
        await this.transaction.query(`
          INSERT INTO [table] ([columns]) VALUES ([placeholders])
        `, [/* mapped values */]);
      }
      
      return Result.success(entity);
    } catch (error) {
      return Result.fail(`Failed to save [entity]: ${error.message}`);
    }
  }
  
  async findById(id: string): Promise<[Entity] | null> {
    // Implementation using this.transaction
  }
  
  async findBy[Criteria](criteria: ValueObject): Promise<[Entity] | null> {
    // Implementation using this.transaction
  }
}
```

### Key Patterns
- **Transaction injection** in constructor
- **Smart save method** handles create/update logic
- **Result pattern** for error handling
- **Value objects** as query parameters
- **Null return** for not-found cases

## Feature Functions

### Feature Structure
```typescript
// domain/[Subdomain]/features/[feature-name].ts

// Input payload type
type [Feature]Payload = {
  property1: string;
  property2: number;
  // ... other input properties
};

// Dependency injection type
type [Feature]Dependencies = {
  [entity]Repository: [Entity]Repository;
  eventRepository?: EventRepository;
  // ... other dependencies
};

// Return type
type [Feature]Result = {
  [entity]: [Entity];
  // ... other return properties
};

// Feature function
export async function [featureName](
  payload: [Feature]Payload,
  dependencies: [Feature]Dependencies
): Promise<Result<[Feature]Result>> {
  const { [entity]Repository, eventRepository } = dependencies;
  
  // 1. Validate input and create value objects
  const valueObject = ValueObject.create(payload.property);
  if (valueObject.isFailure()) {
    return Result.fail(valueObject.error);
  }
  
  // 2. Business logic and domain operations
  const entity = await [entity]Repository.findBy[Criteria](criteria);
  if (!entity) {
    return Result.fail('[Entity] not found');
  }
  
  // 3. Domain operations
  const result = entity.businessMethod(valueObject.value);
  if (result.isFailure()) {
    return Result.fail(result.error);
  }
  
  // 4. Persist changes
  const savedEntity = await [entity]Repository.save(entity);
  if (savedEntity.isFailure()) {
    return Result.fail(savedEntity.error);
  }
  
  // 5. Publish domain events (optional)
  if (eventRepository) {
    await eventRepository.publish(new [DomainEvent](entity.id));
  }
  
  return Result.success({
    [entity]: savedEntity.value
  });
}
```

### Key Patterns
- **Typed payloads** for input and dependencies
- **Result pattern** throughout the function
- **Value object validation** early in the function
- **Domain event publishing** when state changes
- **Clear error messages** for business rule violations

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
}

// Export union type for this subdomain
export type [Subdomain]Events = [Entity][Action] | [Entity][OtherAction];
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
        createdAt: expect.any(Date)
      });
    });
  });
});
```

### Feature Integration Tests
```typescript
// domain/[Subdomain]/features/[feature-name].test.ts
describe('[Feature Name]', () => {
  let testTransaction: Transaction;
  let [entity]Repository: [Entity]Repository;
  
  beforeEach(async () => {
    testTransaction = await createTestTransaction();
    [entity]Repository = new [Entity]Repository(testTransaction);
  });
  
  afterEach(async () => {
    await testTransaction.rollback();
  });
  
  it('should execute feature successfully', async () => {
    // Arrange: Create test data using builders
    const existing[Entity] = new [Entity]Builder()
      .with[Property]('test-value')
      .build();
    
    await [entity]Repository.save(existing[Entity]);
    
    // Act: Execute feature
    const result = await [featureName](
      { inputProperty: 'test-input' },
      { [entity]Repository }
    );
    
    // Assert: Verify results
    expect(result.isSuccess()).toBe(true);
    expect(result.value.[entity].someProperty).toBe('expected-value');
    
    // Verify database state
    const saved[Entity] = await [entity]Repository.findById(result.value.[entity].id);
    expect(saved[Entity]).toBeDefined();
  });
  
  it('should handle error cases', async () => {
    const result = await [featureName](
      { invalidInput: 'bad-data' },
      { [entity]Repository }
    );
    
    expect(result.isFailure()).toBe(true);
    expect(result.error).toBe('Expected error message');
  });
});
```

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
    
    // Handle response
    if (result.isFailure()) {
      return reply.status(400).send({
        error: {
          message: result.error,
          code: '[ERROR_CODE]'
        }
      });
    }
    
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

## Result Pattern

### Result Implementation
```typescript
// shared/Result.ts
export class Result<T, E = string> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: E
  ) {}
  
  static success<T>(value: T): Result<T> {
    return new Result(true, value);
  }
  
  static fail<E>(error: E): Result<never, E> {
    return new Result(false, undefined, error);
  }
  
  isSuccess(): boolean { return this._isSuccess; }
  isFailure(): boolean { return !this._isSuccess; }
  
  get value(): T {
    if (!this._isSuccess) throw new Error('Cannot get value from failed result');
    return this._value!;
  }
  
  get error(): E {
    if (this._isSuccess) throw new Error('Cannot get error from successful result');
    return this._error!;
  }
}
```

## Migration Strategy

When adding new domains or refactoring existing code:

1. **Create domain structure** following the directory conventions
2. **Implement entities** with inline value objects and getInternalState()
3. **Create repository** with smart save() method
4. **Define domain events** in event.ts
5. **Implement features** as functions with typed payloads
6. **Create tests** (entity unit tests, feature integration tests)
7. **Update routes** to use new architecture
8. **Verify transaction management** works correctly

## Benefits

- **Clear domain boundaries** through subdomain organization
- **Improved testability** through dependency injection and Result pattern
- **Consistent error handling** throughout the application
- **Transaction safety** with automatic rollback on errors
- **Type safety** with TypeScript throughout
- **Simple dependency management** without complex DI containers
- **Co-located tests** for better maintainability

## Anti-Patterns to Avoid

- **Don't create infrastructure layer** - keep repositories in domain
- **Don't over-abstract** - prefer simple solutions over complex ones
- **Don't use complex DI frameworks** - direct instantiation is clearer
- **Don't separate value objects unnecessarily** - inline them in entities
- **Don't ignore transactions** - always use the request transaction
- **Don't bypass Result pattern** - handle errors explicitly

This architecture balances domain-driven principles with practical implementation concerns, optimizing for maintainability and team productivity over theoretical purity.
