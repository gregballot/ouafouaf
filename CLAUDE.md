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
│   ├── web/                  # Frontend application
│   └── api/                  # Backend API
├── packages/
│   ├── ui/                   # Shared UI components
│   ├── database/             # Database utilities & types
│   ├── eslint-config/        # Shared ESLint configuration
│   └── typescript-config/    # Shared TypeScript configurations
├── docker-compose.yml        # Local development database
├── turbo.json               # Turborepo configuration
└── pnpm-workspace.yaml      # Workspace definition
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Start local database
pnpm db:up

# Development (runs all apps in parallel)
pnpm dev

# Build all packages and apps
pnpm build

# Type checking
pnpm type-check

# Linting
pnpm lint

# Stop local database
pnpm db:down
```

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

## Testing Instructions

Currently using TypeScript for type checking and ESLint for code quality:

```bash
# Type checking across all packages
pnpm type-check

# Code linting across all packages  
pnpm lint

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
