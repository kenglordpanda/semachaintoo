'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { post } from '@/lib/api/api-client';
import { setAuthToken, clearAuthToken, getAuthToken } from './token-storage';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();

  // On mount, check if we have a token in localStorage
  useEffect(() => {
    const storedToken = getAuthToken();
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      fetchUserProfile(storedToken);
    }
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const userData = await post<User>('/users/me', {});
      setUser(userData);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      // If we can't get the user profile, the token is likely invalid
      clearAuthToken();
      setIsAuthenticated(false);
      setToken(null);
    }
  };

  const login = async (credentials: { username: string; password: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await post<{ access_token: string; token_type: string }>('/auth/token', {
        username: credentials.username,
        password: credentials.password,
      });
      
      const newToken = response.access_token;
      
      // Store token in both localStorage and cookie
      setAuthToken(newToken);
      
      // Update state
      setToken(newToken);
      setIsAuthenticated(true);
      
      // Fetch user details
      await fetchUserProfile(newToken);
      
      // Redirect to home page
      router.push('/');
    } catch (err) {
      console.error('Login failed:', err);
      setError('Invalid email or password. Please try again.');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear token from both localStorage and cookie
    clearAuthToken();
    
    // Update state
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
    // Redirect to login page
    router.push('/login');
  };

  const checkAuth = () => {
    return !!getAuthToken();
  };

  const contextValue: AuthContextType = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}