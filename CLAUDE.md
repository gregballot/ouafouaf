# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**IMPORTANT:** This file is automatically pulled into Claude's context at the start of each conversation. Keep it concise, human-readable, and focused on essential guidance.

## Primary Workflow

When working on non-straightforward tasks in this repository, follow this structured approach:

1. **Acknowledge & Explore:** Acknowledge the request. State that you will begin by exploring the codebase. DO NOT write or edit any code yet. Use subagents to conduct research or read the relevant files I've pointed out or that you find through `grep`.

2. **Plan:** Use the `think hard` command to formulate a detailed, step-by-step plan. The plan must list the files you will create or modify and the commands you will run to verify the changes.

3. **Approval:** Present the plan for my approval. **Wait for confirmation before proceeding.**

4. **Implement:** Execute the approved plan.

5. **Verify:** Build, lint, test and review the code using the code-quality-reviewer subagent to ensure quality and correctness. If new features have been introduced, you can also use the bug-hunter subagent.

## Project Overview

Full-stack TypeScript monorepo using Turborepo with:

- **Frontend**: Vite + React + SWC (apps/web)
- **Backend**: Fastify API (apps/api)
- **Database**: PostgreSQL (Vercel Postgres for production, Docker Compose locally)
- **Deployment**: Vercel
- **Package Manager**: pnpm

## Monorepo Structure

```
ouafouaf/
├── apps/
│   ├── web/                  # Vite + React + SWC frontend
│   └── api/                  # Fastify backend API
├── packages/
│   ├── ui/                   # Shared React components
│   ├── database/             # Database utilities & types
│   ├── eslint-config/        # Shared ESLint configuration
│   └── typescript-config/    # Shared TypeScript configurations
├── docker-compose.yml        # PostgreSQL for local development
├── turbo.json               # Turborepo configuration
└── pnpm-workspace.yaml      # Workspace definition
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Start local database
pnpm db:up

# Set up database schema (first time only)
pnpm db:setup

# Development (runs all apps in parallel)
pnpm dev

# Build all packages and apps
pnpm build

# Type checking
pnpm type-check

# Linting
pnpm lint

# Testing
pnpm test

# Database Management
pnpm db:up        # Start PostgreSQL container
pnpm db:down      # Stop PostgreSQL container
pnpm db:setup     # Create database and run all migrations (first time)
pnpm db:migrate   # Run new migrations only
pnpm db:reset     # Drop all tables (destructive!)
```

## Database Migration System

When working with the database:

- **First time setup**: Always run `pnpm db:up && pnpm db:setup`
- **Before running tests**: Ensure database is set up with `pnpm db:setup`
- **Adding new migrations**: Create numbered SQL files in `packages/database/migrations/`
- **CI/CD**: Use `pnpm db:migrate` in deployment scripts

The migration system tracks executed migrations automatically and only runs new ones.

## Code Style & Guidelines

- **TypeScript**: Strict mode enabled, use shared configs from `@repo/typescript-config`
- **ESLint**: Shared configuration in `@repo/eslint-config`
- **Imports**: Use workspace protocol (`@repo/*`) for internal packages
- **Components**: Store shared UI components in `packages/ui`
- **Database**: All database-related types and utilities in `packages/database`

## Development Philosophy

- **Keep It Super Simple**: Always choose the simplest solution that works. Avoid over-engineering.
- **Minimal Dependencies**: Avoid adding external dependencies unless they are obviously relevant and necessary. Prefer native browser APIs and built-in Node.js modules when possible.
- **Essential Only**: Every dependency should solve a real problem. Question whether a library is truly needed before adding it.
- **Maintainability**: Simple code is easier to maintain, debug, and understand. Favor clarity over cleverness.

## Security Principles

- **Environment Variables**: Never include fallback secrets in code. Always require environment variables for sensitive data and fail fast if missing.
- **Multi-Layer Validation**: Validate inputs at client, API, and database boundaries. Never trust external data.
- **Database Security**: Use parameterized queries exclusively. Never use string concatenation for SQL queries.
- **Defensive Programming**: Always check for null/undefined before using critical data. Assume external systems can fail or return unexpected data.

## Error Handling Standards

- **Design for Failure**: Consider error scenarios from the start, not as an afterthought.
- **Graceful Degradation**: Provide fallbacks for external dependencies (storage, network, APIs).
- **Explicit Error Handling**: Handle network failures, malformed responses, and storage errors explicitly.
- **User Experience**: Never let errors crash the application. Provide meaningful feedback and recovery options.

## Type Safety Guidelines

- **Cross-Boundary Consistency**: Maintain type consistency between frontend, backend, and database.
- **Runtime Validation**: Validate that runtime data matches expected types, especially from external sources.
- **Shared Schemas**: Use shared type definitions to prevent contract drift between systems.
- **Safe TypeScript**: Avoid non-null assertions (`!`) without explicit null checks. Prefer optional chaining and nullish coalescing.

## Code Quality Workflow

- **Agent Reviews**: Use code-quality-reviewer and bug-hunter agents for all significant changes.
- **End-to-End Testing**: Always test the complete user flow, not just individual functions.
- **Configuration Validation**: Verify all required environment variables and settings on startup.
- **Error Scenario Testing**: Test failure cases, edge cases, and invalid inputs alongside happy paths.

## Code Style Standards

- **Comments**: Keep comments to a minimum. Only add comments when code is truly not self-explanatory. Avoid stating the obvious.
- **File Structure**: Always end files with a newline character for proper POSIX compliance.
- **Configuration**: Never hardcode values that could be environment-dependent. Use environment variables with sensible defaults.
- **Logging**: Use the logger service instead of `console.*` methods throughout the application.
- **Code Organization**: Extract complex configuration (like Swagger setup) into separate, focused files.
- **Domain Encapsulation**: Never expose internal domain state directly. Use dedicated getters/methods for external access.
- **Testing Structure**: Use `beforeEach` to set up test data and repositories. Declare shared test variables at the describe block level.
- **Type Definitions**: Keep dependency injection types internal to modules. Use simple names like `Dependencies` rather than verbose exported names.

## Architecture Philosophy

- **Domain-Driven Design**: Follow the architectural guidelines in `docs/architecture.md` for all API development
- **Subdomain Organization**: Organize code by business domains rather than technical layers
- **Transaction-Per-Request**: Use database transactions consistently with automatic commit/rollback
- **Separation of Concerns**: Keep business logic, UI state, and external integrations clearly separated
- **Component Reusability**: Design components for composition and reuse across different contexts
- **Centralized Configuration**: Make configuration explicit and centralized rather than scattered
- **Shared Validation**: Use shared schemas and validation logic to prevent inconsistencies between layers

**IMPORTANT**: For all API development, follow the DDD + Hexagonal Architecture patterns documented in `docs/architecture.md`. This includes entity design, repository patterns, feature functions, and testing approaches.

## Core Files & Architecture

- `turbo.json` - Turborepo task configuration and caching
- `pnpm-workspace.yaml` - Workspace package definitions
- `apps/web/vite.config.ts` - Frontend build configuration
- `apps/api/src/index.ts` - Backend API entry point
- `packages/typescript-config/` - Shared TypeScript configurations

## Testing Philosophy & Instructions

### Testing Approach

We follow a **pragmatic testing strategy** that emphasizes real integration over mocking:

#### Integration Tests for Features

- **No mocks for repositories or database operations** - use real test database with clean slate approach
- **Test complete workflows** - verify the entire feature flow from input to database changes
- **Use Builder pattern** for test data creation via `[Entity]Builder.ts` files
- **Verify domain events** - check that events are published to database
- **Clean slate testing** - each test starts with a completely empty database and creates its own test data

### Test Database Setup

The test suite uses a dedicated **ouafouaf_test** database that provides complete isolation from development data:

#### Database Management

- **Separate test database**: `ouafouaf_test` (completely isolated from development database)
- **Clean slate approach**: Database is cleared before each test using table truncation
- **Test utilities**: Located in `src/shared/test-utils/` for consistent test infrastructure
- **Automatic setup**: Vitest handles database setup/teardown via global setup files

#### Test Database Commands

```bash
# Set up test database (first time only)
pnpm db:test:setup

# Run database migrations for tests
pnpm db:test:migrate

# Run the full test suite
pnpm test
```

#### Test Structure Pattern

All feature integration tests MUST follow this pattern for consistent, isolated testing:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { authenticateUser } from './authenticate-user';
import { UserRepository } from '../UserRepository';
import { EventRepository } from '../../DomainEvent/EventRepository';
import { UserBuilder } from '../UserBuilder';
import { User } from '../User';
import { withTransaction } from '../../../shared/transaction';

describe('Feature Integration Tests', () => {
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
});
```

#### Unit Tests for Entities

- **Pure business logic testing** - test domain rules, validation, and entity behavior
- **Value object validation** - test all edge cases for email, password, etc.
- **No external dependencies** - entities should be testable in isolation

```typescript
// Entity Unit Test Example
it('should create user with valid data', async () => {
  const email = Email.create('test@example.com');
  const password = await Password.create('validpassword123');
  const user = await User.create({ email, password });

  expect(user.id).toBeDefined();
  expect(user.email.toString()).toBe('test@example.com');
});
```

### Test Infrastructure Files

- `src/shared/test-utils/database-utils.ts` - Database setup, cleanup, and teardown functions
- `src/shared/test-utils/setup.ts` - Per-test database clearing and environment setup
- `src/shared/test-utils/global-setup.ts` - Global test environment setup and teardown

### Quality Verification Commands

```bash
# Type checking across all packages
pnpm type-check

# Code linting across all packages
pnpm lint

# Run integration tests (requires local database)
pnpm test

# Build verification
pnpm build
```

## Local Development Setup

```bash
# Install dependencies
pnpm install

# Start PostgreSQL database
docker-compose up -d

# Run development servers (all apps in parallel)
pnpm dev

# Access the applications:
# - Frontend: http://localhost:3000
# - API: http://localhost:4000
# - API Documentation: http://localhost:4000/docs
```

## Production Deployment

**Vercel Setup:**

- Frontend app: Deploy from `apps/web` directory
- API app: Deploy from `apps/api` directory
- Configure Vercel Postgres for production database
- Set environment variables for database connections

**Environment Variables:**

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secure random string for JWT signing (**REQUIRED**)
- `NODE_ENV` - Set to 'production' for production builds
- `VITE_API_URL` - Your deployed API URL (for frontend)

## Repository Notes

- **Package Manager**: Use pnpm for all package management
- **Caching**: Leverage Turborepo's caching for faster builds
- **Dependencies**: Follow workspace conventions for internal dependencies (`@repo/*`)
- **ESLint**: Root configuration with package-specific extensions
- **TypeScript**: Shared configurations for consistent typing across packages
- **Database**: PostgreSQL with Docker Compose locally, Vercel Postgres in production
- Use `/clear` command to maintain focused context during long sessions
- Leverage subagents for specialized tasks (research, code review, bug hunting)
