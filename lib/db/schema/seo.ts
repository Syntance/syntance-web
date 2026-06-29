import { boolean, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const seoGlobal = pgTable('seo_global', {
  id: text('id').primaryKey().default('default'),
  metaTitle: text('meta_title'),
  metaTitleTemplate: text('meta_title_template'),
  metaDescription: text('meta_description'),
  canonicalUrl: text('canonical_url'),
  keywords: jsonb('keywords').$type<string[]>().default([]),
  ogTitle: text('og_title'),
  ogDescription: text('og_description'),
  ogImageUrl: text('og_image_url'),
  twitterTitle: text('twitter_title'),
  twitterDescription: text('twitter_description'),
  twitterImageAlt: text('twitter_image_alt'),
  organizationName: text('organization_name'),
  organizationDescription: text('organization_description'),
  foundingDate: text('founding_date'),
  founderName: text('founder_name'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  address: jsonb('address').$type<Record<string, string>>(),
  geo: jsonb('geo').$type<{ latitude: number; longitude: number }>(),
  socialLinks: jsonb('social_links').$type<string[]>().default([]),
  openingHours: jsonb('opening_hours').$type<{
    opens: string
    closes: string
    days: string[]
  }>(),
  services: jsonb('services').$type<
    Array<{
      name: string
      description: string
      serviceType: string
      priceRange?: string
      price?: number
    }>
  >().default([]),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const seoPages = pgTable('seo_pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  pageName: text('page_name').notNull(),
  slug: text('slug').notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  canonicalUrl: text('canonical_url'),
  focusKeyword: text('focus_keyword'),
  keywords: jsonb('keywords').$type<string[]>().default([]),
  keywordDensity: text('keyword_density'),
  ogTitle: text('og_title'),
  ogDescription: text('og_description'),
  ogImageUrl: text('og_image_url'),
  twitterTitle: text('twitter_title'),
  twitterDescription: text('twitter_description'),
  seoNotes: text('seo_notes'),
  lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow(),
})
