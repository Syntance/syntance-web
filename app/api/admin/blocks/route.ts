import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE_NAME, verifySession } from '@/lib/admin-auth'
import { createBlock, listBlocks } from '@/lib/sanity/booking'

async function requireAdmin() {
  const jar = await cookies()
  const session = await verifySession(jar.get(ADMIN_COOKIE_NAME)?.value)
  return session
}

const createSchema = z.object({
  title: z.string().min(1).max(120),
  allDay: z.boolean().optional().default(true),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
})

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  const blocks = await listBlocks()
  return NextResponse.json({ ok: true, blocks })
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 })
  }
  if (new Date(parsed.data.endAt) <= new Date(parsed.data.startAt)) {
    return NextResponse.json({ ok: false, error: 'Koniec musi być po starcie' }, { status: 400 })
  }
  const doc = await createBlock({ ...parsed.data, createdBy: session.email })
  return NextResponse.json({ ok: true, id: doc._id })
}
