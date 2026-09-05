import { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    path: '/panel',
    title: 'Panel sklepu Syntance — sklep, CMS, SEO i analityka w jednym miejscu',
    description: 'Zarządzaj stroną, produktami, zamówieniami, treściami i analityką GA4 + PostHog z jednego panelu. PageSpeed 90+, pełna własność kodu, RODO w standardzie.',
    ogTitle: 'Panel sklepu Syntance — jeden panel zamiast pięciu narzędzi',
    ogDescription: 'Autorski panel Syntance: strona, sklep, CMS, SEO i analityka GA4 + PostHog w jednym miejscu.',
    keywords: [ 'panel do zarządzania sklepem internetowym', 'autorski CMS bez Sanity', 'sklep internetowy z analityką GA4 PostHog', 'headless e-commerce panel Next.js', ],
  })
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return children
}
