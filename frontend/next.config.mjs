/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other configurations if they exist
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // If you have output: 'export' for static builds, ensure it's compatible
  // with being served by Nginx. If not, remove or adjust it.
  // output: 'export', // Example: remove or comment out if not needed for static export
};

export default nextConfig; // Use module.exports = nextConfig; if using next.config.js
