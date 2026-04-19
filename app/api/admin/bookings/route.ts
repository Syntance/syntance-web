import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE_NAME, verifySession } from '@/lib/admin-auth'
import { listBookings } from '@/lib/sanity/booking'

async function requireAdmin() {
  const jar = await cookies()
  return verifySession(jar.get(ADMIN_COOKIE_NAME)?.value)
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const range = searchParams.get('range') ?? 'upcoming'
  const now = new Date().toISOString()
  const opts: Parameters<typeof listBookings>[0] = { limit: 200 }
  if (range === 'upcoming') opts.from = now
  else if (range === 'past') opts.to = now

  const bookings = await listBookings(opts)
  return NextResponse.json({ ok: true, bookings })
}
