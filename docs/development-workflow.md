# Development Workflow

This document outlines the structured approach for working on tasks in this repository.

## Primary Workflow

When working on non-straightforward tasks, follow this structured approach:

### 1. **Acknowledge & Explore**

- Acknowledge the request
- State that you will begin by exploring the codebase
- **DO NOT** write or edit any code yet
- Use subagents to conduct research or read relevant files
- Use grep and file exploration to understand the current state

### 2. **Plan**

- Use the `think hard` command to formulate a detailed, step-by-step plan
- The plan must list the files you will create or modify
- Include commands you will run to verify the changes
- Consider architectural implications and testing requirements

### 3. **Approval**

- Present the plan for approval
- **Wait for confirmation before proceeding**
- Address any feedback or modifications requested

### 4. **Implement**

- Execute the approved plan methodically
- Follow coding standards and architectural patterns
- Make incremental changes with clear commit messages

### 5. **Verify**

- Build, lint, and test the implementation
- Use the code-quality-reviewer subagent for significant changes
- Use the bug-hunter subagent for new features
- Ensure all quality checks pass

## Development Commands

### Environment Setup

```bash
# Install dependencies
pnpm install

# Start local database
pnpm db:up

# Set up database schema
pnpm db:setup
```

### Daily Development

```bash
# Development (runs all apps in parallel)
pnpm dev

# Access applications:
# - Frontend: http://localhost:3000
# - API: http://localhost:4000
# - API Documentation: http://localhost:4000/docs
```

### Quality Assurance

```bash
# Type checking across all packages
pnpm type-check

# Code linting across all packages
pnpm lint

# Run integration tests (requires database)
pnpm test

# Build verification
pnpm build
```

### Database Management

```bash
# Start PostgreSQL container
pnpm db:up

# Stop PostgreSQL container
pnpm db:down

# Create database and run all migrations
pnpm db:setup

# Run new migrations only
pnpm db:migrate

# Drop all tables (destructive!)
pnpm db:reset
```

### Test Database Commands

```bash
# Set up test database
pnpm db:test:setup

# Run database migrations for tests
pnpm db:test:migrate

# Run the full test suite
pnpm test
```

## Database Development Patterns

### Migration System

The migration system tracks executed migrations automatically and only runs new ones:

- **New migrations**: Create numbered SQL files in `packages/database/migrations/`
- **Development**: Always run `pnpm db:up && pnpm db:setup` for first-time setup
- **Testing**: Ensure database is set up with `pnpm db:setup` before running tests
- **CI/CD**: Use `pnpm db:migrate` in deployment scripts

### Test Database Architecture

- **Separate test database**: `ouafouaf_test` (completely isolated from development)
- **Clean slate approach**: Database is cleared before each test
- **Test utilities**: Located in `src/shared/test-utils/` for consistent infrastructure
- **Automatic setup**: Vitest handles database setup/teardown via global setup files

## Subagent Usage Guidelines

### When to Use Subagents

**General-Purpose Agent:**

- Searching for keywords or files when not confident about location
- Multi-step research tasks
- Complex codebase exploration

**Code-Quality-Reviewer:**

- After writing significant new code
- Before committing major features
- For comprehensive security and best practices review

**Bug-Hunter:**

- After implementing new functions or features
- When reviewing code for potential runtime issues
- For logic error detection and undefined behavior analysis

**Research-Analyst:**

- Understanding modern best practices for specific technologies
- Exploring current industry standards
- State-of-the-art methodology research

### Subagent Best Practices

- Launch multiple agents concurrently when possible for performance
- Provide detailed task descriptions for autonomous execution
- Specify whether you expect research or code implementation
- Use proactively for complex tasks without waiting for explicit requests

## Quality Verification Process

### Before Committing

1. **Type Safety**: Run `pnpm type-check` across all packages
2. **Code Style**: Run `pnpm lint` and fix any issues
3. **Functionality**: Run `pnpm test` to ensure all tests pass
4. **Build Verification**: Run `pnpm build` to catch integration issues

### Code Review Process

- Use code-quality-reviewer agent for all significant changes
- Focus on security, performance, and maintainability
- Verify adherence to architectural patterns
- Check for proper error handling and edge cases

### Testing Requirements

- Write integration tests for new features
- Ensure unit tests cover business logic
- Test both success and failure scenarios
- Verify database state changes in integration tests

## Repository Management

### Package Management

- **Use pnpm** for all package management operations
- **Follow workspace conventions** for internal dependencies (`@repo/*`)
- **Leverage Turborepo caching** for faster builds
- **Shared configurations** for ESLint and TypeScript across packages

### Context Management

- Use `/clear` command to maintain focused context during long sessions
- Leverage subagents for specialized tasks to keep context clean
- Reference specific files and line numbers when discussing code

### Git Workflow

- Make atomic commits with clear messages
- Follow conventional commit format when established
- Only commit when explicitly requested by the user
- Run quality checks before any commit operations

This workflow ensures consistent quality, proper planning, and maintainable code while leveraging the full capabilities of the development environment and toolchain.
