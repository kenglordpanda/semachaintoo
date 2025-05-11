import React, { useState, useEffect, useRef } from 'react';
import { Document } from '@/lib/api/documents';

interface DocumentPopupProps {
  document: Document;
  onClose: () => void;
  position?: { x: number, y: number };
  score?: number;
}

const DocumentPopup: React.FC<DocumentPopupProps> = ({ document, onClose, position, score }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Sanitize and create a snippet from the document content
  const createSnippet = (content: string, maxLength: number = 300): string => {
    if (!content) return '';
    // Remove HTML tags
    const text = content.replace(/<[^>]+>/g, '');
    // Truncate and add ellipsis
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };
  
  // Handle clicks outside the popup to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    // Add animation to make the popup appear smoothly
    const showPopupWithAnimation = () => {
      setTimeout(() => {
        setIsVisible(true);
      }, 50);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    showPopupWithAnimation();
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Calculate default position if not provided
  const defaultPosition = {
    x: window.innerWidth / 2 - 200,
    y: window.innerHeight / 2 - 150
  };
  
  const popupPosition = position || defaultPosition;
  
  // Format the relevance score as a percentage if provided
  const scoreDisplay = score !== undefined ? `${Math.round(score * 100)}%` : null;
  
  return (
    <div 
      ref={popupRef}
      className={`fixed z-50 w-[400px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'}`}
      style={{
        left: `${Math.min(window.innerWidth - 420, Math.max(20, popupPosition.x - 200))}px`,
        top: `${Math.min(window.innerHeight - 420, Math.max(20, popupPosition.y - 100))}px`,
        maxHeight: '400px',
        overflow: 'auto'
      }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{document.title}</h3>
          <div className="flex items-center space-x-2">
            {scoreDisplay && (
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 rounded">
                Relevance: {scoreDisplay}
              </span>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-3">
          {createSnippet(document.content)}
        </p>
        
        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {document.tags.map((tag: string) => (
              <span 
                key={`popup-${document.id}-${tag}`} 
                className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="text-sm text-gray-500 dark:text-gray-400 flex justify-between">
          <span>Last updated: {new Date(document.updated_at).toLocaleDateString()}</span>
          <a 
            href={`/documents/${document.id}`}
            className="text-blue-600 hover:underline dark:text-blue-400"
            onClick={(e) => e.stopPropagation()}
          >
            View full document
          </a>
        </div>
      </div>
    </div>
  );
};

export default DocumentPopup;