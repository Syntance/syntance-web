import type { PricingFaqItem } from '@/sanity/queries/faq'
import type { ConfiguratorMinimumPricesNet } from '@/lib/pricing-configurator-minimum'

export const PRICING_FAQ_TOKEN_WEBSITE = '{{WEBSITE_NET}}'
export const PRICING_FAQ_TOKEN_ECOMMERCE = '{{ECOMMERCE_NET}}'
export const PRICING_FAQ_TOKEN_WEBAPP = '{{WEBAPP_NET}}'
export const PRICING_FAQ_TOKEN_DISCOVERY = '{{DISCOVERY_NET}}'

function formatPln(n: number): string {
  return Math.round(n).toLocaleString('pl-PL')
}

/** W treściach FAQ (Sanity / domyślne) można używać tokenów; podmieniane po stronie serwera. */
export function interpolatePricingFaqItems(
  items: PricingFaqItem[],
  mins: ConfiguratorMinimumPricesNet,
  discoveryNet: number,
): PricingFaqItem[] {
  const map: Record<string, string> = {
    [PRICING_FAQ_TOKEN_WEBSITE]: formatPln(mins.websiteNet),
    [PRICING_FAQ_TOKEN_ECOMMERCE]: formatPln(mins.ecommerceNet),
    [PRICING_FAQ_TOKEN_WEBAPP]: formatPln(mins.webappNet),
    [PRICING_FAQ_TOKEN_DISCOVERY]: formatPln(discoveryNet),
  }

  const run = (text: string): string => {
    let out = text
    for (const [token, value] of Object.entries(map)) {
      out = out.split(token).join(value)
    }
    return out
  }

  return items.map((item) => ({
    ...item,
    question: run(item.question),
    answer: run(item.answer),
  }))
}
