'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { getKnowledgeBases, KnowledgeBase } from '@/lib/api/knowledge-bases';
import { useAuth } from '@/lib/auth/auth-context';

export default function KnowledgeBasesPage() {
  const { isAuthenticated, user } = useAuth();
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchKnowledgeBases = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching knowledge bases... Auth status:", isAuthenticated);
      
      // Force the API call regardless of auth state for debugging
      const data = await getKnowledgeBases();
      console.log("API response:", data);
      
      // Ensure data is always an array
      const safeData = Array.isArray(data) ? data : [];
      console.log(`Retrieved ${safeData.length} knowledge bases`);
      
      setKnowledgeBases(safeData);
    } catch (err) {
      console.error('Error fetching knowledge bases:', err);
      setError('Failed to load knowledge bases. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Retry function for when there are errors
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Always fetch when component mounts
  useEffect(() => {
    console.log("Knowledge base page mounted. Auth status:", isAuthenticated);
    // Try to fetch knowledge bases regardless of auth state for debugging
    fetchKnowledgeBases();
  }, [retryCount, fetchKnowledgeBases]);

  const renderKnowledgeBaseCard = (kb: KnowledgeBase) => {
    // Safely get document count - guard against undefined properties
    const documentCount = kb.documents && Array.isArray(kb.documents) 
      ? kb.documents.length 
      : 0;
    
    // Safely format date with fallback
    const updatedDate = kb.updated_at 
      ? new Date(kb.updated_at).toLocaleDateString()
      : 'Unknown date';

    return (
      <Link 
        key={kb.id} 
        href={`/knowledge-bases/${kb.id}`}
        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{kb.title || 'Untitled'}</h2>
        {kb.description && (
          <p className="text-gray-600 mb-4 line-clamp-2">{kb.description}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {documentCount} document{documentCount !== 1 ? 's' : ''}
          </div>
          <div className="text-sm text-gray-500">
            {updatedDate}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Knowledge Bases</h1>
        <Link 
          href="/knowledge-bases/create" 
          className="btn btn-primary"
        >
          Create Knowledge Base
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12 bg-[var(--muted)] rounded-lg">
          <p className="text-[var(--muted-foreground)]">Loading knowledge bases...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={handleRetry}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      ) : knowledgeBases.length === 0 ? (
        <div className="text-center py-12 bg-[var(--muted)] rounded-lg">
          <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">No knowledge bases found</h3>
          <p className="text-[var(--muted-foreground)] mb-4">Get started by creating your first knowledge base.</p>
          <Link 
            href="/knowledge-bases/create" 
            className="btn btn-primary"
          >
            Create Knowledge Base
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {knowledgeBases.map(kb => renderKnowledgeBaseCard(kb))}
        </div>
      )}
    </div>
  );
}