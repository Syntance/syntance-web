import { eq, sql } from 'drizzle-orm'
import { getDb, schema } from '@/lib/db'
import type { Entitlement } from './license-contract'
import type { PromoPatch, PromoRecord, PromoStore, RedeemResult, RedemptionRecord } from './promo-store'

type Row = typeof schema.studioPromoCodes.$inferSelect

const iso = (d: Date | null): string | null => (d ? d.toISOString() : null)
const toDate = (s: string | null): Date | null => (s ? new Date(s) : null)

export function toPromo(r: Row): PromoRecord {
  return {
    id: r.id,
    appSlug: r.appSlug,
    code: r.code,
    kind: r.kind,
    percentOff: r.percentOff,
    amountOff: r.amountOff,
    currency: r.currency,
    trialDays: r.trialDays,
    grantPlan: r.grantPlan,
    grantEntitlements: r.grantEntitlements as Entitlement[] | null,
    grantUpdateMonths: r.grantUpdateMonths,
    grantMaxDevices: r.grantMaxDevices,
    appliesToPlan: r.appliesToPlan,
    appliesToEntitlements: r.appliesToEntitlements as Entitlement[] | null,
    maxUses: r.maxUses,
    usedCount: r.usedCount,
    validFrom: iso(r.validFrom),
    validUntil: iso(r.validUntil),
    active: r.active,
    providerDiscountId: r.providerDiscountId,
    note: r.note,
    createdBy: r.createdBy,
    createdAt: r.createdAt.toISOString(),
  }
}

/** Kod błędu Postgresa dla naruszenia unikalności. */
function isUniqueViolation(error: unknown): boolean {
  const e = error as { code?: unknown; cause?: { code?: unknown } } | null
  return e?.code === '23505' || e?.cause?.code === '23505'
}

/**
 * Implementacja na Neon (HTTP, bez interaktywnych transakcji). Atomowość `redeem`:
 * 1) wiersz wykorzystania z unikalnością (kod, e-mail) — drugi raz ten sam e-mail = `duplicate`;
 * 2) licznik rośnie jednym UPDATE z warunkiem (aktywny, okno, limit) — przy wyścigu przegrany dostaje `exhausted`
 *    i jego rezerwacja jest usuwana.
 */
export class DrizzlePromoStore implements PromoStore {
  private get db() {
    return getDb()
  }

  async insert(r: PromoRecord): Promise<boolean> {
    try {
      await this.db.insert(schema.studioPromoCodes).values({
        id: r.id,
        appSlug: r.appSlug,
        code: r.code,
        kind: r.kind,
        percentOff: r.percentOff,
        amountOff: r.amountOff,
        currency: r.currency,
        trialDays: r.trialDays,
        grantPlan: r.grantPlan,
        grantEntitlements: r.grantEntitlements,
        grantUpdateMonths: r.grantUpdateMonths,
        grantMaxDevices: r.grantMaxDevices,
        appliesToPlan: r.appliesToPlan,
        appliesToEntitlements: r.appliesToEntitlements,
        maxUses: r.maxUses,
        usedCount: 0,
        validFrom: toDate(r.validFrom),
        validUntil: toDate(r.validUntil),
        active: r.active,
        providerDiscountId: r.providerDiscountId,
        note: r.note,
        createdBy: r.createdBy,
        createdAt: new Date(r.createdAt),
      })
      return true
    } catch (error) {
      if (isUniqueViolation(error)) return false
      throw error
    }
  }

  async findByCode(code: string): Promise<PromoRecord | null> {
    const [row] = await this.db.select().from(schema.studioPromoCodes).where(eq(schema.studioPromoCodes.code, code)).limit(1)
    return row ? toPromo(row) : null
  }

  async findById(id: string): Promise<PromoRecord | null> {
    const [row] = await this.db.select().from(schema.studioPromoCodes).where(eq(schema.studioPromoCodes.id, id)).limit(1)
    return row ? toPromo(row) : null
  }

  async update(id: string, patch: PromoPatch): Promise<void> {
    const set: Partial<typeof schema.studioPromoCodes.$inferInsert> = {}
    if (patch.active !== undefined) set.active = patch.active
    if (patch.maxUses !== undefined) set.maxUses = patch.maxUses
    if (patch.validFrom !== undefined) set.validFrom = toDate(patch.validFrom)
    if (patch.validUntil !== undefined) set.validUntil = toDate(patch.validUntil)
    if (patch.note !== undefined) set.note = patch.note
    if (patch.providerDiscountId !== undefined) set.providerDiscountId = patch.providerDiscountId
    if (Object.keys(set).length === 0) return
    await this.db.update(schema.studioPromoCodes).set(set).where(eq(schema.studioPromoCodes.id, id))
  }

  async redeem(r: RedemptionRecord, now: string): Promise<RedeemResult> {
    const inserted = await this.db
      .insert(schema.studioPromoRedemptions)
      .values({
        id: r.id,
        codeId: r.codeId,
        email: r.email,
        licenseId: r.licenseId,
        source: r.source,
        discountAmount: r.discountAmount,
        currency: r.currency,
        createdAt: new Date(r.createdAt),
      })
      .onConflictDoNothing()
      .returning({ id: schema.studioPromoRedemptions.id })
    if (inserted.length === 0) return 'duplicate'

    const bumped = await this.db.execute(sql`
      update studio_promo_codes set used_count = used_count + 1
      where id = ${r.codeId}::uuid
        and active
        and (max_uses is null or used_count < max_uses)
        and (valid_from is null or valid_from <= ${now}::timestamptz)
        and (valid_until is null or valid_until > ${now}::timestamptz)
      returning id
    `)
    if (bumped.rows.length === 0) {
      await this.db.delete(schema.studioPromoRedemptions).where(eq(schema.studioPromoRedemptions.id, r.id))
      return 'exhausted'
    }
    return 'ok'
  }

  async setRedemptionLicense(redemptionId: string, licenseId: string): Promise<void> {
    await this.db.update(schema.studioPromoRedemptions).set({ licenseId }).where(eq(schema.studioPromoRedemptions.id, redemptionId))
  }

  async releaseRedemption(redemptionId: string): Promise<void> {
    const removed = await this.db
      .delete(schema.studioPromoRedemptions)
      .where(eq(schema.studioPromoRedemptions.id, redemptionId))
      .returning({ codeId: schema.studioPromoRedemptions.codeId })
    const first = removed[0]
    if (first) {
      await this.db.execute(sql`update studio_promo_codes set used_count = greatest(used_count - 1, 0) where id = ${first.codeId}::uuid`)
    }
  }
}
