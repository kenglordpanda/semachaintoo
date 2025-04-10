'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  organizationId: string | null;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

interface Organization {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updateOrganization: (orgData: Partial<Organization>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // In a real implementation, this would verify the session with your backend
      const storedUser = localStorage.getItem('user');
      const storedOrg = localStorage.getItem('organization');
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedOrg) {
        setOrganization(JSON.parse(storedOrg));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // In a real implementation, this would be an API call
      const mockUser: User = {
        id: '1',
        email,
        name: 'Test User',
        organizationId: '1',
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockOrg: Organization = {
        id: '1',
        name: 'Test Organization',
        description: 'A test organization',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser(mockUser);
      setOrganization(mockOrg);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('organization', JSON.stringify(mockOrg));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      // In a real implementation, this would be an API call
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        name,
        organizationId: null,
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, this would clear the session with your backend
      setUser(null);
      setOrganization(null);
      localStorage.removeItem('user');
      localStorage.removeItem('organization');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      // In a real implementation, this would be an API call
      if (user) {
        const updatedUser = { ...user, ...userData, updatedAt: new Date().toISOString() };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('User update failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrganization = async (orgData: Partial<Organization>) => {
    try {
      setIsLoading(true);
      // In a real implementation, this would be an API call
      if (organization) {
        const updatedOrg = { ...organization, ...orgData, updatedAt: new Date().toISOString() };
        setOrganization(updatedOrg);
        localStorage.setItem('organization', JSON.stringify(updatedOrg));
      }
    } catch (error) {
      console.error('Organization update failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        updateOrganization,
      }}
    >
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