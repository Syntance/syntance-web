import { and, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm'
import { z } from 'zod'
import { getDb, schema } from '@/lib/db'
import { ENTITLEMENTS } from './license-contract'
import { DrizzleStudioStore } from './drizzle-store'
import { writeAudit } from './audit'

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
  createdAt: string
}

const escapeLike = (s: string): string => s.replace(/[\\%_]/g, '\\$&')

export async function listLicenses(appSlug: string, q: string, limit = 100): Promise<LicenseListItem[]> {
  const db = getDb()
  const term = q.trim()
  const filter = term
    ? and(
        eq(schema.studioLicenses.appSlug, appSlug),
        or(ilike(schema.studioLicenses.email, `%${escapeLike(term)}%`), ilike(schema.studioLicenses.key, `%${escapeLike(term.toUpperCase())}%`)),
      )
    : eq(schema.studioLicenses.appSlug, appSlug)
  const rows = await db
    .select({
      l: schema.studioLicenses,
      deviceCount: sql<number>`(select count(*)::int from studio_devices d where d.license_id = ${schema.studioLicenses.id})`,
    })
    .from(schema.studioLicenses)
    .where(filter)
    .orderBy(desc(schema.studioLicenses.createdAt))
    .limit(Math.min(limit, 500))
  return rows.map(({ l, deviceCount }) => ({
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
    createdAt: l.createdAt.toISOString(),
  }))
}

export async function getLicenseDetail(id: string) {
  const record = await new DrizzleStudioStore().findById(id)
  if (!record) return null
  const orders = await getDb().select().from(schema.studioOrders).where(eq(schema.studioOrders.licenseId, id)).orderBy(desc(schema.studioOrders.createdAt))
  const audit = await getDb().select().from(schema.studioAuditLog).where(eq(schema.studioAuditLog.target, id)).orderBy(desc(schema.studioAuditLog.at)).limit(50)
  return { license: record, orders, audit }
}

export async function listOrders(limit = 200) {
  return getDb().select().from(schema.studioOrders).orderBy(desc(schema.studioOrders.createdAt)).limit(Math.min(limit, 500))
}

export async function listAudit(limit = 200) {
  return getDb().select().from(schema.studioAuditLog).orderBy(desc(schema.studioAuditLog.at)).limit(Math.min(limit, 500))
}

/** „Użytkownicy” = unikalne e-maile z licencji (aplikacja nie ma kont logowania — ADR 001). */
export async function listCustomers(appSlug: string, q: string) {
  const term = q.trim()
  return getDb()
    .select({
      email: schema.studioLicenses.email,
      licenses: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where ${schema.studioLicenses.status} = 'active')::int`,
      firstSeen: sql<string>`min(${schema.studioLicenses.createdAt})`,
    })
    .from(schema.studioLicenses)
    .where(
      term
        ? and(eq(schema.studioLicenses.appSlug, appSlug), ilike(schema.studioLicenses.email, `%${escapeLike(term)}%`))
        : eq(schema.studioLicenses.appSlug, appSlug),
    )
    .groupBy(schema.studioLicenses.email)
    .orderBy(sql`min(${schema.studioLicenses.createdAt}) desc`)
    .limit(200)
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
})
export type PriceInput = z.infer<typeof PriceInput>

export async function listPrices(appSlug: string) {
  return getDb().select().from(schema.studioPrices).where(eq(schema.studioPrices.appSlug, appSlug))
}

export async function upsertPrice(actor: string, input: PriceInput): Promise<void> {
  const values = { provider: 'paddle', ...input }
  await getDb()
    .insert(schema.studioPrices)
    .values(values)
    .onConflictDoUpdate({
      target: [schema.studioPrices.provider, schema.studioPrices.priceId],
      set: { appSlug: input.appSlug, label: input.label, plan: input.plan, entitlements: input.entitlements, updateMonths: input.updateMonths },
    })
  await writeAudit({ actor, action: 'price.upserted', target: input.priceId, meta: { plan: input.plan, entitlements: input.entitlements } })
}

export async function deletePrice(actor: string, priceId: string): Promise<void> {
  await getDb().delete(schema.studioPrices).where(and(eq(schema.studioPrices.provider, 'paddle'), eq(schema.studioPrices.priceId, priceId)))
  await writeAudit({ actor, action: 'price.deleted', target: priceId })
}
