import { Metadata } from 'next'
import { sanityFetch } from '@/sanity/lib/fetch'
import { startingPricesQuery, defaultStartingPrices, type StartingPrices } from '@/sanity/queries/pricing'

function formatPrice(price: number): string {
  return price.toLocaleString('pl-PL')
}

export async function generateMetadata(): Promise<Metadata> {
  let discoveryPrice = defaultStartingPrices.discoveryWorkshopPrice
  try {
    const prices = await sanityFetch<StartingPrices>({ query: startingPricesQuery })
    if (prices?.discoveryWorkshopPrice) {
      discoveryPrice = prices.discoveryWorkshopPrice
    }
  } catch {}

  const priceFormatted = formatPrice(discoveryPrice)

  return {
    title: 'Strategia Strony Internetowej | Syntance',
    description: `Dlaczego strona nie generuje leadów? Bo nie ma strategii. Poznaj 3 fundamenty skutecznej strony: cel biznesowy, buyer persona i UVP. Strategia przedwdrożeniowa od ${priceFormatted} PLN.`,
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
