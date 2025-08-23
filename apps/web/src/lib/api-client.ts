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

  constructor() {
    // Use environment variable in production, proxy path in development
    this.baseUrl = import.meta.env.VITE_API_URL || '';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
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

  // Utility method for authenticated requests
  async authenticatedRequest<T>(
    endpoint: string,
    token: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export const apiClient = new ApiClient();