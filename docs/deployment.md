# Deployment Guide

This document outlines the deployment architecture, environment configuration, and production setup for both frontend and backend applications.

## Production Architecture

### Vercel Deployment Strategy

**Frontend App (apps/web):**

- **Deploy from**: `apps/web` directory
- **Build command**: `pnpm build` (configured in vercel.json)
- **Output**: Static site with client-side routing
- **CDN**: Global edge network for optimal performance

**Backend API (apps/api):**

- **Deploy from**: `apps/api` directory
- **Runtime**: Node.js serverless functions
- **Build command**: `pnpm build` (TypeScript compilation)
- **Output**: Compiled JavaScript with optimized dependencies

### Database Infrastructure

**Production Database:**

- **Vercel Postgres**: Managed PostgreSQL with automatic scaling
- **Connection pooling**: Built-in connection management
- **Backup strategy**: Automated daily backups with point-in-time recovery
- **SSL enforcement**: All connections encrypted in transit

**Migration Strategy:**

- **CI/CD migrations**: Use `pnpm db:migrate` in deployment scripts
- **Version tracking**: Automatic migration state management
- **Rollback capability**: Database migrations support safe rollbacks
- **Environment isolation**: Separate databases for staging and production

## Environment Configuration

### Required Environment Variables

**Backend API (`apps/api`):**

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Security Configuration
JWT_SECRET=<cryptographically-secure-random-string>
NODE_ENV=production

# Optional Configuration
LOG_LEVEL=info
API_PORT=4000
```

**Frontend App (`apps/web`):**

```bash
# API Integration
VITE_API_URL=https://your-api-domain.vercel.app

# Environment Identification
NODE_ENV=production
```

### Environment Variable Security

**Secret Generation:**

```bash
# Generate secure JWT secret (256-bit)
openssl rand -base64 32

# Generate encryption key if needed
openssl rand -hex 32
```

**Security Requirements:**

- **No fallback secrets** - application fails fast without required variables
- **Environment-specific values** - different secrets for staging/production
- **Rotate regularly** - implement secret rotation schedule
- **Least privilege** - only necessary variables per environment

## Deployment Configuration

### Vercel Configuration Files

**Frontend (`apps/web/vercel.json`):**

```json
{
  "buildCommand": "cd ../.. && npx turbo run build --filter=web",
  "devCommand": "cd ../.. && npx turbo run dev --filter=web",
  "installCommand": "cd ../.. && pnpm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

**Backend (`apps/api/vercel.json`):**

```json
{
  "buildCommand": "cd ../.. && npx turbo run build --filter=api",
  "devCommand": "cd ../.. && npx turbo run dev --filter=api",
  "installCommand": "cd ../.. && pnpm install",
  "functions": {
    "dist/index.js": {
      "runtime": "nodejs18.x"
    }
  },
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/dist/index.js"
    }
  ]
}
```

### Build Optimization

**Turborepo Configuration:**

- **Parallel builds** - frontend and backend build independently
- **Build caching** - incremental builds with dependency tracking
- **Output optimization** - only necessary files included in deployments

**Dependencies:**

- **Production dependencies only** - dev dependencies excluded from production builds
- **Tree shaking** - unused code eliminated during build
- **Bundle analysis** - monitor bundle sizes for performance

## CI/CD Pipeline

### Deployment Workflow

**Automated Deployment:**

1. **Code push** to main branch triggers deployment
2. **Install dependencies** using pnpm with frozen lockfile
3. **Type checking** across all packages
4. **Linting** with zero tolerance for warnings
5. **Testing** with real database integration tests
6. **Building** applications with production optimizations
7. **Database migrations** applied to production database
8. **Deployment** to Vercel with health checks

**Environment Promotion:**

```bash
# Development → Staging → Production
git push origin feature/branch  # Deploy to preview
git push origin main           # Deploy to production
```

### Health Checks

**API Health Endpoint:**

```typescript
// Health check endpoint
app.get('/health', async (request, reply) => {
  try {
    // Test database connection
    await db.selectFrom('users').select('id').limit(1).execute();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV,
    };
  } catch (error) {
    reply.status(503);
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: 'Database connection failed',
    };
  }
});
```

**Frontend Health Check:**

- **Service worker** registration success
- **API connectivity** verification
- **Error boundary** monitoring
- **Performance metrics** collection

## Security Configuration

### Production Security Headers

**Content Security Policy:**

```typescript
const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'", // Only if necessary
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self' https://your-api-domain.vercel.app",
  "frame-ancestors 'none'",
].join('; ');
```

**Additional Security Headers:**

- **HSTS**: `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- **X-Content-Type-Options**: `nosniff`
- **X-Frame-Options**: `DENY`
- **Referrer-Policy**: `strict-origin-when-cross-origin`

### CORS Configuration

**Production CORS Policy:**

```typescript
const corsOptions = {
  origin: [
    'https://your-frontend-domain.vercel.app',
    // Add additional allowed origins
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
};
```

## Monitoring and Observability

### Application Monitoring

**Error Tracking:**

- **Sentry integration** for error monitoring and alerting
- **Performance monitoring** for API response times
- **User session tracking** for frontend error analysis
- **Custom error boundaries** for graceful error handling

**Performance Monitoring:**

- **Core Web Vitals** tracking for frontend performance
- **API response time** monitoring and alerting
- **Database query performance** analysis
- **Resource utilization** monitoring

### Logging Strategy

**Structured Logging:**

```typescript
// Production logging format
logger.info('User authentication', {
  userId: user.id,
  ip: request.ip,
  userAgent: request.headers['user-agent'],
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV,
});
```

**Log Levels:**

- **ERROR**: Application errors requiring immediate attention
- **WARN**: Potential issues that should be monitored
- **INFO**: Important application events and user actions
- **DEBUG**: Detailed information for troubleshooting (development only)

### Alerting Configuration

**Critical Alerts:**

- **Database connection failures**
- **Authentication system errors**
- **High error rates** (>5% of requests)
- **Performance degradation** (>2s response times)

**Warning Alerts:**

- **Unusual traffic patterns**
- **Increased error rates** (>1% of requests)
- **Slow database queries** (>1s execution time)
- **Memory usage spikes**

## Backup and Recovery

### Database Backup Strategy

**Automated Backups:**

- **Daily full backups** with 30-day retention
- **Point-in-time recovery** for the last 7 days
- **Cross-region replication** for disaster recovery
- **Backup testing** - monthly restore verification

**Recovery Procedures:**

1. **Point-in-time recovery** for recent data corruption
2. **Full database restore** from daily backups
3. **Migration rollback** for schema-related issues
4. **Cross-region failover** for major outages

### Application Recovery

**Rollback Strategy:**

- **Vercel deployment rollback** to previous stable version
- **Database migration rollback** using down migrations
- **Feature flags** for quick feature disable
- **Circuit breakers** for graceful service degradation

## Performance Optimization

### Frontend Optimization

**Build Optimization:**

- **Code splitting** by route and feature
- **Tree shaking** to eliminate unused code
- **Asset optimization** with automatic compression
- **CDN caching** for static assets

**Runtime Optimization:**

- **Service worker** for offline capability
- **Resource prefetching** for critical routes
- **Image optimization** with responsive images
- **Bundle analysis** to monitor size growth

### Backend Optimization

**Database Optimization:**

- **Connection pooling** for efficient resource usage
- **Query optimization** with proper indexing
- **Connection limits** to prevent resource exhaustion
- **Query timeout** configuration for reliability

**API Optimization:**

- **Response caching** for frequently accessed data
- **Compression** for large API responses
- **Rate limiting** to prevent abuse
- **Load balancing** through Vercel's infrastructure

This deployment strategy ensures reliable, secure, and performant applications while maintaining observability and recovery capabilities.
