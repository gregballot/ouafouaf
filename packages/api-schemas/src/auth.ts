import { Type, Static } from '@sinclair/typebox';
import { User, ErrorResponse } from './common';

// Auth request schemas
export const SignupRequest = Type.Object({
  email: Type.String({
    format: 'email',
    minLength: 1,
    maxLength: 255,
  }),
  password: Type.String({
    minLength: 8,
    maxLength: 100,
  }),
});

export const LoginRequest = Type.Object({
  email: Type.String({
    format: 'email',
    minLength: 1,
    maxLength: 255,
  }),
  password: Type.String({
    minLength: 8,
    maxLength: 100,
  }),
  remember: Type.Optional(Type.Boolean()),
});

export const ForgotPasswordRequest = Type.Object({
  email: Type.String({
    format: 'email',
    minLength: 1,
    maxLength: 255,
  }),
});

// Auth response schemas
export const AuthResponse = Type.Object({
  user: User,
  expires_at: Type.String({ format: 'date-time' }),
});

export const ForgotPasswordResponse = Type.Object({
  message: Type.String(),
});

// Auth error responses
export const AuthErrorResponse = Type.Union([
  ErrorResponse,
  Type.Object({
    error: Type.Object({
      message: Type.Literal('Invalid credentials'),
      code: Type.Literal('INVALID_CREDENTIALS'),
    }),
  }),
  Type.Object({
    error: Type.Object({
      message: Type.Literal('User already exists'),
      code: Type.Literal('USER_EXISTS'),
    }),
  }),
  Type.Object({
    error: Type.Object({
      message: Type.Literal('Validation failed'),
      code: Type.Literal('VALIDATION_ERROR'),
      details: Type.Array(
        Type.Object({
          field: Type.String(),
          message: Type.String(),
        })
      ),
    }),
  }),
]);

// Route schemas for Fastify
export const SignupRouteSchema = {
  body: SignupRequest,
  response: {
    201: AuthResponse,
    400: AuthErrorResponse,
    409: AuthErrorResponse,
  },
};

export const LoginRouteSchema = {
  body: LoginRequest,
  response: {
    200: AuthResponse,
    400: AuthErrorResponse,
    401: AuthErrorResponse,
  },
};

export const ForgotPasswordRouteSchema = {
  body: ForgotPasswordRequest,
  response: {
    200: ForgotPasswordResponse,
    400: AuthErrorResponse,
  },
};

// Type exports
export type SignupRequestType = Static<typeof SignupRequest>;
export type LoginRequestType = Static<typeof LoginRequest>;
export type ForgotPasswordRequestType = Static<typeof ForgotPasswordRequest>;
export type AuthResponseType = Static<typeof AuthResponse>;
export type ForgotPasswordResponseType = Static<typeof ForgotPasswordResponse>;
export type AuthErrorResponseType = Static<typeof AuthErrorResponse>;
