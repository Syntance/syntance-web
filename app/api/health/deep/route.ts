import { NextResponse } from 'next/server'
import { hasDb, getDb } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { Redis } from '@upstash/redis'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Check = 'ok' | 'down' | 'skipped'

function withTimeout<T>(p: Promise<T>, ms = 4_000): Promise<T> {
  return Promise.race([p, new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))])
}

/**
 * Deep health check — ping Postgres (Neon) i Upstash Redis (limity logowania i API licencji) gdy skonfigurowane.
 * Tylko statusy ok/down/skipped, bez szczegółów. Redis „skipped” poza produkcją; na produkcji brak konfiguracji = down.
 */
export async function GET() {
  const checks: Record<string, Check> = {}

  if (!hasDb()) {
    checks.database = 'skipped'
  } else {
    try {
      await withTimeout(getDb().execute(sql`SELECT 1`))
      checks.database = 'ok'
    } catch {
      checks.database = 'down'
    }
  }

  const url = (process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL)?.trim()
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN)?.trim()
  if (!url || !token) {
    checks.redis = process.env.VERCEL_ENV === 'production' ? 'down' : 'skipped'
  } else {
    try {
      await withTimeout(new Redis({ url, token }).ping())
      checks.redis = 'ok'
    } catch {
      checks.redis = 'down'
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
