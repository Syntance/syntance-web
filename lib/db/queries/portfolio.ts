import { asc, eq } from 'drizzle-orm'
import { getDb, hasDb } from '@/lib/db'
import { portfolioItems } from '@/lib/db/schema'
import type { PortfolioItem } from '@/lib/data/portfolio-types'

export async function fetchPortfolioItemsFromDb(): Promise<PortfolioItem[]> {
  if (!hasDb()) return []
  const db = getDb()
  const rows = await db
    .select()
    .from(portfolioItems)
    .where(eq(portfolioItems.disabled, false))
    .orderBy(asc(portfolioItems.sortOrder), asc(portfolioItems.name))

  return rows.map((row) => ({
    id: row.sanityId ?? row.id,
    name: row.name,
    url: row.url,
    logoUrl: row.logoUrl ?? '',
    logoAlt: row.logoAlt ?? row.name,
    order: row.sortOrder,
  }))
}

export async function listPortfolioItemsAdmin() {
  if (!hasDb()) return []
  const db = getDb()
  return db.select().from(portfolioItems).orderBy(asc(portfolioItems.sortOrder))
}

export async function upsertPortfolioItem(input: {
  id?: string
  name: string
  url: string
  logoUrl?: string
  logoAlt?: string
  sortOrder?: number
  disabled?: boolean
}): Promise<void> {
  const db = getDb()
  if (input.id) {
    await db
      .update(portfolioItems)
      .set({
        name: input.name,
        url: input.url,
        logoUrl: input.logoUrl,
        logoAlt: input.logoAlt,
        sortOrder: input.sortOrder ?? 0,
        disabled: input.disabled ?? false,
      })
      .where(eq(portfolioItems.id, input.id))
    return
  }
  await db.insert(portfolioItems).values({
    name: input.name,
    url: input.url,
    logoUrl: input.logoUrl,
    logoAlt: input.logoAlt,
    sortOrder: input.sortOrder ?? 0,
    disabled: input.disabled ?? false,
  })
}

export async function deletePortfolioItem(id: string): Promise<void> {
  const db = getDb()
  await db.delete(portfolioItems).where(eq(portfolioItems.id, id))
}

export async function replaceAllPortfolioItems(
  items: Array<{
    id?: string
    sanityId?: string
    name: string
    url: string
    logoUrl?: string
    logoAlt?: string
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
      sanityId: item.sanityId,
      name: item.name,
      url: item.url,
      logoUrl: item.logoUrl,
      logoAlt: item.logoAlt,
      sortOrder: item.sortOrder ?? index,
      disabled: item.disabled ?? false,
    })),
  )
}

export type { PortfolioItem }
