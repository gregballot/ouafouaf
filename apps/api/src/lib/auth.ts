import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { UserType } from '@repo/api-schemas';

const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = '7d';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required. Please set a secure secret key.');
  }
  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: UserType): string {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email 
    },
    getJwtSecret(),
    { 
      expiresIn: JWT_EXPIRES_IN 
    }
  );
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string; email: string };
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