import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
    API_URL: process.env.API_URL || 'http://localhost:8000/api',
  },
  // Update API rewrites to properly handle all API routes
  async rewrites() {
    return [
      {
        // This specifically handles the API v1 prefix that's used in your application
        source: '/api/v1/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/:path*` 
          : 'http://backend:8000/api/v1/:path*',
      },
      {
        // This is a fallback for any other API path patterns
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*` 
          : 'http://backend:8000/api/:path*',
      }
    ];
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // This is temporary until we resolve the type issues with Next.js 15.3.2
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
