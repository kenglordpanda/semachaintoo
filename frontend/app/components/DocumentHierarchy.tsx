'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CreateDocument from './CreateDocument';

interface DocumentNode {
  id: string;
  title: string;
  type: 'document' | 'folder';
  children?: DocumentNode[];
}

interface DocumentHierarchyProps {
  nodes: DocumentNode[];
  selectedNodeId?: string;
  onNodeSelect?: (nodeId: string) => void;
  onCreateNode: (parentId: string | null, type: 'folder' | 'document', title?: string) => void;
}

export default function DocumentHierarchy({
  nodes,
  selectedNodeId,
  onNodeSelect,
  onCreateNode,
}: DocumentHierarchyProps) {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'document' | 'folder'>('document');
  const [parentId, setParentId] = useState<string | null>(null);

  const handleCreateClick = (type: 'document' | 'folder', parentId: string | null) => {
    setCreateType(type);
    setParentId(parentId);
    setShowCreateModal(true);
  };

  const handleCreate = (title: string) => {
    onCreateNode(parentId, createType, title);
    setShowCreateModal(false);
  };

  const renderNode = (node: DocumentNode, level: number = 0) => {
    const isSelected = node.id === selectedNodeId;
    const paddingLeft = `${level * 1.5}rem`;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center py-1 px-2 rounded-md hover:bg-gray-100 cursor-pointer ${
            isSelected ? 'bg-blue-50 text-blue-600' : ''
          }`}
          style={{ paddingLeft }}
        >
          <span className="mr-2">
            {node.type === 'folder' ? '📁' : '📄'}
          </span>
          {node.type === 'document' ? (
            <Link
              href={`#${node.id}`}
              onClick={(e) => {
                e.preventDefault();
                onNodeSelect?.(node.id);
              }}
              className="flex-1 truncate"
            >
              {node.title}
            </Link>
          ) : (
            <span className="flex-1 truncate">{node.title}</span>
          )}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleCreateClick('document', node.id)}
              className="p-1 hover:bg-gray-200 rounded"
              title="Add document"
            >
              +
            </button>
            <button
              onClick={() => handleCreateClick('folder', node.id)}
              className="p-1 hover:bg-gray-200 rounded"
              title="Add folder"
            >
              📁
            </button>
          </div>
        </div>
        {node.children?.map((child) => renderNode(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-900">Documents</h3>
        <div className="flex space-x-1">
          <button
            onClick={() => handleCreateClick('document', null)}
            className="p-1 hover:bg-gray-200 rounded"
            title="Add document"
          >
            +
          </button>
          <button
            onClick={() => handleCreateClick('folder', null)}
            className="p-1 hover:bg-gray-200 rounded"
            title="Add folder"
          >
            📁
          </button>
        </div>
      </div>
      <div className="space-y-1">
        {nodes.map((node) => renderNode(node))}
      </div>
      <CreateDocument
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
        type={createType}
      />
    </div>
  );
} 