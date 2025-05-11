"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import { findSimilarDocumentsByContent, SimilarDocumentResult } from '@/lib/api/documents';

interface WysiwygEditorProps {
  initialContent?: string;
  documentId?: number;
  placeholder?: string;
  onChange: (content: string) => void;
  onSimilarDocumentClick?: (documentId: number) => void;
}

export default function WysiwygEditor({ 
  initialContent = '', 
  documentId,
  placeholder = 'Start typing here...',
  onChange,
  onSimilarDocumentClick
}: WysiwygEditorProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [similarDocuments, setSimilarDocuments] = useState<SimilarDocumentResult[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [hoveredDocId, setHoveredDocId] = useState<number | null>(null);
  
  // State for link handling
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const linkDialogRef = useRef<HTMLDivElement>(null);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Highlight,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:underline cursor-pointer',
        },
        // Make links have rel="noopener noreferrer nofollow" for security
        protocols: ['http', 'https', 'mailto', 'tel'],
        validate: (url) => /^(https?:\/\/|mailto:|tel:)/.test(url),
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      
      // Handle typing detection for suggestions
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      setIsTyping(true);
      setTypingTimeout(
        setTimeout(() => {
          setIsTyping(false);
          const text = editor.getText();
          // Only search if we have at least 20 characters
          if (text.length >= 20) {
            fetchSimilarDocuments(text);
          } else {
            setSimilarDocuments([]);
            setShowSuggestions(false);
          }
        }, 1000)
      );
    },
  });

  // Click outside to close link dialog
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (linkDialogRef.current && !linkDialogRef.current.contains(event.target as Node)) {
        setShowLinkDialog(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchSimilarDocuments = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    try {
      const results = await findSimilarDocumentsByContent(content, 5);
      // Filter out the current document if it's in the results
      const filteredResults = documentId 
        ? results.filter(doc => doc.document_id !== documentId)
        : results;
        
      if (filteredResults.length > 0) {
        setSimilarDocuments(filteredResults);
        setShowSuggestions(true);
      } else {
        setSimilarDocuments([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching similar documents:', error);
      setSimilarDocuments([]);
      setShowSuggestions(false);
    }
  }, [documentId]);

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  const insertDocumentReference = useCallback((document: SimilarDocumentResult) => {
    if (!editor) return;
    
    // Insert a reference to the document as a proper link
    editor
      .chain()
      .focus()
      .setLink({ 
        href: `/documents/${document.document_id}`,
        target: '_blank' 
      })
      .insertContent(document.title)
      .run();
      
    setShowSuggestions(false);
    
    // Call the click handler if provided
    if (onSimilarDocumentClick) {
      onSimilarDocumentClick(document.document_id);
    }
  }, [editor, onSimilarDocumentClick]);

  // Handle opening the link dialog
  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    setLinkText(selectedText);
    
    // Check if the selection is inside an existing link
    const linkMark = editor.isActive('link');
    if (linkMark) {
      // Get the link attributes
      const attrs = editor.getAttributes('link');
      setLinkUrl(attrs.href || '');
    } else {
      setLinkUrl('https://');
    }
    
    setShowLinkDialog(true);
  }, [editor]);

  // Handle adding or updating a link
  const handleLinkSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editor || !linkUrl) return;
    
    if (linkText && !editor.state.selection.content().size) {
      // If we have link text but no selection, insert the text with a link
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${linkUrl}" target="_blank">${linkText}</a>`)
        .run();
    } else {
      // Otherwise, convert the current selection to a link
      editor
        .chain()
        .focus()
        .setLink({ href: linkUrl, target: '_blank' })
        .run();
    }
    
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  }, [editor, linkUrl, linkText]);

  // Handle removing a link
  const removeLink = useCallback(() => {
    if (!editor) return;
    
    editor
      .chain()
      .focus()
      .unsetLink()
      .run();
      
    setShowLinkDialog(false);
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative">
      {editor && (
        <BubbleMenu 
          editor={editor} 
          tippyOptions={{ duration: 100 }}
          className="bg-white shadow-lg border border-gray-200 rounded-md py-1 px-2 flex items-center space-x-1"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Bold"
          >
            <span className="font-bold">B</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Italic"
          >
            <span className="italic">I</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-1 rounded ${editor.isActive('highlight') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Highlight"
          >
            <span className="bg-yellow-200 px-1">H</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Heading 2"
          >
            <span className="font-bold">H2</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Heading 3"
          >
            <span className="font-bold">H3</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Bullet List"
          >
            <span className="font-bold">•</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1 rounded ${editor.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Ordered List"
          >
            <span className="font-bold">1.</span>
          </button>
          <button
            onClick={openLinkDialog}
            className={`p-1 rounded ${editor.isActive('link') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Insert Link"
          >
            <span className="underline">Link</span>
          </button>
        </BubbleMenu>
      )}

      <div className="border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
        <EditorContent 
          editor={editor} 
          className="prose max-w-none p-4 min-h-[300px] focus:outline-none"
        />
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div 
            ref={linkDialogRef}
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-medium mb-4">Insert Link</h3>
            <form onSubmit={handleLinkSubmit}>
              <div className="mb-4">
                <label htmlFor="linkText" className="block text-sm font-medium text-gray-700 mb-1">
                  Link Text
                </label>
                <input
                  type="text"
                  id="linkText"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Text to display"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="text"
                  id="linkUrl"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                {editor.isActive('link') && (
                  <button
                    type="button"
                    onClick={removeLink}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                  >
                    Remove Link
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowLinkDialog(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editor.isActive('link') ? 'Update' : 'Insert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Typing indicator */}
      {isTyping && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          <span className="animate-pulse">Typing...</span>
        </div>
      )}

      {/* Similar Documents Panel */}
      {showSuggestions && similarDocuments.length > 0 && (
        <div className="mt-4 p-3 border border-gray-200 rounded-md bg-gray-50">
          <div className="text-sm font-medium text-gray-700 mb-2">Similar Documents:</div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {similarDocuments.map((doc) => (
              <div 
                key={doc.document_id} 
                className={`p-2 border rounded cursor-pointer transition-colors ${
                  hoveredDocId === doc.document_id 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-white border-gray-200'
                }`}
                onClick={() => insertDocumentReference(doc)}
                onMouseEnter={() => setHoveredDocId(doc.document_id)}
                onMouseLeave={() => setHoveredDocId(null)}
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-medium text-gray-800">{doc.title}</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {(doc.distance * 100).toFixed(0)}% Match
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {doc.content.substring(0, 100)}...
                </p>
                {doc.scores && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {Object.entries(doc.scores).map(([key, score]) => (
                      <span key={key} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                        {key}: {score.toFixed(2)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}