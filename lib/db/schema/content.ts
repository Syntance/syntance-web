import { boolean, integer, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import type { PortfolioProjectType } from '@/lib/portfolio-content'
import type { PortfolioPerformanceReport } from '@/lib/portfolio-performance'

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
  slug: text('slug').notNull(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  projectType: text('project_type').$type<PortfolioProjectType>().notNull().default('website'),
  description: text('description').notNull().default(''),
  highlights: jsonb('highlights').$type<string[]>().notNull().default([]),
  stack: jsonb('stack').$type<string[]>().notNull().default([]),
  problemStatement: text('problem_statement'),
  rebuildContext: text('rebuild_context'),
  previewImageFallback: text('preview_image_fallback'),
  previewImageAlt: text('preview_image_alt'),
  logoUrl: text('logo_url'),
  logoAlt: text('logo_alt'),
  performance: jsonb('performance').$type<PortfolioPerformanceReport | null>(),
  sortOrder: integer('sort_order').notNull().default(0),
  disabled: boolean('disabled').notNull().default(false),
  caseStudyEnabled: boolean('case_study_enabled').notNull().default(true),
  adminGalleryEnabled: boolean('admin_gallery_enabled').notNull().default(false),
})
