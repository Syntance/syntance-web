import { and, eq, gte, sql } from 'drizzle-orm'
import { getDb, hasDb } from '@/lib/db'
import { pageHits } from '@/lib/db/schema/analytics'

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Zlicza wejście na daną ścieżkę — niezależnie od zgody na cookies analityczne.
 * Wyłącznie agregat dzienny, bez IP/UA/identyfikatora, więc nie podlega
 * wymogom banera cookies. Wywołuj z `after()`, żeby nie blokować renderu.
 */
export async function recordPageHit(path: string): Promise<void> {
  if (!hasDb()) return

  try {
    const db = getDb()
    await db
      .insert(pageHits)
      .values({ path, day: todayUtc(), count: 1 })
      .onConflictDoUpdate({
        target: [pageHits.path, pageHits.day],
        set: { count: sql`${pageHits.count} + 1`, updatedAt: new Date() },
      })
  } catch {
    // Licznik wejść nie może wywrócić renderu strony.
  }
}

export async function countPageHitsSince(path: string, sinceIso: string): Promise<number> {
  if (!hasDb()) return 0

  try {
    const db = getDb()
    const since = sinceIso.slice(0, 10)
    const rows = await db
      .select({ total: sql<number>`coalesce(sum(${pageHits.count}), 0)` })
      .from(pageHits)
      .where(and(eq(pageHits.path, path), gte(pageHits.day, since)))
    return Number(rows[0]?.total ?? 0)
  } catch {
    return 0
  }
}
