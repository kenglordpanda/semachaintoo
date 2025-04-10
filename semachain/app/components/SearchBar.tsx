'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDocuments } from '@/app/context/DocumentContext';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { documents } = useDocuments();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim().length > 0) {
      setLoading(true);
      setIsOpen(true);
      
      // Simulate search with a small delay (would be replaced with API call)
      setTimeout(() => {
        const searchResults = documents.filter(doc => 
          doc.title.toLowerCase().includes(value.toLowerCase()) || 
          doc.content.toLowerCase().includes(value.toLowerCase())
        );
        
        setResults(searchResults);
        setLoading(false);
      }, 300);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  // Navigate to document
  const handleSelectResult = (doc: any) => {
    router.push(`/knowledge-base/${doc.knowledgeBaseId}/document/${doc.id}`);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search knowledge bases and documents..."
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
        <svg 
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <svg className="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((result) => (
                <li 
                  key={result.id}
                  onClick={() => handleSelectResult(result)}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{result.title}</div>
                  <div className="text-sm text-gray-500 truncate">
                    {result.content ? result.content.substring(0, 100) + '...' : 'No content'}
                  </div>
                </li>
              ))}
            </ul>
          ) : query.trim().length > 0 ? (
            <div className="p-4 text-center text-gray-500">
              No results found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
} 