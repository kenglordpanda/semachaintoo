// Auth token management functions
// import { cookies } from 'next/headers'; // Removed server-side import

/**
 * Store auth token in both localStorage (for client) and cookie (for server)
 */
export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    // Client-side: Set in localStorage
    localStorage.setItem('auth_token', token);
    
    // Also set in cookie for server components
    document.cookie = `auth_token=${token}; path=/; max-age=2592000`; // 30 days
  }
}

/**
 * Clear auth token from both localStorage and cookie
 */
export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    // Client-side: Remove from localStorage
    localStorage.removeItem('auth_token');
    
    // Remove from cookie
    document.cookie = 'auth_token=; path=/; max-age=0';
  }
}

/**
 * Get auth token from appropriate client-side source
 */
export function getAuthToken(): string {
  if (typeof window !== 'undefined') {
    // Client-side: Get from localStorage first
    const tokenFromLocalStorage = localStorage.getItem('auth_token');
    if (tokenFromLocalStorage) {
      return tokenFromLocalStorage;
    }
    // Fallback to reading from document.cookie if not in localStorage
    const match = document.cookie.match(new RegExp('(^| )auth_token=([^;]+)'));
    if (match && match[2]) {
      return match[2];
    }
    return '';
  }
  // This function is intended for client-side use; return empty string if not in browser.
  return '';
}