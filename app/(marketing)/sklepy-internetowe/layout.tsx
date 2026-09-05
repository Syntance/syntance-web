import { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { fetchPricingData } from '@/lib/pricing-data'
import { getConfiguratorMinimumPricesNet } from '@/lib/pricing-configurator-minimum'

function formatP(n: number): string {
  return n.toLocaleString('pl-PL')
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchPricingData()
  const { ecommerceNet } = getConfiguratorMinimumPricesNet(data)
  const priceStr = formatP(ecommerceNet)
  return pageMetadata({
    path: '/sklepy-internetowe',
    title: 'Sklepy internetowe headless | Medusa & Next.js | Syntance',
    description: `Budujemy sklepy internetowe w architekturze headless. Medusa, Next.js, zero prowizji. Sklepy od ${priceStr} PLN netto (pakiet startowy). Wycena w 24h →`,
    ogDescription: `Budujemy sklepy e-commerce w architekturze headless. Zero prowizji, pełna kontrola. Sklepy od ${priceStr} PLN netto.`,
    keywords: [ 'ile kosztuje sklep internetowy', 'sklep internetowy dla firmy', 'sklep internetowy headless', 'headless ecommerce', 'sklep next.js', 'medusajs sklep', 'własny sklep internetowy', 'sklep dla producenta', 'alternatywa dla Shopify', 'własny sklep zamiast Allegro', 'sklep internetowy Kraków', 'tworzenie sklepów internetowych Polska', 'agencja e-commerce Małopolska', ],
  })
}

export default function SklepyInternetoweLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
