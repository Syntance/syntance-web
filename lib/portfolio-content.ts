import type { PortfolioAdminGallery } from '@/lib/portfolio-admin-gallery'
import type { PortfolioPerformanceReport } from '@/lib/portfolio-performance'

export type PortfolioProjectType = 'website' | 'ecommerce'

export const PORTFOLIO_TYPE_LABELS: Record<PortfolioProjectType, string> = {
  website: 'Strona internetowa',
  ecommerce: 'Sklep internetowy',
}

export function getPortfolioTypeLabel(type: PortfolioProjectType): string {
  return PORTFOLIO_TYPE_LABELS[type]
}

export function getPortfolioTypeDotColor(type: PortfolioProjectType): string {
  return type === 'ecommerce' ? 'oklch(0.72 0.17 162)' : 'oklch(0.72 0.14 250)'
}

export type PortfolioCaseStudyInput = Omit<
  PortfolioCaseStudy,
  'previewImage' | 'caseStudyEnabled' | 'adminGalleryEnabled'
> & {
  previewImage?: string
  previewImageFallback?: string
  caseStudyEnabled?: boolean
  adminGalleryEnabled?: boolean
}

export type PortfolioCaseStudyFlags = {
  caseStudyEnabled: boolean
  adminGalleryEnabled: boolean
}

export type PortfolioCaseStudy = {
  id: string
  name: string
  url: string
  domain: string
  type: PortfolioProjectType
  typeLabel: string
  description: string
  highlights: readonly string[]
  stack: readonly string[]
  order: number
  previewImage: string
  previewImageAlt: string
  previewImageFallback?: string
  logoUrl?: string
  logoAlt?: string
  problemStatement?: string
  rebuildContext?: string
  performance?: PortfolioPerformanceReport
  adminGallery?: PortfolioAdminGallery
  caseStudyEnabled: boolean
  adminGalleryEnabled: boolean
}

const PORTFOLIO_SEED_FLAGS: Record<string, PortfolioCaseStudyFlags> = {
  'lumine-concept': { caseStudyEnabled: true, adminGalleryEnabled: false },
  retrohouse: { caseStudyEnabled: false, adminGalleryEnabled: false },
}

export function getPortfolioSeedFlags(id: string): PortfolioCaseStudyFlags {
  return PORTFOLIO_SEED_FLAGS[id] ?? { caseStudyEnabled: true, adminGalleryEnabled: false }
}

const LUMINE_PERFORMANCE: PortfolioPerformanceReport = {
  source: 'Google PageSpeed Insights',
  intro:
    'stan po migracji z WordPress na headless (Next.js + Medusa). Porównanie przed wdrożeniem optymalizacji i po publikacji nowego stacku.',
  before: {
    mobile: {
      measuredAt: '7 cze 2026',
      metrics: {
        performance: 59,
        accessibility: 86,
        bestPractices: 96,
        seo: 92,
        fcp: '4,4 s',
        lcp: '16,1 s',
        tbt: '0 ms',
        speedIndex: '8,4 s',
        cls: '0',
      },
      screenshot: '/portfolio/lumine-concept/pagespeed-mobile-before.png',
      screenshotAlt: 'PageSpeed Insights mobile — Lumine Concept przed optymalizacją, wynik 59',
    },
    desktop: {
      measuredAt: '7 cze 2026',
      metrics: {
        performance: 85,
        accessibility: 86,
        bestPractices: 96,
        seo: 92,
        fcp: '0,7 s',
        lcp: '2,6 s',
        tbt: '0 ms',
        speedIndex: '1,5 s',
        cls: '0',
      },
      screenshot: '/portfolio/lumine-concept/pagespeed-desktop-before.png',
      screenshotAlt: 'PageSpeed Insights desktop — Lumine Concept przed optymalizacją, wynik 85',
    },
  },
  after: {
    mobile: {
      measuredAt: '29 cze 2026',
      metrics: {
        performance: 95,
        accessibility: 100,
        bestPractices: 100,
        seo: 100,
        fcp: '1,1 s',
        lcp: '2,5 s',
        tbt: '40 ms',
        speedIndex: '2,8 s',
        cls: '0,083',
      },
      screenshot: '/portfolio/lumine-concept/pagespeed-mobile-after.png',
      screenshotAlt: 'PageSpeed Insights mobile — Lumine Concept po optymalizacji, wynik 95',
    },
    desktop: {
      measuredAt: '29 cze 2026',
      metrics: {
        performance: 99,
        accessibility: 100,
        bestPractices: 100,
        seo: 100,
        fcp: '0,3 s',
        lcp: '0,8 s',
        tbt: '30 ms',
        speedIndex: '1,1 s',
        cls: '0',
      },
      screenshot: '/portfolio/lumine-concept/pagespeed-desktop-after.png',
      screenshotAlt: 'PageSpeed Insights desktop — Lumine Concept po optymalizacji, wynik 99',
    },
  },
  improvements: [
    'Przebudowa ze sklepu WordPress (WooCommerce) na headless: Next.js + Medusa + własny CMS i Syntance Shop do zarządzania sklepem.',
    'Priorytetyzacja LCP — hero i obrazy produktów ładują się od razu, bez 16 s oczekiwania na mobile.',
    'Headless front + optymalizacja assetów — mniejszy JS, formaty WebP/AVIF, lazy load poza viewportem.',
    'Fonty i third-party pod kontrolą — mniej blokowania wątku głównego, stabilny layout (CLS ≈ 0).',
  ],
}

const LUMINE_ADMIN_GALLERY: PortfolioAdminGallery = {
  intro:
    'Własny panel administracyjny Lumine Concept — produkty, zamówienia i treści sklepu w jednym miejscu, bez ciężkiego WordPress admin i wtyczek WooCommerce.',
  highlights: [
    'Zarządzanie katalogiem produktów i zamówieniami sklepu beauty',
    'Edycja treści podstron i FAQ bez deployu frontu',
    'Headless stack — panel nie obciąża frontu sklepu ani Core Web Vitals',
  ],
  groups: [
    {
      id: 'sklep',
      label: 'Panel sklepu',
      description:
        'Operacje sklepu Lumine Concept: produkty, zamówienia i ustawienia — zamiast panelu WordPress/WooCommerce.',
      screenshots: [
        {
          placeholder: true,
          alt: 'Panel sklepu Lumine Concept — widok główny (placeholder)',
          caption: 'Przegląd panelu',
        },
        {
          placeholder: true,
          alt: 'Panel sklepu Lumine Concept — katalog produktów (placeholder)',
          caption: 'Produkty i zamówienia',
        },
      ],
    },
    {
      id: 'cms',
      label: 'Treści sklepu',
      description:
        'Treści podstron i FAQ sklepu Lumine — edycja w panelu, publikacja od razu na headless front (Next.js).',
      screenshots: [
        {
          placeholder: true,
          alt: 'Panel treści Lumine Concept — FAQ sklepu (placeholder)',
          caption: 'FAQ sklepu',
        },
        {
          placeholder: true,
          alt: 'Panel treści Lumine Concept — podstrony (placeholder)',
          caption: 'Podstrony i content',
        },
      ],
    },
  ],
}

export const PORTFOLIO_CASE_STUDIES: readonly PortfolioCaseStudyInput[] = [
  {
    id: 'lumine-concept',
    name: 'Lumine Concept',
    url: 'https://lumineconcept.pl',
    domain: 'lumineconcept.pl',
    type: 'ecommerce',
    typeLabel: 'Sklep internetowy',
    description:
      'Przebudowa sklepu z WordPress na Next.js + Medusa — salon beauty z logo 3D, tabliczkami z plexi i sprzedażą online w spójnej, premium identyfikacji marki.',
    rebuildContext:
      'Migracja z WordPress (WooCommerce) na stack headless: Next.js, Medusa, własny CMS treści oraz Syntance Shop — panel do zarządzania produktami, treściami i sklepem bez wtyczek.',
    problemStatement:
      'Sklep działał na WordPressie — wolny mobile (LCP 16 s, PageSpeed 59), ciężki front wtyczkowy i ograniczenia WooCommerce przy rozwoju marki premium. Celem była pełna przebudowa na Next.js + Medusa z własnym CMS i modułem zarządzania sklepem, bez utraty estetyki salonu.',
    performance: LUMINE_PERFORMANCE,
    adminGallery: LUMINE_ADMIN_GALLERY,
    highlights: [
      'Przebudowa WordPress → Next.js + Medusa (headless e-commerce)',
      'Własny CMS treści + Syntance Shop (produkty, zamówienia, content)',
      'Sklep w estetyce marki salonu — layout pod konwersję',
      'Spójna identyfikacja wizualna (logo 3D, plexi)',
    ],
    stack: [
      'Next.js',
      'Medusa',
      'Własny CMS',
      'Syntance Shop',
      'Vercel',
      'R2',
    ],
    order: 1,
    previewImageFallback: '/portfolio/lumine-concept-preview.webp',
    previewImageAlt:
      'Podgląd strony Lumine Concept — sklep beauty z logo 3D i sprzedażą online',
  },
  {
    id: 'retrohouse',
    name: 'RetroHouse',
    url: 'https://sklep-retrohouse.pl',
    domain: 'sklep-retrohouse.pl',
    type: 'ecommerce',
    typeLabel: 'Sklep internetowy',
    description:
      'Sklep z antykami i vintage prosto z Wiednia — katalog kategorii (porcelana, szkło, meble), sprzedaż online i lokal w Nowym Targu.',
    highlights: [
      'Katalog produktów z kategoriami premium',
      'Formularz kontaktu i obsługa zapytań B2B',
      'Architektura pod skalowanie kolekcji',
    ],
    stack: [
      'Next.js',
      'Medusa',
      'Syntance CMS / Shop',
      'Zarządzanie produktami',
      'Vercel',
      'R2',
    ],
    order: 2,
    previewImageFallback: '/portfolio/retrohouse-preview.webp',
    previewImageAlt:
      'Podgląd sklepu RetroHouse — antyki i vintage z Wiednia, katalog i blog',
  },
] as const

export function getPortfolioCaseStudyInput(id: string): PortfolioCaseStudyInput | undefined {
  return PORTFOLIO_CASE_STUDIES.find((item) => item.id === id)
}

export function listPortfolioCaseStudyIds(): string[] {
  return PORTFOLIO_CASE_STUDIES.filter((item) => getPortfolioSeedFlags(item.id).caseStudyEnabled).map(
    (item) => item.id,
  )
}

export function toPortfolioGridItems(
  items: readonly PortfolioCaseStudyInput[],
): Array<{
  id: string
  name: string
  url: string
  logoUrl: string
  logoAlt: string
  order?: number
}> {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    url: item.url,
    logoUrl: item.logoUrl ?? '',
    logoAlt: item.logoAlt ?? item.name,
    order: item.order,
  }))
}
