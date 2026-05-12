import type { Metadata } from 'next'

const SITE_URL = 'https://syntance.com'
const PAGE_URL = `${SITE_URL}/porozmawiajmy`

export const metadata: Metadata = {
  title: 'Umów rozmowę — Syntance',
  description:
    'Software house Next.js — 30 min konsultacji o Twojej witrynie, konwersji i stosie.',
  alternates: { canonical: PAGE_URL },
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
  openGraph: {
    title: 'Umów rozmowę z zespołem Syntance',
    description:
      '30 minut. Konkretny plan dla Twojej witryny. Bez presji sprzedażowej.',
    url: PAGE_URL,
    type: 'website',
    siteName: 'Syntance',
    locale: 'pl_PL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Umów rozmowę — Syntance',
    description:
      '30 minut. Konkretny plan dla Twojej witryny. Bez presji sprzedażowej.',
  },
}

export default function PorozmawiajmyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
