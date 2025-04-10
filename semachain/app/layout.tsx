'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./styles/editor.css";
import { AuthProvider } from './context/AuthContext';
import { DocumentProvider } from './context/DocumentContext';
import Navigation from './components/Navigation';
import { usePathname } from 'next/navigation';
import { useAuth } from './context/AuthContext';

const inter = Inter({ subsets: ["latin"] });

// List of public routes that don't require authentication
const publicRoutes = ['/login', '/register'];

export const metadata: Metadata = {
  title: "SemaChain - Knowledge Base Management",
  description: "Create and manage knowledge bases with intelligent document linking",
};

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated and trying to access protected route
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    window.location.href = '/login';
    return null;
  }

  // Don't show navigation on auth pages
  const showNavigation = !publicRoutes.includes(pathname);

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {showNavigation && <Navigation />}
          <main className={showNavigation ? 'pt-16' : ''}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <DocumentProvider>
        <RootLayoutContent>{children}</RootLayoutContent>
      </DocumentProvider>
    </AuthProvider>
  );
}
