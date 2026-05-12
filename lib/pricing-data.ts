import { sanityFetch } from '@/sanity/lib/fetch'
import {
  pricingDataQuery,
  defaultPricingData,
  type PricingData,
} from '@/sanity/queries/pricing'

/** Pełne dane cennika do kalkulacji jak w konfiguratorze (z cache tagiem pricing). */
export async function fetchPricingData(): Promise<PricingData> {
  try {
    const data = await sanityFetch<PricingData>({
      query: pricingDataQuery,
      tags: ['pricing'],
    })
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
