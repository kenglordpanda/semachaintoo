/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    // Temporarily ignore ESLint errors during builds
    // TODO: Fix ESLint issues before production deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily ignore TypeScript errors during builds
    // TODO: Fix TypeScript issues before production deployment
    ignoreBuildErrors: true,
  },
  // Ensure proper standalone mode for containerized environments
  experimental: {
    // Prevent pages failing on window is not defined errors
    appDocumentPreloading: false,
  },
  // Optimize output for Docker
  outputFileTracingRoot: process.env.NODE_ENV === 'production' ? undefined : process.cwd(),
  // Ensure proper caching during Docker builds
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@esbuild/linux-x64',
    ],
  },
};

module.exports = nextConfig;
