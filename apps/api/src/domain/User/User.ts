import bcrypt from 'bcrypt';
import { Result } from '../../shared/Result';

// Inline Value Objects
export class Email {
  private constructor(private readonly value: string) {}

  static create(value: string): Result<Email> {
    if (!value || typeof value !== 'string') {
      return Result.fail('Email is required');
    }
    
    const trimmed = value.trim().toLowerCase();
    if (!this.isValidEmail(trimmed)) {
      return Result.fail('Invalid email format');
    }
    
    return Result.success(new Email(trimmed));
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

  static async create(plaintext: string): Promise<Result<Password>> {
    if (!plaintext || typeof plaintext !== 'string') {
      return Result.fail('Password is required');
    }

    if (plaintext.length < 8) {
      return Result.fail('Password must be at least 8 characters long');
    }

    if (plaintext.length > 100) {
      return Result.fail('Password must be less than 100 characters');
    }

    const hash = await bcrypt.hash(plaintext, 12);
    return Result.success(new Password(hash));
  }

  static fromHash(hash: string): Result<Password> {
    if (!hash || typeof hash !== 'string') {
      return Result.fail('Password hash is required');
    }
    return Result.success(new Password(hash));
  }

  async verify(plaintext: string): Promise<boolean> {
    if (!plaintext) return false;
    return bcrypt.compare(plaintext, this.hash);
  }

  getHash(): string {
    return this.hash;
  }
}

// Main User Entity
export class User {
  private constructor(
    public readonly id: string,
    public readonly email: Email,
    private readonly password: Password,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly lastLogin: Date | null
  ) {}

  static async create(email: Email, password: Password): Promise<Result<User>> {
    // Domain validation can go here
    return Result.success(new User(
      crypto.randomUUID(),
      email,
      password,
      new Date(),
      new Date(),
      null
    ));
  }

  static fromPersistence(data: {
    id: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
    lastLogin: Date | null;
  }): Result<User> {
    const emailResult = Email.create(data.email);
    if (emailResult.isFailure()) {
      return Result.fail(`Invalid email in persistence data: ${emailResult.error}`);
    }

    const passwordResult = Password.fromHash(data.passwordHash);
    if (passwordResult.isFailure()) {
      return Result.fail(`Invalid password in persistence data: ${passwordResult.error}`);
    }

    return Result.success(new User(
      data.id,
      emailResult.value,
      passwordResult.value,
      data.createdAt,
      data.updatedAt,
      data.lastLogin
    ));
  }

  async authenticate(plaintext: string): Promise<boolean> {
    return this.password.verify(plaintext);
  }

  updateLastLogin(): User {
    return new User(
      this.id,
      this.email,
      this.password,
      this.createdAt,
      new Date(), // updatedAt
      new Date()  // lastLogin
    );
  }

  // For persistence - exposes internal state
  getInternalState() {
    return {
      id: this.id,
      email: this.email.toString(),
      passwordHash: this.password.getHash(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastLogin: this.lastLogin
    };
  }
}