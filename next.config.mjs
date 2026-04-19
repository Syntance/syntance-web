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
    const strategia = '/strategia-marketingu-i-sprzedazy'
    const porozmawiajmy = '/porozmawiajmy'
    return [
      { source: '/strategia', destination: strategia, permanent: true },
      { source: '/strategia-biznesowa', destination: strategia, permanent: true },
      { source: '/strategia-przedwdrozeniowa', destination: strategia, permanent: true },
      { source: '/strategia-przedwdrożeniowa', destination: strategia, permanent: true },
      { source: '/discovery', destination: strategia, permanent: true },
      { source: '/product-discovery', destination: strategia, permanent: true },

      // Aliasy dla /porozmawiajmy (wizytówka, QR, podpis mail, LinkedIn)
      { source: '/spotkanie', destination: porozmawiajmy, permanent: true },
      { source: '/rozmowa', destination: porozmawiajmy, permanent: true },
      { source: '/pogadajmy', destination: porozmawiajmy, permanent: true },
      { source: '/umow-spotkanie', destination: porozmawiajmy, permanent: true },
      { source: '/booking', destination: porozmawiajmy, permanent: true },
      { source: '/meeting', destination: porozmawiajmy, permanent: true },
    ]
  },
};
export default nextConfig;
