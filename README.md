# Ouafouaf

A full-stack TypeScript monorepo built with Turborepo.

## Tech Stack

- **Frontend**: Vite + React + SWC
- **Backend**: Fastify API
- **Database**: PostgreSQL
- **Deployment**: Vercel
- **Package Manager**: pnpm
- **Monorepo**: Turborepo

## Quick Start

```bash
# Install dependencies
pnpm install

# Start local database
pnpm db:up

# Set up database schema (first time only)
pnpm db:setup

# Run development servers
pnpm dev
```

Visit:
- Frontend: http://localhost:3000
- API: http://localhost:3001
- API Docs: http://localhost:3001/docs

## Project Structure

```
ouafouaf/
├── apps/
│   ├── web/                  # React frontend
│   └── api/                  # Fastify backend
├── packages/
│   ├── ui/                   # Shared React components
│   ├── database/             # Database utilities
│   ├── eslint-config/        # ESLint configuration
│   └── typescript-config/    # TypeScript configurations
└── docker-compose.yml        # Local PostgreSQL
```

## Available Commands

### Development
```bash
pnpm dev         # Start development servers
pnpm build       # Build all packages
pnpm type-check  # TypeScript checking
pnpm lint        # Code linting
pnpm test        # Run tests
```

### Database
```bash
pnpm db:up       # Start PostgreSQL container
pnpm db:down     # Stop PostgreSQL container
pnpm db:setup    # Create database and run all migrations (first time)
pnpm db:migrate  # Run new migrations only
pnpm db:reset    # Drop all tables (destructive!)
```

## Database Management

This project uses PostgreSQL with a custom migration system. Migration files are stored in `packages/database/migrations/` and are executed in alphabetical order.

### Migration Workflow
1. **First time setup**: `pnpm db:up && pnpm db:setup`
2. **Adding new migrations**: Create `XXX_description.sql` in `packages/database/migrations/`
3. **Running new migrations**: `pnpm db:migrate`
4. **Reset for clean slate**: `pnpm db:reset && pnpm db:migrate`

### Migration Files
- `001_init.sql` - Initial schema (users table, uuid extension)
- `002_add_auth.sql` - Authentication fields and indexes
- `003_add_domain_events.sql` - Event sourcing table and indexes

The migration system automatically tracks executed migrations and only runs new ones.

## Deployment

Deploy to Vercel by connecting your GitHub repository and configuring:
- Frontend app from `apps/web`
- API app from `apps/api`
- Vercel Postgres for the database