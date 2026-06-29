import { NextResponse } from 'next/server'
import { hasDb, getDb } from '@/lib/db'
import { sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Deep health check — ping Postgres (Neon) gdy skonfigurowany.
 */
export async function GET() {
  const checks: Record<string, 'ok' | 'down' | 'skipped'> = {}

  if (!hasDb()) {
    checks.database = 'skipped'
  } else {
    try {
      const db = getDb()
      await db.execute(sql`SELECT 1`)
      checks.database = 'ok'
    } catch {
      checks.database = 'down'
    }
  }

  const allOk = Object.values(checks).every((s) => s !== 'down')
  return NextResponse.json(
    { status: allOk ? 'ok' : 'degraded', checks, timestamp: new Date().toISOString() },
    {
      status: allOk ? 200 : 503,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    },
  )
}
