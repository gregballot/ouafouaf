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

```bash
pnpm dev         # Start development servers
pnpm build       # Build all packages
pnpm type-check  # TypeScript checking
pnpm lint        # Code linting
pnpm db:up       # Start database
pnpm db:down     # Stop database
```

## Deployment

Deploy to Vercel by connecting your GitHub repository and configuring:
- Frontend app from `apps/web`
- API app from `apps/api`
- Vercel Postgres for the database