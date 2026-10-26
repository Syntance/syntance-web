import { timingSafeEqual } from 'node:crypto'

/** Vercel Cron wysyła `Authorization: Bearer $CRON_SECRET`, gdy CRON_SECRET jest ustawiony w projekcie. */
export function isAuthorizedCron(req: Request, env: NodeJS.ProcessEnv = process.env): boolean {
  const secret = env.CRON_SECRET?.trim()
  if (!secret || secret.length < 16) return false
  const given = Buffer.from(req.headers.get('authorization') ?? '')
  const expected = Buffer.from(`Bearer ${secret}`)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

/** Dead-man switch: ping healthchecks.io po udanym przebiegu (brak pingu = alert). Nie przerywa zadania. */
export async function pingHealthcheck(url: string | undefined, suffix = ''): Promise<void> {
  if (!url?.startsWith('https://')) return
  try {
    await fetch(`${url}${suffix}`, { method: 'GET', signal: AbortSignal.timeout(5_000) })
  } catch (error) {
    console.error('[healthcheck] ping nieudany', error)
  }
}
