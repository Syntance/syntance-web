/**
 * Minimalny auth dla dashboardu (jeden użytkownik).
 *
 * Env:
 *   ADMIN_EMAIL            (np. kamil@syntance.com)
 *   ADMIN_PASSWORD         (plain — np. Fv215b0108)
 *   ADMIN_COOKIE_SECRET    (dowolny mocny secret, min. 32 znaki)
 *
 * Cookie:
 *   name:  syntance_admin
 *   value: `${email}.${exp}.${sig}` (sig = HMAC-SHA256 nad `${email}.${exp}`)
 *   HttpOnly, Secure (w prod), SameSite=Lax, Path=/admin
 *
 * Działa zarówno w Node (route handlers), jak i Edge (middleware) — używa Web Crypto.
 */

export const ADMIN_COOKIE_NAME = 'syntance_admin'
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 dni

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
  const b64 = (typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64'))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function hmac(data: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
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

export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const expectedEmail = process.env.ADMIN_EMAIL
  const expectedPassword = process.env.ADMIN_PASSWORD
  if (!expectedEmail || !expectedPassword) return false
  return (
    timingSafeEqual(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase()) &&
    timingSafeEqual(password, expectedPassword)
  )
}

export async function signSession(email: string, ttlSeconds = DEFAULT_TTL_SECONDS): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds
  const payload = `${email.trim().toLowerCase()}.${exp}`
  const sig = await hmac(payload)
  return `${payload}.${sig}`
}

export interface VerifiedSession {
  email: string
  exp: number
}

export async function verifySession(token: string | undefined | null): Promise<VerifiedSession | null> {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [email, expStr, sig] = parts
  const exp = Number(expStr)
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return null
  const expected = await hmac(`${email}.${exp}`)
  if (!timingSafeEqual(sig, expected)) return null
  return { email, exp }
}

export function buildSessionCookie(token: string, maxAgeSeconds = DEFAULT_TTL_SECONDS): string {
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : ''
  return `${ADMIN_COOKIE_NAME}=${token}; Path=/; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Lax; ${secure}`
}

export function buildClearCookie(): string {
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : ''
  return `${ADMIN_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; ${secure}`
}
