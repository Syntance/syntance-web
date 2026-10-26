import { sql } from 'drizzle-orm'
import {
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
