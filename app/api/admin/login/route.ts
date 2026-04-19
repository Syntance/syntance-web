import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyCredentials, signSession, buildSessionCookie } from '@/lib/admin-auth'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
})

const hits = new Map<string, { count: number; until: number }>()
function rateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = hits.get(ip)
  if (entry && entry.until > now && entry.count >= 5) return true
  if (!entry || entry.until <= now) {
    hits.set(ip, { count: 1, until: now + 10 * 60 * 1000 })
    return false
  }
  entry.count += 1
  return false
}

export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || '0.0.0.0'
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: 'Za dużo prób. Odczekaj chwilę.' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Uzupełnij email i hasło.' }, { status: 400 })
  }

  const valid = await verifyCredentials(parsed.data.email, parsed.data.password)
  if (!valid) {
    return NextResponse.json({ ok: false, error: 'Niepoprawny email lub hasło.' }, { status: 401 })
  }

  const token = await signSession(parsed.data.email)
  const res = NextResponse.json({ ok: true })
  res.headers.append('Set-Cookie', buildSessionCookie(token))
  return res
}
