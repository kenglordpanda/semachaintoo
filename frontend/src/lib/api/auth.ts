import { fetchApi } from './api-client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

/**
 * Login and get access token
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  // Convert to form data format required by the backend
  const formData = new URLSearchParams();
  formData.append('username', data.username);
  formData.append('password', data.password);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/login/access-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
    mode: 'cors',
    credentials: 'include', // Always include credentials for cross-origin
    cache: 'no-cache',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Authentication failed');
  }

  return response.json();
}

/**
 * Get the current authenticated user information
 */
export async function getCurrentUser() {
  return fetchApi('/api/v1/users/me');
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  organization_name?: string;
}

/**
 * Register a new user
 */
export async function register(data: RegisterRequest) {
  return fetchApi('/api/v1/users/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Register a new user and get access token in one step
 */
export async function registerWithToken(data: RegisterRequest): Promise<LoginResponse> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/users/register/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    mode: 'cors',
    credentials: 'include',
    cache: 'no-cache',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Registration failed');
  }

  return response.json();
}