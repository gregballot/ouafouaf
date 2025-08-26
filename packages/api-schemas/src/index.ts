// Common schemas and types
export {
  ErrorResponse,
  SuccessResponse,
  User,
  type ErrorResponseType,
  type SuccessResponseType,
  type UserType,
} from './common';

// Auth schemas and types
export {
  SignupRequest,
  LoginRequest,
  ForgotPasswordRequest,
  AuthResponse,
  ForgotPasswordResponse,
  AuthErrorResponse,
  SignupRouteSchema,
  LoginRouteSchema,
  ForgotPasswordRouteSchema,
  type SignupRequestType,
  type LoginRequestType,
  type ForgotPasswordRequestType,
  type AuthResponseType,
  type ForgotPasswordResponseType,
  type AuthErrorResponseType,
} from './auth';
