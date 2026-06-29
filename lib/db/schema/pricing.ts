import { boolean, integer, jsonb, pgTable, real, text, uuid } from 'drizzle-orm/pg-core'

export const pricingConfig = pgTable('pricing_config', {
  id: text('id').primaryKey().default('default'),
  data: jsonb('data').$type<Record<string, unknown>>().notNull().default({}),
})

export const pricingCategories = pgTable('pricing_categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'),
  sortOrder: integer('sort_order').notNull().default(0),
  showInConfigurator: boolean('show_in_configurator').notNull().default(true),
  disabled: boolean('disabled').notNull().default(false),
})

export const projectTypes = pgTable('project_types', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  basePrice: integer('base_price'),
  icon: text('icon'),
  sortOrder: integer('sort_order').notNull().default(0),
  disabled: boolean('disabled').notNull().default(false),
})

export const pricingItems = pgTable('pricing_items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull().default(0),
  hours: real('hours').notNull().default(0),
  rateType: text('rate_type'),
  categoryId: text('category_id'),
  projectTypes: jsonb('project_types').$type<string[]>().default([]),
  required: boolean('required').notNull().default(false),
  defaultSelected: boolean('default_selected').notNull().default(false),
  includedInBase: boolean('included_in_base').notNull().default(false),
  maxQuantity: integer('max_quantity'),
  percentageAdd: real('percentage_add'),
  orderRank: text('order_rank'),
  configuratorOrderRanks: jsonb('configurator_order_ranks').$type<Record<string, string>>(),
  dependencies: jsonb('dependencies').$type<string[]>().default([]),
  bundledWith: jsonb('bundled_with').$type<string[]>().default([]),
  popular: boolean('popular').notNull().default(false),
  isNew: boolean('is_new').notNull().default(false),
  disabled: boolean('disabled').notNull().default(false),
  hidePrice: boolean('hide_price').notNull().default(false),
  extra: jsonb('extra').$type<Record<string, unknown>>().default({}),
})
