import PanelPageClient from '@/components/sections/panel/panel-page-client'
import { PANEL_FAQ } from '@/components/sections/panel/panel-content'

const canonical = 'https://syntance.com/panel'

export default function PanelPage() {
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
            item: canonical,
          },
        ],
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${canonical}#software`,
        name: 'Panel sklepu Syntance',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description:
          'Autorski panel do zarządzania stroną, sklepem internetowym, treściami, SEO i analityką GA4 + PostHog.',
        url: canonical,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'PLN',
          description: 'Wycena indywidualna — skontaktuj się w celu demo panelu.',
        },
        provider: {
          '@type': 'Organization',
          name: 'Syntance',
          url: 'https://syntance.com',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonical}#faq`,
        mainEntity: PANEL_FAQ.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PanelPageClient />
    </>
  )
}
