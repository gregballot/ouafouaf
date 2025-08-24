import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, ApiError } from '../lib/api-client';
import type { AuthState } from '../lib/auth';
import type {
  SignupRequestType,
  LoginRequestType,
  UserType,
} from '@repo/api-schemas';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    status: 'initializing',
    user: null,
  });

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Initialize authentication state by checking server
  useEffect(() => {
    if (authState.status !== 'initializing') return;

    const initAuth = async () => {
      try {
        // Try to get current user from server (which will check httpOnly cookie)
        const response = await apiClient.get<{ user: UserType }>(
          '/api/auth/me'
        );
        const user = response.user;

        setAuthState({
          status: 'authenticated',
          user,
        });
      } catch (error) {
        // No valid session - user is unauthenticated
        setAuthState({
          status: 'unauthenticated',
          user: null,
        });
      }
    };

    initAuth();
  }, [authState.status]);

  // Note: No cross-tab sync needed - httpOnly cookies are handled server-side

  const signupMutation = useMutation({
    mutationFn: (data: SignupRequestType) => apiClient.signup(data),
    onSuccess: (response) => {
      setAuthState({
        status: 'authenticated',
        user: response.user,
      });
      queryClient.clear(); // Clear any cached data
      navigate('/'); // Navigate to home page after successful signup
    },
    onError: (error) => {
      console.error('Signup failed:', error);
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequestType) => apiClient.login(data),
    onSuccess: (response) => {
      setAuthState({
        status: 'authenticated',
        user: response.user,
      });
      queryClient.clear(); // Clear any cached data
      navigate('/'); // Navigate to home page after successful login
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to clear httpOnly cookie
      await apiClient.post('/api/auth/logout', {});
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local state regardless of API call success
      setAuthState({
        status: 'unauthenticated',
        user: null,
      });
      queryClient.clear(); // Clear any cached data
      navigate('/auth'); // Navigate to auth page after logout
    }
  }, [navigate, queryClient]);

  return {
    // Auth state
    user: authState.user,
    isAuthenticated: authState.status === 'authenticated',
    isInitializing: authState.status === 'initializing',

    // Mutations
    signup: signupMutation.mutate,
    login: loginMutation.mutate,
    logout,

    // Loading states
    isSigningUp: signupMutation.isPending,
    isLoggingIn: loginMutation.isPending,

    // Error states
    signupError: signupMutation.error as ApiError | null,
    loginError: loginMutation.error as ApiError | null,

    // Reset functions
    resetSignupError: signupMutation.reset,
    resetLoginError: loginMutation.reset,
  };
}
