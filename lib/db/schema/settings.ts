import { integer, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core'

export const paymentSettings = pgTable('payment_settings', {
  id: text('id').primaryKey().default('default'),
  data: jsonb('data').$type<Record<string, unknown>>().notNull().default({}),
})

export const contractFiles = pgTable('contract_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  sanityId: text('sanity_id'),
  label: text('label').notNull(),
  fileUrl: text('file_url'),
  fileName: text('file_name'),
  projectType: text('project_type'),
  sortOrder: integer('sort_order').notNull().default(0),
})
