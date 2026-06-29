import { fetchPricingData as fetchPricingDataFromDb } from '@/lib/db/queries/pricing'
import { defaultPricingData, type PricingData } from '@/lib/data/pricing'

export type {
  PricingCategory,
  ProjectType,
  PricingItem,
  PricingConfig,
  PricingData,
  StartingPrices,
  ProjectTypeBundleRow,
} from '@/lib/data/pricing'

export { defaultPricingData, defaultStartingPrices } from '@/lib/data/pricing'

export async function fetchPricingData(): Promise<PricingData> {
  try {
    const data = await fetchPricingDataFromDb()
    if (!data?.categories?.length || !data?.projectTypes?.length) {
      return defaultPricingData
    }
    return {
      ...data,
      config: { ...defaultPricingData.config, ...(data.config ?? {}) },
    }
  } catch (error) {
    console.error('fetchPricingData:', error)
    return defaultPricingData
  }
}
