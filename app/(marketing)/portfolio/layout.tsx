import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    path: '/portfolio',
    title: 'Portfolio stron Next.js i sklepów — Syntance',
    description: 'Wybrane realizacje Syntance: strony firmowe i sklepy internetowe w Next.js. Lumine Concept, RetroHouse i kolejne projekty z naciskiem na performance i konwersję.',
    ogDescription: 'Realizacje Syntance: strony firmowe i sklepy headless z naciskiem na szybkość, SEO i konwersję.',
    keywords: [ 'portfolio stron next.js', 'realizacje sklepów internetowych', 'case studies next.js', 'portfolio agencji interaktywnej', 'strony internetowe portfolio', ],
  })
}

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
