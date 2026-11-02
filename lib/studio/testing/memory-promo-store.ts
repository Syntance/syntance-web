import type { PromoPatch, PromoRecord, PromoStore, RedeemResult, RedemptionRecord } from '../promo-store'

/** Magazyn kodów w pamięci — tylko do testów. */
export class MemoryPromoStore implements PromoStore {
  readonly codes = new Map<string, PromoRecord>()
  readonly redemptions: RedemptionRecord[] = []

  insert(record: PromoRecord): Promise<boolean> {
    if ([...this.codes.values()].some((c) => c.code === record.code)) return Promise.resolve(false)
    this.codes.set(record.id, structuredClone(record))
    return Promise.resolve(true)
  }
  findByCode(code: string): Promise<PromoRecord | null> {
    const r = [...this.codes.values()].find((c) => c.code === code)
    return Promise.resolve(r ? structuredClone(r) : null)
  }
  findById(id: string): Promise<PromoRecord | null> {
    const r = this.codes.get(id)
    return Promise.resolve(r ? structuredClone(r) : null)
  }
  update(id: string, patch: PromoPatch): Promise<void> {
    const r = this.codes.get(id)
    if (r) Object.assign(r, patch)
    return Promise.resolve()
  }
  redeem(redemption: RedemptionRecord, now: string): Promise<RedeemResult> {
    const code = this.codes.get(redemption.codeId)
    if (!code) return Promise.resolve('exhausted')
    if (this.redemptions.some((r) => r.codeId === redemption.codeId && r.email === redemption.email)) return Promise.resolve('duplicate')
    const t = Date.parse(now)
    const usable =
      code.active &&
      (code.maxUses === null || code.usedCount < code.maxUses) &&
      (!code.validFrom || Date.parse(code.validFrom) <= t) &&
      (!code.validUntil || Date.parse(code.validUntil) > t)
    if (!usable) return Promise.resolve('exhausted')
    code.usedCount += 1
    this.redemptions.push(structuredClone(redemption))
    return Promise.resolve('ok')
  }
  setRedemptionLicense(redemptionId: string, licenseId: string): Promise<void> {
    const r = this.redemptions.find((x) => x.id === redemptionId)
    if (r) r.licenseId = licenseId
    return Promise.resolve()
  }
  releaseRedemption(redemptionId: string): Promise<void> {
    const i = this.redemptions.findIndex((x) => x.id === redemptionId)
    if (i >= 0) {
      const [r] = this.redemptions.splice(i, 1)
      const code = r ? this.codes.get(r.codeId) : undefined
      if (code) code.usedCount = Math.max(0, code.usedCount - 1)
    }
    return Promise.resolve()
  }
}
