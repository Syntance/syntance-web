import { count, desc, eq, gte, lt, and } from 'drizzle-orm'
import { getDb, hasDb } from '@/lib/db'
import {
  bookingRules,
  bookingTimeBlocks,
  meetingBookings,
} from '@/lib/db/schema'

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

function rowToRules(row: typeof bookingRules.$inferSelect): BookingRules {
  return {
    slotMinutes: row.slotMinutes,
    workingDays: row.workingDays ?? DEFAULT_RULES.workingDays,
    workingHoursStart: row.workingHoursStart,
    workingHoursEnd: row.workingHoursEnd,
    slotPresets: row.slotPresets ?? DEFAULT_RULES.slotPresets,
    bufferBeforeMinutes: row.bufferBeforeMinutes,
    bufferAfterMinutes: row.bufferAfterMinutes,
    minNoticeHours: row.minNoticeHours,
    maxAdvanceDays: row.maxAdvanceDays,
    timezone: row.timezone,
  }
}

function rowToBlock(row: typeof bookingTimeBlocks.$inferSelect): BookingTimeBlock {
  return {
    _id: row.sanityId ?? row.id,
    title: row.title,
    allDay: row.allDay,
    startAt: row.startAt.toISOString(),
    endAt: row.endAt.toISOString(),
    createdBy: row.createdBy ?? undefined,
  }
}

function rowToBooking(row: typeof meetingBookings.$inferSelect): MeetingBookingDoc {
  return {
    _id: row.sanityId ?? row.id,
    status: row.status as MeetingBookingDoc['status'],
    startAt: row.startAt.toISOString(),
    endAt: row.endAt.toISOString(),
    name: row.name,
    email: row.email,
    company: row.company ?? undefined,
    topic: row.topic ?? undefined,
    source: row.source ?? undefined,
    meetLink: row.meetLink ?? undefined,
    googleEventId: row.googleEventId ?? undefined,
    googleCalendarId: row.googleCalendarId ?? undefined,
    createdAt: row.createdAt?.toISOString(),
  }
}

export async function getBookingRules(): Promise<BookingRules> {
  if (!hasDb()) return DEFAULT_RULES
  const db = getDb()
  const row = await db.query.bookingRules.findFirst({
    where: eq(bookingRules.id, 'default'),
  })
  return row ? rowToRules(row) : DEFAULT_RULES
}

export async function saveBookingRules(rules: Partial<BookingRules>): Promise<void> {
  const merged = { ...DEFAULT_RULES, ...rules }
  const db = getDb()
  await db
    .insert(bookingRules)
    .values({
      id: 'default',
      ...merged,
    })
    .onConflictDoUpdate({
      target: bookingRules.id,
      set: merged,
    })
}

export async function getBlocksBetween(fromIso: string, toIso: string): Promise<BookingTimeBlock[]> {
  if (!hasDb()) return []
  const db = getDb()
  const rows = await db
    .select()
    .from(bookingTimeBlocks)
    .where(and(lt(bookingTimeBlocks.startAt, new Date(toIso)), gte(bookingTimeBlocks.endAt, new Date(fromIso))))
    .orderBy(bookingTimeBlocks.startAt)
  return rows.map(rowToBlock)
}

export async function listBlocks(limit = 200): Promise<BookingTimeBlock[]> {
  if (!hasDb()) return []
  const db = getDb()
  const rows = await db.select().from(bookingTimeBlocks).orderBy(desc(bookingTimeBlocks.startAt)).limit(limit)
  return rows.map(rowToBlock)
}

export async function createBlock(input: Omit<BookingTimeBlock, '_id'>) {
  const db = getDb()
  const [row] = await db
    .insert(bookingTimeBlocks)
    .values({
      title: input.title,
      allDay: input.allDay,
      startAt: new Date(input.startAt),
      endAt: new Date(input.endAt),
      createdBy: input.createdBy,
    })
    .returning()
  return rowToBlock(row)
}

export async function deleteBlock(id: string) {
  const db = getDb()
  await db.delete(bookingTimeBlocks).where(eq(bookingTimeBlocks.id, id))
  await db.delete(bookingTimeBlocks).where(eq(bookingTimeBlocks.sanityId, id))
}

export async function listBookings(opts?: {
  from?: string
  to?: string
  limit?: number
  status?: MeetingBookingDoc['status']
}): Promise<MeetingBookingDoc[]> {
  if (!hasDb()) return []
  const { from, to, limit = 100, status } = opts ?? {}
  const db = getDb()
  const conditions = []
  if (from) conditions.push(gte(meetingBookings.startAt, new Date(from)))
  if (to) conditions.push(lt(meetingBookings.startAt, new Date(to)))
  if (status) conditions.push(eq(meetingBookings.status, status))

  const rows = await db
    .select()
    .from(meetingBookings)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(meetingBookings.startAt))
    .limit(limit)
  return rows.map(rowToBooking)
}

export async function createBooking(input: Omit<MeetingBookingDoc, '_id'>) {
  const db = getDb()
  const [row] = await db
    .insert(meetingBookings)
    .values({
      status: input.status,
      startAt: new Date(input.startAt),
      endAt: new Date(input.endAt),
      name: input.name,
      email: input.email,
      company: input.company,
      topic: input.topic,
      source: input.source,
      meetLink: input.meetLink,
      googleEventId: input.googleEventId,
      googleCalendarId: input.googleCalendarId,
      createdAt: input.createdAt ? new Date(input.createdAt) : new Date(),
    })
    .returning()
  return rowToBooking(row)
}

export async function updateBookingStatus(id: string, status: MeetingBookingDoc['status']) {
  const db = getDb()
  const byUuid = await db
    .update(meetingBookings)
    .set({ status })
    .where(eq(meetingBookings.id, id))
    .returning()
  if (byUuid.length) return rowToBooking(byUuid[0])
  const bySanity = await db
    .update(meetingBookings)
    .set({ status })
    .where(eq(meetingBookings.sanityId, id))
    .returning()
  if (bySanity.length) return rowToBooking(bySanity[0])
  return null
}

export async function countBookingsSince(fromIso: string): Promise<number> {
  if (!hasDb()) return 0
  const db = getDb()
  const [result] = await db
    .select({ value: count() })
    .from(meetingBookings)
    .where(gte(meetingBookings.createdAt, new Date(fromIso)))
  return result?.value ?? 0
}

export async function findBookingById(id: string): Promise<MeetingBookingDoc | null> {
  if (!hasDb()) return null
  const db = getDb()
  const byUuid = await db.query.meetingBookings.findFirst({ where: eq(meetingBookings.id, id) })
  if (byUuid) return rowToBooking(byUuid)
  const bySanity = await db.query.meetingBookings.findFirst({ where: eq(meetingBookings.sanityId, id) })
  return bySanity ? rowToBooking(bySanity) : null
}

export async function deleteBooking(id: string): Promise<void> {
  const db = getDb()
  await db.delete(meetingBookings).where(eq(meetingBookings.id, id))
  await db.delete(meetingBookings).where(eq(meetingBookings.sanityId, id))
}

export async function patchBooking(id: string, patch: Partial<MeetingBookingDoc>) {
  const db = getDb()
  const set: Partial<typeof meetingBookings.$inferInsert> = {}
  if (patch.status) set.status = patch.status
  if (patch.meetLink !== undefined) set.meetLink = patch.meetLink
  if (patch.googleEventId !== undefined) set.googleEventId = patch.googleEventId
  if (patch.googleCalendarId !== undefined) set.googleCalendarId = patch.googleCalendarId

  const byUuid = await db.update(meetingBookings).set(set).where(eq(meetingBookings.id, id)).returning()
  if (byUuid.length) return rowToBooking(byUuid[0])
  const bySanity = await db.update(meetingBookings).set(set).where(eq(meetingBookings.sanityId, id)).returning()
  return bySanity.length ? rowToBooking(bySanity[0]) : null
}
