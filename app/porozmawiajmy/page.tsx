import { Suspense } from 'react'
import PorozmawiajmyContent from './porozmawiajmy-content'

export default function PorozmawiajmyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Umów rozmowę — Syntance',
    url: 'https://syntance.com/porozmawiajmy',
    mainEntity: {
      '@type': 'Person',
      name: 'Kamil Podobiński',
      jobTitle: 'Founder, Syntance',
      email: 'kamil@syntance.com',
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
