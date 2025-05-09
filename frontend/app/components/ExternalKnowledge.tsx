'use client';

import { useState, useEffect } from 'react';

interface ExternalKnowledgeProps {
  documentId: string;
  content: string;
}

export default function ExternalKnowledge({ documentId, content }: ExternalKnowledgeProps) {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<any | null>(null);

  useEffect(() => {
    // Simulate fetching external knowledge sources
    // In a real implementation, this would call an API endpoint
    const fetchExternalSources = () => {
      setLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        // Mock data for demonstration
        const mockSources = [
          {
            id: '1',
            title: 'Wikipedia: Knowledge Management',
            url: 'https://en.wikipedia.org/wiki/Knowledge_management',
            snippet: 'Knowledge management (KM) is the collection of methods relating to creating, sharing, using and managing the knowledge and information of an organization.',
            relevance: 0.92,
            type: 'wikipedia'
          },
          {
            id: '2',
            title: 'Google Scholar: Semantic Analysis in Knowledge Bases',
            url: 'https://scholar.google.com/scholar?q=semantic+analysis+knowledge+bases',
            snippet: 'Recent research on semantic analysis techniques for improving knowledge base connectivity and information retrieval.',
            relevance: 0.85,
            type: 'scholar'
          },
          {
            id: '3',
            title: 'Internal Document: Knowledge Base Guidelines',
            url: '/knowledge-base/1743956662073/document/123',
            snippet: 'Our internal guidelines for creating and maintaining knowledge bases within the organization.',
            relevance: 0.78,
            type: 'internal'
          }
        ];
        
        setSources(mockSources);
        setLoading(false);
      }, 800);
    };
    
    fetchExternalSources();
  }, [documentId, content]);

  const handleSourceClick = (source: any) => {
    setSelectedSource(source);
  };

  const handleCloseSource = () => {
    setSelectedSource(null);
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'wikipedia':
        return (
          <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm-1 4v10h2V6h-2zm0 12v2h2v-2h-2z"/>
          </svg>
        );
      case 'scholar':
        return (
          <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3L1 9l11 6 11-6-11-6zM1 15l11 6 11-6M1 21l11 6 11-6"/>
          </svg>
        );
      case 'internal':
        return (
          <svg className="h-5 w-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">External Knowledge Sources</h3>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : sources.length > 0 ? (
        <div className="space-y-4">
          {sources.map(source => (
            <div 
              key={source.id} 
              className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleSourceClick(source)}
            >
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  {getSourceIcon(source.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{source.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{source.snippet}</p>
                  <div className="flex items-center mt-2">
                    <div className="text-xs text-gray-500 mr-2">Relevance: {Math.round(source.relevance * 100)}%</div>
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Source
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No external knowledge sources found for this document.
        </div>
      )}

      {/* Source Detail Modal */}
      {selectedSource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{selectedSource.title}</h3>
              <button 
                onClick={handleCloseSource}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-700">{selectedSource.snippet}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Source: {selectedSource.type.charAt(0).toUpperCase() + selectedSource.type.slice(1)}
              </div>
              <div className="flex space-x-2">
                <button 
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={handleCloseSource}
                >
                  Close
                </button>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    // In a real implementation, this would integrate the source into the document
                    alert('This would integrate the external knowledge into the document.');
                    handleCloseSource();
                  }}
                >
                  Integrate into Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 