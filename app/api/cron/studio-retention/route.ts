import { NextResponse } from 'next/server'
import { isAuthorizedCron, pingHealthcheck } from '@/lib/cron-auth'
import { runRetention } from '@/lib/studio/retention'

export const runtime = 'nodejs'
export const maxDuration = 60

/** Codzienna retencja danych Studio (vercel.json → crons). Sukces pinguje healthchecks.io (dead-man switch). */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const hc = process.env.HEALTHCHECK_RETENTION_URL
  try {
    const result = await runRetention()
    await pingHealthcheck(hc)
    return NextResponse.json({ ok: true, ...result }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[cron] retencja nieudana', error)
    await pingHealthcheck(hc, '/fail')
    return NextResponse.json({ error: 'INTERNAL' }, { status: 500 })
  }
}
