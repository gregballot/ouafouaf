# Coding Standards

This document outlines the coding standards, style guidelines, and development principles for this TypeScript monorepo.

## Development Philosophy

### Keep It Super Simple (KISS)

- **Choose the simplest solution** that works effectively
- **Avoid over-engineering** and unnecessary complexity
- **Favor clarity over cleverness** in all code decisions
- **Question complexity** before introducing it

### Minimal Dependencies

- **Avoid adding external dependencies** unless obviously necessary
- **Prefer native browser APIs** and built-in Node.js modules
- **Every dependency must solve a real problem** - question before adding
- **Essential only** - avoid libraries that don't provide clear value

### Maintainability First

- **Simple code is maintainable code** - easy to debug and understand
- **Write code for the next developer** who will work on it
- **Consistent patterns** make the codebase predictable
- **Clear interfaces** between components and modules

## TypeScript Standards

### Type Safety Guidelines

- **Strict mode enabled** - use shared configs from `@repo/typescript-config`
- **Cross-boundary consistency** - maintain type alignment between frontend, backend, and database
- **Runtime validation** - validate that runtime data matches expected types
- **Shared schemas** - use shared type definitions to prevent contract drift
- **Safe TypeScript** - avoid non-null assertions (`!`) without explicit null checks
- **Prefer optional chaining** (`?.`) and nullish coalescing (`??`)

### Type Definition Patterns

```typescript
// ✅ Good - Clear, focused interfaces
interface User {
  id: string;
  email: string;
  createdAt: Date;
}

// ✅ Good - Internal dependency types
interface Dependencies {
  userRepository: UserRepository;
  logger: Logger;
}

// ❌ Bad - Verbose exported names
export interface CreateUserFeatureFunctionDependencies {
  // ...
}
```

## Code Style Standards

### Comments Policy

- **Keep comments to a minimum** - code should be self-explanatory
- **Only comment when code is truly not self-explanatory**
- **Avoid stating the obvious** in comments
- **Explain "why" not "what"** when comments are necessary

```typescript
// ❌ Bad - Obvious comment
const users = await userRepository.findAll(); // Get all users

// ✅ Good - Explains business rule
const users = await userRepository.findAll();
// Filter active users only for billing calculations
const activeUsers = users.filter((user) => user.isActive);
```

### File Structure Standards

- **Always end files with a newline** for POSIX compliance
- **Consistent import ordering**: external libraries, internal packages, relative imports
- **Clear file organization** with logical groupings
- **Extract complex configuration** into separate, focused files

```typescript
// ✅ Good import structure
import { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { UserRepository } from '@repo/database';
import { logger } from '@repo/shared';

import { validateInput } from './utils';
```

### Configuration Management

- **Never hardcode environment-dependent values**
- **Use environment variables** with sensible defaults where appropriate
- **Centralized configuration** rather than scattered throughout codebase
- **Fail fast on missing required environment variables**

```typescript
// ✅ Good - Environment-driven configuration
const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  databaseUrl: process.env.DATABASE_URL, // Required, no fallback
  jwtSecret: process.env.JWT_SECRET, // Required, no fallback
};

if (!config.databaseUrl || !config.jwtSecret) {
  throw new Error('Missing required environment variables');
}
```

## Import and Dependency Conventions

### Workspace Protocol

- **Use workspace protocol** (`@repo/*`) for internal packages
- **Consistent package references** across the monorepo
- **Type-safe imports** between packages

```json
{
  "dependencies": {
    "@repo/ui": "workspace:*",
    "@repo/database": "workspace:*"
  }
}
```

### Package Organization

- **Shared UI components** in `packages/ui`
- **Database utilities and types** in `packages/database`
- **Configuration packages** for ESLint and TypeScript
- **Clear package boundaries** with well-defined interfaces

## Error Handling Standards

### Design for Failure

- **Consider error scenarios** from the start of development
- **Graceful degradation** for external dependencies (APIs, storage, network)
- **Explicit error handling** for all failure modes
- **Never let errors crash the application** - provide meaningful feedback

### Domain Error Patterns

```typescript
// ✅ Good - Specific domain errors
export class InvalidEmailError extends DomainError {
  readonly code = 'INVALID_EMAIL';
  readonly httpStatus = 400;
}

// ✅ Good - Error handling in features
export async function createUser(payload: CreateUserPayload) {
  const email = Email.create(payload.email);
  if (!email) {
    throw new InvalidEmailError();
  }

  // Continue with business logic...
}
```

### User Experience Focus

- **Provide meaningful error messages** to users
- **Include recovery suggestions** when possible
- **Log detailed errors** for debugging while showing user-friendly messages
- **Consistent error response format** across API endpoints

## Logging Standards

### Centralized Logging

- **Use the logger service** instead of `console.*` methods
- **Consistent logging format** across the application
- **Appropriate log levels** (info, warn, error, debug)
- **Structured logging** with relevant context

```typescript
// ✅ Good - Using logger service
import { logger } from '../lib/logger';

export async function processPayment(paymentData: PaymentData) {
  try {
    logger.info('Processing payment', { userId: paymentData.userId });
    const result = await paymentGateway.process(paymentData);
    logger.info('Payment processed successfully', { paymentId: result.id });
    return result;
  } catch (error) {
    logger.error('Payment processing failed', error);
    throw new PaymentProcessingError();
  }
}
```

## Code Organization Principles

### Domain Encapsulation

- **Never expose internal domain state** directly
- **Use dedicated getters/methods** for external access
- **Clear boundaries** between internal implementation and public interfaces
- **Consistent encapsulation patterns** across all entities

```typescript
// ✅ Good - Encapsulated domain entity
export class User {
  private constructor(private readonly params: UserParams) {}

  // Public interface
  get id(): string {
    return this.params.id;
  }
  get email(): Email {
    return this.params.email;
  }

  // Internal state only for persistence
  getInternalState() {
    return {
      /* ... */
    };
  }
}
```

### Separation of Concerns

- **Business logic** separate from UI state and external integrations
- **Component reusability** through composition patterns
- **Clear responsibility boundaries** between layers
- **Modular architecture** with focused, single-purpose modules

## Testing Structure Standards

### Test Organization

- **Use `beforeEach`** to set up test data and repositories
- **Declare shared test variables** at the describe block level
- **Avoid repetition** in test setup across related tests
- **Clear test naming** that describes behavior being tested

```typescript
// ✅ Good test structure
describe('User Registration', () => {
  let userRepository: UserRepository;
  let testUser: User;

  beforeEach(async () => {
    await withTransaction(async (trx) => {
      userRepository = new UserRepository(trx);
      testUser = await new UserBuilder().build();
    });
  });

  it('should create user with valid email', async () => {
    // Test implementation...
  });
});
```

### Dependency Injection in Tests

- **Simple naming** for dependencies (`Dependencies` not `TestDependencies`)
- **Internal types** to test modules - don't export unless needed elsewhere
- **Clean test signatures** with focused dependency objects

## Quality Assurance

### Code Review Standards

- **Use code-quality-reviewer agent** for all significant changes
- **End-to-end testing** of complete user flows
- **Configuration validation** on startup
- **Error scenario testing** alongside happy path tests

### Continuous Quality

- **Type checking** must pass across all packages
- **Linting** must pass with zero warnings
- **Tests** must pass with good coverage
- **Build verification** must succeed before deployment

This approach ensures code that is maintainable, readable, and robust while following TypeScript best practices and supporting team collaboration effectively.
