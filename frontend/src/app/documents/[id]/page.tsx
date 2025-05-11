'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDocument, Document } from '@/lib/api/documents';
import DocumentViewer from './viewer';
import DocumentActions from './actions';

export default function DocumentPage({ params }: { params: { id: string } }) {
  const documentId = parseInt(params.id);
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchDocument() {
      try {
        setIsLoading(true);
        const documentData = await getDocument(documentId);
        setDocument(documentData);
        setError(null);
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Failed to load document. Please ensure you are logged in and have access to this resource.');
        
        // If we get a 401 error, redirect to login
        if (err instanceof Error && err.message.includes('Not authenticated')) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchDocument();
  }, [documentId, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <p className="text-red-700">{error || 'Document not found'}</p>
          <Link href="/knowledge-bases" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded">
            Back to Knowledge Bases
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center text-sm mb-2">
          <Link href="/knowledge-bases" className="text-primary hover:underline">
            Knowledge Bases
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <Link 
            href={`/knowledge-bases/${document.knowledge_base_id}`}
            className="text-primary hover:underline"
          >
            KB-{document.knowledge_base_id}
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-500">Document</span>
        </div>

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
          <DocumentActions documentId={documentId} knowledgeBaseId={document.knowledge_base_id} />
        </div>

        <div className="flex flex-wrap mt-2 mb-4 gap-2">
          {document.tags.map((tag) => (
            <span 
              key={tag} 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <DocumentViewer content={document.content} />
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <div>Last updated: {new Date(document.updated_at).toLocaleString()}</div>
      </div>
    </div>
  );
}