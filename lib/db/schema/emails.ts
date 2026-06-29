import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const emailTemplates = pgTable('email_templates', {
  id: text('id').primaryKey().default('default'),
  data: jsonb('data').$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})
