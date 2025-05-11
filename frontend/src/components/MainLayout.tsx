"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import NavigationHeader from "./NavigationHeader";

export default function MainLayout({ children }: { children: ReactNode }) {
  const { loading } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [viewportHeight, setViewportHeight] = useState("100vh");
  
  // Handle client-side mounting and viewport sizing
  useEffect(() => {
    setMounted(true);
    
    // Function to update viewport height
    const updateViewportHeight = () => {
      // Set a CSS variable for the actual viewport height
      // This fixes issues with mobile browser address bars
      setViewportHeight(`${window.innerHeight}px`);
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    
    // Set initial viewport height
    updateViewportHeight();
    
    // Update on resize
    window.addEventListener('resize', updateViewportHeight);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateViewportHeight);
  }, []);

  // Don't show layout on login page
  const isLoginPage = pathname === '/login';
  
  // Show loading state while checking authentication
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ height: viewportHeight }}>
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }
  
  // Don't include the header on the login page
  if (isLoginPage) {
    return <div style={{ minHeight: viewportHeight }}>{children}</div>;
  }
  
  return (
    <div className="flex flex-col" style={{ minHeight: viewportHeight }}>
      <NavigationHeader />
      <main className="flex-grow flex flex-col overflow-auto">
        {children}
      </main>
    </div>
  );
}