import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE_NAME, verifySession } from '@/lib/admin-auth'
import { updateBookingStatus } from '@/lib/sanity/booking'
import { cancelEvent } from '@/lib/google-calendar'
import { client, clientWithoutToken } from '@/sanity/lib/client'

const schema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'done', 'no_show']),
  cancelInCalendar: z.boolean().optional().default(false),
})

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const jar = await cookies()
  const session = await verifySession(jar.get(ADMIN_COOKIE_NAME)?.value)
  if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 })
  }

  if (parsed.data.cancelInCalendar && parsed.data.status === 'cancelled') {
    const doc = await clientWithoutToken.fetch<{ googleEventId?: string } | null>(
      `*[_id == $id][0]{ googleEventId }`,
      { id }
    )
    if (doc?.googleEventId) {
      await cancelEvent(doc.googleEventId)
    }
  }

  await updateBookingStatus(id, parsed.data.status)
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const jar = await cookies()
  const session = await verifySession(jar.get(ADMIN_COOKIE_NAME)?.value)
  if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const doc = await clientWithoutToken.fetch<{ googleEventId?: string } | null>(
    `*[_id == $id][0]{ googleEventId }`,
    { id }
  )
  if (doc?.googleEventId) {
    await cancelEvent(doc.googleEventId)
  }
  await client.delete(id)
  return NextResponse.json({ ok: true })
}
