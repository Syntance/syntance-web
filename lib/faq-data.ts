import { sanityFetch } from '@/sanity/lib/fetch'
import type { PricingFaqItem, SimpleFaqQA, FaqSettingsDocument } from '@/sanity/queries/faq'
import {
  faqSettingsQuery,
  normalizePricingFaqItems,
  normalizeSimpleFaq,
  defaultFaqItems,
  defaultFaqStronyWww,
  defaultFaqSklepy,
  defaultFaqStrategia,
  defaultFaqONas,
  defaultFaqKontakt,
  defaultFaqAgencje,
} from '@/sanity/queries/faq'
import type { ConfiguratorMinimumPricesNet } from '@/lib/pricing-configurator-minimum'
import { interpolateFaqTexts, interpolatePricingFaqItems } from '@/lib/interpolate-pricing-faq'

export async function fetchFaqSettings(): Promise<FaqSettingsDocument | null> {
  try {
    const doc = await sanityFetch<FaqSettingsDocument | null>({
      query: faqSettingsQuery,
      tags: ['faq'],
    })
    return doc
  } catch (error) {
    console.error('Error fetching FAQ settings:', error)
    return null
  }
}

/** /cennik — z zakładki „FAQ Cennika” w CMS (fallback: defaultFaqItems). */
export function resolveCennikFaqItems(
  doc: FaqSettingsDocument | null,
  mins: ConfiguratorMinimumPricesNet,
  discoveryNet: number,
): PricingFaqItem[] {
  const fromCms = normalizePricingFaqItems(doc?.faqCennik)
  const base = fromCms.length > 0 ? fromCms : defaultFaqItems
  return interpolatePricingFaqItems(base, mins, discoveryNet)
}

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

type FaqSimpleKey = 'faqStronyWww' | 'faqSklepy' | 'faqStrategia' | 'faqONas' | 'faqKontakt' | 'faqAgencje'

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
