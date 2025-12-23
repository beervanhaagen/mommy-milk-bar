import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Base path for admin panel (keeps admin at /admin while serving static site at /)
  basePath: '/admin',

  // Enable strict mode
  reactStrictMode: true,

  // Image optimization
  images: {
    domains: ['lqmnkdqyoxytyyxuglhx.supabase.co'],
  },
};

export default nextConfig;
