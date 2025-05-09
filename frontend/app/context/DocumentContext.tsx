'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { documentApi } from '../utils/api';

interface Document {
  id: string;
  title: string;
  content: string;
  tags: string[];
  knowledgeBaseId: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentContextType {
  documents: Document[];
  loading: boolean;
  error: string | null;
  addDocument: (knowledgeBaseId: string, data: Partial<Document>) => Promise<Document>;
  updateDocument: (knowledgeBaseId: string, documentId: string, data: Partial<Document>) => Promise<Document>;
  deleteDocument: (knowledgeBaseId: string, documentId: string) => Promise<void>;
  getDocument: (knowledgeBaseId: string, documentId: string) => Promise<Document>;
  findSimilarDocuments: (knowledgeBaseId: string, documentId: string, n_results?: number) => Promise<any[]>;
  getDocumentSimilarity: (knowledgeBaseId: string, doc1Id: string, doc2Id: string) => Promise<number>;
  refreshDocuments: (knowledgeBaseId: string) => Promise<void>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async (knowledgeBaseId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentApi.getAll(knowledgeBaseId);
      setDocuments(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const addDocument = async (knowledgeBaseId: string, data: Partial<Document>) => {
    try {
      setLoading(true);
      setError(null);
      const newDocument = await documentApi.create(knowledgeBaseId, data);
      setDocuments((prev) => [...prev, newDocument]);
      return newDocument;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create document');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDocument = async (knowledgeBaseId: string, documentId: string, data: Partial<Document>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedDocument = await documentApi.update(knowledgeBaseId, documentId, data);
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === documentId ? updatedDocument : doc))
      );
      return updatedDocument;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update document');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (knowledgeBaseId: string, documentId: string) => {
    try {
      setLoading(true);
      setError(null);
      await documentApi.delete(knowledgeBaseId, documentId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete document');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDocument = async (knowledgeBaseId: string, documentId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await documentApi.getById(knowledgeBaseId, documentId);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get document');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const findSimilarDocuments = async (knowledgeBaseId: string, documentId: string, n_results: number = 5) => {
    try {
      setLoading(true);
      setError(null);
      return await documentApi.findSimilar(knowledgeBaseId, documentId, n_results);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to find similar documents');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDocumentSimilarity = async (knowledgeBaseId: string, doc1Id: string, doc2Id: string) => {
    try {
      setLoading(true);
      setError(null);
      return await documentApi.getSimilarity(knowledgeBaseId, doc1Id, doc2Id);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get document similarity');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshDocuments = async (knowledgeBaseId: string) => {
    await fetchDocuments(knowledgeBaseId);
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        loading,
        error,
        addDocument,
        updateDocument,
        deleteDocument,
        getDocument,
        findSimilarDocuments,
        getDocumentSimilarity,
        refreshDocuments,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};