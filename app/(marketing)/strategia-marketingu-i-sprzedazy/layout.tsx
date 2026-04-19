import { Metadata } from 'next'
import { sanityFetch } from '@/sanity/lib/fetch'
import { startingPricesQuery, defaultStartingPrices, type StartingPrices } from '@/sanity/queries/pricing'

function formatPrice(price: number): string {
  return price.toLocaleString('pl-PL')
}

const SHORT =
  'Strategia marketingu i sprzedaży — fundament pod skuteczną stronę. Zakończona gotowym dokumentem strategicznym.'

export async function generateMetadata(): Promise<Metadata> {
  let workshopPrice = defaultStartingPrices.discoveryWorkshopPrice
  try {
    const prices = await sanityFetch<StartingPrices>({ query: startingPricesQuery })
    if (prices?.discoveryWorkshopPrice) {
      workshopPrice = prices.discoveryWorkshopPrice
    }
  } catch {}

  const priceFormatted = formatPrice(workshopPrice)
  const canonical = 'https://syntance.com/strategia-marketingu-i-sprzedazy'

  return {
    title: 'Strategia marketingu i sprzedaży (faza przedwdrożeniowa) | Syntance',
    description: `${SHORT} Pełna usługa od ${priceFormatted} PLN netto.`,
    keywords: [
      'strategia marketingu i sprzedaży',
      'strategia strony internetowej',
      'faza przedwdrożeniowa',
      'buyer persona',
      'UVP',
      'strona B2B',
    ],
    openGraph: {
      title: 'Strategia marketingu i sprzedaży | Syntance',
      description: SHORT,
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Strategia marketingu i sprzedaży | Syntance',
      description: SHORT,
    },
    alternates: {
      canonical,
    },
  }
}

export default function StrategiaMarketinguLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
