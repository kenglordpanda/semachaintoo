"use client";

import { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteDocument } from '@/lib/api/documents';

interface DocumentActionsProps {
  documentId: number;
  knowledgeBaseId: number;
}

export default function DocumentActions({ documentId, knowledgeBaseId }: DocumentActionsProps) {
  const router = useRouter();
  
  const handleDelete = useCallback(async () => {
    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      try {
        await deleteDocument(documentId);
        router.push(`/knowledge-bases/${knowledgeBaseId}`);
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Failed to delete document. Please try again.');
      }
    }
  }, [documentId, knowledgeBaseId, router]);

  return (
    <div className="flex space-x-4">
      <Link
        href={`/documents/${documentId}/edit`}
        className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200 text-sm font-medium transition-colors"
      >
        Edit
      </Link>
      <button
        onClick={handleDelete}
        className="px-3 py-1 bg-red-100 border border-red-300 rounded-md text-red-700 hover:bg-red-200 text-sm font-medium transition-colors"
      >
        Delete
      </button>
    </div>
  );
}