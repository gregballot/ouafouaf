import type { UserType } from '@repo/api-schemas';

// Simplified authentication status - no client-side storage needed with httpOnly cookies
export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  status: AuthStatus;
  user: UserType | null;
}
