import type { Metadata } from 'next'
import { pageSocialMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Porozmawiajmy o projekcie — Syntance',
  description:
    'Strony i sklepy oparte o strategię, lejek i KPI — nie o szablon. Skontaktuj się z Syntance i opisz swój projekt.',
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
  ...pageSocialMetadata({
    path: '/porozmawiajmy',
    title: 'Porozmawiajmy o projekcie — Syntance',
    description: 'Strony i sklepy oparte o strategię, lejek i KPI. Napisz do nas — odpowiadamy w 24h.',
  }),
}

export default function PorozmawiajmyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
