import type { Metadata } from 'next'
import PanelRealizationsClient from '@/components/sections/panel/panel-realizations-client'
import { panelRealizations } from '@/lib/panel-realizations-content'

const canonical = 'https://syntance.com/panel/realizacje'

export const metadata: Metadata = {
  title: 'Realizacje panelu sklepu — Syntance',
  description:
    'Zrzuty ekranu panelu Syntance u klientów produkcyjnych. Zarządzanie sklepem, treściami i analityką w praktyce.',
  keywords: [
    'panel sklepu realizacje',
    'case study panel e-commerce',
    'autorski CMS sklep',
    'panel Syntance wdrożenia',
  ],
  openGraph: {
    title: 'Realizacje panelu sklepu — Syntance',
    description:
      'Zobacz, jak panel Syntance wygląda u prawdziwych klientów — zrzuty z produkcyjnych wdrożeń.',
    url: canonical,
    siteName: 'Syntance',
    locale: 'pl_PL',
  },
  alternates: {
    canonical,
  },
}

export default function PanelRealizationsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Strona główna',
            item: 'https://syntance.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Panel sklepu Syntance',
            item: 'https://syntance.com/panel',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Realizacje panelu',
            item: canonical,
          },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': canonical,
        name: 'Realizacje panelu Syntance',
        description:
          'Galeria zrzutów ekranu panelu Syntance wdrożonego u klientów produkcyjnych.',
        url: canonical,
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PanelRealizationsClient realizations={panelRealizations} />
    </>
  )
}
