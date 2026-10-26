import { NextResponse } from 'next/server'
import { z } from 'zod'
import { buildSessionCookie, signSession } from '@/lib/admin-auth'
import { createSession, enableTotp, encryptionKey, findAdminByEmail, hasEnabledAdmin, hashIp } from '@/lib/admin/accounts'
import { decryptSecret, generateBackupCodes, hashBackupCode } from '@/lib/admin/crypto'
import { dummyHash, verifyPassword } from '@/lib/admin/password'
import { verifyTotp } from '@/lib/admin/totp'
import { getClientIpFromHeaders } from '@/lib/client-ip'
import { rateLimit } from '@/lib/rate-limit'
import { writeAudit } from '@/lib/studio/audit'

export const runtime = 'nodejs'

const schema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
  code: z.string().regex(/^\d{6}$/),
})

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

/** Krok 2: potwierdzenie TOTP kodem z aplikacji → włączenie MFA, kody zapasowe (pokazane raz) i pierwsza sesja. */
export async function POST(req: Request) {
  const ipHash = hashIp(getClientIpFromHeaders(req.headers))
  const limit = await rateLimit({ key: `setup-confirm:ip:${ipHash}`, limit: 10, windowSec: 3600, failOpen: false })
  if (!limit.ok) return json({ ok: false, error: 'Za dużo prób.' }, 429)

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return json({ ok: false, error: 'Podaj email, hasło i 6-cyfrowy kod.' }, 400)

  const user = await findAdminByEmail(parsed.data.email)
  const passwordOk = await verifyPassword(user?.passwordHash ?? (await dummyHash()), parsed.data.password)
  // Konto z potwierdzonym TOTP nie przechodzi tą ścieżką (do logowania służy /api/admin/login).
  if (!user || !passwordOk || user.totpEnabledAt || !user.totpSecretEnc || (await hasEnabledAdmin())) {
    return json({ ok: false, error: 'Niepoprawne dane.' }, 401)
  }

  const check = verifyTotp(decryptSecret(user.totpSecretEnc, encryptionKey()), parsed.data.code, Date.now(), null)
  if (!check.ok) return json({ ok: false, error: 'Niepoprawny kod.' }, 401)

  const backupCodes = generateBackupCodes()
  await enableTotp(user.id, check.step, backupCodes.map(hashBackupCode))
  const sid = await createSession(user.id, ipHash, req.headers.get('user-agent') ?? '')
  await writeAudit({ actor: user.email, action: 'admin.setup_completed', target: user.id, meta: { ipHash } })

  const res = json({ ok: true, backupCodes })
  res.headers.append('Set-Cookie', buildSessionCookie(await signSession(sid)))
  return res
}
