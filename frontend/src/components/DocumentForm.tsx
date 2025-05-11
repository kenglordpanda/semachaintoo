"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import WysiwygEditor from './WysiwygEditor';
import { createDocument, updateDocument, DocumentCreate, DocumentUpdate } from '@/lib/api/documents';

interface DocumentFormProps {
  knowledgeBaseId: number;
  initialData?: {
    id: number;
    title: string;
    content: string;
    tags: string[];
  };
}

export default function DocumentForm({ knowledgeBaseId, initialData }: DocumentFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<DocumentCreate | DocumentUpdate>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    knowledge_base_id: knowledgeBaseId,
    tags: initialData?.tags || [],
  });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagsError, setTagsError] = useState<string | null>(null);
  // State for linked documents
  const [linkedDocuments, setLinkedDocuments] = useState<{id: number, title: string}[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
      setTagsError(null);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = (formData.tags || []).filter(tag => tag !== tagToRemove);
    setFormData((prev) => ({
      ...prev,
      tags: updatedTags,
    }));
    
    // Show error if removing the tag would result in no tags
    if (updatedTags.length === 0) {
      setTagsError('At least one tag is required');
    }
  };

  const validateForm = () => {
    let isValid = true;
    
    // Validate that at least one tag is provided
    if (!formData.tags || formData.tags.length === 0) {
      setTagsError('At least one tag is required');
      isValid = false;
    } else {
      setTagsError(null);
    }
    
    return isValid;
  };

  // Handle when a user clicks on a suggested similar document
  const handleSimilarDocumentClick = (documentId: number) => {
    // Get the document title from the clicked link
    const documentTitle = document.querySelector(`[data-document-id="${documentId}"]`)?.textContent || `Document #${documentId}`;
    
    // Add to linked documents if not already there
    setLinkedDocuments(prev => {
      const exists = prev.some(doc => doc.id === documentId);
      if (!exists) {
        return [...prev, {id: documentId, title: documentTitle}];
      }
      return prev;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the form before submission
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Make sure tags is an array before submitting
      const dataToSubmit = {
        ...formData,
        tags: formData.tags || [],
      };

      // The linked documents could be stored in metadata or as part of the content
      // For simplicity, we're embedding them directly in the HTML content
      // A more robust solution would store these relationships in a separate table

      if (initialData) {
        // Update existing document
        await updateDocument(initialData.id, dataToSubmit);
      } else {
        // Create new document
        await createDocument(dataToSubmit as DocumentCreate);
      }
      
      // Force a refresh before navigating back to ensure the KB page gets fresh data
      router.refresh();
      router.push(`/knowledge-bases/${knowledgeBaseId}`);
    } catch (err) {
      console.error('Error saving document:', err);
      setError(err instanceof Error ? err.message : 'Failed to save document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-[var(--foreground)] mb-1">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-[var(--input)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--ring)] focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
          placeholder="Document Title"
        />
      </div>
      
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-[var(--foreground)] mb-1">
          Tags *
        </label>
        <div className="mb-2 flex flex-wrap gap-2">
          {formData.tags && formData.tags.length > 0 ? (
            formData.tags.map((tag) => (
              <span 
                key={tag} 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)]"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1.5 inline-flex items-center justify-center text-[var(--primary)] hover:text-[var(--primary-dark)]"
                >
                  <span className="sr-only">Remove tag</span>
                  &times;
                </button>
              </span>
            ))
          ) : (
            <span className="text-sm text-[var(--muted-foreground)]">No tags added yet</span>
          )}
        </div>
        <div className="flex">
          <input
            type="text"
            id="tagInput"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            className={`flex-grow px-3 py-2 border rounded-l-md shadow-sm focus:outline-none focus:ring-[var(--ring)] focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)] ${
              tagsError ? 'border-red-500' : 'border-[var(--input)]'
            }`}
            placeholder="Add a tag (required)"
          />
          <button
            type="button"
            onClick={addTag}
            className="btn btn-secondary rounded-l-none"
          >
            Add
          </button>
        </div>
        {tagsError && (
          <p className="mt-1 text-sm text-red-600">{tagsError}</p>
        )}
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          At least one tag is required for the document
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
          Content *
        </label>
        <WysiwygEditor 
          initialContent={formData.content as string} 
          documentId={initialData?.id}
          onChange={handleContentChange}
          onSimilarDocumentClick={handleSimilarDocumentClick}
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Start typing to see similar document suggestions. Type at least 20 characters to activate suggestions.
        </p>
      </div>
      
      {linkedDocuments.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Linked Documents:</h3>
          <ul className="list-disc pl-5">
            {linkedDocuments.map(doc => (
              <li key={doc.id} className="text-sm text-blue-700">
                {doc.title}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-outline"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary disabled:opacity-70"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Document' : 'Create Document'}
        </button>
      </div>
    </form>
  );
}