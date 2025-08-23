import { describe, it, expect, beforeEach } from 'vitest';
import { User, Email, Password } from './User';

describe('Email Value Object', () => {
  describe('creation', () => {
    it('should create email with valid format', () => {
      const result = Email.create('test@example.com');
      
      expect(result.isSuccess()).toBe(true);
      expect(result.value.toString()).toBe('test@example.com');
    });

    it('should normalize email to lowercase', () => {
      const result = Email.create('TEST@EXAMPLE.COM');
      
      expect(result.isSuccess()).toBe(true);
      expect(result.value.toString()).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      const result = Email.create('  test@example.com  ');
      
      expect(result.isSuccess()).toBe(true);
      expect(result.value.toString()).toBe('test@example.com');
    });

    it('should fail with invalid email format', () => {
      const result = Email.create('invalid-email');
      
      expect(result.isFailure()).toBe(true);
      expect(result.error).toBe('Invalid email format');
    });

    it('should fail with empty email', () => {
      const result = Email.create('');
      
      expect(result.isFailure()).toBe(true);
      expect(result.error).toBe('Email is required');
    });

    it('should fail with email too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = Email.create(longEmail);
      
      expect(result.isFailure()).toBe(true);
      expect(result.error).toBe('Invalid email format');
    });
  });

  describe('equality', () => {
    it('should be equal when values match', () => {
      const email1 = Email.create('test@example.com').value;
      const email2 = Email.create('test@example.com').value;
      
      expect(email1.equals(email2)).toBe(true);
    });

    it('should not be equal when values differ', () => {
      const email1 = Email.create('test@example.com').value;
      const email2 = Email.create('other@example.com').value;
      
      expect(email1.equals(email2)).toBe(false);
    });
  });
});

describe('Password Value Object', () => {
  describe('creation', () => {
    it('should create password with valid input', async () => {
      const result = await Password.create('validpassword123');
      
      expect(result.isSuccess()).toBe(true);
      expect(result.value.getHash()).toBeDefined();
      expect(result.value.getHash().length).toBeGreaterThan(0);
    });

    it('should fail with password too short', async () => {
      const result = await Password.create('short');
      
      expect(result.isFailure()).toBe(true);
      expect(result.error).toBe('Password must be at least 8 characters long');
    });

    it('should fail with password too long', async () => {
      const longPassword = 'a'.repeat(101);
      const result = await Password.create(longPassword);
      
      expect(result.isFailure()).toBe(true);
      expect(result.error).toBe('Password must be less than 100 characters');
    });

    it('should fail with empty password', async () => {
      const result = await Password.create('');
      
      expect(result.isFailure()).toBe(true);
      expect(result.error).toBe('Password is required');
    });
  });

  describe('verification', () => {
    it('should verify correct password', async () => {
      const plaintext = 'testpassword123';
      const password = (await Password.create(plaintext)).value;
      
      const isValid = await password.verify(plaintext);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = (await Password.create('testpassword123')).value;
      
      const isValid = await password.verify('wrongpassword');
      expect(isValid).toBe(false);
    });

    it('should reject empty password verification', async () => {
      const password = (await Password.create('testpassword123')).value;
      
      const isValid = await password.verify('');
      expect(isValid).toBe(false);
    });
  });

  describe('fromHash', () => {
    it('should create password from valid hash', () => {
      const hash = '$2b$12$validhashexample';
      const result = Password.fromHash(hash);
      
      expect(result.isSuccess()).toBe(true);
      expect(result.value.getHash()).toBe(hash);
    });

    it('should fail with empty hash', () => {
      const result = Password.fromHash('');
      
      expect(result.isFailure()).toBe(true);
      expect(result.error).toBe('Password hash is required');
    });
  });
});

describe('User Entity', () => {
  let validEmail: Email;
  let validPassword: Password;

  beforeEach(async () => {
    validEmail = Email.create('test@example.com').value;
    validPassword = (await Password.create('validpassword123')).value;
  });

  describe('creation', () => {
    it('should create user with valid email and password', async () => {
      const result = await User.create(validEmail, validPassword);
      
      expect(result.isSuccess()).toBe(true);
      expect(result.value.id).toBeDefined();
      expect(result.value.email.equals(validEmail)).toBe(true);
      expect(result.value.createdAt).toBeInstanceOf(Date);
      expect(result.value.updatedAt).toBeInstanceOf(Date);
      expect(result.value.lastLogin).toBeNull();
    });
  });

  describe('authentication', () => {
    it('should authenticate with correct password', async () => {
      const user = (await User.create(validEmail, validPassword)).value;
      
      const isAuthenticated = await user.authenticate('validpassword123');
      expect(isAuthenticated).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const user = (await User.create(validEmail, validPassword)).value;
      
      const isAuthenticated = await user.authenticate('wrongpassword');
      expect(isAuthenticated).toBe(false);
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login time', async () => {
      const user = (await User.create(validEmail, validPassword)).value;
      expect(user.lastLogin).toBeNull();
      
      // Add small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1));
      
      const updatedUser = user.updateLastLogin();
      
      expect(updatedUser.lastLogin).toBeInstanceOf(Date);
      expect(updatedUser.id).toBe(user.id);
      expect(updatedUser.email.equals(user.email)).toBe(true);
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(user.updatedAt.getTime());
    });
  });

  describe('getInternalState', () => {
    it('should expose all data needed for persistence', async () => {
      const user = (await User.create(validEmail, validPassword)).value;
      const state = user.getInternalState();
      
      expect(state).toMatchObject({
        id: expect.any(String),
        email: 'test@example.com',
        passwordHash: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        lastLogin: null
      });
    });
  });

  describe('fromPersistence', () => {
    it('should reconstruct user from persistence data', () => {
      const persistenceData = {
        id: 'test-id',
        email: 'test@example.com',
        passwordHash: '$2b$12$validhashexample',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        lastLogin: new Date('2023-01-03')
      };
      
      const result = User.fromPersistence(persistenceData);
      
      expect(result.isSuccess()).toBe(true);
      expect(result.value.id).toBe('test-id');
      expect(result.value.email.toString()).toBe('test@example.com');
      expect(result.value.lastLogin).toEqual(new Date('2023-01-03'));
    });

    it('should fail with invalid email in persistence data', () => {
      const persistenceData = {
        id: 'test-id',
        email: 'invalid-email',
        passwordHash: '$2b$12$validhashexample',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null
      };
      
      const result = User.fromPersistence(persistenceData);
      
      expect(result.isFailure()).toBe(true);
      expect(result.error).toContain('Invalid email in persistence data');
    });
  });
});