import { Transaction } from 'kysely';
import { Database } from '../../shared/database-types';
import { User, Email } from './User';
import {
  DatabaseError,
  UserNotFoundError,
  UserAlreadyExistsError
} from '../../shared/errors';

export class UserRepository {
  constructor(private trx: Transaction<Database>) {}

  async save(user: User): Promise<User> {
    const state = user.getInternalState();

    try {
      // Check if user exists
      const existing = await this.trx
        .selectFrom('users')
        .select('id')
        .where('id', '=', state.id)
        .executeTakeFirst();

      if (existing) {
        // Update existing user
        await this.trx
          .updateTable('users')
          .set({
            email: state.email,
            password_hash: state.passwordHash,
            updated_at: state.updatedAt,
            last_login: state.lastLogin
          })
          .where('id', '=', state.id)
          .execute();
      } else {
        // Create new user
        await this.trx
          .insertInto('users')
          .values({
            id: state.id,
            email: state.email,
            password_hash: state.passwordHash,
            created_at: state.createdAt,
            updated_at: state.updatedAt,
            last_login: state.lastLogin
          })
          .execute();
      }

      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new DatabaseError(`Failed to save user: ${message}`, error);
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const row = await this.trx
        .selectFrom('users')
        .select([
          'id',
          'email',
          'password_hash',
          'created_at',
          'updated_at',
          'last_login'
        ])
        .where('id', '=', id)
        .executeTakeFirst();

      if (!row) {
        return null;
      }

      return User.fromPersistence({
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        lastLogin: row.last_login
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new DatabaseError(`Failed to find user by ID: ${message}`, error);
    }
  }

  async findByEmail(email: Email): Promise<User | null> {
    try {
      const row = await this.trx
        .selectFrom('users')
        .select([
          'id',
          'email',
          'password_hash',
          'created_at',
          'updated_at',
          'last_login'
        ])
        .where('email', '=', email.toString())
        .executeTakeFirst();

      if (!row) {
        return null;
      }

      return User.fromPersistence({
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        lastLogin: row.last_login
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new DatabaseError(`Failed to find user by email: ${message}`, error);
    }
  }

  async requireByEmail(email: Email): Promise<User> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }

  async requireById(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }

  async assertEmailUnique(email: Email): Promise<void> {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsError();
    }
  }
}
