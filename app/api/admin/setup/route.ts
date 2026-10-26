import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createPendingAdmin, encryptionKey, hasEnabledAdmin, hashIp } from '@/lib/admin/accounts'
import { encryptSecret } from '@/lib/admin/crypto'
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, hashPassword } from '@/lib/admin/password'
import { generateTotpSecret, otpauthUri } from '@/lib/admin/totp'
import { getClientIpFromHeaders } from '@/lib/client-ip'
import { rateLimit } from '@/lib/rate-limit'
import { writeAudit } from '@/lib/studio/audit'

export const runtime = 'nodejs'

const schema = z.object({
  bootstrapToken: z.string().min(1).max(200),
  email: z.string().email().max(254),
  password: z.string().min(MIN_PASSWORD_LENGTH, `Hasło: min. ${MIN_PASSWORD_LENGTH} znaków.`).max(MAX_PASSWORD_LENGTH),
})

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

function tokenMatches(given: string): boolean {
  const expected = process.env.ADMIN_BOOTSTRAP_TOKEN?.trim() ?? ''
  if (expected.length < 24) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

/**
 * Krok 1 konfiguracji konta: token z env + e-mail + nowe hasło → sekret TOTP do zeskanowania.
 * Działa tylko, dopóki NIE istnieje konto z potwierdzonym TOTP (potem odpowiedź jest taka sama jak przy złym tokenie).
 */
export async function POST(req: Request) {
  const ipHash = hashIp(getClientIpFromHeaders(req.headers))
  const limit = await rateLimit({ key: `setup:ip:${ipHash}`, limit: 5, windowSec: 3600, failOpen: false })
  if (!limit.ok) return json({ ok: false, error: 'Za dużo prób.' }, 429)

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return json({ ok: false, error: parsed.error.issues[0]?.message ?? 'Niepoprawne dane.' }, 400)

  if (!tokenMatches(parsed.data.bootstrapToken) || (await hasEnabledAdmin())) {
    await writeAudit({ actor: 'anonymous', action: 'admin.setup_denied', target: 'admin', meta: { ipHash } })
    return json({ ok: false, error: 'Konfiguracja niedostępna.' }, 403)
  }

  const secret = generateTotpSecret()
  const email = parsed.data.email.trim().toLowerCase()
  await createPendingAdmin({
    email,
    passwordHash: await hashPassword(parsed.data.password),
    totpSecretEnc: encryptSecret(secret, encryptionKey()),
  })
  await writeAudit({ actor: email, action: 'admin.setup_started', target: 'admin', meta: { ipHash } })
  return json({ ok: true, secret, otpauthUri: otpauthUri({ secret, account: email, issuer: 'Syntance Magazyn' }) })
}
