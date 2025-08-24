import 'dotenv/config';
import { z } from 'zod';
import { logger } from '../lib/logger';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .default('4000'),
  DATABASE_URL: z.string().url().optional(),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters long for security'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  API_URL: z.string().url().default('http://localhost:4000'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .default('5432'),
  DB_NAME: z.string().default('ouafouaf'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres'),
  PRODUCTION_DOMAIN: z.string().url().optional(),
});

function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        logger.error(`  • ${err.path.join('.')}: ${err.message}`);
      });
      logger.error('\nPlease check your environment variables and try again.');
    } else {
      logger.error(
        '❌ Failed to validate environment:',
        error instanceof Error ? error : new Error(String(error))
      );
    }
    process.exit(1);
  }
}

export const env = validateEnv();

export type Env = z.infer<typeof envSchema>;
