import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Panel sklepu Syntance — sklep, CMS, SEO i analityka w jednym miejscu',
  description:
    'Zarządzaj stroną, produktami, zamówieniami, treściami i analityką GA4 + PostHog z jednego panelu. PageSpeed 90+, pełna własność kodu, RODO w standardzie.',
  keywords: [
    'panel do zarządzania sklepem internetowym',
    'autorski CMS bez Sanity',
    'sklep internetowy z analityką GA4 PostHog',
    'headless e-commerce panel Next.js',
  ],
  openGraph: {
    title: 'Panel sklepu Syntance — jeden panel zamiast pięciu narzędzi',
    description:
      'Autorski panel Syntance: strona, sklep, CMS, SEO i analityka GA4 + PostHog w jednym miejscu.',
    url: 'https://syntance.com/panel',
  },
  alternates: {
    canonical: 'https://syntance.com/panel',
  },
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return children
}
