import { NextRequest, NextResponse } from 'next/server'
import { getAvailableDates, getAvailableSlotsForDate, toYmd } from '@/lib/booking-slots'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const date = searchParams.get('date')

  try {
    // Jeden dzień — lista wolnych slotów z dokładnym ISO
    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
      }
      const day = await getAvailableSlotsForDate(date)
      return NextResponse.json(day, {
        headers: { 'Cache-Control': 'private, max-age=30' },
      })
    }

    // Zakres — daty z jakimkolwiek wolnym slotem (do rysowania kalendarza)
    const days = Number(searchParams.get('days') ?? '60')
    const from = new Date()
    const { availableDates, busyDates, rules } = await getAvailableDates({
      from,
      days: Number.isFinite(days) ? days : 60,
    })

    return NextResponse.json(
      {
        from: toYmd(from),
        availableDates,
        busyDates,
        rules: {
          slotMinutes: rules.slotMinutes,
          maxAdvanceDays: rules.maxAdvanceDays,
          timezone: rules.timezone,
        },
      },
      { headers: { 'Cache-Control': 'private, max-age=60' } }
    )
  } catch (err) {
    console.error('/api/meeting/slots error:', err)
    return NextResponse.json({ error: 'Failed to compute slots' }, { status: 500 })
  }
}
