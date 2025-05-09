/**
 * Utility functions to help with client-side only code
 */

// Check if code is running in browser environment
export const isBrowser = typeof window !== 'undefined';

// Safe wrapper for window access
export const safeWindow = () => (isBrowser ? window : undefined);

// Safe localStorage wrapper
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser) return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Error accessing localStorage:', e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (!isBrowser) return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Error setting localStorage:', e);
    }
  },
  removeItem: (key: string): void => {
    if (!isBrowser) return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing from localStorage:', e);
    }
  }
};

// Safely execute code only in browser
export const executeOnClient = (fn: () => void): void => {
  if (isBrowser) {
    fn();
  }
};

// Dynamic import wrapper that only runs on client
export const loadClientModule = async <T>(importFn: () => Promise<T>): Promise<T | null> => {
  if (!isBrowser) return null;
  try {
    return await importFn();
  } catch (e) {
    console.error('Error loading client module:', e);
    return null;
  }
};
