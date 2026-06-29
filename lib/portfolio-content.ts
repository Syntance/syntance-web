import type { PortfolioAdminGallery } from '@/lib/portfolio-admin-gallery'
import type { PortfolioPerformanceReport } from '@/lib/portfolio-performance'

export type PortfolioProjectType = 'website' | 'ecommerce'

export function getPortfolioTypeDotColor(type: PortfolioProjectType): string {
  return type === 'ecommerce' ? 'oklch(0.72 0.17 162)' : 'oklch(0.72 0.14 250)'
}

export type PortfolioCaseStudyInput = Omit<PortfolioCaseStudy, 'previewImage'> & {
  previewImage?: string
  previewImageFallback?: string
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
}

const LUMINE_PERFORMANCE: PortfolioPerformanceReport = {
  source: 'Google PageSpeed Insights',
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
    'Przebudowa ze sklepu WordPress (WooCommerce) na headless: Next.js + Medusa + własny CMS i moduł Magazyn do zarządzania sklepem.',
    'Priorytetyzacja LCP — hero i obrazy produktów ładują się od razu, bez 16 s oczekiwania na mobile.',
    'Headless front + optymalizacja assetów — mniejszy JS, formaty WebP/AVIF, lazy load poza viewportem.',
    'Fonty i third-party pod kontrolą — mniej blokowania wątku głównego, stabilny layout (CLS ≈ 0).',
  ],
}

const LUMINE_ADMIN_GALLERY: PortfolioAdminGallery = {
  intro:
    'Zamiast ciężkiego WordPress admin i wtyczek WooCommerce — jeden panel Magazyn do sklepu, treści i konfiguracji. CMS podstron i FAQ bez edytora bloków.',
  highlights: [
    'Magazyn: cennik, SEO, e-maile transakcyjne i ustawienia w jednym miejscu',
    'CMS: FAQ i treści podstron sklepu — edycja bez deployu frontu',
    'Headless stack — panel nie obciąża frontu sklepu ani Core Web Vitals',
  ],
  groups: [
    {
      id: 'magazyn',
      label: 'Moduł Magazyn',
      description:
        'Panel operacyjny sklepu: przegląd, konfigurator cennika, rezerwacje i ustawienia — wdrożony na lumineconcept.pl zamiast WP admin.',
      screenshots: [
        {
          src: '/portfolio/lumine-concept/admin/magazyn-przeglad.png',
          alt: 'Panel Magazyn Lumine Concept — widok przeglądu',
          caption: 'Przegląd panelu',
        },
        {
          src: '/portfolio/lumine-concept/admin/magazyn-cennik.png',
          alt: 'Panel Magazyn Lumine Concept — konfigurator cennika',
          caption: 'Cennik i konfigurator',
        },
      ],
    },
    {
      id: 'cms',
      label: 'CMS treści',
      description:
        'Treści podstron i FAQ sklepu — edycja w panelu, publikacja od razu na headless front (Next.js).',
      screenshots: [
        {
          src: '/portfolio/lumine-concept/admin/cms-sklepy.png',
          alt: 'CMS Lumine Concept — FAQ podstrony Sklepy internetowe',
          caption: 'FAQ — Sklepy internetowe',
        },
        {
          src: '/portfolio/lumine-concept/admin/cms-portfolio.png',
          alt: 'CMS Lumine Concept — zarządzanie portfolio realizacji',
          caption: 'Portfolio realizacji',
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
      'Migracja z WordPress (WooCommerce) na stack headless: Next.js, Medusa, własny CMS treści oraz moduł Magazyn — panel do zarządzania produktami, treściami i sklepem bez wtyczek.',
    problemStatement:
      'Sklep działał na WordPressie — wolny mobile (LCP 16 s, PageSpeed 59), ciężki front wtyczkowy i ograniczenia WooCommerce przy rozwoju marki premium. Celem była pełna przebudowa na Next.js + Medusa z własnym CMS i modułem zarządzania sklepem, bez utraty estetyki salonu.',
    performance: LUMINE_PERFORMANCE,
    adminGallery: LUMINE_ADMIN_GALLERY,
    highlights: [
      'Przebudowa WordPress → Next.js + Medusa (headless e-commerce)',
      'Własny CMS treści + moduł Magazyn (produkty, zamówienia, content)',
      'Sklep w estetyce marki salonu — layout pod konwersję',
      'Spójna identyfikacja wizualna (logo 3D, plexi)',
    ],
    stack: [
      'Next.js',
      'Medusa',
      'Własny CMS',
      'Moduł Magazyn',
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
      'CMS / Magazyn',
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
  return PORTFOLIO_CASE_STUDIES.map((item) => item.id)
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
