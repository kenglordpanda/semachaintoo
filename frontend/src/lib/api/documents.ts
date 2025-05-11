import { get, post, put, del } from './api-client';

export interface Document {
  id: number;  // Changed to consistent number type
  title: string;
  content: string;
  knowledge_base_id: number;
  created_at: string;
  updated_at: string;
  tags: string[];  // Always an array, even if empty
}

export interface DocumentCreate {
  title: string;
  content: string;
  knowledge_base_id: number;
  tags?: string[];
}

export interface DocumentUpdate {
  title?: string;
  content?: string;
  knowledge_base_id?: number;
  tags?: string[];
}

/**
 * Get all documents
 */
export function getDocuments(params?: { skip?: number; limit?: number }) {
  return get<Document[]>('/documents/', params);
}

/**
 * Get a document by ID
 */
export function getDocument(id: number) {
  return get<Document>(`/documents/${id}`);
}

/**
 * Create a new document
 */
export function createDocument(data: DocumentCreate) {
  return post<Document>('/documents/', data);
}

/**
 * Update a document
 */
export function updateDocument(id: number, data: DocumentUpdate) {
  return put<Document>(`/documents/${id}`, data);
}

/**
 * Delete a document
 */
export function deleteDocument(id: number) {
  return del(`/documents/${id}`);
}

/**
 * Find similar documents based on content
 * This endpoint is used for real-time suggestions while typing
 */
export interface SimilarDocumentResult {
  document_id: number;
  title: string;
  content: string;
  distance: number;
  scores?: Record<string, number>;
}

export function findSimilarDocumentsByContent(content: string, nResults: number = 5) {
  return post<SimilarDocumentResult[]>('/documents/similar', { content, n_results: nResults });
}

/**
 * Get suggestions for document content
 * This is a new endpoint that will be used by the WYSIWYG editor
 */
export function getDocumentSuggestions(documentId: number, content: string) {
  return post<{ suggestions: string[] }>(`/documents/${documentId}/suggestions`, { content });
}