import { describe, it, expect } from 'vitest';
import { User, Email, Password } from './User';

describe('User Domain Entity - Unit Tests', () => {
  describe('Email Value Object', () => {
    describe('creation', () => {
      it('should create email with valid format', () => {
        const email = Email.create('test@example.com');
        expect(email.toString()).toBe('test@example.com');
      });

      it('should normalize email to lowercase', () => {
        const email = Email.create('TEST@EXAMPLE.COM');
        expect(email.toString()).toBe('test@example.com');
      });

      it('should trim whitespace', () => {
        const email = Email.create('  test@example.com  ');
        expect(email.toString()).toBe('test@example.com');
      });
    });

    describe('validation failures', () => {
      it('should throw with invalid format', () => {
        expect(() => Email.create('invalid-email')).toThrow('Invalid email format');
      });

      it('should throw with empty string', () => {
        expect(() => Email.create('')).toThrow('Invalid email format');
      });

      it('should throw with null', () => {
        expect(() => Email.create(null as any)).toThrow('Invalid email format');
      });

      it('should throw with undefined', () => {
        expect(() => Email.create(undefined as any)).toThrow('Invalid email format');
      });

      it('should throw with too long email', () => {
        const longEmail = 'a'.repeat(250) + '@example.com';
        expect(() => Email.create(longEmail)).toThrow('Invalid email format');
      });
    });

    describe('equality', () => {
      it('should be equal for same emails', () => {
        const email1 = Email.create('test@example.com');
        const email2 = Email.create('test@example.com');
        expect(email1.equals(email2)).toBe(true);
      });

      it('should be equal after normalization', () => {
        const email1 = Email.create('TEST@EXAMPLE.COM');
        const email2 = Email.create('test@example.com');
        expect(email1.equals(email2)).toBe(true);
      });

      it('should not be equal for different emails', () => {
        const email1 = Email.create('test1@example.com');
        const email2 = Email.create('test2@example.com');
        expect(email1.equals(email2)).toBe(false);
      });
    });
  });

  describe('Password Value Object', () => {
    describe('creation', () => {
      it('should create password with valid input', async () => {
        const password = await Password.create('validpassword123');
        expect(password.getHash()).toBeDefined();
        expect(password.getHash()).toContain('$2b$');
      });

      it('should hash password using bcrypt', async () => {
        const password = await Password.create('testpassword123');
        const hash = password.getHash();
        expect(hash).toMatch(/^\$2b\$12\$/);
      });
    });

    describe('validation failures', () => {
      it('should throw with short password', async () => {
        await expect(Password.create('short')).rejects.toThrow('Password must be at least 8 characters long');
      });

      it('should throw with empty password', async () => {
        await expect(Password.create('')).rejects.toThrow('Password is required');
      });

      it('should throw with null password', async () => {
        await expect(Password.create(null as any)).rejects.toThrow('Password is required');
      });

      it('should throw with undefined password', async () => {
        await expect(Password.create(undefined as any)).rejects.toThrow('Password is required');
      });

      it('should throw with too long password', async () => {
        const longPassword = 'a'.repeat(101);
        await expect(Password.create(longPassword)).rejects.toThrow('Password must be less than 100 characters');
      });
    });

    describe('verification', () => {
      it('should verify correct password', async () => {
        const password = await Password.create('testpassword123');
        const isValid = await password.verify('testpassword123');
        expect(isValid).toBe(true);
      });

      it('should reject incorrect password', async () => {
        const password = await Password.create('testpassword123');
        const isValid = await password.verify('wrongpassword');
        expect(isValid).toBe(false);
      });

      it('should handle null input gracefully', async () => {
        const password = await Password.create('testpassword123');
        const isValid = await password.verify(null as any);
        expect(isValid).toBe(false);
      });

      it('should handle empty string input gracefully', async () => {
        const password = await Password.create('testpassword123');
        const isValid = await password.verify('');
        expect(isValid).toBe(false);
      });

      it('should handle corrupted hash gracefully', async () => {
        const password = Password.fromHash('corrupted-hash');
        const isValid = await password.verify('anypassword');
        expect(isValid).toBe(false);
      });
    });

    describe('fromHash', () => {
      it('should create password from valid hash', () => {
        const hash = '$2b$12$validhashhere';
        const password = Password.fromHash(hash);
        expect(password.getHash()).toBe(hash);
      });

      it('should throw with invalid hash', () => {
        expect(() => Password.fromHash('')).toThrow('Password hash is required');
        expect(() => Password.fromHash(null as any)).toThrow('Password hash is required');
      });
    });
  });

  describe('User Entity', () => {
    describe('creation', () => {
      it('should create user with valid data', async () => {
        const email = Email.create('test@example.com');
        const password = await Password.create('validpassword123');

        const user = await User.create({ email, password });

        expect(user.id).toBeDefined();
        expect(user.email.toString()).toBe('test@example.com');
        expect(user.createdAt).toBeInstanceOf(Date);
        expect(user.updatedAt).toBeInstanceOf(Date);
        expect(user.lastLogin).toBeNull();
      });
    });

    describe('authentication', () => {
      it('should authenticate with correct password', async () => {
        const email = Email.create('test@example.com');
        const password = await Password.create('validpassword123');
        const user = await User.create({ email, password });

        const isAuthenticated = await user.authenticate('validpassword123');
        expect(isAuthenticated).toBe(true);
      });

      it('should reject incorrect password', async () => {
        const email = Email.create('test@example.com');
        const password = await Password.create('validpassword123');
        const user = await User.create({ email, password });

        const isAuthenticated = await user.authenticate('wrongpassword');
        expect(isAuthenticated).toBe(false);
      });
    });

    describe('last login update', () => {
      it('should update last login time', async () => {
        const email = Email.create('test@example.com');
        const password = await Password.create('validpassword123');
        const user = await User.create({ email, password });

        expect(user.lastLogin).toBeNull();

        user.updateLastLogin();
        expect(user.lastLogin).toBeInstanceOf(Date);
        expect(user.lastLogin!.getTime()).toBeGreaterThan(Date.now() - 1000);
      });

      it('should update the same user instance', async () => {
        const email = Email.create('test@example.com');
        const password = await Password.create('validpassword123');
        const user = await User.create({ email, password });

        const originalId = user.id;
        user.updateLastLogin();
        expect(user.lastLogin).toBeInstanceOf(Date);
        expect(user.id).toBe(originalId); // Same ID
      });
    });

    describe('state updates', () => {
      it('should update state in place', async () => {
        const email = Email.create('test@example.com');
        const password = await Password.create('validpassword123');
        const user = await User.create({ email, password });

        const originalCreatedAt = user.createdAt;
        expect(user.lastLogin).toBeNull();

        user.updateLastLogin();

        expect(user.lastLogin).toBeInstanceOf(Date);
        expect(user.createdAt).toBe(originalCreatedAt);
      });
    });
  });
});
