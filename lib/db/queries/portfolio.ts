import { asc, eq } from 'drizzle-orm'
import { getDb, hasDb } from '@/lib/db'
import { portfolioItems } from '@/lib/db/schema'
import type { PortfolioProjectType } from '@/lib/portfolio-content'
import { getPortfolioTypeLabel } from '@/lib/portfolio-content'
import type { PortfolioPerformanceReport } from '@/lib/portfolio-performance'

export type PortfolioDbRow = typeof portfolioItems.$inferSelect

export type PortfolioItemRecord = {
  id: string
  slug: string
  name: string
  url: string
  projectType: PortfolioProjectType
  typeLabel: string
  description: string
  highlights: string[]
  stack: string[]
  problemStatement?: string
  rebuildContext?: string
  previewImageFallback?: string
  previewImageAlt?: string
  logoUrl: string
  logoAlt: string
  performance?: PortfolioPerformanceReport | null
  order: number
}

function rowToRecord(row: PortfolioDbRow): PortfolioItemRecord {
  const projectType = row.projectType ?? 'website'
  return {
    id: row.slug,
    slug: row.slug,
    name: row.name,
    url: row.url,
    projectType,
    typeLabel: getPortfolioTypeLabel(projectType),
    description: row.description ?? '',
    highlights: row.highlights ?? [],
    stack: row.stack ?? [],
    problemStatement: row.problemStatement ?? undefined,
    rebuildContext: row.rebuildContext ?? undefined,
    previewImageFallback: row.previewImageFallback ?? undefined,
    previewImageAlt: row.previewImageAlt ?? undefined,
    logoUrl: row.logoUrl ?? '',
    logoAlt: row.logoAlt ?? row.name,
    performance: row.performance ?? null,
    order: row.sortOrder,
  }
}

export async function fetchPortfolioItemsFromDb(): Promise<PortfolioItemRecord[]> {
  if (!hasDb()) return []
  const db = getDb()
  const rows = await db
    .select()
    .from(portfolioItems)
    .where(eq(portfolioItems.disabled, false))
    .orderBy(asc(portfolioItems.sortOrder), asc(portfolioItems.name))

  return rows.map(rowToRecord)
}

export async function getPortfolioItemBySlug(slug: string): Promise<PortfolioItemRecord | null> {
  if (!hasDb()) return null
  const db = getDb()
  const rows = await db
    .select()
    .from(portfolioItems)
    .where(eq(portfolioItems.slug, slug))
    .limit(1)
  const row = rows[0]
  if (!row || row.disabled) return null
  return rowToRecord(row)
}

export async function listPortfolioSlugsFromDb(): Promise<string[]> {
  if (!hasDb()) return []
  const db = getDb()
  const rows = await db
    .select({ slug: portfolioItems.slug })
    .from(portfolioItems)
    .where(eq(portfolioItems.disabled, false))
    .orderBy(asc(portfolioItems.sortOrder))
  return rows.map((row) => row.slug)
}

export async function listPortfolioItemsAdmin() {
  if (!hasDb()) return []
  const db = getDb()
  return db.select().from(portfolioItems).orderBy(asc(portfolioItems.sortOrder))
}

export async function replaceAllPortfolioItems(
  items: Array<{
    id?: string
    sanityId?: string | null
    slug: string
    name: string
    url: string
    projectType?: PortfolioProjectType
    description?: string
    highlights?: string[]
    stack?: string[]
    problemStatement?: string | null
    rebuildContext?: string | null
    previewImageFallback?: string | null
    previewImageAlt?: string | null
    logoUrl?: string | null
    logoAlt?: string | null
    performance?: PortfolioPerformanceReport | null
    sortOrder?: number
    disabled?: boolean
  }>,
): Promise<void> {
  const db = getDb()
  await db.delete(portfolioItems)
  if (!items.length) return
  await db.insert(portfolioItems).values(
    items.map((item, index) => ({
      id: item.id,
      sanityId: item.sanityId ?? null,
      slug: item.slug,
      name: item.name,
      url: item.url,
      projectType: item.projectType ?? 'website',
      description: item.description ?? '',
      highlights: item.highlights ?? [],
      stack: item.stack ?? [],
      problemStatement: item.problemStatement ?? null,
      rebuildContext: item.rebuildContext ?? null,
      previewImageFallback: item.previewImageFallback ?? null,
      previewImageAlt: item.previewImageAlt ?? null,
      logoUrl: item.logoUrl ?? null,
      logoAlt: item.logoAlt ?? null,
      performance: item.performance ?? null,
      sortOrder: item.sortOrder ?? index,
      disabled: item.disabled ?? false,
    })),
  )
}

export type { PortfolioItemRecord as PortfolioItem }
