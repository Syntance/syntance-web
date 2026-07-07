import { Suspense } from 'react'
import PorozmawiajmyContent from './porozmawiajmy-content'

export default function PorozmawiajmyPage() {
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
