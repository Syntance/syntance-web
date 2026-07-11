import { Suspense } from 'react'
import { after } from 'next/server'
import { recordPageHit } from '@/lib/db/queries/analytics'
import PorozmawiajmyContent from './porozmawiajmy-content'

export default function PorozmawiajmyPage() {
  // Licznik wejść działa niezależnie od zgody na cookies — to wyłącznie
  // agregat dzienny (bez IP/UA/identyfikatora), więc nie wymaga banera
  // cookies. Pełna analityka (GA4/PostHog) rusza tylko po zgodzie.
  after(() => recordPageHit('/porozmawiajmy'))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Porozmawiajmy o projekcie — Syntance',
    url: 'https://syntance.com/porozmawiajmy',
    mainEntity: {
      '@type': 'Organization',
      name: 'Syntance',
      url: 'https://syntance.com',
      email: 'kontakt@syntance.com',
      telephone: '+48537110170',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={null}>
        <PorozmawiajmyContent />
      </Suspense>
    </>
  )
}
