import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portfolio stron Next.js i sklepów — Syntance',
  description:
    'Wybrane realizacje Syntance: strony firmowe i sklepy internetowe w Next.js. Lumine Concept, RetroHouse i kolejne projekty z naciskiem na performance i konwersję.',
  keywords: [
    'portfolio stron next.js',
    'realizacje sklepów internetowych',
    'case studies next.js',
    'portfolio agencji interaktywnej',
    'strony internetowe portfolio',
  ],
  openGraph: {
    title: 'Portfolio stron Next.js i sklepów — Syntance',
    description:
      'Realizacje Syntance: strony firmowe i sklepy headless z naciskiem na szybkość, SEO i konwersję.',
    url: 'https://syntance.com/portfolio',
    siteName: 'Syntance',
    locale: 'pl_PL',
  },
  alternates: {
    canonical: 'https://syntance.com/portfolio',
  },
}

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
