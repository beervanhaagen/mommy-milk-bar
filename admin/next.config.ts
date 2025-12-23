import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Base path for admin panel
  basePath: '/admin',

  // Enable strict mode
  reactStrictMode: true,

  // Image optimization
  images: {
    domains: ['lqmnkdqyoxytyyxuglhx.supabase.co'],
  },
};

export default nextConfig;
