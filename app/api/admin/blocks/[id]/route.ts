import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE_NAME, verifySession } from '@/lib/admin-auth'
import { deleteBlock } from '@/lib/sanity/booking'

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const jar = await cookies()
  const session = await verifySession(jar.get(ADMIN_COOKIE_NAME)?.value)
  if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 })
  await deleteBlock(id)
  return NextResponse.json({ ok: true })
}
