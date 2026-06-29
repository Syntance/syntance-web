import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const bookingRules = pgTable('booking_rules', {
  id: text('id').primaryKey().default('default'),
  slotMinutes: integer('slot_minutes').notNull().default(30),
  workingDays: jsonb('working_days').$type<number[]>().notNull().default([1, 2, 3, 4, 5]),
  workingHoursStart: text('working_hours_start').notNull().default('10:00'),
  workingHoursEnd: text('working_hours_end').notNull().default('17:00'),
  slotPresets: jsonb('slot_presets').$type<string[]>().notNull().default(['10:00', '13:00', '16:00']),
  bufferBeforeMinutes: integer('buffer_before_minutes').notNull().default(0),
  bufferAfterMinutes: integer('buffer_after_minutes').notNull().default(15),
  minNoticeHours: integer('min_notice_hours').notNull().default(12),
  maxAdvanceDays: integer('max_advance_days').notNull().default(60),
  timezone: text('timezone').notNull().default('Europe/Warsaw'),
})

export const bookingTimeBlocks = pgTable('booking_time_blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  sanityId: text('sanity_id'),
  title: text('title').notNull(),
  allDay: boolean('all_day').notNull().default(false),
  startAt: timestamp('start_at', { withTimezone: true }).notNull(),
  endAt: timestamp('end_at', { withTimezone: true }).notNull(),
  createdBy: text('created_by'),
})

export const meetingBookings = pgTable('meeting_bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  sanityId: text('sanity_id'),
  status: text('status').notNull().default('confirmed'),
  startAt: timestamp('start_at', { withTimezone: true }).notNull(),
  endAt: timestamp('end_at', { withTimezone: true }).notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  company: text('company'),
  topic: text('topic'),
  source: text('source'),
  meetLink: text('meet_link'),
  googleEventId: text('google_event_id'),
  googleCalendarId: text('google_calendar_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})
