import { get, post, put, del } from './api-client';
import { Document } from './documents';

export interface KnowledgeBase {
  id: number;
  title: string;
  description: string | null;
  owner_id: number;
  organization_id: number;
  created_at: string;
  updated_at: string;
  owner: {
    id: number;
    email: string;
    full_name: string;
  };
  organization: {
    id: number;
    name: string;
  };
  documents: Document[];
}

export interface KnowledgeBaseCreate {
  title: string;
  description?: string;
}

export interface KnowledgeBaseUpdate {
  title?: string;
  description?: string;
}

/**
 * Get all knowledge bases
 */
export function getKnowledgeBases(params?: { skip?: number; limit?: number }) {
  return get<KnowledgeBase[]>('/knowledge-bases/', params);
}

/**
 * Get a knowledge base by ID
 */
export function getKnowledgeBase(id: number) {
  return get<KnowledgeBase>(`/knowledge-bases/${id}`);
}

/**
 * Create a new knowledge base
 */
export function createKnowledgeBase(data: KnowledgeBaseCreate) {
  return post<KnowledgeBase>('/knowledge-bases/', data);
}

/**
 * Update a knowledge base
 */
export function updateKnowledgeBase(id: number, data: KnowledgeBaseUpdate) {
  return put<KnowledgeBase>(`/knowledge-bases/${id}`, data);
}

/**
 * Delete a knowledge base
 */
export function deleteKnowledgeBase(id: number) {
  return del(`/knowledge-bases/${id}`);
}