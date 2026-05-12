import { Suspense } from 'react'
import PorozmawiajmyContent from './porozmawiajmy-content'

export default function PorozmawiajmyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Umów rozmowę — Syntance',
    url: 'https://syntance.com/porozmawiajmy',
    mainEntity: {
      '@type': 'Organization',
      name: 'Syntance',
      url: 'https://syntance.com',
      email: 'kontakt@syntance.com',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+48537110170',
        email: 'kontakt@syntance.com',
        contactType: 'customer support',
        availableLanguage: ['pl', 'en'],
      },
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
