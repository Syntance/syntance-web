import { cache } from 'react'
import { sanityFetch } from '@/sanity/lib/fetch'
import {
  startingPricesQuery,
  defaultStartingPrices,
  type StartingPrices,
} from '@/sanity/queries/pricing'

async function loadStartingPrices(): Promise<StartingPrices> {
  try {
    const prices = await sanityFetch<Partial<StartingPrices> | null>({
      query: startingPricesQuery,
    })
    if (!prices) {
      return defaultStartingPrices
    }
    return { ...defaultStartingPrices, ...prices }
  } catch {
    return defaultStartingPrices
  }
}

/** Ceny startowe z dokumentu Sanity „Ustawienia cennika” (grupa „Ceny startowe”). */
export const getStartingPrices = cache(loadStartingPrices)

export function formatPricePln(amount: number): string {
  return amount.toLocaleString('pl-PL')
}
