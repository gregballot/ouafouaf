# Project Architecture

This document outlines the architectural principles and organizational patterns used in this full-stack TypeScript monorepo.

## Technology Stack

**Frontend (apps/web):**
- **Vite**: Fast build tool with HMR and optimized bundling
- **React**: Component-based UI library with TypeScript
- **SWC**: Fast TypeScript/JSX compiler for better performance

**Backend (apps/api):**
- **Fastify**: High-performance web framework with TypeScript support
- **PostgreSQL**: Relational database with full ACID compliance
- **Kysely**: Type-safe SQL query builder with TypeScript integration

**Development:**
- **Turborepo**: Monorepo build system with intelligent caching
- **pnpm**: Fast, disk-efficient package manager with workspace support
- **Docker Compose**: Local PostgreSQL development environment

**Deployment:**
- **Vercel**: Serverless deployment platform for both frontend and API
- **Vercel Postgres**: Managed PostgreSQL for production

## Monorepo Organization Pattern

### Domain-Based Structure

The monorepo follows a domain-based organization pattern that separates concerns by business functionality rather than technical layers:

```
ouafouaf/
├── apps/                           # Application deployments
│   ├── web/                        # Frontend application
│   │   ├── src/
│   │   │   ├── components/         # UI components
│   │   │   ├── hooks/              # React hooks
│   │   │   ├── lib/                # Application utilities
│   │   │   ├── schemas/            # Frontend validation schemas
│   │   │   └── styles/             # SCSS styles and design tokens
│   │   └── vite.config.ts          # Build configuration
│   └── api/                        # Backend application
│       ├── src/
│       │   ├── domain/             # Business domains
│       │   ├── routes/             # HTTP endpoints
│       │   ├── shared/             # Cross-cutting concerns
│       │   └── config/             # Application configuration
│       └── vitest.config.ts        # Test configuration
├── packages/                       # Shared libraries
│   ├── ui/                         # Shared React components
│   ├── database/                   # Database utilities & types
│   ├── eslint-config/              # Shared ESLint configuration
│   └── typescript-config/          # Shared TypeScript configurations
├── docs/                           # Project documentation
├── turbo.json                      # Turborepo task configuration
└── pnpm-workspace.yaml             # Workspace definition
```

### Workspace Protocol

All internal dependencies use the workspace protocol pattern:

```json
{
  "dependencies": {
    "@repo/ui": "workspace:*",
    "@repo/database": "workspace:*",
    "@repo/typescript-config": "workspace:*"
  }
}
```

This ensures:
- **Type safety** across package boundaries
- **Consistent versioning** of internal dependencies
- **Optimal bundling** with proper tree-shaking
- **Development workflow** with hot reloading across packages

## Package Architecture

### Shared UI Components (`packages/ui`)

React components library with:
- **Storybook integration** for component development and documentation
- **SCSS modules** for scoped styling with design tokens
- **TypeScript interfaces** for consistent prop definitions
- **Composition patterns** for flexible component reuse

### Database Package (`packages/database`)

Centralized database concerns:
- **Kysely types** for compile-time SQL safety
- **Migration system** with automatic tracking
- **Utility functions** for common database operations
- **Test utilities** for database setup and teardown

### Configuration Packages

**ESLint Config (`packages/eslint-config`):**
- Shared linting rules across all TypeScript projects
- React-specific rules for frontend packages
- Node.js-specific rules for backend packages

**TypeScript Config (`packages/typescript-config`):**
- Base TypeScript configuration with strict mode
- Specialized configs for React, Node.js, and library packages
- Path mapping for clean imports across the monorepo

## Application Architecture

### Frontend Architecture (apps/web)

**Component Organization:**
```
src/components/
├── ui/                 # Reusable UI components
├── auth/               # Authentication-specific components
└── [feature]/          # Feature-specific components
```

**State Management:**
- **React Context** for authentication state
- **Custom hooks** for API interactions and business logic
- **Local component state** for UI-specific concerns

**Styling Architecture:**
- **SCSS modules** for component-specific styles
- **Design tokens** in `src/styles/variables.scss`
- **Global styles** for resets and base typography

### Backend Architecture (apps/api)

**Domain-Driven Organization:**
```
src/domain/
├── User/               # User domain
│   ├── User.ts         # Entity with value objects
│   ├── UserRepository.ts # Data persistence
│   └── features/       # Use cases
├── DomainEvent/        # Event sourcing infrastructure
└── [Domain]/           # Additional business domains
```

**Cross-Cutting Concerns:**
```
src/shared/
├── database-types.ts   # Kysely schema definitions
├── errors.ts           # Domain error hierarchy
├── transaction.ts      # Transaction management
└── test-utils/         # Testing infrastructure
```

## Core Files & Their Purpose

### Build Configuration
- **`turbo.json`**: Turborepo task configuration and caching rules
- **`pnpm-workspace.yaml`**: Workspace package definitions and dependencies
- **`apps/web/vite.config.ts`**: Frontend build configuration with SCSS and CSS modules
- **`apps/api/vitest.config.ts`**: Test configuration with database setup

### Package Configuration
- **Root `package.json`**: Workspace scripts and pnpm overrides
- **Individual `package.json`**: Package-specific dependencies and scripts
- **`tsconfig.json`**: TypeScript configuration extending shared configs

## Architectural Principles

### Separation of Concerns
- **Frontend**: UI components, state management, user interactions
- **Backend**: Business logic, data persistence, API contracts
- **Shared packages**: Reusable components, utilities, and configurations

### Type Safety Across Boundaries
- **Shared schemas** prevent contract drift between frontend and backend
- **Kysely types** ensure compile-time SQL correctness
- **TypeScript strict mode** catches errors at development time

### Scalable Organization
- **Domain-based structure** supports team autonomy and feature development
- **Package boundaries** enforce clean dependencies and interfaces
- **Monorepo benefits** with independent deployment capabilities

### Performance Optimization
- **Turborepo caching** speeds up builds and tests
- **Tree-shaking** eliminates unused code from bundles
- **Code splitting** enables optimal loading strategies

## Development Workflow Integration

### Local Development
- **Hot reloading** across packages during development
- **Type checking** runs continuously across all packages
- **Shared tooling** ensures consistent code quality

### Build Process
- **Parallel builds** using Turborepo's dependency graph
- **Incremental builds** cache unchanged packages
- **Type-safe builds** fail fast on type errors

### Testing Strategy
- **Package isolation** allows focused testing
- **Shared test utilities** ensure consistent test setup
- **Integration testing** verifies package interactions

This architecture balances developer productivity, type safety, and maintainability while supporting the specific needs of a full-stack TypeScript application.