import jwt from 'jsonwebtoken';
import type { UserType } from '@repo/api-schemas';
import { env } from '../config/env'

const JWT_EXPIRES_IN = '7d';

export function generateToken(user: UserType): string {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email 
    },
    env.JWT_SECRET,
    { 
      expiresIn: JWT_EXPIRES_IN 
    }
  );
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; email: string };
    return decoded;
  } catch {
    return null;
  }
}

export function getTokenExpiration(): string {
  const now = new Date();
  const expiration = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
  return expiration.toISOString();
}