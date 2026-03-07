import { Metadata } from 'next'
import { sanityFetch } from '@/sanity/lib/fetch'
import { startingPricesQuery, defaultStartingPrices, type StartingPrices } from '@/sanity/queries/pricing'

function formatPrice(price: number): string {
  return price.toLocaleString('pl-PL')
}

async function getStrategyPrice(): Promise<number> {
  try {
    const prices = await sanityFetch<StartingPrices>({ query: startingPricesQuery })
    return prices?.discoveryWorkshopPrice || defaultStartingPrices.discoveryWorkshopPrice
  } catch {
    return defaultStartingPrices.discoveryWorkshopPrice
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const price = await getStrategyPrice()
  const formattedPrice = formatPrice(price)

  return {
    title: 'Strategia Strony Internetowej | Syntance',
    description: `Dlaczego strona nie generuje leadów? Bo nie ma strategii. Poznaj 3 fundamenty skutecznej strony: cel biznesowy, buyer persona i UVP. Strategia przedwdrożeniowa od ${formattedPrice} PLN.`,
    keywords: 'strategia strony internetowej, buyer persona, UVP, cel biznesowy strony, strategia przedwdrożeniowa, strona B2B',
    openGraph: {
      title: 'Strategia Strony Internetowej | Syntance',
      description: 'Dlaczego strona nie generuje leadów? Bo nie ma strategii. Poznaj 3 fundamenty skutecznej strony.',
      url: 'https://syntance.com/strategia',
    },
    alternates: {
      canonical: 'https://syntance.com/strategia',
    },
  }
}

export default function StrategiaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
