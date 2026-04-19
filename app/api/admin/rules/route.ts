import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE_NAME, verifySession } from '@/lib/admin-auth'
import { getBookingRules, saveBookingRules } from '@/lib/sanity/booking'

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/

const schema = z.object({
  slotMinutes: z.number().int().min(5).max(240),
  workingDays: z.array(z.number().int().min(0).max(6)).min(1),
  workingHoursStart: z.string().regex(HHMM),
  workingHoursEnd: z.string().regex(HHMM),
  slotPresets: z.array(z.string().regex(HHMM)).optional().default([]),
  bufferBeforeMinutes: z.number().int().min(0).max(240).optional().default(0),
  bufferAfterMinutes: z.number().int().min(0).max(240).optional().default(0),
  minNoticeHours: z.number().int().min(0).max(168).optional().default(12),
  maxAdvanceDays: z.number().int().min(1).max(365).optional().default(60),
})

async function requireAdmin() {
  const jar = await cookies()
  return verifySession(jar.get(ADMIN_COOKIE_NAME)?.value)
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  const rules = await getBookingRules()
  return NextResponse.json({ ok: true, rules })
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 })
  }
  await saveBookingRules(parsed.data)
  return NextResponse.json({ ok: true })
}
