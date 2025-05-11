import { getDocument } from '@/lib/api/documents';
import DocumentForm from '@/components/DocumentForm';
import { Metadata } from 'next';

export async function generateMetadata({ 
  params 
}: { 
  params: { id: string } 
}): Promise<Metadata> {
  const documentId = parseInt(params.id);
  const document = await getDocument(documentId);
  
  return {
    title: `Edit Document - ${document.title}`,
    description: `Edit document ${document.title}`,
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const documentId = parseInt(params.id);
  const document = await getDocument(documentId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Document</h1>
        <p className="text-gray-600 mt-1">
          Editing "{document.title}"
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <DocumentForm 
          knowledgeBaseId={document.knowledge_base_id} 
          initialData={{
            id: document.id,
            title: document.title,
            content: document.content,
            tags: document.tags,
          }}
        />
      </div>
    </div>
  );
}