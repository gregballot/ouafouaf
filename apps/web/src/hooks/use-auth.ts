import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { apiClient, ApiError } from '../lib/api-client';
import { getStoredAuth, setStoredAuth, clearStoredAuth, type AuthState } from '../lib/auth';
import type { SignupRequestType, LoginRequestType } from '@repo/api-schemas';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => getStoredAuth());
  const queryClient = useQueryClient();

  // Update auth state when localStorage changes (e.g., from other tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      setAuthState(getStoredAuth());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const signupMutation = useMutation({
    mutationFn: (data: SignupRequestType) => apiClient.signup(data),
    onSuccess: (response) => {
      setStoredAuth(response.user, response.token, response.expires_at);
      setAuthState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
      });
      queryClient.clear(); // Clear any cached data
    },
    onError: (error) => {
      console.error('Signup failed:', error);
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequestType) => apiClient.login(data),
    onSuccess: (response) => {
      setStoredAuth(response.user, response.token, response.expires_at);
      setAuthState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
      });
      queryClient.clear(); // Clear any cached data
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });

  const logout = () => {
    clearStoredAuth();
    setAuthState({ user: null, token: null, isAuthenticated: false });
    queryClient.clear(); // Clear any cached data
  };

  return {
    // Auth state
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    
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