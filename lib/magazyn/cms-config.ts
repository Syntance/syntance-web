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

export type CmsModuleId = 'faq' | 'tresci'

export type CmsContentPageId = 'portfolio' | 'stack-badges'

export type CmsPageId = CmsFaqPageId | CmsContentPageId

export type CmsFaqPageDef = {
  id: CmsFaqPageId
  label: string
  path: string
  faqKey: keyof FaqSettingsDocument
  pricing?: boolean
}

export type CmsContentPageDef = {
  id: CmsContentPageId
  label: string
  path: string
}

export type CmsPortfolioPageDef = CmsContentPageDef & { id: 'portfolio' }

export type CmsPageDef = CmsFaqPageDef | CmsContentPageDef

export function isPortfolioPage(page: CmsPageDef): page is CmsPortfolioPageDef {
  return page.id === 'portfolio'
}

export const CMS_MODULES: Array<{ id: CmsModuleId; label: string }> = [
  { id: 'faq', label: 'FAQ' },
  { id: 'tresci', label: 'Treści' },
]

export const CMS_FAQ_PAGES: CmsFaqPageDef[] = [
  { id: 'home', label: 'Strona główna', path: '/', faqKey: 'faqHome' },
  { id: 'cennik', label: 'Cennik', path: '/cennik', faqKey: 'faqCennik', pricing: true },
  { id: 'strony-www', label: 'Strony WWW', path: '/strony-www', faqKey: 'faqStronyWww' },
  { id: 'sklepy', label: 'Sklepy internetowe', path: '/sklepy-internetowe', faqKey: 'faqSklepy' },
  { id: 'strategia', label: 'Strategia', path: '/strategia-marketingu-i-sprzedazy', faqKey: 'faqStrategia' },
  { id: 'o-nas', label: 'O nas', path: '/o-nas', faqKey: 'faqONas' },
  { id: 'kontakt', label: 'Kontakt', path: '/kontakt', faqKey: 'faqKontakt' },
  { id: 'agencje', label: 'Agencje', path: '/agencje-marketingowe', faqKey: 'faqAgencje' },
]

export const CMS_CONTENT_PAGES: CmsContentPageDef[] = [
  { id: 'portfolio', label: 'Portfolio', path: '/portfolio' },
  { id: 'stack-badges', label: 'Badge technologii', path: '/' },
]

/** @deprecated Użyj CMS_FAQ_PAGES lub CMS_CONTENT_PAGES */
export const CMS_PAGES: CmsPageDef[] = [...CMS_FAQ_PAGES, ...CMS_CONTENT_PAGES]

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
