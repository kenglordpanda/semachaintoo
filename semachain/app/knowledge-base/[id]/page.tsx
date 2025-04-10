'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDocuments } from '@/app/context/DocumentContext';
import CreateDocument from '@/app/components/CreateDocument';

// Helper function to strip HTML and get plain text
function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export default function KnowledgeBasePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getDocumentsByKnowledgeBase } = useDocuments();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Get documents for this knowledge base
  const documents = getDocumentsByKnowledgeBase(params.id);

  const handleCreateDocument = () => {
    // Navigate to the new document page
    window.location.href = `/knowledge-base/${params.id}/new`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
        <button
          onClick={handleCreateDocument}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Document
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => router.push(`/knowledge-base/${params.id}/document/${doc.id}`)}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{doc.title}</h2>
            <div className="text-gray-600 text-sm mb-4">
              {stripHtml(doc.content).substring(0, 150)}...
            </div>
            <div className="flex flex-wrap gap-2">
              {doc.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Last updated: {new Date(doc.updatedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {documents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No documents yet. Create your first document to get started!</p>
          <button
            onClick={handleCreateDocument}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Document
          </button>
        </div>
      )}

      <CreateDocument
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={(title) => {
          router.push(`/knowledge-base/${params.id}/document/new?title=${encodeURIComponent(title)}`);
        }}
        type="document"
      />
    </div>
  );
} 