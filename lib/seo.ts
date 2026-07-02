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
          width: seo.ogImage?.asset?.metadata?.dimensions?.width || 1200,
          height: seo.ogImage?.asset?.metadata?.dimensions?.height || 630,
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
      canonical: seo.canonicalUrl,
    },
    category: 'technology',
  }
}
