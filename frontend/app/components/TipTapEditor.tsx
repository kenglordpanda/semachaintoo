'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { useState, useEffect, useCallback } from 'react';
import EditorToolbar from './EditorToolbar';

interface DocumentSuggestion {
  id: string;
  title: string;
  relevanceScore: number;
  excerpt: string;
}

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onLinkSuggestion: (text: string) => Promise<DocumentSuggestion[]>;
  onCursorPosition?: (position: { x: number; y: number }) => void;
  knowledgeBaseId: string;
}

export default function TipTapEditor({
  content,
  onChange,
  onLinkSuggestion,
  onCursorPosition,
  knowledgeBaseId,
}: TipTapEditorProps) {
  const [suggestions, setSuggestions] = useState<DocumentSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-700 underline',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your document...',
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        const selectedText = editor.state.doc.textBetween(from, to);
        setSelectedText(selectedText);
        
        // Get the position of the selection
        const { top, left } = editor.view.coordsAtPos(from);
        setSuggestionPosition({ top, left });
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    },
  });

  // Track cursor position
  useEffect(() => {
    if (!editor || !onCursorPosition) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = editor.view.dom.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      onCursorPosition({ x, y });
    };

    editor.view.dom.addEventListener('mousemove', handleMouseMove);
    return () => {
      editor.view.dom.removeEventListener('mousemove', handleMouseMove);
    };
  }, [editor, onCursorPosition]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (selectedText.length > 3) {
        const results = await onLinkSuggestion(selectedText);
        setSuggestions(results);
      }
    };

    fetchSuggestions();
  }, [selectedText, onLinkSuggestion]);

  const handleSuggestionClick = useCallback((suggestion: DocumentSuggestion) => {
    if (editor) {
      const { from, to } = editor.state.selection;
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: `/knowledge-base/${knowledgeBaseId}/document/${suggestion.id}` })
        .run();
    }
    setShowSuggestions(false);
  }, [editor, knowledgeBaseId]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <EditorToolbar editor={editor} />
      <div className="relative">
        <EditorContent editor={editor} className="prose max-w-none p-4" />
        
        {showSuggestions && suggestions.length > 0 && (
          <div
            className="absolute z-50 bg-white rounded-lg shadow-lg p-4 w-80"
            style={{
              top: `${suggestionPosition.top + 20}px`,
              left: `${suggestionPosition.left}px`,
            }}
          >
            <h3 className="text-sm font-medium text-gray-900 mb-2">Link Suggestions</h3>
            <div className="space-y-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left p-2 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{suggestion.title}</p>
                      <p className="text-xs text-gray-900 mt-1">{suggestion.excerpt}</p>
                    </div>
                    <span className="text-xs text-gray-900">
                      {Math.round(suggestion.relevanceScore * 100)}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 