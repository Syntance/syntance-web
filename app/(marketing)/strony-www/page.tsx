import { fetchPricingData } from '@/lib/pricing-data'
import { getConfiguratorMinimumPricesNet } from '@/lib/pricing-configurator-minimum'
import StronyWWWContent from './strony-www-client'

export default async function StronyWWWPage() {
  const data = await fetchPricingData()
  const { websiteNet } = getConfiguratorMinimumPricesNet(data)
  return <StronyWWWContent startPrice={websiteNet} />
}
