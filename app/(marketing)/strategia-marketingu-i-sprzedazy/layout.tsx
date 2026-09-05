import { Metadata } from 'next'
import { pageSocialMetadata } from '@/lib/seo'
import { getDiscoveryWorkshopPrice } from '@/lib/pricing-discovery'

function formatPrice(price: number): string {
  return price.toLocaleString('pl-PL')
}

const SHORT =
  'Strategia marketingu i sprzedaży — fundament pod skuteczną stronę. Zakończona gotowym dokumentem strategicznym.'

export async function generateMetadata(): Promise<Metadata> {
  const workshopPrice = await getDiscoveryWorkshopPrice()
  const priceFormatted = formatPrice(workshopPrice)

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
    ...pageSocialMetadata({
      path: '/strategia-marketingu-i-sprzedazy',
      title: 'Strategia marketingu i sprzedaży | Syntance',
      description: SHORT,
    }),
  }
}

export default function StrategiaMarketinguLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
