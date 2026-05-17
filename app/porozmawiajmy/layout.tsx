import type { Metadata } from 'next'

const SITE_URL = 'https://syntance.com'
const PAGE_URL = `${SITE_URL}/porozmawiajmy`

export const metadata: Metadata = {
  title: 'Dlaczego strategia decyduje, czy strona sprzedaje — Syntance',
  description:
    'Strategia to różnica między stroną, która sprzedaje, a tą, która tylko ładnie wygląda. Zobacz gdzie działa i zamów darmowy audyt.',
  alternates: { canonical: PAGE_URL },
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
  openGraph: {
    title:
      'Strategia = różnica między stroną, która sprzedaje, a tą, która tylko ładnie wygląda',
    description:
      'Strategia to różnica między stroną, która sprzedaje, a tą, która tylko ładnie wygląda. Zobacz gdzie działa i zamów darmowy audyt.',
    url: PAGE_URL,
    type: 'website',
    siteName: 'Syntance',
    locale: 'pl_PL',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Strategia = różnica między stroną, która sprzedaje, a tą, która tylko ładnie wygląda',
    description:
      'Strategia to różnica między stroną, która sprzedaje, a tą, która tylko ładnie wygląda. Zobacz gdzie działa i zamów darmowy audyt.',
  },
}

export default function PorozmawiajmyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
