import type { Metadata } from 'next'

const SITE_URL = 'https://syntance.com'
const PAGE_URL = `${SITE_URL}/porozmawiajmy`

export const metadata: Metadata = {
  title: 'Co odróżnia strony, które sprzedają — Syntance',
  description:
    'Darmowy raport: porównanie Twojej strony z 5 obszarami, które decydują o sprzedaży. PDF + Loom w 3 dni robocze.',
  alternates: { canonical: PAGE_URL },
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
  openGraph: {
    title:
      '5 różnic między stroną, która sprzedaje, a tą, która tylko ładnie wygląda',
    description:
      'Darmowy raport: w których obszarach Twoja strona jest po lewej, w których po prawej. PDF + Loom w 3 dni.',
    url: PAGE_URL,
    type: 'website',
    siteName: 'Syntance',
    locale: 'pl_PL',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      '5 różnic między stroną, która sprzedaje, a tą, która tylko ładnie wygląda',
    description:
      'Darmowy raport: w których obszarach Twoja strona jest po lewej, w których po prawej. PDF + Loom w 3 dni.',
  },
}

export default function PorozmawiajmyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
