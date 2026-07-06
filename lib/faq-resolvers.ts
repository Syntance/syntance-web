import type { ConfiguratorMinimumPricesNet } from '@/lib/pricing-configurator-minimum'
import { interpolateFaqTexts, interpolatePricingFaqItems } from '@/lib/interpolate-pricing-faq'
import type { FaqSettingsDocument, PricingFaqItem, SimpleFaqQA } from '@/lib/data/faq'
import {
  defaultFaqItems,
  defaultFaqStronyWww,
  defaultFaqSklepy,
  defaultFaqStrategia,
  defaultFaqONas,
  defaultFaqKontakt,
  defaultFaqAgencje,
  defaultFaqHome,
  normalizePricingFaqItems,
  normalizeSimpleFaq,
} from '@/lib/data/faq'

export function resolveCennikFaqItems(
  doc: FaqSettingsDocument | null,
  mins: ConfiguratorMinimumPricesNet,
  discoveryNet: number,
): PricingFaqItem[] {
  const fromCms = normalizePricingFaqItems(doc?.faqCennik)
  const base = fromCms.length > 0 ? fromCms : defaultFaqItems
  return interpolatePricingFaqItems(base, mins, discoveryNet)
}

type FaqSimpleKey = 'faqHome' | 'faqStronyWww' | 'faqSklepy' | 'faqStrategia' | 'faqONas' | 'faqKontakt' | 'faqAgencje'

function resolveSimple(
  cmsList: FaqSettingsDocument[FaqSimpleKey],
  fallback: SimpleFaqQA[],
  mins: ConfiguratorMinimumPricesNet,
  discoveryNet: number,
): SimpleFaqQA[] {
  const fromCms = normalizeSimpleFaq(cmsList)
  const base = fromCms.length > 0 ? fromCms : fallback
  return interpolateFaqTexts(base, mins, discoveryNet)
}

export function resolveStronyWwwFaq(
  doc: FaqSettingsDocument | null,
  mins: ConfiguratorMinimumPricesNet,
  discoveryNet: number,
): SimpleFaqQA[] {
  return resolveSimple(doc?.faqStronyWww, defaultFaqStronyWww, mins, discoveryNet)
}

export function resolveSklepyFaq(
  doc: FaqSettingsDocument | null,
  mins: ConfiguratorMinimumPricesNet,
  discoveryNet: number,
): SimpleFaqQA[] {
  return resolveSimple(doc?.faqSklepy, defaultFaqSklepy, mins, discoveryNet)
}

export function resolveStrategiaFaq(
  doc: FaqSettingsDocument | null,
  mins: ConfiguratorMinimumPricesNet,
  discoveryNet: number,
): SimpleFaqQA[] {
  return resolveSimple(doc?.faqStrategia, defaultFaqStrategia, mins, discoveryNet)
}

export function resolveONasFaq(
  doc: FaqSettingsDocument | null,
  mins: ConfiguratorMinimumPricesNet,
  discoveryNet: number,
): SimpleFaqQA[] {
  return resolveSimple(doc?.faqONas, defaultFaqONas, mins, discoveryNet)
}

export function resolveKontaktFaq(
  doc: FaqSettingsDocument | null,
  mins: ConfiguratorMinimumPricesNet,
  discoveryNet: number,
): SimpleFaqQA[] {
  return resolveSimple(doc?.faqKontakt, defaultFaqKontakt, mins, discoveryNet)
}

export function resolveAgencjeFaq(
  doc: FaqSettingsDocument | null,
  mins: ConfiguratorMinimumPricesNet,
  discoveryNet: number,
): SimpleFaqQA[] {
  return resolveSimple(doc?.faqAgencje, defaultFaqAgencje, mins, discoveryNet)
}

/** FAQ strony głównej — edycja w Magazyn → CMS → Strona główna. */
export function resolveHomeFaq(
  doc: FaqSettingsDocument | null,
  mins: ConfiguratorMinimumPricesNet,
  discoveryNet: number,
): SimpleFaqQA[] {
  return resolveSimple(doc?.faqHome, defaultFaqHome, mins, discoveryNet)
}
