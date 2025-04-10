'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBar from './SearchBar';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Determine if we're on the home page
  const isHomePage = pathname === '/';
  
  // Determine if we're in a knowledge base
  const isKnowledgeBase = pathname.startsWith('/knowledge-base/') && !pathname.includes('/document/');
  
  // Determine if we're in a document
  const isDocument = pathname.includes('/document/');
  
  // Extract knowledge base ID from path if available
  const knowledgeBaseId = pathname.split('/')[2];
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Home Link */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-blue-600">SemaChain</span>
            </Link>
          </div>
          
          {/* Search Bar - Only show on knowledge base and document pages */}
          <div className="hidden md:block flex-1 max-w-xl mx-8">
            {!isHomePage && <SearchBar />}
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isHomePage 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Knowledge Bases
            </Link>
            
            {isKnowledgeBase && (
              <Link 
                href={`/knowledge-base/${knowledgeBaseId}`}
                className="px-3 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-700"
              >
                Current Knowledge Base
              </Link>
            )}
            
            {isDocument && (
              <Link 
                href={`/knowledge-base/${knowledgeBaseId}`}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Back to Knowledge Base
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isHomePage
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Knowledge Bases
            </Link>
            
            {isKnowledgeBase && (
              <Link
                href={`/knowledge-base/${knowledgeBaseId}`}
                className="block px-3 py-2 rounded-md text-base font-medium bg-blue-100 text-blue-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Current Knowledge Base
              </Link>
            )}
            
            {isDocument && (
              <Link
                href={`/knowledge-base/${knowledgeBaseId}`}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Back to Knowledge Base
              </Link>
            )}
            
            {!isHomePage && (
              <div className="px-3 py-2">
                <SearchBar />
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 