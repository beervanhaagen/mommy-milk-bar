/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/admin',

  // Enable strict mode
  reactStrictMode: true,

  // Image optimization
  images: {
    domains: ['lqmnkdqyoxytyyxuglhx.supabase.co'],
  },
};

module.exports = nextConfig;
