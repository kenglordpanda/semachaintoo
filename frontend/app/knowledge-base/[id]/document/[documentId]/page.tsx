'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TipTapEditor from '@/app/components/TipTapEditor';
import DocumentMetadata from '@/app/components/DocumentMetadata';
import DocumentHierarchy from '@/app/components/DocumentHierarchy';
import Collaborators from '@/app/components/Collaborators';
import { useCollaboration } from '@/app/services/collaboration';
import { useDocuments } from '@/app/context/DocumentContext';
import SemanticConnections from '@/app/components/SemanticConnections';
import ExternalKnowledge from '@/app/components/ExternalKnowledge';

interface Document {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  template: string | null;
}

interface DocumentSuggestion {
  id: string;
  title: string;
  relevanceScore: number;
  excerpt: string;
}

interface DocumentNode {
  id: string;
  title: string;
  type: 'document' | 'folder';
  children?: DocumentNode[];
}

// Example documents data
const EXAMPLE_DOCUMENTS: Record<string, Document> = {
  '2': {
    id: '2',
    title: 'Getting Started',
    content: '<p>This is the getting started guide...</p>',
    tags: ['guide', 'tutorial'],
    category: 'Documentation',
    template: null,
  },
  '4': {
    id: '4',
    title: 'Authentication',
    content: '<p>Learn about authentication methods...</p>',
    tags: ['security', 'api'],
    category: 'Documentation',
    template: 'api-doc',
  },
  '5': {
    id: '5',
    title: 'Endpoints',
    content: '<p>API endpoint documentation...</p>',
    tags: ['api', 'reference'],
    category: 'Reference',
    template: 'api-doc',
  },
  '7': {
    id: '7',
    title: 'Installation',
    content: '<p>Installation instructions...</p>',
    tags: ['guide', 'setup'],
    category: 'Guides',
    template: 'tutorial',
  },
};

// Example document structure
const EXAMPLE_HIERARCHY: DocumentNode[] = [
  {
    id: '1',
    title: 'Project Documentation',
    type: 'folder',
    children: [
      {
        id: '2',
        title: 'Getting Started',
        type: 'document',
      },
      {
        id: '3',
        title: 'API Reference',
        type: 'folder',
        children: [
          {
            id: '4',
            title: 'Authentication',
            type: 'document',
          },
          {
            id: '5',
            title: 'Endpoints',
            type: 'document',
          },
        ],
      },
    ],
  },
  {
    id: '6',
    title: 'User Guides',
    type: 'folder',
    children: [
      {
        id: '7',
        title: 'Installation',
        type: 'document',
      },
    ],
  },
];

// Fix the props type issue by adjusting the interface
// You likely have something like:
// export default function DocumentPage({ params }: PageProps) {

// Change it to:
export default function DocumentPage({ 
  params 
}: { 
  params: { 
    id: string; 
    documentId: string; 
  } 
}) {
  const router = useRouter();
  const { documents, getDocument, updateDocument, getDocumentsByKnowledgeBase } = useDocuments();
  const [hierarchy, setHierarchy] = useState(EXAMPLE_HIERARCHY);
  const [currentDoc, setCurrentDoc] = useState<Document>({
    id: params.documentId,
    title: 'New Document',
    content: '<p>Start writing your document here...</p>',
    tags: [],
    category: 'Documentation',
    template: null,
  });
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSemanticPanel, setShowSemanticPanel] = useState(true);

  // Initialize collaboration
  const { users, isConnected, sendCursorPosition, sendContentUpdate } = useCollaboration(
    params.documentId,
    'current-user', // In a real app, this would be the actual user ID
    'You' // In a real app, this would be the actual user name
  );

  useEffect(() => {
    const document = getDocument(params.documentId);
    if (document) {
      setCurrentDoc(document);
    } else {
      // If document not found, redirect to knowledge base
      router.push(`/knowledge-base/${params.id}`);
    }
  }, [params.documentId, getDocument, router, params.id]);

  // Auto-save functionality
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(saveTimeout);
  }, [currentDoc]);

  const handleSave = async () => {
    if (!currentDoc.title.trim()) {
      alert('Please enter a document title');
      return;
    }

    setIsAutoSaving(true);
    
    try {
      if (params.documentId === 'new') {
        // Create a new document
        const newDocument = {
          id: Date.now().toString(),
          title: currentDoc.title,
          content: currentDoc.content,
          tags: currentDoc.tags,
          category: currentDoc.category,
          template: currentDoc.template,
          knowledgeBaseId: params.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // In a real implementation, this would be an API call
        // For now, we'll just update the local state
        updateDocument(newDocument);
        
        // Navigate to the new document
        router.push(`/knowledge-base/${params.id}/document/${newDocument.id}`);
      } else {
        // Update existing document
        if (currentDoc) {
          const updatedDocument = {
            ...currentDoc,
            title: currentDoc.title,
            content: currentDoc.content,
            updatedAt: new Date().toISOString(),
          };
          
          // In a real implementation, this would be an API call
          // For now, we'll just update the local state
          updateDocument(updatedDocument);
        }
      }
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Failed to save document. Please try again.');
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleContentChange = (content: string) => {
    setCurrentDoc(prev => ({ ...prev, content }));
    sendContentUpdate(content);
  };

  const handleCursorPosition = (position: { x: number; y: number }) => {
    sendCursorPosition(position);
  };

  const handleLinkSuggestion = async (text: string): Promise<DocumentSuggestion[]> => {
    // Filter existing documents based on text match
    const suggestions = Object.values(documents)
      .filter(doc => 
        doc.id !== currentDoc.id && 
        (doc.title.toLowerCase().includes(text.toLowerCase()) ||
         doc.content.toLowerCase().includes(text.toLowerCase()))
      )
      .map(doc => ({
        id: doc.id,
        title: doc.title,
        relevanceScore: 0.8, // In a real app, this would be calculated
        excerpt: doc.content.replace(/<[^>]*>/g, '').slice(0, 100) + '...',
      }));

    return suggestions;
  };

  const handleCreateNode = (parentId: string | null, type: 'document' | 'folder', title?: string) => {
    const newId = Date.now().toString();
    
    if (type === 'document') {
      // Create new document
      const newDoc: Document = {
        id: newId,
        title: title || 'New Document',
        content: '<p>Start writing your document here...</p>',
        tags: [],
        category: 'Documentation',
        template: null,
      };
      
      setDocuments(prev => ({
        ...prev,
        [newId]: newDoc
      }));

      // Update hierarchy
      const newHierarchy = addNodeToHierarchy(hierarchy, parentId, {
        id: newId,
        title: title || 'New Document',
        type: 'document',
      });
      setHierarchy(newHierarchy);

      // Navigate to new document
      router.push(`/knowledge-base/${params.id}/document/${newId}`);
    } else {
      // Create new folder in hierarchy
      const newHierarchy = addNodeToHierarchy(hierarchy, parentId, {
        id: newId,
        title: title || 'New Folder',
        type: 'folder',
        children: [],
      });
      setHierarchy(newHierarchy);
    }
  };

  const addNodeToHierarchy = (nodes: DocumentNode[], parentId: string | null, newNode: DocumentNode): DocumentNode[] => {
    if (!parentId) {
      return [...nodes, newNode];
    }

    return nodes.map(node => {
      if (node.id === parentId && node.type === 'folder') {
        return {
          ...node,
          children: [...(node.children || []), newNode],
        };
      }
      if (node.children) {
        return {
          ...node,
          children: addNodeToHierarchy(node.children, parentId, newNode),
        };
      }
      return node;
    });
  };

  if (!currentDoc && params.documentId !== 'new') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Document Not Found</h1>
          <button
            onClick={() => router.push(`/knowledge-base/${params.id}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Knowledge Base
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <div className="mb-4">
          <Link 
            href={`/knowledge-base/${params.id}`}
            className="text-blue-600 hover:text-blue-700 flex items-center"
          >
            ← Back to Knowledge Base
          </Link>
        </div>
        <DocumentHierarchy
          nodes={hierarchy}
          selectedNodeId={params.documentId}
          onNodeSelect={(nodeId) => router.push(`/knowledge-base/${params.id}/document/${nodeId}`)}
          onCreateNode={handleCreateNode}
        />
        <Collaborators users={users} />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <input
              type="text"
              value={currentDoc.title}
              onChange={(e) => setCurrentDoc(prev => ({ ...prev, title: e.target.value }))}
              className="text-2xl font-bold w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Document Title"
            />
          </div>
          
          <div className="mb-6">
            <TipTapEditor
              content={currentDoc.content}
              onChange={handleContentChange}
              onCursorPosition={handleCursorPosition}
              onLinkSuggestion={handleLinkSuggestion}
              knowledgeBaseId={params.id}
            />
          </div>

          <DocumentMetadata
            tags={currentDoc.tags}
            category={currentDoc.category}
            template={currentDoc.template}
            onTagsChange={(tags) => setCurrentDoc(prev => ({ ...prev, tags }))}
            onCategoryChange={(category) => setCurrentDoc(prev => ({ ...prev, category }))}
            onTemplateChange={(template) => setCurrentDoc(prev => ({ ...prev, template }))}
          />

          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {lastSaved && `Last saved: ${lastSaved.toLocaleTimeString()}`}
            </div>
            <button
              onClick={handleSave}
              disabled={isAutoSaving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isAutoSaving ? 'Saving...' : 'Save Document'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}