import { Metadata } from 'next'
import { fetchPricingData } from '@/lib/pricing-data'
import { getConfiguratorMinimumPricesNet } from '@/lib/pricing-configurator-minimum'

function formatP(n: number): string {
  return n.toLocaleString('pl-PL')
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchPricingData()
  const { ecommerceNet } = getConfiguratorMinimumPricesNet(data)
  const priceStr = formatP(ecommerceNet)
  return {
    title: 'Sklepy internetowe headless | MedusaJS & Next.js | Syntance',
    description: `Budujemy sklepy internetowe w architekturze headless. MedusaJS, Next.js, zero prowizji. Sklepy od ${priceStr} PLN netto (baza konfiguratora). Wycena w 24h →`,
    keywords: [
      'ile kosztuje sklep internetowy',
      'sklep internetowy dla firmy',
      'sklep internetowy headless',
      'headless ecommerce',
      'sklep next.js',
      'medusajs sklep',
      'własny sklep internetowy',
      'sklep dla producenta',
      'alternatywa dla Shopify',
      'własny sklep zamiast Allegro',
      'sklep internetowy Kraków',
      'tworzenie sklepów internetowych Polska',
      'agencja e-commerce Małopolska',
    ],
    openGraph: {
      title: 'Sklepy internetowe headless | MedusaJS & Next.js | Syntance',
      description: `Budujemy sklepy e-commerce w architekturze headless. Zero prowizji, pełna kontrola. Sklepy od ${priceStr} PLN netto.`,
      url: 'https://syntance.com/sklepy-internetowe',
    },
    alternates: {
      canonical: 'https://syntance.com/sklepy-internetowe',
    },
  }
}

export default function SklepyInternetoweLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
