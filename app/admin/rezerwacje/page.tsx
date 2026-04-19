import { listBookings } from '@/lib/sanity/booking'
import { BookingsClient } from './bookings-client'

export const dynamic = 'force-dynamic'

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const { range } = await searchParams
  const current = range === 'past' || range === 'all' ? range : 'upcoming'

  const now = new Date().toISOString()
  const opts: Parameters<typeof listBookings>[0] = { limit: 200 }
  if (current === 'upcoming') opts.from = now
  else if (current === 'past') opts.to = now

  const bookings = await listBookings(opts)
  return <BookingsClient initial={bookings} range={current} />
}
