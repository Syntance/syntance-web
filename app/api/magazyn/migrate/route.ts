import { NextResponse } from 'next/server'
import { execSync } from 'node:child_process'
import { count } from 'drizzle-orm'
import { getAdminSession } from '@/lib/admin-auth'
import { getDb, hasDb } from '@/lib/db'
import { seoGlobal } from '@/lib/db/schema'

export const runtime = 'nodejs'
export const maxDuration = 300

/** Jednorazowy import danych z Sanity → Neon (pomija gdy seo_global ma już dane). */
export async function POST() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!hasDb()) {
    return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 503 })
  }

  try {
    const db = getDb()
    const [existing] = await db.select({ value: count() }).from(seoGlobal)
    if ((existing?.value ?? 0) > 0) {
      return NextResponse.json({ ok: true, skipped: true, reason: 'Database already seeded' })
    }

    execSync('npx tsx scripts/migrate-from-sanity.ts', {
      stdio: 'pipe',
      env: process.env,
      timeout: 240_000,
    })

    return NextResponse.json({ ok: true, migrated: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Migration failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
