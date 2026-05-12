import { discoveryPriceNetFromConfig } from '@/lib/pricing-calculator'
import { fetchPricingData } from '@/lib/pricing-data'

/**
 * Cena warsztatu strategii z tego samego źródła co `/cennik` — `pricingConfig.discoveryWorkshopPrice`
 * przez `fetchPricingData` + `discoveryPriceNetFromConfig` (bez osobnego zapytania).
 */
export async function getDiscoveryWorkshopPrice(): Promise<number> {
  const data = await fetchPricingData()
  return discoveryPriceNetFromConfig(data.config)
}
