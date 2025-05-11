'use client';

import { useEffect, useState } from 'react';
import { getKnowledgeBase, KnowledgeBase } from '@/lib/api/knowledge-bases';
import DocumentForm from '@/components/DocumentForm';
import Link from 'next/link';

export default function CreateDocumentPage({ params }: { params: { id: string } }) {
  const knowledgeBaseId = parseInt(params.id);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKnowledgeBase = async () => {
      try {
        setIsLoading(true);
        const data = await getKnowledgeBase(knowledgeBaseId);
        setKnowledgeBase(data);
      } catch (err) {
        console.error('Error fetching knowledge base:', err);
        setError('Failed to load knowledge base. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchKnowledgeBase();
  }, [knowledgeBaseId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-700">Loading knowledge base...</p>
        </div>
      </div>
    );
  }

  if (error || !knowledgeBase) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <p className="text-red-700">{error || 'Knowledge base not found'}</p>
          <Link href="/knowledge-bases" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Back to Knowledge Bases
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Document</h1>
        <p className="text-gray-600 mt-1">
          Creating a new document in the "{knowledgeBase.title}" knowledge base
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <DocumentForm knowledgeBaseId={knowledgeBaseId} />
      </div>
    </div>
  );
}