import AgencjeMarketingoweClient from './agencje-marketingowe-client'
import { fetchPricingData } from '@/lib/pricing-data'
import { strategiaWorkshopPriceNet } from '@/lib/pricing-calculator'
import { getConfiguratorMinimumPricesNet } from '@/lib/pricing-configurator-minimum'
import { fetchFaqSettings, resolveAgencjeFaq } from '@/lib/faq-data'

const canonical = 'https://syntance.com/agencje-marketingowe'

export default async function AgencjeMarketingowePage() {
  const [pricingData, faqDoc] = await Promise.all([fetchPricingData(), fetchFaqSettings()])
  const mins = getConfiguratorMinimumPricesNet(pricingData)
  const discoveryNet = strategiaWorkshopPriceNet(pricingData)
  const faqItems = resolveAgencjeFaq(faqDoc, mins, discoveryNet)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${canonical}#organization`,
        name: 'Syntance',
        url: 'https://syntance.com',
        description:
          'Studio dostarczające strony i sklepy internetowe. Model partnerski white-label dla agencji marketingowych.',
        email: 'kontakt@syntance.com',
        telephone: '+48537110170',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Czerniec 72',
          addressLocality: 'Łącko',
          postalCode: '33-390',
          addressCountry: 'PL',
        },
        sameAs: ['https://linkedin.com/company/syntance', 'https://github.com/Syntance'],
      },
      {
        '@type': 'Service',
        '@id': `${canonical}#service`,
        name: 'White-label: strony internetowe dla agencji marketingowych',
        serviceType: 'Web development pod marką agencji',
        provider: { '@id': `${canonical}#organization` },
        areaServed: {
          '@type': 'Country',
          name: 'Polska',
        },
        description:
          'Realizacja stron pod marką agencji: NDA, PageSpeed 96+, SLA, marża partnerska. Bez kontaktu z końcowym klientem agencji.',
        url: canonical,
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonical}#faq`,
        mainEntity: faqItems.map((item) => ({
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AgencjeMarketingoweClient faqItems={faqItems} />
    </>
  )
}
