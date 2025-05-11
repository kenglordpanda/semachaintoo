'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { getKnowledgeBase, KnowledgeBase } from '@/lib/api/knowledge-bases';
import { Document } from '@/lib/api/documents';
import DocumentPopup from '@/components/ui/DocumentPopup';
import { useDocumentPopup } from '@/lib/services/use-document-popup';

// Helper function to create a snippet from HTML content
const createSnippet = (htmlString: string | undefined, maxLength: number): string => {
  if (!htmlString) return '';
  // Remove HTML tags
  const text = htmlString.replace(/<[^>]+>/g, '');
  // Truncate and add ellipsis
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
};

export default function KnowledgeBasePage({ params }: { params: { id: string } }) {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageContext, setPageContext] = useState<string>('');

  // Function to extract current page context for document relevance scoring
  const extractPageContext = useCallback(() => {
    // Combine explicit page context with knowledge base metadata
    const baseContext = (knowledgeBase?.title || '') + ' ' + (knowledgeBase?.description || '');
    
    // Include document titles in context to increase matches
    const documentTitles = knowledgeBase?.documents?.map(doc => doc.title).join(' ') || '';
    
    // Include tags from all documents to improve contextual matching
    const allTags = knowledgeBase?.documents?.flatMap(doc => doc.tags || []).join(' ') || '';
    
    // Combine all context sources
    return `${pageContext} ${baseContext} ${documentTitles} ${allTags}`.trim();
  }, [pageContext, knowledgeBase]);

  // Initialize document popup hook
  const {
    isPopupOpen,
    popupDocument,
    popupPosition,
    popupScore,
    closePopup
  } = useDocumentPopup({
    documents: knowledgeBase?.documents || [],
    inactivityThreshold: 3000, // Show popup after 3 seconds of inactivity
    minScore: 0.2, // Reduced minimum score threshold from 0.4 to 0.2
    contextExtractor: extractPageContext,
    debugMode: true // Enable debug mode to see what's happening
  });

  useEffect(() => {
    const fetchKnowledgeBase = async () => {
      try {
        setIsLoading(true);
        const data = await getKnowledgeBase(parseInt(params.id));
        // Ensure documents array is defined and tags are arrays
        const processedData = {
          ...data,
          documents: (data.documents || []).map(doc => ({
            ...doc,
            tags: doc.tags || []
          }))
        };
        setKnowledgeBase(processedData);
        
        // Set initial page context based on knowledge base title and description
        setPageContext(`${data.title} ${data.description || ''}`);
      } catch (err) {
        console.error('Error fetching knowledge base:', err);
        setError('Failed to load knowledge base. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchKnowledgeBase();
  }, [params.id]);

  // Update page context when specific elements are hovered
  const handleElementHover = useCallback((text: string) => {
    setPageContext(prev => prev + ' ' + text);
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 bg-[var(--muted)] rounded-lg">
          <p className="text-[var(--muted-foreground)]">Loading knowledge base...</p>
        </div>
      </div>
    );
  }

  if (error || !knowledgeBase) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <p className="text-red-700">{error || 'Knowledge base not found'}</p>
          <Link href="/knowledge-bases" className="mt-4 inline-block btn btn-secondary">
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
          <Link href="/knowledge-bases" className="text-[var(--link-text)] hover:underline">
            Knowledge Bases
          </Link>
          <span className="mx-2 text-[var(--muted-foreground)]">/</span>
          <span className="text-[var(--muted-foreground)]">{knowledgeBase.title}</span>
        </div>

        <div className="flex justify-between items-center">
          <h1 
            className="text-2xl font-bold text-[var(--foreground)]"
            onMouseEnter={() => handleElementHover(knowledgeBase.title)}
          >
            {knowledgeBase.title}
          </h1>
          <Link 
            href={`/knowledge-bases/${knowledgeBase.id}/documents/create`} 
            className="btn btn-primary"
          >
            Create Document
          </Link>
        </div>
        {knowledgeBase.description && (
          <p 
            className="text-[var(--muted-foreground)] mt-2"
            onMouseEnter={() => handleElementHover(knowledgeBase.description || '')}
          >
            {knowledgeBase.description}
          </p>
        )}
      </div>

      <div className="card">
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-medium text-[var(--foreground)]">Documents</h2>
        </div>

        {knowledgeBase.documents.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">No documents found</h3>
            <p className="text-[var(--muted-foreground)] mb-4">Get started by creating your first document.</p>
            <Link 
              href={`/knowledge-bases/${knowledgeBase.id}/documents/create`} 
              className="btn btn-primary"
            >
              Create Document
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {knowledgeBase.documents.map((document: Document) => (
              <Link 
                key={document.id} 
                href={`/documents/${document.id}`}
                className="block px-6 py-4 hover:bg-[var(--muted)] transition-colors"
                onMouseEnter={() => handleElementHover(document.title + ' ' + createSnippet(document.content, 50))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-grow mr-4">
                    <h3 className="text-md font-medium text-[var(--foreground)]">{document.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                      {createSnippet(document.content, 150)}
                    </p>
                    <div className="flex items-center mt-1">
                      <div className="text-sm text-[var(--muted-foreground)]">
                        Last updated: {new Date(document.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end">
                    {document.tags.map((tag: string) => (
                      <span 
                        key={`${document.id}-${tag}`} 
                        className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--btn-corp-secondary-bg)] text-[var(--btn-corp-secondary-text)]"
                        onMouseEnter={() => handleElementHover(tag)}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Document popup that appears when user is inactive */}
      {isPopupOpen && popupDocument && (
        <DocumentPopup
          document={popupDocument}
          onClose={closePopup}
          position={popupPosition}
          score={popupScore}
        />
      )}
    </div>
  );
}