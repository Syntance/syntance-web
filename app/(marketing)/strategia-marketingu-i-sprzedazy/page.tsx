import { getDiscoveryWorkshopPrice } from '@/lib/sanity/discovery-workshop-price'
import StrategiaContent from './strategia-content'

const PAGE_URL = 'https://syntance.com/strategia-marketingu-i-sprzedazy'

export default async function StrategiaMarketinguPage() {
  const workshopPrice = await getDiscoveryWorkshopPrice()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${PAGE_URL}#service`,
        name: 'Strategia marketingu i sprzedaży',
        alternateName: 'Strategia marketingu i sprzedaży — faza przedwdrożeniowa',
        serviceType: 'Business Consulting',
        description:
          'Strategia marketingu i sprzedaży — fundament pod skuteczną stronę. Zakończona gotowym dokumentem strategicznym. Segmentacja, pozycjonowanie, UVP, persony, lejek, user flows, SEO i analityka.',
        url: PAGE_URL,
        provider: { '@type': 'Organization', name: 'Syntance', url: 'https://syntance.com' },
        areaServed: { '@type': 'Country', name: 'PL' },
        offers: {
          '@type': 'Offer',
          price: workshopPrice,
          priceCurrency: 'PLN',
          priceValidUntil: '2027-12-31',
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StrategiaContent discoveryPrice={workshopPrice} />
    </>
  )
}
