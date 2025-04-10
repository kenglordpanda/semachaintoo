'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TipTapEditor from '@/app/components/TipTapEditor';
import DocumentMetadata from '@/app/components/DocumentMetadata';
import { useDocuments } from '@/app/context/DocumentContext';

interface DocumentSuggestion {
  id: string;
  title: string;
  relevanceScore: number;
  excerpt: string;
}

export default function NewDocumentPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const router = useRouter();
  const { addDocument } = useDocuments();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('<p>Start writing your document here...</p>');
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState('Documentation');
  const [template, setTemplate] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a document title');
      return;
    }

    setIsSaving(true);
    
    try {
      const newDocument = addDocument({
        title,
        content,
        tags,
        category,
        template,
        knowledgeBaseId: params.id,
      });
      
      // Redirect to the new document
      router.push(`/knowledge-base/${params.id}/document/${newDocument.id}`);
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Failed to save document. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLinkSuggestion = async (text: string): Promise<DocumentSuggestion[]> => {
    // This would typically be an API call to get relevant document suggestions
    return [
      {
        id: '2',
        title: 'Installation Guide',
        relevanceScore: 0.85,
        excerpt: 'Step-by-step guide for installing the project dependencies...',
      },
      {
        id: '3',
        title: 'Configuration Options',
        relevanceScore: 0.75,
        excerpt: 'Detailed explanation of available configuration options...',
      },
    ];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-8">
        <Link 
          href={`/knowledge-base/${params.id}`}
          className="text-blue-600 hover:text-blue-700"
        >
          ← Back to Documents
        </Link>
      </nav>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Create New Document</h1>
        
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-1">
            Document Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Enter document title"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Content
          </label>
          <TipTapEditor
            content={content}
            onChange={setContent}
            onLinkSuggestion={handleLinkSuggestion}
            knowledgeBaseId={params.id}
          />
        </div>

        <DocumentMetadata
          tags={tags}
          category={category}
          template={template}
          onTagsChange={setTags}
          onCategoryChange={setCategory}
          onTemplateChange={setTemplate}
        />

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Create Document'}
          </button>
        </div>
      </div>
    </div>
  );
} 