"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';

interface ValidationErrors {
  username?: string;
  password?: string;
}

export default function LoginForm() {
  const { login, loading, error } = useAuth();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState({
    username: false,
    password: false,
  });

  const validateField = (name: string, value: string) => {
    let fieldError = '';
    
    if (name === 'username') {
      if (!value) {
        fieldError = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        fieldError = 'Please enter a valid email address';
      }
    } else if (name === 'password') {
      if (!value) {
        fieldError = 'Password is required';
      } else if (value.length < 6) {
        fieldError = 'Password must be at least 6 characters';
      }
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
    
    return !fieldError;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    
    if (touched[name as keyof typeof touched]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const usernameValid = validateField('username', credentials.username);
    const passwordValid = validateField('password', credentials.password);
    
    // Mark all fields as touched
    setTouched({
      username: true,
      password: true,
    });
    
    // Only submit if all fields are valid
    if (usernameValid && passwordValid) {
      await login(credentials);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="username"
          name="username"
          autoComplete="email"
          value={credentials.username}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-3 py-2 border text-gray-900 ${
            validationErrors.username && touched.username 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-primary focus:border-primary'
          } rounded-md shadow-sm focus:outline-none`}
          placeholder="your.email@example.com"
          aria-invalid={!!validationErrors.username}
          aria-describedby={validationErrors.username ? "username-error" : undefined}
        />
        {validationErrors.username && touched.username && (
          <p className="mt-1 text-sm text-red-600" id="username-error">
            {validationErrors.username}
          </p>
        )}
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          autoComplete="current-password"
          value={credentials.password}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-3 py-2 border text-gray-900 ${
            validationErrors.password && touched.password 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-primary focus:border-primary'
          } rounded-md shadow-sm focus:outline-none`}
          placeholder="••••••••"
          aria-invalid={!!validationErrors.password}
          aria-describedby={validationErrors.password ? "password-error" : undefined}
        />
        {validationErrors.password && touched.password && (
          <p className="mt-1 text-sm text-red-600" id="password-error">
            {validationErrors.password}
          </p>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
            Remember me
          </label>
        </div>
        
        <div className="text-sm">
          <a href="#" className="font-medium text-primary hover:text-primary-dark">
            Forgot your password?
          </a>
        </div>
      </div>
      
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>
  );
}