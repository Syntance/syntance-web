import { sanityFetch } from '@/sanity/lib/fetch'
import { startingPricesQuery, defaultStartingPrices, type StartingPrices } from '@/sanity/queries/pricing'
import StronyWWWContent from './strony-www-client'

async function getWebsiteStartPrice(): Promise<number> {
  try {
    const prices = await sanityFetch<StartingPrices>({ query: startingPricesQuery })
    if (prices?.websiteStartPrice) {
      return prices.websiteStartPrice
    }
  } catch {}
  return defaultStartingPrices.websiteStartPrice
}

export default async function StronyWWWPage() {
  const startPrice = await getWebsiteStartPrice()
  return <StronyWWWContent startPrice={startPrice} />
}
