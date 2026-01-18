/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { 
    serverActions: { bodySizeLimit: '2mb' },
  },
  images: { 
    domains: [],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },
  // Sanity Studio wymaga tych pakietów do transpilacji
  transpilePackages: ['sanity', 'next-sanity'],
};
export default nextConfig;

