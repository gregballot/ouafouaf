import { Type, Static } from '@sinclair/typebox';
import { User, ErrorResponse } from './common';

// Auth request schemas
export const SignupRequest = Type.Object({
  email: Type.String({
    format: 'email',
    minLength: 1,
    maxLength: 255
  }),
  password: Type.String({
    minLength: 8,
    maxLength: 100
  })
});

export const LoginRequest = Type.Object({
  email: Type.String({
    format: 'email',
    minLength: 1,
    maxLength: 255
  }),
  password: Type.String({
    minLength: 8,
    maxLength: 100
  })
});

// Auth response schemas
export const AuthResponse = Type.Object({
  user: User,
  expires_at: Type.String({ format: 'date-time' })
});

// Auth error responses
export const AuthErrorResponse = Type.Union([
  ErrorResponse,
  Type.Object({
    error: Type.Object({
      message: Type.Literal('Invalid credentials'),
      code: Type.Literal('INVALID_CREDENTIALS')
    })
  }),
  Type.Object({
    error: Type.Object({
      message: Type.Literal('User already exists'),
      code: Type.Literal('USER_EXISTS')
    })
  }),
  Type.Object({
    error: Type.Object({
      message: Type.Literal('Validation failed'),
      code: Type.Literal('VALIDATION_ERROR'),
      details: Type.Array(Type.Object({
        field: Type.String(),
        message: Type.String()
      }))
    })
  })
]);

// Route schemas for Fastify
export const SignupRouteSchema = {
  body: SignupRequest,
  response: {
    201: AuthResponse,
    400: AuthErrorResponse,
    409: AuthErrorResponse
  }
};

export const LoginRouteSchema = {
  body: LoginRequest,
  response: {
    200: AuthResponse,
    400: AuthErrorResponse,
    401: AuthErrorResponse
  }
};

// Type exports
export type SignupRequestType = Static<typeof SignupRequest>;
export type LoginRequestType = Static<typeof LoginRequest>;
export type AuthResponseType = Static<typeof AuthResponse>;
export type AuthErrorResponseType = Static<typeof AuthErrorResponse>;