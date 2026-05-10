import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Deep health check (rules: 60-quality).
 * Pinguje krytyczne zewnętrzne zależności (Sanity).
 * 200 = wszystko OK; 503 = któryś dependency pada.
 * Bez secret data — tylko status flag (rules: "NEVER secret data w response").
 */
export async function GET() {
  const checks: Record<string, 'ok' | 'down' | 'skipped'> = {}

  // Sanity (jeśli skonfigurowane)
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  if (!projectId) {
    checks.sanity = 'skipped'
  } else {
    try {
      const res = await fetch(
        `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(
          '*[_type == "sanity.imageAsset"][0]._id'
        )}`,
        { signal: AbortSignal.timeout(3_000) }
      )
      checks.sanity = res.ok ? 'ok' : 'down'
    } catch {
      checks.sanity = 'down'
    }
  }

  const allOk = Object.values(checks).every((s) => s !== 'down')
  return NextResponse.json(
    { status: allOk ? 'ok' : 'degraded', checks, timestamp: new Date().toISOString() },
    {
      status: allOk ? 200 : 503,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    }
  )
}
