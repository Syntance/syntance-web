import { fetchPricingData } from '@/lib/pricing-data'
import { discoveryPriceNetFromConfig } from '@/lib/pricing-calculator'
import { getConfiguratorMinimumPricesNet } from '@/lib/pricing-configurator-minimum'
import { fetchFaqSettings, resolveStronyWwwFaq } from '@/lib/faq-data'
import StronyWWWContent from './strony-www-client'

export default async function StronyWWWPage() {
  const [data, faqDoc] = await Promise.all([fetchPricingData(), fetchFaqSettings()])
  const mins = getConfiguratorMinimumPricesNet(data)
  const discoveryNet = discoveryPriceNetFromConfig(data.config)
  const faqItems = resolveStronyWwwFaq(faqDoc, mins, discoveryNet)
  return <StronyWWWContent startPrice={mins.websiteNet} faqItems={faqItems} />
}
