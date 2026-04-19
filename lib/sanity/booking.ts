import { client, clientWithoutToken } from '@/sanity/lib/client'

export interface BookingRules {
  slotMinutes: number
  workingDays: number[]
  workingHoursStart: string
  workingHoursEnd: string
  slotPresets: string[]
  bufferBeforeMinutes: number
  bufferAfterMinutes: number
  minNoticeHours: number
  maxAdvanceDays: number
  timezone: string
}

export interface BookingTimeBlock {
  _id: string
  title: string
  allDay: boolean
  startAt: string
  endAt: string
  createdBy?: string
}

export interface MeetingBookingDoc {
  _id: string
  status: 'confirmed' | 'cancelled' | 'done' | 'no_show'
  startAt: string
  endAt: string
  name: string
  email: string
  company?: string
  topic?: string
  source?: string
  meetLink?: string
  googleEventId?: string
  googleCalendarId?: string
  createdAt?: string
}

export const DEFAULT_RULES: BookingRules = {
  slotMinutes: 30,
  workingDays: [1, 2, 3, 4, 5],
  workingHoursStart: '10:00',
  workingHoursEnd: '17:00',
  slotPresets: ['10:00', '13:00', '16:00'],
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 15,
  minNoticeHours: 12,
  maxAdvanceDays: 60,
  timezone: 'Europe/Warsaw',
}

export async function getBookingRules(): Promise<BookingRules> {
  const doc = await clientWithoutToken.fetch<Partial<BookingRules> | null>(
    `*[_id == "bookingRules"][0]{
      slotMinutes, workingDays, workingHoursStart, workingHoursEnd,
      slotPresets, bufferBeforeMinutes, bufferAfterMinutes,
      minNoticeHours, maxAdvanceDays, timezone
    }`
  )
  if (!doc) return DEFAULT_RULES
  return {
    ...DEFAULT_RULES,
    ...doc,
    workingDays: Array.isArray(doc.workingDays) && doc.workingDays.length > 0 ? doc.workingDays : DEFAULT_RULES.workingDays,
    slotPresets: Array.isArray(doc.slotPresets) ? doc.slotPresets : DEFAULT_RULES.slotPresets,
  } as BookingRules
}

export async function saveBookingRules(rules: Partial<BookingRules>): Promise<void> {
  await client.createOrReplace({
    _id: 'bookingRules',
    _type: 'bookingRules',
    ...DEFAULT_RULES,
    ...rules,
  })
}

export async function getBlocksBetween(fromIso: string, toIso: string): Promise<BookingTimeBlock[]> {
  const docs = await clientWithoutToken.fetch<BookingTimeBlock[]>(
    `*[_type == "bookingTimeBlock" && endAt > $from && startAt < $to]
       | order(startAt asc){
         _id, title, allDay, startAt, endAt, createdBy
       }`,
    { from: fromIso, to: toIso }
  )
  return docs ?? []
}

export async function listBlocks(limit = 200): Promise<BookingTimeBlock[]> {
  return (
    (await clientWithoutToken.fetch<BookingTimeBlock[]>(
      `*[_type == "bookingTimeBlock"] | order(startAt desc)[0...$limit]{
         _id, title, allDay, startAt, endAt, createdBy
       }`,
      { limit }
    )) ?? []
  )
}

export async function createBlock(input: Omit<BookingTimeBlock, '_id'>) {
  return client.create({
    _type: 'bookingTimeBlock',
    ...input,
  })
}

export async function deleteBlock(id: string) {
  return client.delete(id)
}

export async function listBookings(opts?: {
  from?: string
  to?: string
  limit?: number
  status?: MeetingBookingDoc['status']
}): Promise<MeetingBookingDoc[]> {
  const { from, to, limit = 100, status } = opts ?? {}
  const filters = [`_type == "meetingBooking"`]
  const params: Record<string, unknown> = { limit }
  if (from) {
    filters.push(`startAt >= $from`)
    params.from = from
  }
  if (to) {
    filters.push(`startAt < $to`)
    params.to = to
  }
  if (status) {
    filters.push(`status == $status`)
    params.status = status
  }
  const query = `*[${filters.join(' && ')}] | order(startAt desc)[0...$limit]{
    _id, status, startAt, endAt, name, email, company, topic, source,
    meetLink, googleEventId, googleCalendarId, createdAt
  }`
  return (await clientWithoutToken.fetch<MeetingBookingDoc[]>(query, params)) ?? []
}

export async function createBooking(input: Omit<MeetingBookingDoc, '_id'>) {
  return client.create({
    _type: 'meetingBooking',
    ...input,
  })
}

export async function updateBookingStatus(id: string, status: MeetingBookingDoc['status']) {
  return client.patch(id).set({ status }).commit()
}

export async function countBookingsSince(fromIso: string): Promise<number> {
  return (
    (await clientWithoutToken.fetch<number>(
      `count(*[_type == "meetingBooking" && createdAt >= $from])`,
      { from: fromIso }
    )) ?? 0
  )
}
