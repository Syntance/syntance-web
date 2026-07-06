import type { FaqPricingCategory, FaqSettingsDocument } from '@/lib/data/faq'

export type CmsFaqPageId =
  | 'home'
  | 'cennik'
  | 'strony-www'
  | 'sklepy'
  | 'strategia'
  | 'o-nas'
  | 'kontakt'
  | 'agencje'

export type CmsPageId = CmsFaqPageId | 'portfolio'

export type CmsFaqPageDef = {
  id: CmsFaqPageId
  label: string
  path: string
  faqKey: keyof FaqSettingsDocument
  pricing?: boolean
}

export type CmsPortfolioPageDef = {
  id: 'portfolio'
  label: string
  path: string
}

export type CmsPageDef = CmsFaqPageDef | CmsPortfolioPageDef

export function isPortfolioPage(page: CmsPageDef): page is CmsPortfolioPageDef {
  return page.id === 'portfolio'
}

export const CMS_PAGES: CmsPageDef[] = [
  { id: 'home', label: 'Strona główna', path: '/', faqKey: 'faqHome' },
  { id: 'cennik', label: 'Cennik', path: '/cennik', faqKey: 'faqCennik', pricing: true },
  { id: 'strony-www', label: 'Strony WWW', path: '/strony-www', faqKey: 'faqStronyWww' },
  { id: 'sklepy', label: 'Sklepy internetowe', path: '/sklepy-internetowe', faqKey: 'faqSklepy' },
  { id: 'strategia', label: 'Strategia', path: '/strategia-marketingu-i-sprzedazy', faqKey: 'faqStrategia' },
  { id: 'o-nas', label: 'O nas', path: '/o-nas', faqKey: 'faqONas' },
  { id: 'kontakt', label: 'Kontakt', path: '/kontakt', faqKey: 'faqKontakt' },
  { id: 'agencje', label: 'Agencje', path: '/agencje-marketingowe', faqKey: 'faqAgencje' },
  { id: 'portfolio', label: 'Portfolio', path: '/portfolio' },
]

export const PRICING_FAQ_SECTIONS: Array<{ id: FaqPricingCategory; label: string }> = [
  { id: 'pricing', label: 'Cennik' },
  { id: 'time', label: 'Czas realizacji' },
  { id: 'trust', label: 'Zaufanie' },
  { id: 'comparison', label: 'Porównanie' },
]

export const SIMPLE_FAQ_SECTION = { id: 'faq', label: 'FAQ' } as const

export const PRICING_FAQ_SECTION_LABELS: Record<FaqPricingCategory, string> = {
  pricing: 'Cennik',
  time: 'Czas realizacji',
  trust: 'Zaufanie',
  comparison: 'Porównanie',
}
