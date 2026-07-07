import type { Metadata } from 'next'

const SITE_URL = 'https://syntance.com'
const PAGE_URL = `${SITE_URL}/porozmawiajmy`

export const metadata: Metadata = {
  title: 'Porozmawiajmy o projekcie — Syntance',
  description:
    'Strony i sklepy oparte o strategię, lejek i KPI — nie o szablon. Skontaktuj się z Syntance i opisz swój projekt.',
  alternates: { canonical: PAGE_URL },
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
  openGraph: {
    title: 'Porozmawiajmy o projekcie — Syntance',
    description:
      'Strony i sklepy oparte o strategię, lejek i KPI. Napisz do nas — odpowiadamy w 24h.',
    url: PAGE_URL,
    type: 'website',
    siteName: 'Syntance',
    locale: 'pl_PL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Porozmawiajmy o projekcie — Syntance',
    description:
      'Strony i sklepy oparte o strategię, lejek i KPI. Napisz do nas — odpowiadamy w 24h.',
  },
}

export default function PorozmawiajmyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
