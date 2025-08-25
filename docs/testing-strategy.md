# Testing Strategy

This document outlines the testing philosophy, infrastructure, and patterns used to ensure code quality and reliability.

## Testing Philosophy

### Pragmatic Testing Approach

We follow a **pragmatic testing strategy** that emphasizes real integration over mocking:

- **Integration tests for features** - test complete workflows with real database operations
- **Unit tests for entities** - test pure business logic and domain rules in isolation
- **No mocks for core infrastructure** - use real database with proper isolation
- **Test meaningful behaviors** - focus on business value, not implementation details

### Quality Over Quantity
- **Test the right things** - focus on business logic, edge cases, and integration points
- **Avoid testing frameworks** - don't test what React, Fastify, or Kysely already test
- **End-to-end user flows** - verify complete features work together
- **Error scenarios matter** - test failure cases alongside happy paths

## Test Database Architecture

### Isolation Strategy

The test suite uses a **dedicated test database** (`ouafouaf_test`) that provides complete isolation:

- **Separate test database** - completely isolated from development data
- **Clean slate approach** - database is cleared before each test using table truncation
- **Test utilities** - centralized infrastructure in `src/shared/test-utils/`
- **Automatic setup** - Vitest handles database setup/teardown via global setup files

### Database Management Commands

```bash
# Set up test database (first time)
pnpm db:test:setup

# Run database migrations for tests
pnpm db:test:migrate

# Run the full test suite
pnpm test
```

### Test Infrastructure Files

- **`src/shared/test-utils/database-utils.ts`** - Database setup, cleanup, and teardown functions
- **`src/shared/test-utils/setup.ts`** - Per-test database clearing and environment setup
- **`src/shared/test-utils/global-setup.ts`** - Global test environment setup and teardown

## Feature Integration Testing

### Test Structure Pattern

All feature integration tests follow this pattern for consistent, isolated testing:

```typescript
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

### Key Testing Patterns

**Test Setup:**
- **`beforeEach` setup** - Create fresh test data for each test using `withTransaction()`
- **Multiple transaction contexts** - Separate transactions for setup, execution, and verification
- **Shared test variables** - Declare at describe block level for consistency
- **Builder pattern** - Use entity builders for consistent test data creation

**Test Execution:**
- **Complete workflow testing** - Test the entire feature flow from input to database state
- **Real database operations** - No mocks for repositories or database calls
- **Transaction isolation** - Each test gets its own transaction context
- **Error scenario testing** - Test both success and failure paths

**Test Verification:**
- **Domain event verification** - Verify that domain events are properly published
- **Database state verification** - Check that expected changes occurred
- **Business rule verification** - Assert on business logic outcomes
- **Error message verification** - Ensure appropriate errors are thrown

## Entity Unit Testing

### Pure Business Logic Testing

Entity unit tests focus on domain rules, validation, and business behavior without external dependencies:

```typescript
describe('User Entity', () => {
  describe('creation', () => {
    it('should create user with valid data', async () => {
      const email = Email.create('test@example.com');
      const password = await Password.create('validpassword123');
      
      const user = await User.create({ email, password });
      
      expect(user.id).toBeDefined();
      expect(user.email.toString()).toBe('test@example.com');
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should fail with invalid email', () => {
      expect(() => {
        Email.create('invalid-email');
      }).toThrow('Invalid email format');
    });
  });

  describe('business methods', () => {
    it('should update last login timestamp', async () => {
      const user = await new UserBuilder().build();
      const originalLastLogin = user.lastLogin;
      
      const updatedUser = user.updateLastLogin();
      
      expect(updatedUser.lastLogin).toBeInstanceOf(Date);
      expect(updatedUser.lastLogin).not.toBe(originalLastLogin);
    });
  });

  describe('getInternalState', () => {
    it('should expose all data needed for persistence', async () => {
      const user = await new UserBuilder()
        .withEmail('test@example.com')
        .build();
      
      const state = user.getInternalState();
      
      expect(state).toMatchObject({
        id: expect.any(String),
        email: 'test@example.com',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });
});
```

### Value Object Testing

Test all edge cases and validation rules for value objects:

```typescript
describe('Email Value Object', () => {
  it('should accept valid email addresses', () => {
    const validEmails = [
      'user@example.com',
      'test.email+tag@domain.co.uk',
      'user123@subdomain.example.org'
    ];
    
    validEmails.forEach(email => {
      expect(() => Email.create(email)).not.toThrow();
    });
  });

  it('should reject invalid email addresses', () => {
    const invalidEmails = [
      'not-an-email',
      '@example.com',
      'user@',
      'user..double.dot@example.com'
    ];
    
    invalidEmails.forEach(email => {
      expect(() => Email.create(email)).toThrow('Invalid email format');
    });
  });

  it('should normalize email addresses', () => {
    const email = Email.create('  USER@EXAMPLE.COM  ');
    expect(email.toString()).toBe('user@example.com');
  });
});
```

## Builder Pattern for Test Data

### Entity Builders

Use the builder pattern for creating consistent, flexible test data:

```typescript
export class UserBuilder {
  private email = 'test@example.com';
  private password = 'validpassword123';
  private name = 'Test User';

  withEmail(email: string): UserBuilder {
    this.email = email;
    return this;
  }

  withPassword(password: string): UserBuilder {
    this.password = password;
    return this;
  }

  withName(name: string): UserBuilder {
    this.name = name;
    return this;
  }

  async build(): Promise<User> {
    const emailVO = Email.create(this.email);
    const passwordVO = await Password.create(this.password);
    
    return await User.create({
      email: emailVO,
      password: passwordVO,
      name: this.name,
    });
  }
}
```

### Builder Usage Patterns

```typescript
// Simple case - use defaults
const user = await new UserBuilder().build();

// Customized case - override specific fields
const adminUser = await new UserBuilder()
  .withEmail('admin@example.com')
  .withName('Admin User')
  .build();

// Multiple related entities
const users = await Promise.all([
  new UserBuilder().withEmail('user1@example.com').build(),
  new UserBuilder().withEmail('user2@example.com').build(),
  new UserBuilder().withEmail('user3@example.com').build(),
]);
```

## Testing Best Practices

### Test Organization

**File Structure:**
- **Co-locate tests** with implementation files (`.test.ts` suffix)
- **Feature integration tests** in the features directory
- **Entity unit tests** alongside entity files
- **Shared test utilities** in dedicated test-utils directory

**Test Naming:**
```typescript
// ✅ Good - Describes behavior being tested
describe('User Registration Feature', () => {
  it('should create user account with valid data', () => {});
  it('should reject registration with duplicate email', () => {});
  it('should publish UserRegistered event on success', () => {});
});

// ❌ Bad - Describes implementation details
describe('UserRepository.save()', () => {
  it('should call INSERT query', () => {});
});
```

### Test Data Management

**Clean Slate Principle:**
- Each test starts with a completely empty database
- Tests create their own test data using builders
- No shared state between tests
- Predictable, isolated test execution

**Builder Consistency:**
- Use builders for all entity creation in tests
- Provide sensible defaults for quick test setup
- Allow customization for specific test scenarios
- Fail fast on invalid test data

### Error Testing

**Comprehensive Error Coverage:**
```typescript
describe('Error Scenarios', () => {
  it('should throw ValidationError for invalid input', async () => {
    await expect(
      createUser({ email: 'invalid-email', password: 'short' })
    ).rejects.toThrow(ValidationError);
  });

  it('should throw UserAlreadyExistsError for duplicate email', async () => {
    // Setup: Create existing user
    await new UserBuilder().withEmail('test@example.com').build();
    
    // Test: Attempt to create duplicate
    await expect(
      createUser({ email: 'test@example.com', password: 'password123' })
    ).rejects.toThrow(UserAlreadyExistsError);
  });
});
```

### Performance Testing

**Database Performance:**
- Test queries with realistic data volumes
- Verify database indexes are effective
- Test transaction rollback scenarios
- Monitor test execution times

**Integration Performance:**
- Test API endpoints with various payload sizes
- Verify reasonable response times
- Test concurrent request handling
- Monitor memory usage during tests

## Quality Verification Workflow

### Continuous Integration

**Required Checks:**
```bash
# Type safety verification
pnpm type-check

# Code style verification
pnpm lint

# Test execution
pnpm test

# Build verification
pnpm build
```

**Test Coverage Goals:**
- **Business logic**: 100% coverage of domain entities and features
- **Integration paths**: All API endpoints and database operations
- **Error scenarios**: All custom error types and edge cases
- **Security controls**: Authentication and authorization logic

### Test Maintenance

**Regular Reviews:**
- Remove tests that no longer provide value
- Update tests when business requirements change
- Refactor tests to maintain clarity and speed
- Monitor and optimize slow tests

**Documentation Updates:**
- Keep test documentation current with implementation
- Document testing patterns and conventions
- Maintain examples of good test structure
- Update testing guidelines as patterns evolve

This testing strategy ensures reliable, maintainable code while providing confidence in system behavior and business rule enforcement.