// Base API client for making requests to the backend
import { parseCookies } from 'nookies'; // Add nookies for isomorphic cookie handling

// Configure API URL based on environment
const API_URL = typeof window === 'undefined'
  // Server-side: backend service name when running in Docker
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000')
  // Client-side: Use the browser-accessible URL
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');

/**
 * Base API client for making requests to the backend
 */
export async function fetchApi(endpoint: string, options: RequestInit = {}, ctx?: any) {
  // Get token from appropriate source based on environment
  let token = '';
  
  if (typeof window !== 'undefined') {
    // Client-side: Get token from localStorage
    token = localStorage.getItem('auth_token') || '';
  } else {
    // Server-side: Get token from cookies using nookies (isomorphic)
    try {
      const cookies = parseCookies(ctx);
      token = cookies['auth_token'] || '';
    } catch (error) {
      console.warn('Failed to access cookies during server rendering:', error);
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Ensure endpoint always has /api/v1 prefix
  const apiEndpoint = endpoint.startsWith('/api/v1') ? endpoint : `/api/v1${endpoint}`;
  
  // Construct the full URL
  const requestUrl = `${API_URL}${apiEndpoint}`;

  // For debugging
  console.log(`[API Request] ${options.method || 'GET'} ${requestUrl}`);
  
  try {
    const response = await fetch(requestUrl, {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'include',
      cache: 'no-cache',
    });

    // For debugging
    console.log(`[API Response] ${response.status} ${response.statusText} for ${requestUrl}`);

    // Handle API errors
    if (!response.ok) {
      let errorMessage = 'An error occurred while fetching data';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
        
        // Handle authentication errors on client side
        if (response.status === 401 && typeof window !== 'undefined') {
          console.warn('Authentication token expired or invalid. Clearing token and redirecting to login.');
          localStorage.removeItem('auth_token');
          
          // Only redirect if we're in the browser
          window.location.href = '/login';
        }
      } catch (e) {
        errorMessage = `${response.status}: ${response.statusText || errorMessage}`;
      }
      
      throw new Error(errorMessage);
    }

    // Return empty object if no content
    if (response.status === 204) {
      return {};
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * API client for making GET requests
 */
export async function get<T>(endpoint: string, params?: Record<string, string | number | boolean>) {
  try {
    // Ensure endpoint always has /api/v1 prefix
    const normEndpoint = endpoint.startsWith('/api/v1') ? endpoint : `/api/v1${endpoint}`;
    
    // Always create full URL with localhost:8000
    let urlString = `${API_URL}${normEndpoint}`;
    
    // Add query parameters
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
      
      const queryString = queryParams.toString();
      if (queryString) {
        urlString += `?${queryString}`;
      }
    }
    
    console.log(`Making GET request to: ${urlString}`);
    return fetchApi(normEndpoint, { method: 'GET' }) as Promise<T>;
  } catch (error) {
    console.error(`GET request failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * API client for making POST requests
 */
export async function post<T>(endpoint: string, data?: any) {
  return fetchApi(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  }) as Promise<T>;
}

/**
 * API client for making PUT requests
 */
export async function put<T>(endpoint: string, data?: any) {
  return fetchApi(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  }) as Promise<T>;
}

/**
 * API client for making DELETE requests
 */
export async function del(endpoint: string) {
  return fetchApi(endpoint, { method: 'DELETE' });
}