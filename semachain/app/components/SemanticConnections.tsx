'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDocuments } from '@/app/context/DocumentContext';

interface SemanticConnectionsProps {
  documentId: string;
  knowledgeBaseId: string;
}

export default function SemanticConnections({ documentId, knowledgeBaseId }: SemanticConnectionsProps) {
  const [relatedDocuments, setRelatedDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { documents } = useDocuments();

  useEffect(() => {
    // Simulate fetching related documents based on semantic analysis
    // In a real implementation, this would call an API endpoint
    const fetchRelatedDocuments = () => {
      setLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        // For demo purposes, just get random documents from the same knowledge base
        // In a real implementation, this would use semantic similarity
        const currentDoc = documents.find(doc => doc.id === documentId);
        if (!currentDoc) {
          setLoading(false);
          return;
        }
        
        const otherDocs = documents.filter(doc => 
          doc.id !== documentId && 
          doc.knowledgeBaseId === knowledgeBaseId
        );
        
        // Simulate semantic relevance by checking for shared tags
        const related = otherDocs.filter(doc => {
          const sharedTags = doc.tags.filter((tag: string) => 
            currentDoc.tags.includes(tag)
          );
          return sharedTags.length > 0;
        });
        
        setRelatedDocuments(related.slice(0, 5)); // Limit to 5 related documents
        setLoading(false);
      }, 500);
    };
    
    fetchRelatedDocuments();
  }, [documentId, knowledgeBaseId, documents]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Semantic Connections</h3>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : relatedDocuments.length > 0 ? (
        <ul className="space-y-3">
          {relatedDocuments.map(doc => (
            <li key={doc.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
              <Link 
                href={`/knowledge-base/${knowledgeBaseId}/document/${doc.id}`}
                className="block hover:bg-gray-50 p-2 rounded-md transition-colors"
              >
                <div className="font-medium text-gray-900">{doc.title}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {doc.content ? doc.content.substring(0, 80) + '...' : 'No content'}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {doc.tags.slice(0, 3).map((tag: string) => (
                    <span 
                      key={tag} 
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {doc.tags.length > 3 && (
                    <span className="text-xs text-gray-500">+{doc.tags.length - 3} more</span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No semantic connections found for this document.
        </div>
      )}
    </div>
  );
} 