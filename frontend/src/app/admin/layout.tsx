import { ReactNode } from "react";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="admin-layout">
      <header className="admin-header flex items-center justify-between px-6">
        <div className="text-xl font-semibold text-primary">SemaChainToo Admin</div>
        <div className="flex items-center gap-4">
          <div className="text-secondary text-sm">
            {new Date().toLocaleDateString()}
          </div>
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-medium">
            AT
          </div>
        </div>
      </header>
      
      <nav className="admin-sidebar py-6">
        <div className="px-4 mb-6">
          <div className="text-xs uppercase font-semibold text-gray-500 mb-2 pl-2">Main</div>
          <ul>
            <li>
              <Link 
                href="/admin/dashboard" 
                className="flex items-center px-2 py-2 text-gray-800 hover:bg-primary hover:text-white rounded-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Dashboard
              </Link>
            </li>
          </ul>
        </div>

        <div className="px-4 mb-6">
          <div className="text-xs uppercase font-semibold text-gray-500 mb-2 pl-2">Management</div>
          <ul>
            <li>
              <Link 
                href="/admin/organizations" 
                className="flex items-center px-2 py-2 text-gray-800 hover:bg-primary hover:text-white rounded-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Organizations
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/users" 
                className="flex items-center px-2 py-2 text-gray-800 hover:bg-primary hover:text-white rounded-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Users
              </Link>
            </li>
          </ul>
        </div>

        <div className="px-4 mb-6">
          <div className="text-xs uppercase font-semibold text-gray-500 mb-2 pl-2">Content</div>
          <ul>
            <li>
              <Link 
                href="/admin/knowledge-bases" 
                className="flex items-center px-2 py-2 text-gray-800 hover:bg-primary hover:text-white rounded-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Knowledge Bases
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/documents" 
                className="flex items-center px-2 py-2 text-gray-800 hover:bg-primary hover:text-white rounded-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documents
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}