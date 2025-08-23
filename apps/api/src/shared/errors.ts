// Custom domain errors with automatic HTTP status mapping

export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;

  constructor(message: string, public readonly details?: any) {
    super(message);
    this.name = this.constructor.name;
  }

  toResponse() {
    return {
      error: {
        message: this.message,
        code: this.code,
        ...(this.details && { details: this.details })
      }
    };
  }
}

// Validation Errors (400)
export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  readonly httpStatus = 400;
}

export class InvalidEmailError extends DomainError {
  readonly code = 'INVALID_EMAIL';
  readonly httpStatus = 400;

  constructor() {
    super('Invalid email format');
  }
}

export class InvalidPasswordError extends DomainError {
  readonly code = 'INVALID_PASSWORD';
  readonly httpStatus = 400;

  constructor(message: string = 'Invalid password format') {
    super(message);
  }
}

// Authentication Errors (401)
export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS';
  readonly httpStatus = 401;

  constructor() {
    super('Invalid credentials');
  }
}

// Conflict Errors (409)
export class UserAlreadyExistsError extends DomainError {
  readonly code = 'USER_EXISTS';
  readonly httpStatus = 409;

  constructor() {
    super('User already exists');
  }
}

// Not Found Errors (404)
export class UserNotFoundError extends DomainError {
  readonly code = 'USER_NOT_FOUND';
  readonly httpStatus = 404;

  constructor() {
    super('User not found');
  }
}

// Server Errors (500)
export class DatabaseError extends DomainError {
  readonly code = 'DATABASE_ERROR';
  readonly httpStatus = 500;

  constructor(message: string = 'Database operation failed', details?: any) {
    super(message, details);
  }
}

export class InternalServerError extends DomainError {
  readonly code = 'INTERNAL_SERVER_ERROR';
  readonly httpStatus = 500;

  constructor(message: string = 'Internal server error', details?: any) {
    super(message, details);
  }
}

// Type guard to check if error is a domain error
export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}