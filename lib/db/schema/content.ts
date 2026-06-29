import { boolean, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core'

export const faqEntries = pgTable('faq_entries', {
  id: text('id').primaryKey(),
  section: text('section').notNull(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: text('category'),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
})

export const portfolioItems = pgTable('portfolio_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  sanityId: text('sanity_id'),
  name: text('name').notNull(),
  url: text('url').notNull(),
  logoUrl: text('logo_url'),
  logoAlt: text('logo_alt'),
  sortOrder: integer('sort_order').notNull().default(0),
  disabled: boolean('disabled').notNull().default(false),
})
