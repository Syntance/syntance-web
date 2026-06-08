export const PRICING_REVALIDATE_PATHS = [
  '/',
  '/cennik',
  '/strony-www',
  '/sklepy-internetowe',
  '/strategia-marketingu-i-sprzedazy',
  '/kontakt',
  '/o-nas',
  '/agencje-marketingowe',
  '/api/pricing/start-prices',
] as const

export const PRICING_DOCUMENT_TYPES = new Set([
  'pricingCategory',
  'projectType',
  'pricingItem',
  'pricingConfig',
  'faqSettings',
])

export function shouldRevalidatePricing(documentType: string | undefined): boolean {
  if (!documentType) return true
  return PRICING_DOCUMENT_TYPES.has(documentType)
}
