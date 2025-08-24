import type {
  SignupRequestType,
  LoginRequestType,
  AuthResponseType,
  AuthErrorResponseType
} from '@repo/api-schemas';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;
  private csrfToken: string | null = null;

  constructor() {
    // Use environment variable in production, proxy path in development
    this.baseUrl = import.meta.env.VITE_API_URL || '';
  }

  private async getCsrfToken(): Promise<string | null> {
    if (this.csrfToken) {
      return this.csrfToken;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/csrf-token`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        this.csrfToken = data.token;
        return this.csrfToken;
      }
    } catch (error) {
      console.warn('Failed to get CSRF token:', error);
    }

    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const csrfToken = await this.getCsrfToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add CSRF token for state-changing operations
    if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || 'GET')) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    try {
      const response = await fetch(url, {
        credentials: 'include', // Include cookies
        headers,
        ...options,
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new ApiError(
          'Invalid response format',
          response.status,
          'INVALID_RESPONSE'
        );
      }

      if (!response.ok) {
        // Handle CSRF token expiration
        if (response.status === 403 && data?.error?.code === 'CSRF_TOKEN_INVALID') {
          this.csrfToken = null; // Clear cached token
          // Retry the request once with new token
          return this.request<T>(endpoint, options);
        }

        const error = data as AuthErrorResponseType;
        const errorDetails = error?.error && 'details' in error.error ? error.error.details : undefined;
        throw new ApiError(
          error?.error?.message || 'Request failed',
          response.status,
          error?.error?.code || 'REQUEST_FAILED',
          errorDetails
        );
      }

      return data;
    } catch (networkError) {
      if (networkError instanceof ApiError) {
        throw networkError;
      }

      // Handle network errors (fetch throws for network failures)
      throw new ApiError(
        'Network error occurred',
        0,
        'NETWORK_ERROR',
        networkError
      );
    }
  }

  // Auth endpoints
  async signup(data: SignupRequestType): Promise<AuthResponseType> {
    return this.request<AuthResponseType>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequestType): Promise<AuthResponseType> {
    return this.request<AuthResponseType>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Generic GET method
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  // Generic POST method
  async post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  // Generic PUT method
  async put<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  // Generic DELETE method
  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  // Clear CSRF token (useful for testing or logout)
  clearCsrfToken(): void {
    this.csrfToken = null;
  }
}

export const apiClient = new ApiClient();