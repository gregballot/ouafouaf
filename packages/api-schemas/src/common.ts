import { Type, Static } from '@sinclair/typebox';

// Common response schemas
export const ErrorResponse = Type.Object({
  error: Type.Object({
    message: Type.String(),
    code: Type.Optional(Type.String()),
    details: Type.Optional(Type.Unknown())
  })
});

export const SuccessResponse = Type.Object({
  success: Type.Literal(true),
  message: Type.Optional(Type.String())
});

// User schema (matches database structure)
export const User = Type.Object({
  id: Type.String({ format: 'uuid' }),
  email: Type.String({ format: 'email' }),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
  last_login: Type.Optional(Type.String({ format: 'date-time' }))
});

// Type exports
export type ErrorResponseType = Static<typeof ErrorResponse>;
export type SuccessResponseType = Static<typeof SuccessResponse>;
export type UserType = Static<typeof User>;