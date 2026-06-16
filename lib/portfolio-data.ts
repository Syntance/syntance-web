import { sanityFetch } from '@/sanity/lib/fetch'
import {
  PORTFOLIO_CASE_STUDIES,
  type PortfolioCaseStudy,
} from '@/lib/portfolio-content'
import {
  portfolioItemsQuery,
  type PortfolioItem,
} from '@/sanity/queries/portfolio'

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, '').toLowerCase()
}

function mergePortfolioItems(
  base: readonly PortfolioCaseStudy[],
  cmsItems: PortfolioItem[],
): PortfolioCaseStudy[] {
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
      stack: ['Next.js'],
      order: cmsItem.order ?? 99,
      logoUrl: cmsItem.logoUrl,
      logoAlt: cmsItem.logoAlt,
    })
  }

  return [...byUrl.values()].sort((a, b) => a.order - b.order)
}

export async function fetchPortfolioItems(): Promise<PortfolioCaseStudy[]> {
  try {
    const cmsItems = await sanityFetch<PortfolioItem[]>({
      query: portfolioItemsQuery,
      tags: ['portfolio'],
    })

    if (!cmsItems?.length) {
      return [...PORTFOLIO_CASE_STUDIES]
    }

    return mergePortfolioItems(PORTFOLIO_CASE_STUDIES, cmsItems)
  } catch (error) {
    console.error('Error fetching portfolio items:', error)
    return [...PORTFOLIO_CASE_STUDIES]
  }
}
