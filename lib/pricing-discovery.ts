import { strategiaWorkshopPriceNet } from '@/lib/pricing-calculator'
import { fetchPricingData } from '@/lib/pricing-data'

/** Cena warsztatu strategii — ta sama pozycja co checkbox w konfiguratorze (`strategia-marketing`). */
export async function getDiscoveryWorkshopPrice(): Promise<number> {
  const data = await fetchPricingData()
  return strategiaWorkshopPriceNet(data)
}
