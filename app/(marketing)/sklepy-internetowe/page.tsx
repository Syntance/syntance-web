import { Metadata } from 'next'
import {
  getStartingPrices,
  formatPricePln,
} from '@/lib/sanity-starting-prices'
import SklepyInternetoweClient from './sklepy-internetowe-client'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const prices = await getStartingPrices()
  const formatted = formatPricePln(prices.ecommerceStandardStartPrice)
  return {
    description: `Budujemy sklepy internetowe w architekturze headless. MedusaJS, Next.js, zero prowizji. Sklepy od ${formatted} PLN. Wycena w 24h →`,
    openGraph: {
      description: `Budujemy sklepy e-commerce w architekturze headless. Zero prowizji, pełna kontrola. Sklepy od ${formatted} PLN.`,
    },
  }
}

export default async function SklepyInternetowePage() {
  const { ecommerceStandardStartPrice, ecommerceProStartPrice } =
    await getStartingPrices()
  return (
    <SklepyInternetoweClient
      ecommerceStandardStartPrice={ecommerceStandardStartPrice}
      ecommerceProStartPrice={ecommerceProStartPrice}
    />
  )
}
