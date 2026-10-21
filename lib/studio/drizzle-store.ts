import { and, eq, sql, type SQL } from 'drizzle-orm'
import { getDb, schema } from '@/lib/db'
import type { Entitlement } from './license-contract'
import type { PriceEntry } from './payments'
import type {
  AddDeviceResult,
  DeviceRecord,
  LicensePatch,
  LicenseRecord,
  OrderRecord,
  StudioStore,
} from './store'

type LicenseRow = typeof schema.studioLicenses.$inferSelect
type DeviceRow = typeof schema.studioDevices.$inferSelect

const iso = (d: Date | null): string | null => (d ? d.toISOString() : null)
const toDate = (s: string): Date => new Date(s)

function toDevice(row: DeviceRow): DeviceRecord {
  return { deviceId: row.deviceId, name: row.name, activatedAt: row.activatedAt.toISOString(), lastSeen: row.lastSeen.toISOString() }
}

function toLicense(row: LicenseRow, devices: DeviceRow[]): LicenseRecord {
  return {
    id: row.id,
    appSlug: row.appSlug,
    key: row.key,
    email: row.email,
    plan: row.plan,
    entitlements: row.entitlements as Entitlement[],
    updatesUntil: row.updatesUntil.toISOString(),
    expiresAt: iso(row.expiresAt),
    maxDevices: row.maxDevices,
    status: row.status,
    devices: devices.map(toDevice),
    source: row.sourceProvider && row.sourceReference ? { provider: row.sourceProvider, reference: row.sourceReference } : null,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
  }
}

/** Kod błędu Postgresa dla naruszenia unikalności. */
const UNIQUE_VIOLATION = '23505'
function isUniqueViolation(error: unknown): boolean {
  const e = error as { code?: unknown; cause?: { code?: unknown } } | null
  return e?.code === UNIQUE_VIOLATION || e?.cause?.code === UNIQUE_VIOLATION
}

const SLOT_RETRIES = 3

/** Implementacja portu na Neon (HTTP, bez interaktywnych transakcji — atomowość daje pojedyncze zapytanie i ograniczenia unikalności). */
export class DrizzleStudioStore implements StudioStore {
  private get db() {
    return getDb()
  }

  private async load(where: SQL): Promise<LicenseRecord | null> {
    const [row] = await this.db.select().from(schema.studioLicenses).where(where).limit(1)
    if (!row) return null
    const devices = await this.db
      .select()
      .from(schema.studioDevices)
      .where(eq(schema.studioDevices.licenseId, row.id))
      .orderBy(schema.studioDevices.activatedAt)
    return toLicense(row, devices)
  }

  findByKey(key: string): Promise<LicenseRecord | null> {
    return this.load(eq(schema.studioLicenses.key, key))
  }
  findById(id: string): Promise<LicenseRecord | null> {
    return this.load(eq(schema.studioLicenses.id, id))
  }
  findBySource(provider: string, reference: string): Promise<LicenseRecord | null> {
    return this.load(sql`${eq(schema.studioLicenses.sourceProvider, provider)} and ${eq(schema.studioLicenses.sourceReference, reference)}`)
  }

  async insertLicense(r: LicenseRecord): Promise<boolean> {
    try {
      await this.db.insert(schema.studioLicenses).values({
        id: r.id,
        appSlug: r.appSlug,
        key: r.key,
        email: r.email,
        plan: r.plan,
        entitlements: r.entitlements,
        updatesUntil: toDate(r.updatesUntil),
        expiresAt: r.expiresAt ? toDate(r.expiresAt) : null,
        maxDevices: r.maxDevices,
        status: r.status,
        sourceProvider: r.source?.provider ?? null,
        sourceReference: r.source?.reference ?? null,
        note: r.note,
        createdAt: toDate(r.createdAt),
      })
      return true
    } catch (error) {
      if (isUniqueViolation(error)) return false
      throw error
    }
  }

  async updateLicense(id: string, patch: LicensePatch): Promise<void> {
    const set: Partial<typeof schema.studioLicenses.$inferInsert> = {}
    if (patch.status !== undefined) set.status = patch.status
    if (patch.expiresAt !== undefined) set.expiresAt = patch.expiresAt ? toDate(patch.expiresAt) : null
    if (patch.updatesUntil !== undefined) set.updatesUntil = toDate(patch.updatesUntil)
    if (patch.maxDevices !== undefined) set.maxDevices = patch.maxDevices
    if (patch.entitlements !== undefined) set.entitlements = patch.entitlements
    if (patch.plan !== undefined) set.plan = patch.plan
    if (patch.note !== undefined) set.note = patch.note
    if (Object.keys(set).length === 0) return
    await this.db.update(schema.studioLicenses).set(set).where(eq(schema.studioLicenses.id, id))
  }

  /**
   * Limit urządzeń egzekwuje baza: urządzenie zajmuje najniższe wolne miejsce 1..maxDevices, a unikalność
   * (licencja, miejsce) odrzuca wyścig dwóch równoległych aktywacji — przegrany ponawia próbę lub dostaje `limit`.
   */
  async addDevice(licenseId: string, device: DeviceRecord, maxDevices: number): Promise<AddDeviceResult> {
    const existing = () =>
      this.db
        .select({ id: schema.studioDevices.deviceId })
        .from(schema.studioDevices)
        .where(and(eq(schema.studioDevices.licenseId, licenseId), eq(schema.studioDevices.deviceId, device.deviceId)))
        .limit(1)
    if ((await existing()).length > 0) return 'exists'

    for (let attempt = 0; attempt < SLOT_RETRIES; attempt++) {
      const inserted = await this.db.execute(sql`
        insert into studio_devices (license_id, device_id, slot, name, activated_at, last_seen)
        select ${licenseId}::uuid, ${device.deviceId}, s, ${device.name}, ${device.activatedAt}::timestamptz, ${device.lastSeen}::timestamptz
        from generate_series(1, ${maxDevices}::int) as s
        where not exists (select 1 from studio_devices d where d.license_id = ${licenseId}::uuid and d.slot = s)
        order by s
        limit 1
        on conflict do nothing
        returning slot
      `)
      if (inserted.rows.length > 0) return 'added'
      // Brak wolnego miejsca albo przegrany wyścig: sprawdź, czy to urządzenie już nie weszło, i ponów.
      if ((await existing()).length > 0) return 'exists'
      const [{ count } = { count: 0 }] = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.studioDevices)
        .where(eq(schema.studioDevices.licenseId, licenseId))
      if (count >= maxDevices) return 'limit'
    }
    return 'limit'
  }

  async touchDevice(licenseId: string, deviceId: string, lastSeen: string): Promise<boolean> {
    const rows = await this.db
      .update(schema.studioDevices)
      .set({ lastSeen: toDate(lastSeen) })
      .where(and(eq(schema.studioDevices.licenseId, licenseId), eq(schema.studioDevices.deviceId, deviceId)))
      .returning({ id: schema.studioDevices.deviceId })
    return rows.length > 0
  }

  async removeDevice(licenseId: string, deviceId: string): Promise<boolean> {
    const rows = await this.db
      .delete(schema.studioDevices)
      .where(and(eq(schema.studioDevices.licenseId, licenseId), eq(schema.studioDevices.deviceId, deviceId)))
      .returning({ id: schema.studioDevices.deviceId })
    return rows.length > 0
  }

  async insertOrder(o: OrderRecord): Promise<void> {
    await this.db.insert(schema.studioOrders).values({
      id: o.id,
      licenseId: o.licenseId,
      provider: o.provider,
      eventId: o.eventId,
      kind: o.kind,
      reference: o.reference,
      email: o.email,
      amountTotal: o.amountTotal,
      currency: o.currency,
      createdAt: toDate(o.createdAt),
    })
  }

  async claimEvent(provider: string, eventId: string, type: string): Promise<boolean> {
    // Wiersz wraca przy nowym zdarzeniu albo gdy poprzednie podejście nie zostało dokończone (processed_at is null).
    const res = await this.db.execute(sql`
      insert into studio_webhook_events (provider, event_id, type)
      values (${provider}, ${eventId}, ${type})
      on conflict (provider, event_id) do update set received_at = now()
        where studio_webhook_events.processed_at is null
      returning event_id
    `)
    return res.rows.length > 0
  }

  async completeEvent(provider: string, eventId: string): Promise<void> {
    await this.db
      .update(schema.studioWebhookEvents)
      .set({ processedAt: new Date() })
      .where(and(eq(schema.studioWebhookEvents.provider, provider), eq(schema.studioWebhookEvents.eventId, eventId)))
  }
}

/** Mapowanie price id → produkt (tabela studio_prices). */
export async function lookupPrice(provider: string, priceId: string): Promise<PriceEntry | undefined> {
  const [row] = await getDb()
    .select()
    .from(schema.studioPrices)
    .where(and(eq(schema.studioPrices.provider, provider), eq(schema.studioPrices.priceId, priceId)))
    .limit(1)
  if (!row) return undefined
  return { plan: row.plan, entitlements: row.entitlements as Entitlement[], updateMonths: row.updateMonths }
}
