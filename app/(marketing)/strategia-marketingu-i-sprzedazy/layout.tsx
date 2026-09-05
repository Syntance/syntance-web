import { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { getDiscoveryWorkshopPrice } from '@/lib/pricing-discovery'

function formatPrice(price: number): string {
  return price.toLocaleString('pl-PL')
}

const SHORT =
  'Strategia marketingu i sprzedaży — fundament pod skuteczną stronę. Zakończona gotowym dokumentem strategicznym.'

export async function generateMetadata(): Promise<Metadata> {
  const workshopPrice = await getDiscoveryWorkshopPrice()
  const priceFormatted = formatPrice(workshopPrice)

  return pageMetadata({
    path: '/strategia-marketingu-i-sprzedazy',
    title: 'Strategia marketingu i sprzedaży (faza przedwdrożeniowa) | Syntance',
    description: `${SHORT} Pełna usługa od ${priceFormatted} PLN netto.`,
    ogTitle: 'Strategia marketingu i sprzedaży | Syntance',
    ogDescription: SHORT,
    keywords: [ 'strategia marketingu i sprzedaży', 'strategia strony internetowej', 'faza przedwdrożeniowa', 'buyer persona', 'UVP', 'strona B2B', ],
  })
}

export default function StrategiaMarketinguLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
