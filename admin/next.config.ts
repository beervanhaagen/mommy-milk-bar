import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Temporarily removed basePath to fix routing error
  // basePath: '/admin',

  // Enable strict mode
  reactStrictMode: true,

  // Image optimization
  images: {
    domains: ['lqmnkdqyoxytyyxuglhx.supabase.co'],
  },

  // Set the correct root for file tracing in monorepo
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../'),
  },
};

export default nextConfig;
