import { fetchPricingData } from '@/lib/pricing-data'
import { strategiaWorkshopPriceNet } from '@/lib/pricing-calculator'
import { getConfiguratorMinimumPricesNet } from '@/lib/pricing-configurator-minimum'
import { fetchFaqSettings, resolveSklepyFaq } from '@/lib/faq-data'
import SklepyInternetoweContent from './sklepy-internetowe-client'

export default async function SklepyInternetowePage() {
  const [data, faqDoc] = await Promise.all([fetchPricingData(), fetchFaqSettings()])
  const mins = getConfiguratorMinimumPricesNet(data)
  const discoveryNet = strategiaWorkshopPriceNet(data)
  const faqItems = resolveSklepyFaq(faqDoc, mins, discoveryNet)
  return <SklepyInternetoweContent startPrice={mins.ecommerceNet} faqItems={faqItems} />
}
