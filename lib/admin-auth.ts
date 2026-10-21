/**
 * Sesje panelu /magazyn (Syntance Magazyn).
 *
 * Logowanie: hasło (Argon2id) + TOTP, konfiguracja jednorazowym tokenem ADMIN_BOOTSTRAP_TOKEN (lib/admin/*, /api/admin/*).
 * Sesja jest zapisana W BAZIE (admin_sessions), więc można ją unieważnić; cookie niesie tylko jej id podpisane HMAC.
 *
 * Env:
 *   ADMIN_COOKIE_SECRET    mocny sekret podpisu cookie (min. 16 znaków, zalecane 32+)
 *   ADMIN_ENC_KEY          klucz AES-256 (32 B base64) do sekretów TOTP w bazie
 *   ADMIN_BOOTSTRAP_TOKEN  jednorazowy token pierwszej konfiguracji konta (usuń po konfiguracji)
 *   UPSTASH_REDIS_REST_*   limit prób logowania
 *
 * Cookie (`__Host-` w produkcji): `${sessionId}.${exp}.${sig}`, sig = HMAC-SHA256 nad `${sessionId}.${exp}`.
 * HttpOnly, Secure (prod), SameSite=Strict, Path=/.
 *
 * Ten plik jest ładowany także w middleware (Edge) — bez importów Node-only; część bazodanowa jest importowana dynamicznie.
 */
import { neon } from '@neondatabase/serverless'

export const ADMIN_COOKIE_NAME = process.env.NODE_ENV === 'production' ? '__Host-syntance_admin' : 'syntance_admin'
export const SESSION_TTL_SECONDS = 60 * 60 * 24 // 24 h, bez odnawiania

const SESSION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

function getSecret(): string {
  const s = process.env.ADMIN_COOKIE_SECRET
  if (!s || s.length < 16) {
    throw new Error('ADMIN_COOKIE_SECRET is not set (min 16 chars)')
  }
  return s
}

function base64urlFromBytes(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let binary = ''
  for (let i = 0; i < arr.byteLength; i++) binary += String.fromCharCode(arr[i])
  const b64 = typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64')
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function hmac(data: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(getSecret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return base64urlFromBytes(sig)
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export async function signSession(sessionId: string, ttlSeconds = SESSION_TTL_SECONDS): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds
  const payload = `${sessionId}.${exp}`
  return `${payload}.${await hmac(payload)}`
}

/** To, co niesie cookie po sprawdzeniu podpisu i terminu — jeszcze bez sprawdzenia unieważnienia w bazie. */
export interface SessionClaims {
  sid: string
  exp: number
}

/** Bezstanowa kontrola podpisu i terminu (Edge-safe). Unieważnienie sprawdza `getAdminSession`/middleware. */
export async function verifySession(token: string | undefined | null): Promise<SessionClaims | null> {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [sid, expStr, sig] = parts
  if (!SESSION_ID.test(sid)) return null
  const exp = Number(expStr)
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return null
  const expected = await hmac(`${sid}.${exp}`)
  if (!timingSafeEqual(sig, expected)) return null
  return { sid, exp }
}

/** Czy sesja istnieje, nie jest unieważniona ani wygasła — lekkie zapytanie HTTP do Neon, działa na Edge. Fail-closed. */
export async function isSessionActiveEdge(sid: string): Promise<boolean> {
  const url = process.env.DATABASE_URL
  if (!url) return false
  try {
    const sql = neon(url)
    const rows = await sql`select 1 as ok from admin_sessions where id = ${sid}::uuid and revoked_at is null and expires_at > now() limit 1`
    return rows.length > 0
  } catch {
    return false
  }
}

export function buildSessionCookie(token: string, maxAgeSeconds = SESSION_TTL_SECONDS): string {
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : ''
  return `${ADMIN_COOKIE_NAME}=${token}; Path=/; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Strict; ${secure}`
}

export function buildClearCookie(): string {
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : ''
  return `${ADMIN_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict; ${secure}`
}

export interface VerifiedSession {
  email: string
  exp: number
  sid: string
  userId: string
}

/** Server-only — sesja admina z cookie, potwierdzona w bazie (RSC / route handlers). */
export async function getAdminSession(): Promise<VerifiedSession | null> {
  const { cookies } = await import('next/headers')
  const jar = await cookies()
  const claims = await verifySession(jar.get(ADMIN_COOKIE_NAME)?.value)
  if (!claims) return null
  const { findActiveSession } = await import('@/lib/admin/accounts')
  const row = await findActiveSession(claims.sid)
  return row ? { email: row.email, exp: claims.exp, sid: claims.sid, userId: row.userId } : null
}

export async function requireAdminSession(): Promise<VerifiedSession> {
  const session = await getAdminSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}
