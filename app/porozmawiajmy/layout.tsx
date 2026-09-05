import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    path: '/porozmawiajmy',
    title: 'Porozmawiajmy o projekcie — Syntance',
    description: 'Strony i sklepy oparte o strategię, lejek i KPI — nie o szablon. Skontaktuj się z Syntance i opisz swój projekt.',
    ogDescription: 'Strony i sklepy oparte o strategię, lejek i KPI. Napisz do nas — odpowiadamy w 24h.',
    robots: { index: false, follow: true, googleBot: { index: false, follow: true }, },
  })
}

export default function PorozmawiajmyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
