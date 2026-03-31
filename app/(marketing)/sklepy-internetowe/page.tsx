import { sanityFetch } from '@/sanity/lib/fetch'
import { startingPricesQuery, defaultStartingPrices, type StartingPrices } from '@/sanity/queries/pricing'
import SklepyInternetoweContent from './sklepy-internetowe-client'

async function getEcommerceStartPrice(): Promise<number> {
  try {
    const prices = await sanityFetch<StartingPrices>({ query: startingPricesQuery })
    if (prices?.ecommerceStandardStartPrice) {
      return prices.ecommerceStandardStartPrice
    }
  } catch {}
  return defaultStartingPrices.ecommerceStandardStartPrice
}

export default async function SklepyInternetowePage() {
  const startPrice = await getEcommerceStartPrice()
  return <SklepyInternetoweContent startPrice={startPrice} />
}
