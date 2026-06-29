import { discoveryPriceNetFromConfig } from '@/lib/pricing-calculator'
import { fetchPricingData } from '@/lib/pricing-data'

/** Cena warsztatu strategii z konfiguratora cennika. */
export async function getDiscoveryWorkshopPrice(): Promise<number> {
  const data = await fetchPricingData()
  return discoveryPriceNetFromConfig(data.config)
}
