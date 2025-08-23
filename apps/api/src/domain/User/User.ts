import bcrypt from 'bcrypt';
import {
  InvalidEmailError,
  InvalidPasswordError
} from '../../shared/errors';

// Inline Value Objects - now throw errors instead of returning Results
export class Email {
  private constructor(private readonly value: string) {}

  static create(value: string): Email {
    if (!value || typeof value !== 'string') {
      throw new InvalidEmailError();
    }

    const trimmed = value.trim().toLowerCase();
    if (!this.isValidEmail(trimmed)) {
      throw new InvalidEmailError();
    }

    return new Email(trimmed);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  }
}

export class Password {
  private constructor(private readonly hash: string) {}

  static async create(plaintext: string): Promise<Password> {
    if (!plaintext || typeof plaintext !== 'string') {
      throw new InvalidPasswordError('Password is required');
    }

    if (plaintext.length < 8) {
      throw new InvalidPasswordError('Password must be at least 8 characters long');
    }

    if (plaintext.length > 100) {
      throw new InvalidPasswordError('Password must be less than 100 characters');
    }

    const hash = await bcrypt.hash(plaintext, 12);
    return new Password(hash);
  }

  static fromHash(hash: string): Password {
    if (!hash || typeof hash !== 'string') {
      throw new InvalidPasswordError('Password hash is required');
    }
    return new Password(hash);
  }

  async verify(plaintext: string): Promise<boolean> {
    if (!plaintext || typeof plaintext !== 'string') {
      return false;
    }

    try {
      return await bcrypt.compare(plaintext, this.hash);
    } catch (error) {
      // If bcrypt comparison fails due to corrupted hash or other issues,
      // treat as invalid password rather than throwing
      return false;
    }
  }

  getHash(): string {
    return this.hash;
  }
}

// User entity constructor parameters - typed object
export interface UserConstructorParams {
  id: string;
  email: Email;
  password: Password;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
}

// User entity creation parameters - typed object
export interface CreateUserParams {
  email: Email;
  password: Password;
}

// Persistence data interface
export interface UserPersistenceData {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
}

// User entity
export class User {
  private constructor(private readonly params: UserConstructorParams) {}

  // Factory method for creating new users
  static async create(params: CreateUserParams): Promise<User> {
    const now = new Date();
    return new User({
      id: crypto.randomUUID(),
      email: params.email,
      password: params.password,
      createdAt: now,
      updatedAt: now,
      lastLogin: null
    });
  }

  // Factory method for reconstructing from persistence
  static fromPersistence(data: UserPersistenceData): User {
    const email = Email.create(data.email);
    const password = Password.fromHash(data.passwordHash);

    return new User({
      id: data.id,
      email,
      password,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      lastLogin: data.lastLogin
    });
  }

  // Getters
  get id(): string { return this.params.id; }
  get email(): Email { return this.params.email; }
  get createdAt(): Date { return this.params.createdAt; }
  get updatedAt(): Date { return this.params.updatedAt; }
  get lastLogin(): Date | null { return this.params.lastLogin; }

  // Business methods
  async authenticate(plaintext: string): Promise<boolean> {
    return this.params.password.verify(plaintext);
  }

  updateLastLogin(): void {
    const now = new Date();
    this.params.lastLogin = now;
    this.params.updatedAt = now;
  }

  // For API responses - exposes public data only
  get details() {
    return {
      id: this.params.id,
      email: this.params.email.toString(),
      created_at: this.params.createdAt.toISOString(),
      updated_at: this.params.updatedAt.toISOString(),
      last_login: this.params.lastLogin?.toISOString()
    };
  }

  // For persistence - exposes internal state
  getInternalState(): UserPersistenceData {
    return {
      id: this.params.id,
      email: this.params.email.toString(),
      passwordHash: this.params.password.getHash(),
      createdAt: this.params.createdAt,
      updatedAt: this.params.updatedAt,
      lastLogin: this.params.lastLogin
    };
  }
}
