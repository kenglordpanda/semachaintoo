'use client';

import { useState } from 'react';
import { Tag, Plus, X } from 'lucide-react';

interface DocumentMetadataProps {
  tags: string[];
  category: string;
  template: string | null;
  onTagsChange: (tags: string[]) => void;
  onCategoryChange: (category: string) => void;
  onTemplateChange: (template: string | null) => void;
}

const AVAILABLE_CATEGORIES = [
  'Documentation',
  'Research',
  'Notes',
  'Guides',
  'Tutorials',
  'Reference',
  'Other',
];

const AVAILABLE_TEMPLATES = [
  { id: 'blank', name: 'Blank Document' },
  { id: 'tutorial', name: 'Tutorial Template' },
  { id: 'api-doc', name: 'API Documentation' },
  { id: 'research', name: 'Research Paper' },
];

export default function DocumentMetadata({
  tags,
  category,
  template,
  onTagsChange,
  onCategoryChange,
  onTemplateChange,
}: DocumentMetadataProps) {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      onTagsChange([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Document Metadata</h3>
        
        {/* Category Selection */}
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-900 mb-1">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {AVAILABLE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Template Selection */}
        <div className="mb-4">
          <label htmlFor="template" className="block text-sm font-medium text-gray-900 mb-1">
            Template
          </label>
          <select
            id="template"
            value={template || ''}
            onChange={(e) => onTemplateChange(e.target.value || null)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">No Template</option>
            {AVAILABLE_TEMPLATES.map((tmpl) => (
              <option key={tmpl.id} value={tmpl.id}>
                {tmpl.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-900 mb-1">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-blue-100 text-blue-700"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              id="tags"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a tag"
              className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleAddTag}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 