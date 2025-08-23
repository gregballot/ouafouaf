# Deployment Guide

This guide covers deploying the Ouafouaf application to production.

## Architecture

- **Frontend**: React app deployed on Vercel
- **API**: Fastify app deployed on Vercel (serverless)
- **Database**: PostgreSQL on Vercel Postgres

## Environment Variables

### Frontend (apps/web)

Create environment variables in Vercel dashboard:

- `VITE_API_URL`: URL of your deployed API (e.g., `https://your-api.vercel.app`)

### API (apps/api)

Create environment variables in Vercel dashboard:

- `DATABASE_URL`: PostgreSQL connection string from Vercel Postgres
- `JWT_SECRET`: A secure random string for JWT signing
- `NODE_ENV`: Set to `production`

## Deployment Steps

### 1. Database Setup

1. Create a PostgreSQL database on Vercel Postgres
2. Run the migration scripts:
   ```sql
   -- 001_init.sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   
   CREATE TABLE users (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       email VARCHAR(255) UNIQUE NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- 002_add_auth.sql
   ALTER TABLE users 
   ADD COLUMN password_hash VARCHAR(255) NOT NULL,
   ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
   
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_users_auth ON users(email, password_hash);
   ```

### 2. API Deployment

1. In the Vercel dashboard, create a new project for the API
2. Set the root directory to `apps/api`
3. Configure environment variables (see above)
4. Deploy

### 3. Frontend Deployment

1. In the Vercel dashboard, create a new project for the frontend
2. Set the root directory to `apps/web`
3. Set `VITE_API_URL` to your deployed API URL
4. Deploy

## Development vs Production

### Development
- Uses Vite proxy for API calls (`VITE_API_URL` is empty)
- Local PostgreSQL via Docker Compose
- Hot reloading for both frontend and API

### Production
- Direct API calls using `VITE_API_URL`
- Vercel Postgres database
- Serverless functions for API endpoints

## Security Considerations

- Ensure `JWT_SECRET` is a strong, random string in production
- Database credentials should never be committed to the repository
- Use environment variables for all sensitive configuration
- API CORS is configured to allow your frontend domain in production

## Monitoring

Both applications include:
- Structured logging with appropriate log levels
- Health check endpoints
- Error handling and reporting
