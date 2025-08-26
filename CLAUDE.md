## Documentation Index

- **Workflow**: [development-workflow.md](docs/development-workflow.md) - How to approach tasks systematically
- **Architecture**: [project-architecture.md](docs/project-architecture.md) | [api-architecture.md](docs/api-architecture.md)
- **Standards**: [coding-standards.md](docs/coding-standards.md) | [security-guidelines.md](docs/security-guidelines.md)
- **Testing**: [testing-strategy.md](docs/testing-strategy.md) - Integration and unit testing patterns
- **Styling**: [styling-guidelines.md](docs/styling-guidelines.md) - SCSS + CSS modules approach
- **Deployment**: [deployment.md](docs/deployment.md) - Production setup and CI/CD

## Project Overview

Full-stack TypeScript monorepo using Turborepo:

- **Frontend**: Vite + React + SWC (apps/web)
- **Backend**: Fastify API (apps/api) with DDD + Hexagonal Architecture
- **Database**: PostgreSQL with Kysely for type-safe queries
- **Styling**: SCSS + CSS modules with design tokens
- **Package Manager**: pnpm

**Monorepo Structure:**

```
apps/web/          # Vite + React frontend
apps/api/          # Fastify backend with DDD
packages/ui/       # Shared React components
packages/database/ # Database utilities & types
docs/             # All project documentation
```

## Essential Commands

```bash
# Setup
pnpm install && pnpm db:up && pnpm db:setup

# Development
pnpm dev           # All apps (Frontend: :3000, API: :4000)
pnpm build         # Build all packages and apps
pnpm type-check    # Type safety verification
pnpm lint          # Code style verification
pnpm test          # Integration and unit tests
```

## Core Principles

- **Follow the workflow**: Always Acknowledge → Explore → Plan → Get Approval → Implement → Verify
- **Use subagents**: Research, code-quality-reviewer, bug-hunter for specialized tasks
- **Keep it simple**: Minimal dependencies, clear code over clever code
- **Security first**: No secrets in code, validate all inputs, fail fast on missing env vars
- **Test comprehensively**: Integration tests for features, unit tests for entities
- **Domain-driven**: Follow DDD patterns in `docs/api-architecture.md` for all API development
