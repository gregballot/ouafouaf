import type { UserType } from '@repo/api-schemas';

export interface AuthState {
  user: UserType | null;
  token: string | null;
  isAuthenticated: boolean;
}

const AUTH_STORAGE_KEY = 'ouafouaf_auth';

export function getStoredAuth(): AuthState {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) {
      return { user: null, token: null, isAuthenticated: false };
    }

    const parsed = JSON.parse(stored);

    // Check if token is expired
    if (parsed.expires_at && new Date(parsed.expires_at) <= new Date()) {
      try {
        clearStoredAuth();
      } catch (clearError) {
        console.warn('Failed to clear expired auth data:', clearError);
      }
      return { user: null, token: null, isAuthenticated: false };
    }

    return {
      user: parsed.user,
      token: parsed.token,
      isAuthenticated: true,
    };
  } catch (error) {
    console.warn('Failed to retrieve auth data:', error);
    try {
      clearStoredAuth();
    } catch (clearError) {
      console.warn('Failed to clear corrupted auth data:', clearError);
    }
    return { user: null, token: null, isAuthenticated: false };
  }
}

export function setStoredAuth(user: UserType, token: string, expires_at: string): void {
  const authData = { user, token, expires_at };

  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  } catch (error) {
    console.error('Failed to store auth data:', error);
    // If quota exceeded, try to clear old data and retry
    if (error instanceof DOMException && error.code === 22) {
      console.warn('LocalStorage quota exceeded, attempting to clear and retry');
      try {
        localStorage.clear();
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      } catch (retryError) {
        console.error('Failed to store auth data after clearing localStorage:', retryError);
        throw new Error('Unable to store authentication data. Please check your browser storage settings.');
      }
    } else {
      throw error;
    }
  }
}

export function clearStoredAuth(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear auth data:', error);
  }
}