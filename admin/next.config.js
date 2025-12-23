/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily removed basePath to fix routing error
  // basePath: '/admin',

  // Enable strict mode
  reactStrictMode: true,

  // Image optimization
  images: {
    domains: ['lqmnkdqyoxytyyxuglhx.supabase.co'],
  },
};

module.exports = nextConfig;
