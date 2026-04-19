import { getBookingRules, getBlocksBetween, type BookingRules } from '@/lib/sanity/booking'
import { getBusyIntervals } from '@/lib/google-calendar'

const TIMEZONE = 'Europe/Warsaw'

/**
 * Pomocnik: buduje ISO string z datą YYYY-MM-DD i godziną HH:MM
 * w strefie Europe/Warsaw (DST-aware) i zwraca w UTC.
 *
 * Używamy Intl.DateTimeFormat żeby znaleźć offset strefy dla danego momentu.
 */
function warsawToUtcIso(dateYmd: string, timeHm: string): string {
  const [y, m, d] = dateYmd.split('-').map(Number)
  const [h, min] = timeHm.split(':').map(Number)
  // Zaczynamy od "pseudo-UTC" momentu — potem odejmiemy offset Warszawy
  const asUtc = Date.UTC(y, m - 1, d, h, min, 0, 0)

  // Policz offset Warszawy dla tego momentu: różnica między tym co mówi formatter (Warszawa)
  // a tym samym timestampem w UTC.
  const warsaw = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date(asUtc))
  const get = (type: string) => Number(warsaw.find((p) => p.type === type)?.value)
  const asWarsaw = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second')
  )
  const offsetMs = asWarsaw - asUtc
  // Chcemy żeby momentem w Warszawie było dateYmd/timeHm → UTC to ten moment minus offset.
  return new Date(asUtc - offsetMs).toISOString()
}

/**
 * Zwraca YYYY-MM-DD danego dnia (dzień w strefie Warszawy).
 */
export function toYmd(date: Date): string {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
  return parts
}

/**
 * Zwraca dzień tygodnia (0=nd, 1=pn, ...) w strefie Warszawy.
 */
function weekdayWarsaw(dateYmd: string): number {
  const [y, m, d] = dateYmd.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay()
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart
}

function generateCandidateSlots(rules: BookingRules, dateYmd: string): string[] {
  if (rules.slotPresets && rules.slotPresets.length > 0) {
    return [...new Set(rules.slotPresets)].filter((s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s))
  }
  const out: string[] = []
  const [startH, startM] = rules.workingHoursStart.split(':').map(Number)
  const [endH, endM] = rules.workingHoursEnd.split(':').map(Number)
  const startMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM
  for (let t = startMinutes; t + rules.slotMinutes <= endMinutes; t += rules.slotMinutes) {
    const hh = String(Math.floor(t / 60)).padStart(2, '0')
    const mm = String(t % 60).padStart(2, '0')
    out.push(`${hh}:${mm}`)
  }
  return out
  // dateYmd not used in generation but kept for future per-day overrides
}

export interface AvailableSlot {
  time: string // HH:MM (Europe/Warsaw)
  startIso: string // UTC ISO
  endIso: string // UTC ISO
}

export interface DayAvailability {
  date: string // YYYY-MM-DD
  slots: AvailableSlot[]
}

/**
 * Zwraca listę wolnych slotów na dany dzień.
 * Filtry: dni robocze, minimum notice, zajętość w Google Calendar, manualne blokady.
 */
export async function getAvailableSlotsForDate(dateYmd: string): Promise<DayAvailability> {
  const rules = await getBookingRules()
  const weekday = weekdayWarsaw(dateYmd)

  if (!rules.workingDays.includes(weekday)) {
    return { date: dateYmd, slots: [] }
  }

  // Granice dnia w strefie Warszawy
  const dayStartIso = warsawToUtcIso(dateYmd, '00:00')
  const [y, m, d] = dateYmd.split('-').map(Number)
  const nextDay = new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0))
  const dayEndIso = warsawToUtcIso(toYmd(nextDay), '00:00')

  const [busy, blocks] = await Promise.all([
    getBusyIntervals(new Date(dayStartIso), new Date(dayEndIso)),
    getBlocksBetween(dayStartIso, dayEndIso),
  ])

  const busyIntervals: Array<{ start: Date; end: Date }> = [
    ...busy.map((b) => ({ start: new Date(b.start), end: new Date(b.end) })),
    ...blocks.map((b) => ({ start: new Date(b.startAt), end: new Date(b.endAt) })),
  ]

  const now = new Date()
  const minNoticeMs = rules.minNoticeHours * 60 * 60 * 1000
  const earliest = new Date(now.getTime() + minNoticeMs)

  const candidates = generateCandidateSlots(rules, dateYmd)
  const result: AvailableSlot[] = []

  for (const time of candidates) {
    const startIso = warsawToUtcIso(dateYmd, time)
    const start = new Date(startIso)
    const end = new Date(start.getTime() + rules.slotMinutes * 60 * 1000)

    // 1) minimum notice
    if (start < earliest) continue

    // 2) bufor przed/po
    const effStart = new Date(start.getTime() - rules.bufferBeforeMinutes * 60 * 1000)
    const effEnd = new Date(end.getTime() + rules.bufferAfterMinutes * 60 * 1000)

    // 3) busy (calendar + manualne blokady)
    const conflict = busyIntervals.some((b) => overlaps(effStart, effEnd, b.start, b.end))
    if (conflict) continue

    result.push({
      time,
      startIso,
      endIso: end.toISOString(),
    })
  }

  return { date: dateYmd, slots: result }
}

/**
 * Zwraca listę dat (YYYY-MM-DD), w których jest choć jeden wolny slot.
 * Przydatne do renderowania kalendarza.
 */
export async function getAvailableDates(opts?: { from?: Date; days?: number }): Promise<{
  availableDates: string[]
  busyDates: string[]
  rules: BookingRules
}> {
  const rules = await getBookingRules()
  const from = opts?.from ?? new Date()
  const days = Math.min(opts?.days ?? rules.maxAdvanceDays, 365)

  const dates: string[] = []
  const cursor = new Date(from.getTime())
  for (let i = 0; i < days; i++) {
    const ymd = toYmd(cursor)
    dates.push(ymd)
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  // Bulk: jedno zapytanie do GCal i jedno do Sanity na cały zakres — potem filtrujemy per-day.
  const rangeStart = new Date(warsawToUtcIso(dates[0], '00:00'))
  const rangeEndYmd = toYmd(new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate() + days, 0, 0)))
  const rangeEnd = new Date(warsawToUtcIso(rangeEndYmd, '00:00'))

  const [busy, blocks] = await Promise.all([
    getBusyIntervals(rangeStart, rangeEnd),
    getBlocksBetween(rangeStart.toISOString(), rangeEnd.toISOString()),
  ])

  const busyIntervals: Array<{ start: Date; end: Date }> = [
    ...busy.map((b) => ({ start: new Date(b.start), end: new Date(b.end) })),
    ...blocks.map((b) => ({ start: new Date(b.startAt), end: new Date(b.endAt) })),
  ]

  const now = new Date()
  const minNoticeMs = rules.minNoticeHours * 60 * 60 * 1000
  const earliest = new Date(now.getTime() + minNoticeMs)

  const availableDates: string[] = []
  const busyDates: string[] = []

  for (const ymd of dates) {
    const weekday = weekdayWarsaw(ymd)
    if (!rules.workingDays.includes(weekday)) continue

    const candidates = generateCandidateSlots(rules, ymd)
    let hasFree = false

    for (const time of candidates) {
      const startIso = warsawToUtcIso(ymd, time)
      const start = new Date(startIso)
      const end = new Date(start.getTime() + rules.slotMinutes * 60 * 1000)
      if (start < earliest) continue
      const effStart = new Date(start.getTime() - rules.bufferBeforeMinutes * 60 * 1000)
      const effEnd = new Date(end.getTime() + rules.bufferAfterMinutes * 60 * 1000)
      const conflict = busyIntervals.some((b) => overlaps(effStart, effEnd, b.start, b.end))
      if (!conflict) {
        hasFree = true
        break
      }
    }

    if (hasFree) availableDates.push(ymd)
    else busyDates.push(ymd)
  }

  return { availableDates, busyDates, rules }
}

/** Eksport helpera dla API — żeby endpoint bookingu mógł zamieniać HH:MM → UTC ISO. */
export function warsawSlotToIso(dateYmd: string, timeHm: string): string {
  return warsawToUtcIso(dateYmd, timeHm)
}
