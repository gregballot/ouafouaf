import jwt from 'jsonwebtoken';
import type { UserType } from '@repo/api-schemas';
import { env } from '../config/env';

const JWT_EXPIRES_IN_SHORT = '24h'; // 24 hours
const JWT_EXPIRES_IN_LONG = '30d'; // 30 days

export function generateToken(
  user: UserType,
  remember: boolean = false
): string {
  const expiresIn = remember ? JWT_EXPIRES_IN_LONG : JWT_EXPIRES_IN_SHORT;

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    env.JWT_SECRET,
    {
      expiresIn,
    }
  );
}

export function verifyToken(
  token: string
): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      email: string;
    };
    return decoded;
  } catch {
    return null;
  }
}

export function getTokenExpiration(remember: boolean = false): string {
  const now = new Date();
  const durationMs = remember
    ? 30 * 24 * 60 * 60 * 1000 // 30 days
    : 24 * 60 * 60 * 1000; // 24 hours
  const expiration = new Date(now.getTime() + durationMs);
  return expiration.toISOString();
}

export function getCookieMaxAge(remember: boolean = false): number {
  return remember
    ? 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
    : 24 * 60 * 60 * 1000; // 24 hours in milliseconds
}
