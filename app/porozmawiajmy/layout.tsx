import type { Metadata } from 'next'

const SITE_URL = 'https://syntance.com'
const PAGE_URL = `${SITE_URL}/porozmawiajmy`

export const metadata: Metadata = {
  title: 'Skuteczne strony i sklepy, które sprzedają — Syntance',
  description:
    'Strony i sklepy oparte o strategię, lejek i KPI — nie o szablon. Średni PageSpeed 96/100. Zamów darmowy audyt swojej strony.',
  alternates: { canonical: PAGE_URL },
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
  openGraph: {
    title: 'Skuteczne strony i sklepy, które sprzedają',
    description:
      'Strony i sklepy oparte o strategię, lejek i KPI — nie o szablon. Średni PageSpeed 96/100. Zamów darmowy audyt.',
    url: PAGE_URL,
    type: 'website',
    siteName: 'Syntance',
    locale: 'pl_PL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skuteczne strony i sklepy, które sprzedają',
    description:
      'Strony i sklepy oparte o strategię, lejek i KPI — nie o szablon. Średni PageSpeed 96/100. Zamów darmowy audyt.',
  },
}

export default function PorozmawiajmyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
