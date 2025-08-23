import { getConnection } from './connection';
import type { UserType } from '@repo/api-schemas';

export interface CreateUserParams {
  email: string;
  password_hash: string;
}

export interface AuthUserParams {
  email: string;
  password_hash: string;
}

export interface DatabaseUser extends UserType {
  password_hash: string;
}

export async function createUser(params: CreateUserParams): Promise<UserType> {
  const client = await getConnection();

  try {
    const result = await client.query(
      `INSERT INTO users (email, password_hash, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING id, email, created_at, updated_at, last_login`,
      [params.email, params.password_hash]
    );

    return result.rows[0] as UserType;
  } finally {
    client.release();
  }
}

export async function findUserByEmail(email: string): Promise<DatabaseUser | null> {
  const client = await getConnection();

  try {
    const result = await client.query(
      `SELECT id, email, password_hash, created_at, updated_at, last_login
       FROM users
       WHERE email = $1`,
      [email]
    );

    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function findUserByEmailAndPassword(email: string, password_hash: string): Promise<UserType | null> {
  const client = await getConnection();

  try {
    const result = await client.query(
      `SELECT id, email, created_at, updated_at, last_login
       FROM users
       WHERE email = $1 AND password_hash = $2`,
      [email, password_hash]
    );

    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function updateLastLogin(userId: string): Promise<void> {
  const client = await getConnection();

  try {
    await client.query(
      `UPDATE users
       SET last_login = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [userId]
    );
  } finally {
    client.release();
  }
}