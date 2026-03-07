import { sanityFetch } from '@/sanity/lib/fetch'
import { startingPricesQuery, defaultStartingPrices, type StartingPrices } from '@/sanity/queries/pricing'
import StrategiaContent from './strategia-content'

async function getStrategyPrice(): Promise<number> {
  try {
    const prices = await sanityFetch<StartingPrices>({ query: startingPricesQuery })
    return prices?.discoveryWorkshopPrice || defaultStartingPrices.discoveryWorkshopPrice
  } catch {
    return defaultStartingPrices.discoveryWorkshopPrice
  }
}

export default async function StrategiaPage() {
  const strategyPrice = await getStrategyPrice()
  return <StrategiaContent strategyPrice={strategyPrice} />
}
