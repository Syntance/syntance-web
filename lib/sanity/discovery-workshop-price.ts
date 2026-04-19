import { sanityFetch } from '@/sanity/lib/fetch'
import {
  startingPricesQuery,
  defaultStartingPrices,
  type StartingPrices,
} from '@/sanity/queries/pricing'

/**
 * Cena „Strategii marketingu i sprzedaży” z dokumentu Ustawienia cennika (`pricingConfig`)
 * w Sanity — pole `discoveryWorkshopPrice`.
 */
export async function getDiscoveryWorkshopPrice(): Promise<number> {
  try {
    const prices = await sanityFetch<StartingPrices | null>({ query: startingPricesQuery })
    const raw: unknown = prices?.discoveryWorkshopPrice
    const n =
      typeof raw === 'number'
        ? raw
        : typeof raw === 'string'
          ? Number(raw.replace(/\s/g, ''))
          : NaN
    if (Number.isFinite(n) && n >= 0) {
      return n
    }
  } catch {
    // brak env / sieć / pusty CMS → fallback
  }
  return defaultStartingPrices.discoveryWorkshopPrice
}
