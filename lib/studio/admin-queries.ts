import { and, asc, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm'
import { z } from 'zod'
import { getDb, schema } from '@/lib/db'
import { ENTITLEMENTS } from './license-contract'
import { DrizzleStudioStore } from './drizzle-store'
import { writeAudit } from './audit'
import { DrizzlePromoStore, toPromo } from './drizzle-promo-store'
import { StudioHttpError, customerId } from './license-service'
import { DrizzlePlanStore } from './drizzle-plan-store'
import { deriveEntitlements } from './features'

/** Zapytania panelu (tylko dla zalogowanego właściciela). Dane osobowe: e-mail, nazwy urządzeń. */

export interface LicenseListItem {
  id: string
  key: string
  email: string
  plan: 'perpetual' | 'subscription'
  entitlements: string[]
  status: 'active' | 'revoked'
  maxDevices: number
  deviceCount: number
  updatesUntil: string
  expiresAt: string | null
  source: string | null
  note: string
  createdAt: string
}

export interface Page<T> {
  rows: T[]
  total: number
  page: number
  pageSize: number
}

export const ListParams = z.object({
  q: z.string().max(100).default(''),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(25),
  dir: z.enum(['asc', 'desc']).default('desc'),
})

const escapeLike = (s: string): string => s.replace(/[\\%_]/g, '\\$&')
const offsetOf = (p: { page: number; pageSize: number }): number => (p.page - 1) * p.pageSize

export const LicenseListParams = ListParams.extend({
  status: z.enum(['active', 'revoked', 'all']).default('all'),
  plan: z.enum(['perpetual', 'subscription', 'all']).default('all'),
  sort: z.enum(['createdAt', 'email', 'updatesUntil', 'expiresAt']).default('createdAt'),
  /** Filtr po e-mailu klienta. */
  email: z.email().optional(),
})
export type LicenseListParams = z.infer<typeof LicenseListParams>

export async function listLicenses(appSlug: string, params: LicenseListParams): Promise<Page<LicenseListItem>> {
  const db = getDb()
  const L = schema.studioLicenses
  const term = params.q.trim()
  const where = and(
    eq(L.appSlug, appSlug),
    params.status === 'all' ? undefined : eq(L.status, params.status),
    params.plan === 'all' ? undefined : eq(L.plan, params.plan),
    params.email ? sql`lower(${L.email}) = ${params.email.toLowerCase()}` : undefined,
    term
      ? or(
          ilike(L.email, `%${escapeLike(term)}%`),
          ilike(L.key, `%${escapeLike(term.toUpperCase())}%`),
          ilike(L.note, `%${escapeLike(term)}%`),
        )
      : undefined,
  )
  const column = { createdAt: L.createdAt, email: L.email, updatesUntil: L.updatesUntil, expiresAt: L.expiresAt }[params.sort]
  const [rows, counted] = await Promise.all([
    db
      .select({
        l: L,
        deviceCount: sql<number>`(select count(*)::int from studio_devices d where d.license_id = ${L.id})`,
      })
      .from(L)
      .where(where)
      .orderBy(params.dir === 'asc' ? asc(column) : desc(column), desc(L.createdAt))
      .limit(params.pageSize)
      .offset(offsetOf(params)),
    db.select({ total: sql<number>`count(*)::int` }).from(L).where(where),
  ])
  return {
    total: counted[0]?.total ?? 0,
    page: params.page,
    pageSize: params.pageSize,
    rows: rows.map(({ l, deviceCount }) => ({
      id: l.id,
      key: l.key,
      email: l.email,
      plan: l.plan,
      entitlements: l.entitlements,
      status: l.status,
      maxDevices: l.maxDevices,
      deviceCount,
      updatesUntil: l.updatesUntil.toISOString(),
      expiresAt: l.expiresAt?.toISOString() ?? null,
      source: l.sourceProvider ? `${l.sourceProvider}:${l.sourceReference ?? ''}` : null,
      note: l.note,
      createdAt: l.createdAt.toISOString(),
    })),
  }
}

export async function getLicenseDetail(id: string) {
  const record = await new DrizzleStudioStore().findById(id)
  if (!record) return null
  const db = getDb()
  const [orders, audit, redemptions, blocked] = await Promise.all([
    db.select().from(schema.studioOrders).where(eq(schema.studioOrders.licenseId, id)).orderBy(desc(schema.studioOrders.createdAt)),
    db.select().from(schema.studioAuditLog).where(eq(schema.studioAuditLog.target, id)).orderBy(desc(schema.studioAuditLog.at)).limit(50),
    db
      .select({ code: schema.studioPromoCodes.code, at: schema.studioPromoRedemptions.createdAt })
      .from(schema.studioPromoRedemptions)
      .innerJoin(schema.studioPromoCodes, eq(schema.studioPromoCodes.id, schema.studioPromoRedemptions.codeId))
      .where(eq(schema.studioPromoRedemptions.licenseId, id)),
    new DrizzleStudioStore().isBlocked(record.email),
  ])
  return { license: record, orders, audit, redemptions, customerId: customerId(record.email), blocked }
}

export const OrderListParams = ListParams.extend({ kind: z.enum(['purchase', 'renewal', 'refund', 'manual', 'all']).default('all') })

export async function listOrders(params: z.infer<typeof OrderListParams>): Promise<Page<typeof schema.studioOrders.$inferSelect>> {
  const O = schema.studioOrders
  const term = params.q.trim()
  const where = and(
    params.kind === 'all' ? undefined : eq(O.kind, params.kind),
    term ? or(ilike(O.email, `%${escapeLike(term)}%`), ilike(O.reference, `%${escapeLike(term)}%`)) : undefined,
  )
  const [rows, counted] = await Promise.all([
    getDb().select().from(O).where(where).orderBy(params.dir === 'asc' ? asc(O.createdAt) : desc(O.createdAt)).limit(params.pageSize).offset(offsetOf(params)),
    getDb().select({ total: sql<number>`count(*)::int` }).from(O).where(where),
  ])
  return { rows, total: counted[0]?.total ?? 0, page: params.page, pageSize: params.pageSize }
}

export const AuditListParams = ListParams.extend({ action: z.string().max(60).default('') })

export async function listAudit(params: z.infer<typeof AuditListParams>): Promise<Page<typeof schema.studioAuditLog.$inferSelect>> {
  const A = schema.studioAuditLog
  const term = params.q.trim()
  const where = and(
    params.action ? ilike(A.action, `${escapeLike(params.action)}%`) : undefined,
    term
      ? or(ilike(A.actor, `%${escapeLike(term)}%`), ilike(A.action, `%${escapeLike(term)}%`), ilike(A.target, `%${escapeLike(term)}%`))
      : undefined,
  )
  const [rows, counted] = await Promise.all([
    getDb().select().from(A).where(where).orderBy(params.dir === 'asc' ? asc(A.at) : desc(A.at)).limit(params.pageSize).offset(offsetOf(params)),
    getDb().select({ total: sql<number>`count(*)::int` }).from(A).where(where),
  ])
  return { rows, total: counted[0]?.total ?? 0, page: params.page, pageSize: params.pageSize }
}

export interface CustomerListItem {
  id: string
  email: string
  licenses: number
  active: number
  devices: number
  blocked: boolean
  firstSeen: string
}

const emailHash = (col: unknown) => sql`encode(sha256(convert_to(lower(${col}), 'UTF8')), 'hex')`

export const CustomerListParams = ListParams.extend({
  sort: z.enum(['firstSeen', 'email', 'licenses']).default('firstSeen'),
  blocked: z.enum(['all', 'yes']).default('all'),
})

/** „Użytkownicy” = unikalne e-maile z licencji (aplikacja nie ma kont logowania — ADR 001). Id klienta = SHA-256 e-maila. */
export async function listCustomers(appSlug: string, params: z.infer<typeof CustomerListParams>): Promise<Page<CustomerListItem>> {
  const L = schema.studioLicenses
  const F = schema.studioCustomerFlags
  const term = params.q.trim()
  const filter = and(eq(L.appSlug, appSlug), term ? ilike(L.email, `%${escapeLike(term)}%`) : undefined)
  const order = { firstSeen: sql`min(${L.createdAt})`, email: sql`lower(${L.email})`, licenses: sql`count(*)` }[params.sort]
  const rows = await getDb()
    .select({
      email: sql<string>`lower(${L.email})`,
      licenses: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where ${L.status} = 'active')::int`,
      devices: sql<number>`coalesce(sum((select count(*) from studio_devices d where d.license_id = ${L.id})), 0)::int`,
      blocked: sql<boolean>`bool_or(${F.blockedAt} is not null)`,
      firstSeen: sql<string>`min(${L.createdAt})`,
    })
    .from(L)
    .leftJoin(F, sql`${F.email} = lower(${L.email})`)
    .where(filter)
    .groupBy(sql`lower(${L.email})`)
    .having(params.blocked === 'yes' ? sql`bool_or(${F.blockedAt} is not null)` : undefined)
    .orderBy(params.dir === 'asc' ? sql`${order} asc` : sql`${order} desc`)
    .limit(params.pageSize)
    .offset(offsetOf(params))
  const counted = await getDb()
    .select({ total: sql<number>`count(distinct lower(${L.email}))::int` })
    .from(L)
    .leftJoin(F, sql`${F.email} = lower(${L.email})`)
    .where(and(filter, params.blocked === 'yes' ? sql`${F.blockedAt} is not null` : undefined))
  return {
    total: counted[0]?.total ?? 0,
    page: params.page,
    pageSize: params.pageSize,
    rows: rows.map((r) => ({ ...r, id: customerId(r.email), blocked: Boolean(r.blocked), firstSeen: new Date(r.firstSeen).toISOString() })),
  }
}

/** Szczegóły klienta po id (SHA-256 e-maila): licencje, urządzenia, zamówienia, kody, flagi, audyt. */
export async function getCustomerDetail(appSlug: string, id: string) {
  if (!/^[0-9a-f]{64}$/.test(id)) return null
  const db = getDb()
  const L = schema.studioLicenses
  const licenses = await db
    .select()
    .from(L)
    .where(and(eq(L.appSlug, appSlug), sql`${emailHash(L.email)} = ${id}`))
    .orderBy(desc(L.createdAt))
  const first = licenses[0]
  if (!first) return null
  const email = first.email.toLowerCase()
  const ids = licenses.map((l) => l.id)
  const [devices, orders, redemptions, flags, audit] = await Promise.all([
    db.select().from(schema.studioDevices).where(inArray(schema.studioDevices.licenseId, ids)),
    db.select().from(schema.studioOrders).where(inArray(schema.studioOrders.licenseId, ids)).orderBy(desc(schema.studioOrders.createdAt)),
    db
      .select({ code: schema.studioPromoCodes.code, at: schema.studioPromoRedemptions.createdAt, source: schema.studioPromoRedemptions.source })
      .from(schema.studioPromoRedemptions)
      .innerJoin(schema.studioPromoCodes, eq(schema.studioPromoCodes.id, schema.studioPromoRedemptions.codeId))
      .where(eq(schema.studioPromoRedemptions.email, email)),
    db.select().from(schema.studioCustomerFlags).where(eq(schema.studioCustomerFlags.email, email)).limit(1),
    db.select().from(schema.studioAuditLog).where(inArray(schema.studioAuditLog.target, [id, ...ids])).orderBy(desc(schema.studioAuditLog.at)).limit(100),
  ])
  const flag = flags[0]
  return {
    id,
    email,
    blocked: Boolean(flag?.blockedAt),
    blockedReason: flag?.blockedReason ?? '',
    licenses: licenses.map((l) => ({
      id: l.id,
      key: l.key,
      plan: l.plan,
      entitlements: l.entitlements,
      status: l.status,
      maxDevices: l.maxDevices,
      updatesUntil: l.updatesUntil.toISOString(),
      expiresAt: l.expiresAt?.toISOString() ?? null,
      createdAt: l.createdAt.toISOString(),
    })),
    devices: devices.map((d) => ({ licenseId: d.licenseId, deviceId: d.deviceId, name: d.name, lastSeen: d.lastSeen.toISOString() })),
    orders,
    redemptions: redemptions.map((r) => ({ ...r, at: r.at.toISOString() })),
    audit,
  }
}

export async function getStudioStats(appSlug: string) {
  const t = await getDb().execute(sql`
    select
      (select count(*)::int from studio_licenses where app_slug = ${appSlug} and status = 'active') as active_licenses,
      (select count(*)::int from studio_licenses where app_slug = ${appSlug} and status = 'revoked') as revoked_licenses,
      (select count(*)::int from studio_licenses where app_slug = ${appSlug} and created_at > now() - interval '30 days') as new_30d,
      (select count(*)::int from studio_licenses where app_slug = ${appSlug} and plan = 'subscription' and status = 'active' and expires_at between now() and now() + interval '14 days') as expiring_14d,
      (select count(distinct lower(email))::int from studio_licenses where app_slug = ${appSlug}) as customers,
      (select count(*)::int from studio_devices d join studio_licenses l on l.id = d.license_id where l.app_slug = ${appSlug} and d.last_seen > now() - interval '30 days') as active_devices_30d,
      (select count(*)::int from studio_customer_flags where blocked_at is not null) as blocked_customers,
      (select count(*)::int from studio_promo_codes where app_slug = ${appSlug} and active) as active_codes
  `)
  const r = (t.rows[0] ?? {}) as Record<string, number>
  return {
    activeLicenses: r.active_licenses ?? 0,
    revokedLicenses: r.revoked_licenses ?? 0,
    new30d: r.new_30d ?? 0,
    expiring14d: r.expiring_14d ?? 0,
    customers: r.customers ?? 0,
    activeDevices30d: r.active_devices_30d ?? 0,
    blockedCustomers: r.blocked_customers ?? 0,
    activeCodes: r.active_codes ?? 0,
  }
}

export async function listPromoCodes(appSlug: string) {
  const rows = await getDb()
    .select()
    .from(schema.studioPromoCodes)
    .where(eq(schema.studioPromoCodes.appSlug, appSlug))
    .orderBy(desc(schema.studioPromoCodes.createdAt))
    .limit(500)
  return rows.map(toPromo)
}

export async function getPromoDetail(id: string) {
  const code = await new DrizzlePromoStore().findById(id)
  if (!code) return null
  const R = schema.studioPromoRedemptions
  const redemptions = await getDb()
    .select({ id: R.id, email: R.email, licenseId: R.licenseId, source: R.source, discountAmount: R.discountAmount, currency: R.currency, createdAt: R.createdAt })
    .from(R)
    .where(eq(R.codeId, id))
    .orderBy(desc(R.createdAt))
    .limit(500)
  const audit = await getDb().select().from(schema.studioAuditLog).where(eq(schema.studioAuditLog.target, id)).orderBy(desc(schema.studioAuditLog.at)).limit(50)
  return { code, redemptions, audit }
}

/** Eksport danych osoby (RODO art. 15/20): licencje, urządzenia, zamówienia. */
export async function exportSubject(email: string) {
  const db = getDb()
  const normalized = email.trim().toLowerCase()
  const licenses = await db.select().from(schema.studioLicenses).where(sql`lower(${schema.studioLicenses.email}) = ${normalized}`)
  const ids = licenses.map((l) => l.id)
  const devices = ids.length ? await db.select().from(schema.studioDevices).where(inArray(schema.studioDevices.licenseId, ids)) : []
  const orders = await db.select().from(schema.studioOrders).where(sql`lower(${schema.studioOrders.email}) = ${normalized}`)
  return { email: normalized, exportedAt: new Date().toISOString(), licenses, devices, orders }
}

/**
 * Wymazanie danych osoby (RODO art. 17): anonimizacja e-maila i nazw urządzeń, unieważnienie licencji.
 * Zamówienia zostają (obowiązek księgowy 5 lat), ale bez e-maila.
 */
export async function eraseSubject(actor: string, email: string): Promise<{ licenses: number }> {
  const db = getDb()
  const normalized = email.trim().toLowerCase()
  const licenses = await db.select({ id: schema.studioLicenses.id }).from(schema.studioLicenses).where(sql`lower(${schema.studioLicenses.email}) = ${normalized}`)
  for (const { id } of licenses) {
    const anon = `erased-${id.slice(0, 8)}@invalid.local`
    await db.update(schema.studioLicenses).set({ email: anon, note: '', status: 'revoked' }).where(eq(schema.studioLicenses.id, id))
    await db.update(schema.studioDevices).set({ name: '' }).where(eq(schema.studioDevices.licenseId, id))
    await db.update(schema.studioOrders).set({ email: anon }).where(eq(schema.studioOrders.licenseId, id))
    await writeAudit({ actor, action: 'subject.erased', target: id })
  }
  return { licenses: licenses.length }
}

export const PriceInput = z.object({
  priceId: z.string().min(1).max(100),
  appSlug: z.string().min(1).max(50).default('studio'),
  label: z.string().max(120).default(''),
  plan: z.enum(['perpetual', 'subscription']),
  entitlements: z.array(z.enum(ENTITLEMENTS)).min(1),
  updateMonths: z.number().int().min(1).max(120).default(12),
  /** Plan z katalogu planów: wtedy plan/uprawnienia/okres bierze się z planu, a zakup wystawia licencję o jego zakresie. */
  planId: z.uuid().nullable().default(null),
})
export type PriceInput = z.infer<typeof PriceInput>

export async function listPrices(appSlug: string) {
  return getDb().select().from(schema.studioPrices).where(eq(schema.studioPrices.appSlug, appSlug))
}

export async function upsertPrice(actor: string, input: PriceInput): Promise<void> {
  let fields = input
  if (input.planId) {
    const plan = await new DrizzlePlanStore().findPlan(input.planId)
    if (!plan || plan.kind !== 'paid') throw new StudioHttpError(400, 'UNKNOWN_PLAN')
    const catalog = await new DrizzlePlanStore().listFeatures()
    fields = { ...input, plan: plan.billing, entitlements: deriveEntitlements(plan.features, catalog), updateMonths: plan.updateMonths }
  }
  const values = { provider: 'paddle', ...fields }
  await getDb()
    .insert(schema.studioPrices)
    .values(values)
    .onConflictDoUpdate({
      target: [schema.studioPrices.provider, schema.studioPrices.priceId],
      set: { appSlug: fields.appSlug, label: fields.label, plan: fields.plan, entitlements: fields.entitlements, updateMonths: fields.updateMonths, planId: fields.planId },
    })
  await writeAudit({ actor, action: 'price.upserted', target: input.priceId, meta: { plan: input.plan, entitlements: input.entitlements } })
}

export async function deletePrice(actor: string, priceId: string): Promise<void> {
  await getDb().delete(schema.studioPrices).where(and(eq(schema.studioPrices.provider, 'paddle'), eq(schema.studioPrices.priceId, priceId)))
  await writeAudit({ actor, action: 'price.deleted', target: priceId })
}

/** Plany z liczbą licencji wystawionych z danego planu (informacyjnie). */
export async function listPlansWithUsage() {
  const plans = await new DrizzlePlanStore().listPlans()
  const counts = await getDb()
    .select({ planId: schema.studioLicenses.planId, n: sql<number>`count(*)::int` })
    .from(schema.studioLicenses)
    .groupBy(schema.studioLicenses.planId)
  const byPlan = new Map(counts.map((c) => [c.planId, c.n]))
  return plans.map((p) => ({ ...p, licenseCount: byPlan.get(p.id) ?? 0 }))
}
