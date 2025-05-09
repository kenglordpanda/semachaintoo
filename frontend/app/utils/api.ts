import axios from 'axios';
import { safeLocalStorage } from '../utilities/client-side';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = safeLocalStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      safeLocalStorage.removeItem('token');
      safeLocalStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/login/access-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        username: email,
        password: password,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    return response.json();
  },

  register: async (userData: { email: string; password: string; name: string }) => {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }
    return response.json();
  },

  getCurrentUser: async () => {
    const token = safeLocalStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch user data');
    }
    return response.json();
  },

  logout: () => {
    safeLocalStorage.removeItem('token');
    safeLocalStorage.removeItem('user');
  }
};

// Knowledge Base API
export const knowledgeBaseApi = {
  getAll: async () => {
    const response = await api.get('/knowledge-bases');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/knowledge-bases/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/knowledge-bases', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/knowledge-bases/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/knowledge-bases/${id}`);
    return response.data;
  },
};

// Document API
export const documentApi = {
  getAll: async (knowledgeBaseId: string) => {
    const response = await api.get(`/knowledge-bases/${knowledgeBaseId}/documents`);
    return response.data;
  },
  getById: async (knowledgeBaseId: string, documentId: string) => {
    const response = await api.get(`/knowledge-bases/${knowledgeBaseId}/documents/${documentId}`);
    return response.data;
  },
  create: async (knowledgeBaseId: string, data: any) => {
    const response = await api.post(`/knowledge-bases/${knowledgeBaseId}/documents`, data);
    return response.data;
  },
  update: async (knowledgeBaseId: string, documentId: string, data: any) => {
    const response = await api.put(`/knowledge-bases/${knowledgeBaseId}/documents/${documentId}`, data);
    return response.data;
  },
  delete: async (knowledgeBaseId: string, documentId: string) => {
    const response = await api.delete(`/knowledge-bases/${knowledgeBaseId}/documents/${documentId}`);
    return response.data;
  },
  findSimilar: async (knowledgeBaseId: string, documentId: string, n_results: number = 5) => {
    const response = await api.post(`/knowledge-bases/${knowledgeBaseId}/documents/${documentId}/similar`, { n_results });
    return response.data;
  },
  getSimilarity: async (knowledgeBaseId: string, doc1Id: string, doc2Id: string) => {
    const response = await api.get(`/knowledge-bases/${knowledgeBaseId}/documents/${doc1Id}/similarity/${doc2Id}`);
    return response.data;
  },
};

// Organization API
export const organizationApi = {
  getCurrent: async () => {
    const response = await api.get('/organizations/current');
    return response.data;
  },
  update: async (data: any) => {
    const response = await api.put('/organizations/current', data);
    return response.data;
  },
};

// User API
export const userApi = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  updateProfile: async (data: any) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
};

export default api; 