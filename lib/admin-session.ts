/** Sesja panelu potwierdzona w bazie — tylko Node (RSC / route handlers). Część Edge-safe: lib/admin-auth.ts. */
import { ADMIN_COOKIE_NAME, verifySession } from '@/lib/admin-auth'
import { findActiveSession } from '@/lib/admin/accounts'

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
