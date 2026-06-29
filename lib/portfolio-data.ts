import {
  PORTFOLIO_CASE_STUDIES,
  type PortfolioCaseStudy,
  type PortfolioCaseStudyInput,
} from '@/lib/portfolio-content'
import { fetchPortfolioItemsFromDb } from '@/lib/db/queries/portfolio'
import type { PortfolioItem } from '@/lib/data/portfolio-types'
import { resolvePortfolioPreviewImage } from '@/lib/portfolio-preview'

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, '').toLowerCase()
}

function mergePortfolioItems(
  base: readonly PortfolioCaseStudyInput[],
  cmsItems: PortfolioItem[],
): PortfolioCaseStudyInput[] {
  const byUrl = new Map(base.map((item) => [normalizeUrl(item.url), { ...item }]))

  for (const cmsItem of cmsItems) {
    const key = normalizeUrl(cmsItem.url)
    const existing = byUrl.get(key)

    if (existing) {
      byUrl.set(key, {
        ...existing,
        id: cmsItem.id,
        name: cmsItem.name,
        logoUrl: cmsItem.logoUrl,
        logoAlt: cmsItem.logoAlt,
        order: cmsItem.order ?? existing.order,
      })
      continue
    }

    byUrl.set(key, {
      id: cmsItem.id,
      name: cmsItem.name,
      url: cmsItem.url,
      domain: new URL(cmsItem.url).hostname.replace(/^www\./, ''),
      type: 'website',
      typeLabel: 'Realizacja',
      description: `Realizacja dla ${cmsItem.name}.`,
      highlights: ['Projekt wdrożony w Next.js'],
      stack: ['Next.js', 'CMS / Magazyn', 'Vercel'],
      order: cmsItem.order ?? 99,
      previewImageFallback: undefined,
      previewImageAlt: `Podgląd realizacji ${cmsItem.name}`,
      logoUrl: cmsItem.logoUrl,
      logoAlt: cmsItem.logoAlt,
    })
  }

  return [...byUrl.values()].sort((a, b) => a.order - b.order)
}

async function withResolvedPreviewImages(
  items: PortfolioCaseStudyInput[],
): Promise<PortfolioCaseStudy[]> {
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      previewImage: await resolvePortfolioPreviewImage({
        url: item.url,
        previewImageFallback: item.previewImageFallback,
      }),
    })),
  )
}

export async function fetchPortfolioItems(): Promise<PortfolioCaseStudy[]> {
  try {
    const cmsItems = await fetchPortfolioItemsFromDb()

    if (!cmsItems.length) {
      return withResolvedPreviewImages([...PORTFOLIO_CASE_STUDIES])
    }

    return withResolvedPreviewImages(mergePortfolioItems(PORTFOLIO_CASE_STUDIES, cmsItems))
  } catch (error) {
    console.error('Error fetching portfolio items:', error)
    return withResolvedPreviewImages([...PORTFOLIO_CASE_STUDIES])
  }
}

export type { PortfolioItem } from '@/lib/data/portfolio-types'
