import {
  PORTFOLIO_CASE_STUDIES,
  getPortfolioCaseStudyInput,
  getPortfolioTypeLabel,
  type PortfolioCaseStudy,
  type PortfolioCaseStudyInput,
  type PortfolioProjectType,
} from '@/lib/portfolio-content'
import {
  fetchPortfolioItemsFromDb,
  getPortfolioItemBySlug,
  listPortfolioSlugsFromDb,
  type PortfolioItemRecord,
} from '@/lib/db/queries/portfolio'
import { hasPerformanceContent } from '@/lib/magazyn/portfolio-performance-cms'
import { resolvePortfolioPreviewImage } from '@/lib/portfolio-preview'

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, '').toLowerCase()
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function recordToCaseStudyInput(record: PortfolioItemRecord): PortfolioCaseStudyInput {
  return {
    id: record.slug,
    name: record.name,
    url: record.url,
    domain: extractDomain(record.url),
    type: record.projectType,
    typeLabel: record.typeLabel || getPortfolioTypeLabel(record.projectType),
    description: record.description,
    highlights: record.highlights,
    stack: record.stack,
    order: record.order,
    previewImageFallback: record.previewImageFallback,
    previewImageAlt: record.previewImageAlt ?? `Podgląd realizacji ${record.name}`,
    logoUrl: record.logoUrl || undefined,
    logoAlt: record.logoAlt || undefined,
    problemStatement: record.problemStatement,
    rebuildContext: record.rebuildContext,
    performance: record.performance ?? undefined,
  }
}

function enrichFromHardcoded(input: PortfolioCaseStudyInput): PortfolioCaseStudyInput {
  const base = PORTFOLIO_CASE_STUDIES.find(
    (item) =>
      item.id === input.id || normalizeUrl(item.url) === normalizeUrl(input.url),
  )
  if (!base) return input

  return {
    ...base,
    ...input,
    performance:
      input.performance && hasPerformanceContent(input.performance)
        ? input.performance
        : base.performance,
    adminGallery: base.adminGallery,
    description: input.description || base.description,
    highlights: input.highlights.length ? input.highlights : base.highlights,
    stack: input.stack.length ? input.stack : base.stack,
    problemStatement: input.problemStatement ?? base.problemStatement,
    rebuildContext: input.rebuildContext ?? base.rebuildContext,
    previewImageFallback: input.previewImageFallback ?? base.previewImageFallback,
    previewImageAlt: input.previewImageAlt || base.previewImageAlt,
    type: input.type ?? base.type,
    typeLabel: input.typeLabel || base.typeLabel,
  }
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
    const dbItems = await fetchPortfolioItemsFromDb()

    if (!dbItems.length) {
      return withResolvedPreviewImages([...PORTFOLIO_CASE_STUDIES])
    }

    const byUrl = new Map<string, PortfolioCaseStudyInput>()

    for (const record of dbItems) {
      const input = enrichFromHardcoded(recordToCaseStudyInput(record))
      byUrl.set(normalizeUrl(input.url), input)
    }

    for (const base of PORTFOLIO_CASE_STUDIES) {
      const key = normalizeUrl(base.url)
      if (!byUrl.has(key)) {
        byUrl.set(key, { ...base })
      }
    }

    const inputs = [...byUrl.values()].sort((a, b) => a.order - b.order)
    return withResolvedPreviewImages(inputs)
  } catch (error) {
    console.error('Error fetching portfolio items:', error)
    return withResolvedPreviewImages([...PORTFOLIO_CASE_STUDIES])
  }
}

export async function fetchPortfolioCaseStudy(slug: string): Promise<PortfolioCaseStudy | null> {
  try {
    const dbItem = await getPortfolioItemBySlug(slug)
    if (dbItem) {
      const input = enrichFromHardcoded(recordToCaseStudyInput(dbItem))
      const [resolved] = await withResolvedPreviewImages([input])
      return resolved ?? null
    }
  } catch (error) {
    console.error('Error fetching portfolio case study from DB:', error)
  }

  const base = getPortfolioCaseStudyInput(slug)
  if (!base) return null

  const [resolved] = await withResolvedPreviewImages([base])
  return resolved ?? null
}

export async function listPortfolioSlugs(): Promise<string[]> {
  try {
    const dbSlugs = await listPortfolioSlugsFromDb()
    const hardcodedSlugs = PORTFOLIO_CASE_STUDIES.map((item) => item.id)
    if (dbSlugs.length) {
      return [...new Set([...dbSlugs, ...hardcodedSlugs])]
    }
  } catch (error) {
    console.error('Error listing portfolio slugs:', error)
  }
  return PORTFOLIO_CASE_STUDIES.map((item) => item.id)
}

export type { PortfolioProjectType }
