import { sql } from 'drizzle-orm'
import {
  type AnyPgColumn,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

/* ───────────── Panel Magazyn: konto właściciela i sesje (hasło Argon2id + TOTP) ───────────── */

export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  /** Argon2id (PHC string). */
  passwordHash: text('password_hash').notNull(),
  /** Sekret TOTP zaszyfrowany AES-256-GCM (klucz w env, nie w bazie). Null do czasu zakończenia konfiguracji. */
  totpSecretEnc: text('totp_secret_enc'),
  totpEnabledAt: timestamp('totp_enabled_at', { withTimezone: true }),
  /** Ostatni zaakceptowany krok TOTP — blokuje ponowne użycie kodu. */
  totpLastStep: integer('totp_last_step'),
  /** SHA-256 jednorazowych kodów zapasowych; użyty kod jest usuwany z tablicy. */
  backupCodeHashes: jsonb('backup_code_hashes').$type<string[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const adminSessions = pgTable(
  'admin_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => adminUsers.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    /** Hash IP (HMAC) i skrócony user agent — do przeglądu aktywnych sesji, bez surowego IP. */
    ipHash: text('ip_hash'),
    userAgent: text('user_agent'),
  },
  (t) => [index('admin_sessions_user_idx').on(t.userId)],
)

/* ───────────── Syntance Studio: aplikacje, licencje, urządzenia, zamówienia ───────────── */

/** Sprzedawane aplikacje — każda to zakładka w /magazyn. */
export const studioApps = pgTable('studio_apps', {
  slug: text('slug').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const studioLicenses = pgTable(
  'studio_licenses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    appSlug: text('app_slug')
      .notNull()
      .references(() => studioApps.slug),
    key: text('key').notNull().unique(),
    email: text('email').notNull(),
    plan: text('plan').$type<'perpetual' | 'subscription'>().notNull(),
    entitlements: jsonb('entitlements').$type<string[]>().notNull(),
    updatesUntil: timestamp('updates_until', { withTimezone: true }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    maxDevices: smallint('max_devices').notNull().default(2),
    status: text('status').$type<'active' | 'revoked'>().notNull().default('active'),
    /** Dostawca + id transakcji/subskrypcji; null = wystawiona ręcznie. Unikalne — gwarantuje jedną licencję na zakup. */
    sourceProvider: text('source_provider'),
    sourceReference: text('source_reference'),
    note: text('note').notNull().default(''),
    /** Plan, z którego skopiowano ustawienia (null = własny zakres / sprzed planów). Licencja jest samodzielna — zmiana planu jej nie rusza. */
    planId: uuid('plan_id').references((): AnyPgColumn => studioPlans.id, { onDelete: 'set null' }),
    /** Zakres funkcji licencji; null = wszystkie funkcje wynikające z `entitlements` (licencje sprzed wprowadzenia funkcji). */
    features: jsonb('features').$type<string[] | null>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('studio_licenses_source_uq')
      .on(t.sourceProvider, t.sourceReference)
      .where(sql`${t.sourceProvider} is not null`),
    index('studio_licenses_email_idx').on(t.email),
    index('studio_licenses_app_idx').on(t.appSlug),
  ],
)

export const studioDevices = pgTable(
  'studio_devices',
  {
    licenseId: uuid('license_id')
      .notNull()
      .references(() => studioLicenses.id, { onDelete: 'cascade' }),
    /** SHA-256 odcisku urządzenia (pseudonim — nie da się z niego odtworzyć sprzętu). */
    deviceId: text('device_id').notNull(),
    /** Miejsce 1..maxDevices; unikalność (licencja, miejsce) w bazie gwarantuje limit urządzeń przy równoległych aktywacjach. */
    slot: smallint('slot').notNull(),
    name: text('name').notNull().default(''),
    activatedAt: timestamp('activated_at', { withTimezone: true }).notNull(),
    lastSeen: timestamp('last_seen', { withTimezone: true }).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.licenseId, t.deviceId] }),
    uniqueIndex('studio_devices_slot_uq').on(t.licenseId, t.slot),
  ],
)

export const studioOrders = pgTable(
  'studio_orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    licenseId: uuid('license_id').references(() => studioLicenses.id, { onDelete: 'set null' }),
    provider: text('provider').notNull(),
    eventId: text('event_id').notNull(),
    kind: text('kind').$type<'purchase' | 'renewal' | 'refund' | 'manual'>().notNull(),
    reference: text('reference').notNull(),
    email: text('email').notNull(),
    /** Jednostki najmniejsze (grosze/centy). */
    amountTotal: integer('amount_total'),
    currency: text('currency'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('studio_orders_license_idx').on(t.licenseId), index('studio_orders_email_idx').on(t.email)],
)

/** Przetworzone zdarzenia webhooków (idempotencja). `processedAt` null = odebrane, ale niedokończone. */
export const studioWebhookEvents = pgTable(
  'studio_webhook_events',
  {
    provider: text('provider').notNull(),
    eventId: text('event_id').notNull(),
    type: text('type').notNull(),
    receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
    processedAt: timestamp('processed_at', { withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.provider, t.eventId] })],
)

/** Mapowanie price id z Paddle na to, co kupuje klient. Edytowalne w panelu. */
export const studioPrices = pgTable(
  'studio_prices',
  {
    provider: text('provider').notNull().default('paddle'),
    priceId: text('price_id').notNull(),
    appSlug: text('app_slug')
      .notNull()
      .references(() => studioApps.slug),
    label: text('label').notNull().default(''),
    plan: text('plan').$type<'perpetual' | 'subscription'>().notNull(),
    entitlements: jsonb('entitlements').$type<string[]>().notNull(),
    updateMonths: smallint('update_months').notNull().default(12),
    /** Plan z katalogu planów — gdy ustawiony, zakup wystawia licencję o zakresie tego planu (zamiast samych `entitlements`). */
    planId: uuid('plan_id').references((): AnyPgColumn => studioPlans.id, { onDelete: 'restrict' }),
  },
  (t) => [primaryKey({ columns: [t.provider, t.priceId] })],
)

/** Dziennik audytu — operacje właściciela, aplikacji i webhooków. Bez kluczy licencji i danych wrażliwych. */
export const studioAuditLog = pgTable(
  'studio_audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    at: timestamp('at', { withTimezone: true }).notNull().defaultNow(),
    actor: text('actor').notNull(),
    action: text('action').notNull(),
    target: text('target').notNull(),
    meta: jsonb('meta').$type<Record<string, unknown>>().notNull().default({}),
  },
  (t) => [index('studio_audit_at_idx').on(t.at), index('studio_audit_target_idx').on(t.target)],
)

/* ───────────── Moduły i katalog aktualizacji (F3) ───────────── */

/** Wersje modułów zarejestrowane w panelu (pakiet .fmod w R2). Status: staged → live → withdrawn. */
export const studioModuleVersions = pgTable(
  'studio_module_versions',
  {
    moduleId: text('module_id').notNull(),
    version: text('version').notNull(),
    appSlug: text('app_slug')
      .notNull()
      .references(() => studioApps.slug)
      .default('studio'),
    channel: text('channel').$type<'stable' | 'beta'>().notNull(),
    status: text('status').$type<'staged' | 'live' | 'withdrawn'>().notNull().default('staged'),
    objectKey: text('object_key').notNull(),
    url: text('url').notNull(),
    size: integer('size').notNull(),
    sha256: text('sha256').notNull(),
    hubApiMin: smallint('hub_api_min').notNull(),
    hubApiMax: smallint('hub_api_max').notNull(),
    notesPl: text('notes_pl').notNull().default(''),
    notesEn: text('notes_en').notNull().default(''),
    /** Zweryfikowany manifest (module.json) — nazwa, opis, uprawnienie do wyświetlenia w panelu. */
    manifest: jsonb('manifest').$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.moduleId, t.version] })],
)

/** Opublikowane, podpisane katalogi (archiwum). Bieżący = najnowszy `issued_at`; `catalog_text` to dokładnie podpisany tekst. */
export const studioCatalogs = pgTable(
  'studio_catalogs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    issuedAt: timestamp('issued_at', { withTimezone: true }).notNull(),
    catalogText: text('catalog_text').notNull(),
    signature: text('signature').notNull(),
    publishedBy: text('published_by').notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('studio_catalogs_issued_uq').on(t.issuedAt)],
)

/* ───────────── Klienci (flagi), kody promocyjne i ich wykorzystania ───────────── */

/** Flagi klienta po e-mailu (małe litery). Brak wiersza = klient bez blokady. Zablokowany nie aktywuje ani nie odświeża licencji. */
export const studioCustomerFlags = pgTable('studio_customer_flags', {
  email: text('email').primaryKey(),
  blockedAt: timestamp('blocked_at', { withTimezone: true }),
  blockedReason: text('blocked_reason').notNull().default(''),
  note: text('note').notNull().default(''),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const studioPromoCodes = pgTable(
  'studio_promo_codes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    appSlug: text('app_slug')
      .notNull()
      .references(() => studioApps.slug)
      .default('studio'),
    /** Wielkie litery, bez spacji (normalizowane przy zapisie i odczycie). */
    code: text('code').notNull().unique(),
    kind: text('kind').$type<'percent' | 'amount' | 'free_license' | 'trial'>().notNull(),
    /** percent: 1..100. */
    percentOff: smallint('percent_off'),
    /** amount: jednostki najmniejsze waluty `currency`. */
    amountOff: integer('amount_off'),
    currency: text('currency'),
    /** trial: liczba dni licencji próbnej. */
    trialDays: smallint('trial_days'),
    /** free_license / trial: co zostaje wystawione. */
    grantPlan: text('grant_plan').$type<'perpetual' | 'subscription'>(),
    grantEntitlements: jsonb('grant_entitlements').$type<string[]>(),
    grantUpdateMonths: smallint('grant_update_months'),
    grantMaxDevices: smallint('grant_max_devices'),
    /** Zawężenie rabatów (percent/amount) do planu / uprawnień; null = wszystkie. */
    appliesToPlan: text('applies_to_plan').$type<'perpetual' | 'subscription'>(),
    appliesToEntitlements: jsonb('applies_to_entitlements').$type<string[]>(),
    maxUses: integer('max_uses'),
    usedCount: integer('used_count').notNull().default(0),
    validFrom: timestamp('valid_from', { withTimezone: true }),
    validUntil: timestamp('valid_until', { withTimezone: true }),
    active: boolean('active').notNull().default(true),
    /** Id rabatu w Paddle (dla kodów percent/amount stosowanych w checkout) — uzupełnia właściciel po konfiguracji. */
    providerDiscountId: text('provider_discount_id'),
    note: text('note').notNull().default(''),
    createdBy: text('created_by').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('studio_promo_app_idx').on(t.appSlug)],
)

export const studioPromoRedemptions = pgTable(
  'studio_promo_redemptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    codeId: uuid('code_id')
      .notNull()
      .references(() => studioPromoCodes.id, { onDelete: 'cascade' }),
    /** Małe litery. Jeden e-mail może wykorzystać dany kod raz. */
    email: text('email').notNull(),
    licenseId: uuid('license_id').references(() => studioLicenses.id, { onDelete: 'set null' }),
    source: text('source').$type<'manual' | 'redeem' | 'paddle'>().notNull(),
    /** Udzielony rabat w jednostkach najmniejszych (kody percent/amount z zamówienia). */
    discountAmount: integer('discount_amount'),
    currency: text('currency'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('studio_promo_redemptions_uq').on(t.codeId, t.email), index('studio_promo_redemptions_code_idx').on(t.codeId)],
)

/* ───────────── Plany i katalog funkcji ───────────── */

/** Funkcje (moduły) aplikacji, które plan może zawierać. Klucze = id modułów aplikacji. */
export const studioFeatures = pgTable('studio_features', {
  key: text('key').primaryKey(),
  appSlug: text('app_slug')
    .notNull()
    .references(() => studioApps.slug)
    .default('studio'),
  label: text('label').notNull(),
  /** Uprawnienie wymagane dziś przez aplikację (null = darmowa). */
  entitlement: text('entitlement').$type<'pro' | 'print' | 'vector' | 'image'>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

/**
 * Plan = nazwany zestaw funkcji + warunki. `kind = 'free'` to plan bez licencji (jedyny, nieusuwalny): definiuje, co jest darmowe.
 * Plany płatne służą do wystawiania licencji (ręcznie i z zakupów).
 */
export const studioPlans = pgTable(
  'studio_plans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    appSlug: text('app_slug')
      .notNull()
      .references(() => studioApps.slug)
      .default('studio'),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    kind: text('kind').$type<'paid' | 'free'>().notNull().default('paid'),
    billing: text('billing').$type<'perpetual' | 'subscription'>().notNull().default('perpetual'),
    /** Wieczysta: ile miesięcy aktualizacji w cenie. Subskrypcja: długość jednego okresu. */
    updateMonths: smallint('update_months').notNull().default(12),
    maxDevices: smallint('max_devices').notNull().default(2),
    features: jsonb('features').$type<string[]>().notNull().default([]),
    active: boolean('active').notNull().default(true),
    sortOrder: smallint('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('studio_plans_slug_uq').on(t.appSlug, t.slug)],
)
