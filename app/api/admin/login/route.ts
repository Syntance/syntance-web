import { NextResponse } from 'next/server'
import { z } from 'zod'
import { buildSessionCookie, signSession } from '@/lib/admin-auth'
import { createSession, findAdminByEmail, hashIp } from '@/lib/admin/accounts'
import { dummyHash, verifyPassword } from '@/lib/admin/password'
import { verifySecondFactor } from '@/lib/admin/second-factor'
import { getClientIpFromHeaders } from '@/lib/client-ip'
import { rateLimit } from '@/lib/rate-limit'
import { writeAudit } from '@/lib/studio/audit'

export const runtime = 'nodejs'

const schema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
  code: z.string().max(32).optional(),
})

const fail = (error: string, status: number, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ ok: false, error, ...extra }, { status, headers: { 'Cache-Control': 'no-store' } })

export async function POST(req: Request) {
  const ip = getClientIpFromHeaders(req.headers)
  const ipHash = hashIp(ip)

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return fail('Uzupełnij email i hasło.', 400)
  const { password, code } = parsed.data
  const email = parsed.data.email.trim().toLowerCase()

  // Limity na IP i na konto: brak Upstash = odmowa (fail-closed), to panel administracyjny.
  const [byIp, byEmail] = await Promise.all([
    rateLimit({ key: `login:ip:${ipHash}`, limit: 10, windowSec: 600, failOpen: false }),
    rateLimit({ key: `login:email:${email}`, limit: 5, windowSec: 900, failOpen: false }),
  ])
  if (!byIp.ok || !byEmail.ok) {
    const retryAfter = Math.max(byIp.retryAfter, byEmail.retryAfter)
    return NextResponse.json(
      { ok: false, error: 'Za dużo prób. Odczekaj chwilę.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter), 'Cache-Control': 'no-store' } },
    )
  }

  const user = await findAdminByEmail(email)
  // Hash-wabik, gdy konta nie ma: odpowiedź trwa tyle samo i nie zdradza, czy e-mail istnieje.
  const passwordOk = await verifyPassword(user?.passwordHash ?? (await dummyHash()), password)
  if (!user || !passwordOk) {
    await writeAudit({ actor: 'anonymous', action: 'admin.login_failed', target: 'admin', meta: { ipHash, reason: 'credentials' } })
    return fail('Niepoprawny email lub hasło.', 401)
  }
  if (!user.totpEnabledAt) return fail('Dokończ konfigurację konta (TOTP).', 403, { setupRequired: true })

  if (!code) return NextResponse.json({ ok: false, needsCode: true }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
  if (!(await verifySecondFactor(user, code))) {
    await writeAudit({ actor: user.email, action: 'admin.login_failed', target: user.id, meta: { ipHash, reason: 'second_factor' } })
    return fail('Niepoprawny kod.', 401)
  }

  const sid = await createSession(user.id, ipHash, req.headers.get('user-agent') ?? '')
  await writeAudit({ actor: user.email, action: 'admin.login', target: user.id, meta: { ipHash } })
  const res = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  res.headers.append('Set-Cookie', buildSessionCookie(await signSession(sid)))
  return res
}
