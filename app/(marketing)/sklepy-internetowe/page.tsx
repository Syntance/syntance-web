import { fetchPricingData } from '@/lib/pricing-data'
import { getConfiguratorMinimumPricesNet } from '@/lib/pricing-configurator-minimum'
import SklepyInternetoweContent from './sklepy-internetowe-client'

export default async function SklepyInternetowePage() {
  const data = await fetchPricingData()
  const { ecommerceNet } = getConfiguratorMinimumPricesNet(data)
  return <SklepyInternetoweContent startPrice={ecommerceNet} />
}
