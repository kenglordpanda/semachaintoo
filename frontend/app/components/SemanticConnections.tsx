'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDocuments } from '../context/DocumentContext';

interface SemanticConnectionsProps {
  documentId: string;
  knowledgeBaseId: string;
}

export default function SemanticConnections({ documentId, knowledgeBaseId }: SemanticConnectionsProps) {
  const [relatedDocuments, setRelatedDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { findSimilarDocuments } = useDocuments();

  useEffect(() => {
    const fetchRelatedDocuments = async () => {
      try {
        setLoading(true);
        const documents = await findSimilarDocuments(knowledgeBaseId, documentId);
        setRelatedDocuments(documents);
      } catch (error) {
        console.error('Error fetching related documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedDocuments();
  }, [documentId, knowledgeBaseId, findSimilarDocuments]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (relatedDocuments.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No semantic connections found for this document.
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Semantic Connections</h3>
      <div className="space-y-4">
        {relatedDocuments.map((doc) => (
          <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <Link href={`/knowledge-base/${knowledgeBaseId}/document/${doc.id}`}>
              <div className="cursor-pointer">
                <h4 className="font-medium text-blue-600 hover:text-blue-800">
                  {doc.metadata.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {doc.content.substring(0, 150)}...
                </p>
                <div className="mt-2 flex items-center">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Similarity: {(doc.similarity * 100).toFixed(1)}%
                  </span>
                  {doc.rerank_score && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded ml-2">
                      Relevance: {(doc.rerank_score * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
} 