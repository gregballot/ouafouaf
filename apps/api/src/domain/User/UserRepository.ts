import { Result } from '../../shared/Result';
import { User, Email } from './User';

// Define a simple Transaction interface for now
interface Transaction {
  query(sql: string, params: any[]): Promise<any>;
}

export class UserRepository {
  constructor(private transaction: Transaction) {}

  async save(user: User): Promise<Result<User>> {
    const state = user.getInternalState();

    try {
      // Check if user exists
      const existingUser = await this.findById(state.id);

      if (existingUser) {
        // Update existing user
        await this.transaction.query(`
          UPDATE users 
          SET email = $1, password_hash = $2, updated_at = $3, last_login = $4
          WHERE id = $5
        `, [
          state.email,
          state.passwordHash,
          state.updatedAt,
          state.lastLogin,
          state.id
        ]);
      } else {
        // Create new user
        await this.transaction.query(`
          INSERT INTO users (id, email, password_hash, created_at, updated_at, last_login)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          state.id,
          state.email,
          state.passwordHash,
          state.createdAt,
          state.updatedAt,
          state.lastLogin
        ]);
      }

      return Result.success(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return Result.fail(`Failed to save user: ${message}`);
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const result = await this.transaction.query(`
        SELECT id, email, password_hash, created_at, updated_at, last_login
        FROM users
        WHERE id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const userResult = User.fromPersistence({
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        lastLogin: row.last_login
      });

      return userResult.isSuccess() ? userResult.value : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  async findByEmail(email: Email): Promise<User | null> {
    try {
      const result = await this.transaction.query(`
        SELECT id, email, password_hash, created_at, updated_at, last_login
        FROM users
        WHERE email = $1
      `, [email.toString()]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const userResult = User.fromPersistence({
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        lastLogin: row.last_login
      });

      return userResult.isSuccess() ? userResult.value : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  async isEmailUnique(email: Email): Promise<boolean> {
    const existingUser = await this.findByEmail(email);
    return existingUser === null;
  }
}