/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
    // Inline krytycznego CSS w <head> — eliminuje render-blocking requesty po CSS chunki.
    inlineCss: true,
    // Tree-shaking importów ikon/UI — mniejszy bundle JS (lucide ma setki ikon).
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
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
      {
        protocol: 'https',
        hostname: 'lumineconcept.pl',
      },
      {
        protocol: 'https',
        hostname: 'sklep-retrohouse.pl',
      },
      {
        protocol: 'https',
        hostname: 'assets.sklep-retrohouse.pl',
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

  async headers() {
    // Security headers wg fundament/55-security + 50-perf-a11y.
    // CSP pominięte tu (wymaga nonce-based config + ostrożny review przy Vercel Analytics inline).
    const securityHeaders = [
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()',
      },
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
    ]
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },

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
      { source: '/sklepy', destination: '/sklepy-internetowe', permanent: true },
      { source: '/realizacje', destination: '/portfolio', permanent: true },
    ]
  },
};
export default nextConfig;
