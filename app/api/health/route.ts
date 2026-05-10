import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Simple health endpoint (rules: 60-quality "Health check endpoints").
 * Zwraca 200 jeśli serwer działa. Bez ujawniania szczegółów (no secret data).
 */
export function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  )
}
