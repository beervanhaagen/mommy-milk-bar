import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Temporarily removed basePath to fix routing error
  // basePath: '/admin',

  // Enable strict mode
  reactStrictMode: true,

  // Image optimization
  images: {
    domains: ['lqmnkdqyoxytyyxuglhx.supabase.co'],
  },
};

export default nextConfig;
