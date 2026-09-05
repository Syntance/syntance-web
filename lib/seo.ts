import type { Metadata } from 'next'
import {
  getSeoSettings as getSeoSettingsFromDb,
  getPageSeo,
  mergeSeoSettings,
} from '@/lib/db/queries/seo'
import { defaultSeo } from '@/lib/data/seo-defaults'
import { legalEntityLabel } from '@/lib/data/legal-entity'
import type { PageSeo, SeoSettings } from '@/lib/data/seo-types'

export type { PageSeo, SeoSettings }
export { defaultSeo }

export async function getSeoSettings(): Promise<SeoSettings> {
  return getSeoSettingsFromDb()
}

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

export type PageSocialInput = {
  /** Sciezka bez domeny, np. '/cennik'. Strona glowna: '/'. */
  path: string
  /** Tytul karty social — zwykle krotszy niz <title>. */
  title: string
  /** Opis karty social. */
  description: string
  /** Wlasny obrazek 1200x630; domyslnie wspolny obrazek marki. */
  imageUrl?: string
  imageAlt?: string
  type?: 'website' | 'article'
}

/**
 * Komplet metadanych social + canonical dla pojedynczej podstrony.
 *
 * Next.js NIE scala zagniezdzonych obiektow metadata: `openGraph`, `twitter`
 * i `alternates` zdefiniowane w podstronie ZASTEPUJA blok z root layoutu w calosci.
 * Podstrona, ktora podala tylko `openGraph: { title, description, url }`, gubila
 * przez to `og:image` (brak podgladu przy udostepnianiu) i zostawala z `twitter:title`
 * strony glownej. Ten helper zwraca komplet z jednego zrodla, wiec nowe podstrony
 * nie moga juz powtorzyc tego bledu.
 */
export function pageSocialMetadata({
  path,
  title,
  description,
  imageUrl = defaultSeo.ogImageUrl ?? `${SITE_URL}/og/og-home-1200x630.png`,
  imageAlt = defaultSeo.twitterImageAlt,
  type = 'website',
}: PageSocialInput): Pick<Metadata, 'openGraph' | 'twitter' | 'alternates'> {
  const url = path === '/' ? SITE_URL : `${SITE_URL}${path}`

  return {
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: defaultSeo.organizationName,
      locale: 'pl_PL',
      type,
      images: [
        { url: imageUrl, width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT, alt: imageAlt },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: imageUrl, alt: imageAlt }],
    },
  }
}
