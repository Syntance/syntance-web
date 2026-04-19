/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
  },
  images: {
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
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ['sanity', 'next-sanity'],

  async redirects() {
    const destination = '/strategia-marketingu-i-sprzedazy'
    return [
      { source: '/strategia', destination, permanent: true },
      { source: '/strategia-biznesowa', destination, permanent: true },
      { source: '/strategia-przedwdrozeniowa', destination, permanent: true },
      { source: '/strategia-przedwdrożeniowa', destination, permanent: true },
      { source: '/discovery', destination, permanent: true },
      { source: '/product-discovery', destination, permanent: true },
    ]
  },
};
export default nextConfig;
