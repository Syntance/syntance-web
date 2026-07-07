import { asc } from 'drizzle-orm'
import { getDb, hasDb } from '@/lib/db'
import { stackBadges } from '@/lib/db/schema'
import type { StackBadgeRecord } from '@/lib/data/stack-badges'

export type StackBadgeRow = typeof stackBadges.$inferSelect

function rowToRecord(row: StackBadgeRow): StackBadgeRecord {
  return {
    id: row.id,
    name: row.name,
    definition: row.definition,
    dotColor: row.dotColor,
    showInHero: row.showInHero,
    showInValues: row.showInValues,
    sortOrder: row.sortOrder,
  }
}

export async function listStackBadges(): Promise<StackBadgeRecord[]> {
  if (!hasDb()) return []
  try {
    const db = getDb()
    const rows = await db.select().from(stackBadges).orderBy(asc(stackBadges.sortOrder))
    return rows.map(rowToRecord)
  } catch (error) {
    console.error('Error fetching stack badges from DB:', error)
    return []
  }
}

export async function replaceAllStackBadges(items: StackBadgeRecord[]): Promise<void> {
  const db = getDb()
  await db.delete(stackBadges)
  if (!items.length) return
  await db.insert(stackBadges).values(
    items.map((item, index) => ({
      id: item.id,
      name: item.name,
      definition: item.definition,
      dotColor: item.dotColor,
      showInHero: item.showInHero,
      showInValues: item.showInValues,
      sortOrder: item.sortOrder ?? index,
    })),
  )
}
