interface KnowledgeBaseCardProps {
  title: string;
  description: string;
  documentCount: number;
  onView: () => void;
}

export default function KnowledgeBaseCard({
  title,
  description,
  documentCount,
  onView,
}: KnowledgeBaseCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">{documentCount} documents</span>
        <button 
          onClick={onView}
          className="text-blue-600 hover:text-blue-700"
        >
          View →
        </button>
      </div>
    </div>
  );
} 