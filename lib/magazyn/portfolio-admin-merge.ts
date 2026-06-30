import { createHash } from 'node:crypto'
import {
  PORTFOLIO_CASE_STUDIES,
  type PortfolioCaseStudyInput,
} from '@/lib/portfolio-content'
import type { PortfolioDbRow } from '@/lib/db/queries/portfolio'

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, '').toLowerCase()
}

/** Stabilne UUID na realizacje seedowane z kodu (do pierwszego zapisu w bazie). */
export function seedPortfolioId(slug: string): string {
  const hash = createHash('sha256').update(`syntance-portfolio-seed:${slug}`).digest('hex')
  const variant = ((Number.parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, '0')
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `4${hash.slice(13, 16)}`,
    `${variant}${hash.slice(18, 20)}`,
    hash.slice(20, 32),
  ].join('-')
}

function findDbRowForCaseStudy(
  dbRows: PortfolioDbRow[],
  item: PortfolioCaseStudyInput,
): PortfolioDbRow | undefined {
  const urlKey = normalizeUrl(item.url)
  return dbRows.find(
    (row) => row.slug === item.id || normalizeUrl(row.url) === urlKey,
  )
}

function mergeDbRowWithCaseStudy(
  dbRow: PortfolioDbRow,
  item: PortfolioCaseStudyInput,
): PortfolioDbRow {
  return {
    ...dbRow,
    slug: dbRow.slug || item.id,
    name: dbRow.name || item.name,
    url: dbRow.url || item.url,
    projectType: dbRow.projectType || item.type,
    description: dbRow.description || item.description,
    highlights: dbRow.highlights.length ? dbRow.highlights : [...item.highlights],
    stack: dbRow.stack.length ? dbRow.stack : [...item.stack],
    problemStatement: dbRow.problemStatement ?? item.problemStatement ?? null,
    rebuildContext: dbRow.rebuildContext ?? item.rebuildContext ?? null,
    previewImageFallback: dbRow.previewImageFallback ?? item.previewImageFallback ?? null,
    previewImageAlt: dbRow.previewImageAlt ?? item.previewImageAlt ?? null,
    logoUrl: dbRow.logoUrl ?? item.logoUrl ?? null,
    logoAlt: dbRow.logoAlt ?? item.logoAlt ?? item.name,
    performance: dbRow.performance ?? item.performance ?? null,
    sortOrder: dbRow.sortOrder ?? item.order,
  }
}

function caseStudyToSeedRow(item: PortfolioCaseStudyInput): PortfolioDbRow {
  return {
    id: seedPortfolioId(item.id),
    sanityId: null,
    slug: item.id,
    name: item.name,
    url: item.url,
    projectType: item.type,
    description: item.description,
    highlights: [...item.highlights],
    stack: [...item.stack],
    problemStatement: item.problemStatement ?? null,
    rebuildContext: item.rebuildContext ?? null,
    previewImageFallback: item.previewImageFallback ?? null,
    previewImageAlt: item.previewImageAlt ?? null,
    logoUrl: item.logoUrl ?? null,
    logoAlt: item.logoAlt ?? item.name,
    performance: item.performance ?? null,
    sortOrder: item.order,
    disabled: false,
  }
}

/**
 * Łączy wpisy z bazy z domyślnymi realizacjami z kodu — tak jak na stronie /portfolio.
 * CMS widzi te same projekty co front, nawet gdy baza jest pusta.
 */
export function mergePortfolioRowsForAdmin(dbRows: PortfolioDbRow[]): PortfolioDbRow[] {
  const merged: PortfolioDbRow[] = []
  const consumedDbIds = new Set<string>()

  for (const item of PORTFOLIO_CASE_STUDIES) {
    const dbRow = findDbRowForCaseStudy(dbRows, item)
    if (dbRow) {
      merged.push(mergeDbRowWithCaseStudy(dbRow, item))
      consumedDbIds.add(dbRow.id)
      continue
    }
    merged.push(caseStudyToSeedRow(item))
  }

  for (const row of dbRows) {
    if (!consumedDbIds.has(row.id)) {
      merged.push(row)
    }
  }

  return merged.sort((a, b) => a.sortOrder - b.sortOrder)
}

export function portfolioAdminNeedsInitialSave(dbRows: PortfolioDbRow[]): boolean {
  if (!PORTFOLIO_CASE_STUDIES.length) return false
  return dbRows.length === 0
}
