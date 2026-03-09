import { sanityFetch } from '@/sanity/lib/fetch'
import { startingPricesQuery, defaultStartingPrices, type StartingPrices } from '@/sanity/queries/pricing'
import StrategiaContent from './strategia-content'

async function getDiscoveryPrice(): Promise<number> {
  try {
    const prices = await sanityFetch<StartingPrices>({ query: startingPricesQuery })
    if (prices?.discoveryWorkshopPrice) {
      return prices.discoveryWorkshopPrice
    }
  } catch {}
  return defaultStartingPrices.discoveryWorkshopPrice
}

export default async function StrategiaPage() {
  const discoveryPrice = await getDiscoveryPrice()
  return <StrategiaContent discoveryPrice={discoveryPrice} />
}
