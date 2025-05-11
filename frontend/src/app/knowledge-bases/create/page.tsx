import KnowledgeBaseForm from '@/components/KnowledgeBaseForm';

export default function CreateKnowledgeBasePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Knowledge Base</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <KnowledgeBaseForm />
      </div>
    </div>
  );
}