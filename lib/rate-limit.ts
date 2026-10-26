import { Redis } from '@upstash/redis'

/**
 * Limit żądań na Upstash Redis (okno stałe, wspólne dla wszystkich instancji serverless — nie w pamięci procesu).
 * `failOpen`: co zrobić, gdy Upstash nie jest skonfigurowany lub nie odpowiada.
 *  - false (logowanie admina, aktywacja konta): odmowa — brak limitera to incydent konfiguracji, nie tryb pracy.
 *  - true (publiczne API licencji): przepuszczamy, żeby awaria Redisa nie wyłączyła aplikacji klientów,
 *    ale logujemy głośny błąd (alert w monitoringu).
 */
let client: Redis | null | undefined

function redis(): Redis | null {
  if (client !== undefined) return client
  // Integracja Upstash z Vercel Marketplace wystawia KV_REST_API_*; ręczna konfiguracja — UPSTASH_REDIS_REST_*.
  const url = (process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL)?.trim()
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN)?.trim()
  client = url && token ? new Redis({ url, token }) : null
  return client
}

export interface RateLimitResult {
  ok: boolean
  /** Sekundy do końca okna (gdy ok=false). */
  retryAfter: number
}

export async function rateLimit(opts: { key: string; limit: number; windowSec: number; failOpen: boolean }): Promise<RateLimitResult> {
  const r = redis()
  if (!r) {
    console.error('[rate-limit] Brak UPSTASH_REDIS_REST_URL/TOKEN — limiter niedostępny')
    return { ok: opts.failOpen, retryAfter: opts.windowSec }
  }
  const key = `rl:${opts.key}`
  try {
    // NX+EX: okno ma TTL od pierwszego trafienia, więc nie istnieje klucz bez wygaśnięcia.
    await r.set(key, 0, { nx: true, ex: opts.windowSec })
    const count = await r.incr(key)
    if (count <= opts.limit) return { ok: true, retryAfter: 0 }
    const ttl = await r.ttl(key)
    return { ok: false, retryAfter: ttl > 0 ? ttl : opts.windowSec }
  } catch (error) {
    console.error('[rate-limit] Błąd Upstash', error)
    return { ok: opts.failOpen, retryAfter: opts.windowSec }
  }
}
