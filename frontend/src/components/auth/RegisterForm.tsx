"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register, registerWithToken, RegisterRequest } from '@/lib/api/auth';

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  full_name?: string;
  organization_name?: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterRequest & { confirmPassword: string }>({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    organization_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    full_name: false,
    organization_name: false,
  });

  const validateField = (name: string, value: string) => {
    let fieldError = '';
    
    if (name === 'email') {
      if (!value) {
        fieldError = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        fieldError = 'Please enter a valid email address';
      }
    } else if (name === 'password') {
      if (!value) {
        fieldError = 'Password is required';
      } else if (value.length < 8) {
        fieldError = 'Password must be at least 8 characters';
      }
    } else if (name === 'confirmPassword') {
      if (!value) {
        fieldError = 'Please confirm your password';
      } else if (value !== formData.password) {
        fieldError = 'Passwords do not match';
      }
    } else if (name === 'full_name') {
      if (!value) {
        fieldError = 'Full name is required';
      }
    } else if (name === 'organization_name') {
      if (!value) {
        fieldError = 'Organization name is required';
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
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name as keyof typeof touched]) {
      validateField(name, value);
    }
    
    // Special case: if password changes, also validate confirmPassword
    if (name === 'password' && touched.confirmPassword) {
      validateField('confirmPassword', formData.confirmPassword);
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
    const emailValid = validateField('email', formData.email);
    const passwordValid = validateField('password', formData.password);
    const confirmPasswordValid = validateField('confirmPassword', formData.confirmPassword);
    const fullNameValid = validateField('full_name', formData.full_name);
    const organizationNameValid = validateField('organization_name', formData.organization_name);
    
    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
      confirmPassword: true,
      full_name: true,
      organization_name: true,
    });
    
    // Only submit if all required fields are valid
    if (emailValid && passwordValid && confirmPasswordValid && fullNameValid && organizationNameValid) {
      setLoading(true);
      setError(null);
      
      try {
        // Send registration data to the backend and get token in one step
        const { confirmPassword, ...registerData } = formData;
        const response = await registerWithToken(registerData);
        
        // Store token in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', response.access_token);
        }
        
        // Redirect to knowledge bases after successful registration and login
        router.push('/knowledge-bases');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed');
        console.error('Registration error:', err);
      } finally {
        setLoading(false);
      }
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
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-3 py-2 border text-gray-900 ${
            validationErrors.email && touched.email 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-primary focus:border-primary'
          } rounded-md shadow-sm focus:outline-none`}
          placeholder="your.email@example.com"
          aria-invalid={!!validationErrors.email}
          aria-describedby={validationErrors.email ? "email-error" : undefined}
        />
        {validationErrors.email && touched.email && (
          <p className="mt-1 text-sm text-red-600" id="email-error">
            {validationErrors.email}
          </p>
        )}
      </div>
      
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          autoComplete="name"
          value={formData.full_name}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-3 py-2 border text-gray-900 ${
            validationErrors.full_name && touched.full_name 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-primary focus:border-primary'
          } rounded-md shadow-sm focus:outline-none`}
          placeholder="John Doe"
          aria-invalid={!!validationErrors.full_name}
          aria-describedby={validationErrors.full_name ? "full_name-error" : undefined}
        />
        {validationErrors.full_name && touched.full_name && (
          <p className="mt-1 text-sm text-red-600" id="full_name-error">
            {validationErrors.full_name}
          </p>
        )}
      </div>
      
      <div>
        <label htmlFor="organization_name" className="block text-sm font-medium text-gray-700 mb-1">
          Organization Name *
        </label>
        <input
          type="text"
          id="organization_name"
          name="organization_name"
          autoComplete="organization"
          value={formData.organization_name}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-3 py-2 border text-gray-900 ${
            validationErrors.organization_name && touched.organization_name 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-primary focus:border-primary'
          } rounded-md shadow-sm focus:outline-none`}
          placeholder="Acme Inc."
          aria-invalid={!!validationErrors.organization_name}
          aria-describedby={validationErrors.organization_name ? "organization_name-error" : undefined}
        />
        {validationErrors.organization_name && touched.organization_name && (
          <p className="mt-1 text-sm text-red-600" id="organization_name-error">
            {validationErrors.organization_name}
          </p>
        )}
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password *
        </label>
        <input
          type="password"
          id="password"
          name="password"
          autoComplete="new-password"
          value={formData.password}
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
      
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password *
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-3 py-2 border text-gray-900 ${
            validationErrors.confirmPassword && touched.confirmPassword 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-primary focus:border-primary'
          } rounded-md shadow-sm focus:outline-none`}
          placeholder="••••••••"
          aria-invalid={!!validationErrors.confirmPassword}
          aria-describedby={validationErrors.confirmPassword ? "confirmPassword-error" : undefined}
        />
        {validationErrors.confirmPassword && touched.confirmPassword && (
          <p className="mt-1 text-sm text-red-600" id="confirmPassword-error">
            {validationErrors.confirmPassword}
          </p>
        )}
      </div>
      
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </div>
    </form>
  );
}