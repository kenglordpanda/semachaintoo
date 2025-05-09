import React, { createContext, useContext, useState, useEffect } from 'react';
import { knowledgeBaseApi } from '../utils/api';
import { useAuth } from './AuthContext';

interface KnowledgeBase {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface KnowledgeBaseContextType {
  knowledgeBases: KnowledgeBase[];
  loading: boolean;
  error: string | null;
  addKnowledgeBase: (data: Partial<KnowledgeBase>) => Promise<KnowledgeBase>;
  updateKnowledgeBase: (id: string, data: Partial<KnowledgeBase>) => Promise<KnowledgeBase>;
  deleteKnowledgeBase: (id: string) => Promise<void>;
  getKnowledgeBase: (id: string) => Promise<KnowledgeBase>;
  refreshKnowledgeBases: () => Promise<void>;
}

const KnowledgeBaseContext = createContext<KnowledgeBaseContextType | undefined>(undefined);

export const KnowledgeBaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchKnowledgeBases = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await knowledgeBaseApi.getAll();
      setKnowledgeBases(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch knowledge bases');
      console.error('Error fetching knowledge bases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchKnowledgeBases();
    }
  }, [user]);

  const addKnowledgeBase = async (data: Partial<KnowledgeBase>) => {
    try {
      setLoading(true);
      setError(null);
      const newKnowledgeBase = await knowledgeBaseApi.create(data);
      setKnowledgeBases((prev) => [...prev, newKnowledgeBase]);
      return newKnowledgeBase;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create knowledge base');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateKnowledgeBase = async (id: string, data: Partial<KnowledgeBase>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedKnowledgeBase = await knowledgeBaseApi.update(id, data);
      setKnowledgeBases((prev) =>
        prev.map((kb) => (kb.id === id ? updatedKnowledgeBase : kb))
      );
      return updatedKnowledgeBase;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update knowledge base');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteKnowledgeBase = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await knowledgeBaseApi.delete(id);
      setKnowledgeBases((prev) => prev.filter((kb) => kb.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete knowledge base');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getKnowledgeBase = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      return await knowledgeBaseApi.getById(id);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get knowledge base');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshKnowledgeBases = async () => {
    await fetchKnowledgeBases();
  };

  return (
    <KnowledgeBaseContext.Provider
      value={{
        knowledgeBases,
        loading,
        error,
        addKnowledgeBase,
        updateKnowledgeBase,
        deleteKnowledgeBase,
        getKnowledgeBase,
        refreshKnowledgeBases,
      }}
    >
      {children}
    </KnowledgeBaseContext.Provider>
  );
};

export const useKnowledgeBases = () => {
  const context = useContext(KnowledgeBaseContext);
  if (context === undefined) {
    throw new Error('useKnowledgeBases must be used within a KnowledgeBaseProvider');
  }
  return context;
}; 