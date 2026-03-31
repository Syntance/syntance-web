import { Metadata } from 'next'
import {
  getStartingPrices,
  formatPricePln,
} from '@/lib/sanity-starting-prices'
import StronyWWWClient from './strony-www-client'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const prices = await getStartingPrices()
  const formatted = formatPricePln(prices.websiteStartPrice)
  return {
    description: `Tworzymy profesjonalne strony internetowe dla firm B2B. Next.js, PageSpeed 90+, strategia przed kodem. Strony od ${formatted} PLN. Bezpłatna wycena →`,
    openGraph: {
      description: `Profesjonalne strony www w Next.js z gwarancją PageSpeed 90+. Strategia przed kodem. Strony od ${formatted} PLN.`,
    },
  }
}

export default async function StronyWWWPage() {
  const { websiteStartPrice } = await getStartingPrices()
  return <StronyWWWClient websiteStartPrice={websiteStartPrice} />
}
