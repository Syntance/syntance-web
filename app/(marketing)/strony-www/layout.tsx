import { Metadata } from 'next'
import { fetchPricingData } from '@/lib/pricing-data'
import { getConfiguratorMinimumPricesNet } from '@/lib/pricing-configurator-minimum'

function formatP(n: number): string {
  return n.toLocaleString('pl-PL')
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchPricingData()
  const { websiteNet } = getConfiguratorMinimumPricesNet(data)
  const priceStr = formatP(websiteNet)
  return {
    title: 'Strony internetowe dla firm | Profesjonalne strony www Next.js | Syntance',
    description: `Tworzymy profesjonalne strony internetowe dla firm B2B. Next.js, PageSpeed 90+, strategia marketingu i sprzedaży (faza przedwdrożeniowa). Strony od ${priceStr} PLN netto (pakiet startowy). Bezpłatna wycena →`,
    keywords: [
      'tworzenie stron internetowych',
      'strona internetowa dla firmy',
      'profesjonalna strona internetowa',
      'strony dla firm',
      'strona www dla firmy',
      'strona internetowa Next.js',
      'strona B2B',
      'szybka strona internetowa',
      'tworzenie stron internetowych Kraków',
      'strony internetowe Małopolska',
      'agencja webowa Polska',
    ],
    openGraph: {
      title: 'Strony internetowe dla firm | Syntance',
      description: `Profesjonalne strony www w Next.js z gwarancją PageSpeed 90+. Strategia marketingu i sprzedaży (faza przedwdrożeniowa). Strony od ${priceStr} PLN netto.`,
      url: 'https://syntance.com/strony-www',
    },
    alternates: {
      canonical: 'https://syntance.com/strony-www',
    },
  }
}

export default function StronyWWWLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
