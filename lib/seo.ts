import { cache } from 'react'
import type { Metadata } from 'next'
import {
  getSeoSettings as getSeoSettingsFromDb,
  getPageSeo,
  mergeSeoSettings,
} from '@/lib/db/queries/seo'
import { defaultSeo } from '@/lib/data/seo-defaults'
import { legalEntityLabel } from '@/lib/data/legal-entity'
import type { PageSeo, SeoSettings } from '@/lib/data/seo-types'
import { fetchPricingData } from '@/lib/pricing-data'
import { getConfiguratorMinimumPricesNet } from '@/lib/pricing-configurator-minimum'
import { strategiaWorkshopPriceNet } from '@/lib/pricing-calculator'
import { interpolateText } from '@/lib/interpolate-pricing-faq'

export type { PageSeo, SeoSettings }
export { defaultSeo }

/**
 * `cache()` deduplikuje w obrebie jednego requestu: root layout, generateMetadata
 * i pageMetadata pytaly o te same ustawienia trzy razy.
 */
export const getSeoSettings = cache(async function getSeoSettings(): Promise<SeoSettings> {
  return getSeoSettingsFromDb()
})

const getPageSeoCached = cache(async function getPageSeoCached(slug: string): Promise<PageSeo | null> {
  return getPageSeo(slug)
})

export { getPageSeo, mergeSeoSettings }

export async function generateSeoMetadata(pathname?: string): Promise<Metadata> {
  const globalSeo = await getSeoSettings()

  let pageSeo: PageSeo | null = null
  if (pathname) {
    const slug = pathname === '/' ? '/' : pathname.replace(/\/$/, '')
    pageSeo = await getPageSeo(slug)
  }

  const seo = mergeSeoSettings(globalSeo, pageSeo)
  const ogImageUrl = seo.ogImage?.asset?.url || seo.ogImageUrl || defaultSeo.ogImageUrl
  const isSquareOgImage = /sygnet|logo/i.test(ogImageUrl ?? '')
  const ogImageWidth = seo.ogImage?.asset?.metadata?.dimensions?.width ?? 1200
  const ogImageHeight = seo.ogImage?.asset?.metadata?.dimensions?.height ?? (isSquareOgImage ? 1200 : 630)

  return {
    metadataBase: new URL(seo.canonicalUrl || 'https://syntance.com'),
    title: {
      default: seo.metaTitle,
      template: seo.metaTitleTemplate,
    },
    description: seo.metaDescription,
    keywords: seo.keywords,
    authors: [{ name: seo.organizationName, url: seo.canonicalUrl }],
    creator: seo.organizationName,
    publisher: legalEntityLabel,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: seo.ogTitle || seo.metaTitle,
      description: seo.ogDescription || seo.metaDescription,
      url: seo.canonicalUrl,
      siteName: seo.organizationName,
      images: [
        {
          url: ogImageUrl!,
          width: ogImageWidth,
          height: ogImageHeight,
          alt: seo.ogImage?.alt || seo.ogTitle || seo.metaTitle,
        },
      ],
      locale: 'pl_PL',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.twitterTitle || seo.ogTitle || seo.metaTitle,
      description: seo.twitterDescription || seo.ogDescription || seo.metaDescription,
      images: [
        {
          url: ogImageUrl!,
          alt: seo.twitterImageAlt || seo.ogImage?.alt || seo.metaTitle,
        },
      ],
    },
    alternates: {
      // Ścieżka wzgledna: Next.js rozwija ja wzgledem metadataBase ORAZ biezacej trasy.
      // Absolutny seo.canonicalUrl ustawial tu canonical strony glownej na KAZDEJ
      // podstronie, ktora nie nadpisala `alternates` — czyli jawna deklaracje
      // "to duplikat home" dla Google. Domena nadal pochodzi z panelu (metadataBase).
      canonical: './',
    },
    category: 'technology',
  }
}

const SITE_URL = defaultSeo.canonicalUrl
const OG_IMAGE_WIDTH = 1200
const OG_IMAGE_HEIGHT = 630
const TOKEN_RE = /\{\{[A-Z_]+\}\}/

export type PageMetadataInput = {
  /** Sciezka bez domeny, np. '/cennik'. Strona glowna: '/'. Zarazem klucz wiersza w CMS. */
  path: string
  /** Tytul uzywany, gdy CMS nie ma wlasnego. Pelny — marka nie jest doklejana. */
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  imageUrl?: string
  imageAlt?: string
  keywords?: string | string[]
  type?: 'website' | 'article'
  robots?: Metadata['robots']
  languages?: Record<string, string>
}

/** Podstawia tokeny cenowe tylko wtedy, gdy ktorykolwiek tekst faktycznie ich uzywa. */
async function interpolateAll(fields: Record<string, string | undefined>) {
  const needsPricing = Object.values(fields).some((v) => typeof v === 'string' && TOKEN_RE.test(v))
  if (!needsPricing) return fields

  const pricing = await fetchPricingData()
  const mins = getConfiguratorMinimumPricesNet(pricing)
  const discoveryNet = strategiaWorkshopPriceNet(pricing)

  const out: Record<string, string | undefined> = {}
  for (const [key, value] of Object.entries(fields)) {
    out[key] = typeof value === 'string' ? interpolateText(value, mins, discoveryNet) : value
  }
  return out
}

/**
 * Komplet metadanych podstrony, z CMS jako zrodlem prawdy.
 *
 * Priorytet pole po polu: **CMS (Magazyn → SEO → Podstrony) → wartosc z kodu → globalne SEO**.
 * Puste pole w panelu schodzi na wartosc z kodu (patrz `blankToUndefined`), a wylaczenie
 * strony przelacznikiem `isActive` calkowicie pomija CMS dla tej trasy.
 *
 * Teksty z CMS moga uzywac tokenow cenowych ({{WEBSITE_NET}}, {{ECOMMERCE_NET}},
 * {{WEBAPP_NET}}, {{DISCOVERY_NET}}) — te same, co FAQ — wiec redakcja w panelu
 * nie zamraza cen. Dane cenowe pobieramy wylacznie gdy token wystapi.
 *
 * Tytul ustawiamy jako `absolute`, zeby globalny `title.template` nie doklejal marki
 * do tytulu, ktory juz ja zawiera (zrodlo zdublowanego „| Syntance”).
 */
export type ResolvedSeoFields = {
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  twitterTitle?: string
  twitterDescription?: string
  canonical: string
  imageUrl: string
  imageAlt: string
  keywords?: string | string[]
}

/** Puste/bialoznakowe pole z CMS traktujemy jak brak wartosci, nie jak "wyczysc metadana". */
function present(value: string | undefined | null): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

/**
 * Czysta funkcja rozstrzygajaca priorytety — bez I/O, zeby dalo sie ja przetestowac.
 * Kolejnosc: **CMS (wiersz podstrony) → wartosc z kodu → globalne SEO**.
 */
export function resolveSeoFields(
  input: PageMetadataInput,
  globalSeo: SeoSettings,
  pageSeo: PageSeo | null,
): ResolvedSeoFields {
  const slug = input.path === '/' ? '/' : input.path.replace(/\/$/, '')

  const title = present(pageSeo?.metaTitle) ?? input.title ?? globalSeo.metaTitle
  const description =
    present(pageSeo?.metaDescription) ?? input.description ?? globalSeo.metaDescription
  const ogTitle = present(pageSeo?.ogTitle) ?? input.ogTitle ?? input.title ?? globalSeo.ogTitle
  const ogDescription =
    present(pageSeo?.ogDescription) ??
    input.ogDescription ??
    input.description ??
    globalSeo.ogDescription

  const pageKeywords = pageSeo?.keywords?.length ? pageSeo.keywords : undefined

  return {
    title,
    description,
    ogTitle,
    ogDescription,
    // Swiadomie BEZ zejscia na globalne: globalne twitterTitle jest zawsze ustawione,
    // wiec przykrywaloby ogTitle i kazda podstrona wracalaby do tytulu strony glownej.
    twitterTitle: present(pageSeo?.twitterTitle),
    twitterDescription: present(pageSeo?.twitterDescription),
    canonical: present(pageSeo?.canonicalUrl) ?? (slug === '/' ? SITE_URL : `${SITE_URL}${slug}`),
    imageUrl:
      present(pageSeo?.ogImageUrl) ??
      input.imageUrl ??
      globalSeo.ogImageUrl ??
      `${SITE_URL}/og/og-home-1200x630.png`,
    imageAlt: input.imageAlt ?? globalSeo.twitterImageAlt,
    keywords: pageKeywords ?? input.keywords,
  }
}

/**
 * Komplet metadanych podstrony, z CMS jako zrodlem prawdy.
 *
 * Priorytet pole po polu: **CMS (Magazyn → SEO → Podstrony) → wartosc z kodu → globalne SEO**.
 * Puste pole w panelu schodzi na wartosc z kodu, a wylaczenie strony przelacznikiem
 * `isActive` calkowicie pomija CMS dla tej trasy.
 *
 * Teksty z CMS moga uzywac tokenow cenowych ({{WEBSITE_NET}}, {{ECOMMERCE_NET}},
 * {{WEBAPP_NET}}, {{DISCOVERY_NET}}) — tych samych co FAQ — wiec redakcja w panelu
 * nie zamraza cen. Dane cenowe pobieramy wylacznie gdy token faktycznie wystapi.
 *
 * Tytul ustawiamy jako `absolute`, zeby globalny `title.template` nie doklejal marki
 * do tytulu, ktory juz ja zawiera (zrodlo zdublowanego „| Syntance”).
 */
export async function pageMetadata(input: PageMetadataInput): Promise<Metadata> {
  const slug = input.path === '/' ? '/' : input.path.replace(/\/$/, '')
  const [globalSeo, pageSeo] = await Promise.all([getSeoSettings(), getPageSeoCached(slug)])

  const f = resolveSeoFields(input, globalSeo, pageSeo)
  const t = await interpolateAll({
    title: f.title,
    description: f.description,
    ogTitle: f.ogTitle,
    ogDescription: f.ogDescription,
    twitterTitle: f.twitterTitle,
    twitterDescription: f.twitterDescription,
  })

  return {
    title: { absolute: t.title! },
    description: t.description,
    ...(f.keywords && f.keywords.length ? { keywords: f.keywords } : {}),
    ...(input.robots ? { robots: input.robots } : {}),
    alternates: {
      canonical: f.canonical,
      ...(input.languages ? { languages: input.languages } : {}),
    },
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: f.canonical,
      siteName: globalSeo.organizationName,
      locale: 'pl_PL',
      type: input.type ?? 'website',
      images: [
        { url: f.imageUrl, width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT, alt: f.imageAlt },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.twitterTitle ?? t.ogTitle,
      description: t.twitterDescription ?? t.ogDescription,
      images: [{ url: f.imageUrl, alt: f.imageAlt }],
    },
  }
}
