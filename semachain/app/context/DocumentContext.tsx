'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Document {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  template: string | null;
  knowledgeBaseId: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentContextType {
  documents: Document[];
  addDocument: (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => Document;
  updateDocument: (id: string, document: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  getDocument: (id: string) => Document | undefined;
  getDocumentsByKnowledgeBase: (knowledgeBaseId: string) => Document[];
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);

  const addDocument = (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newDocument: Document = {
      ...document,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    setDocuments(prev => [...prev, newDocument]);
    return newDocument;
  };

  const updateDocument = (id: string, document: Partial<Document>) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id 
        ? { ...doc, ...document, updatedAt: new Date().toISOString() }
        : doc
    ));
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const getDocument = (id: string) => {
    return documents.find(doc => doc.id === id);
  };

  const getDocumentsByKnowledgeBase = (knowledgeBaseId: string) => {
    return documents.filter(doc => doc.knowledgeBaseId === knowledgeBaseId);
  };

  return (
    <DocumentContext.Provider value={{
      documents,
      addDocument,
      updateDocument,
      deleteDocument,
      getDocument,
      getDocumentsByKnowledgeBase,
    }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
}