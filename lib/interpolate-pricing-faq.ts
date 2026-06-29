import type { PricingFaqItem, SimpleFaqQA } from '@/lib/data/faq'
import type { ConfiguratorMinimumPricesNet } from '@/lib/pricing-configurator-minimum'

export const PRICING_FAQ_TOKEN_WEBSITE = '{{WEBSITE_NET}}'
export const PRICING_FAQ_TOKEN_ECOMMERCE = '{{ECOMMERCE_NET}}'
export const PRICING_FAQ_TOKEN_WEBAPP = '{{WEBAPP_NET}}'
export const PRICING_FAQ_TOKEN_DISCOVERY = '{{DISCOVERY_NET}}'

function formatPln(n: number): string {
  return Math.round(n).toLocaleString('pl-PL')
}

function interpolateText(
  text: string,
  mins: ConfiguratorMinimumPricesNet,
  discoveryNet: number,
): string {
  const map: Record<string, string> = {
    [PRICING_FAQ_TOKEN_WEBSITE]: formatPln(mins.websiteNet),
    [PRICING_FAQ_TOKEN_ECOMMERCE]: formatPln(mins.ecommerceNet),
    [PRICING_FAQ_TOKEN_WEBAPP]: formatPln(mins.webappNet),
    [PRICING_FAQ_TOKEN_DISCOVERY]: formatPln(discoveryNet),
  }
  let out = text
  for (const [token, value] of Object.entries(map)) {
    out = out.split(token).join(value)
  }
  return out
}

/** Proste FAQ (wszystkie podstrony oprócz /cennik) — te same tokeny co w bazie cenowej konfiguratora. */
export function interpolateFaqTexts(
  items: SimpleFaqQA[],
  mins: ConfiguratorMinimumPricesNet,
  discoveryNet: number,
): SimpleFaqQA[] {
  return items.map((item) => ({
    question: interpolateText(item.question, mins, discoveryNet),
    answer: interpolateText(item.answer, mins, discoveryNet),
  }))
}

/** W treściach FAQ (Sanity / domyślne) można używać tokenów; podmieniane po stronie serwera. */
export function interpolatePricingFaqItems(
  items: PricingFaqItem[],
  mins: ConfiguratorMinimumPricesNet,
  discoveryNet: number,
): PricingFaqItem[] {
  return items.map((item) => ({
    ...item,
    question: interpolateText(item.question, mins, discoveryNet),
    answer: interpolateText(item.answer, mins, discoveryNet),
  }))
}
