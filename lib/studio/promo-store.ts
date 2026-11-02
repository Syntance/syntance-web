import type { Entitlement } from './license-contract'

export type PromoKind = 'percent' | 'amount' | 'free_license' | 'trial'
export type RedemptionSource = 'manual' | 'redeem' | 'paddle'
export type RedeemResult = 'ok' | 'duplicate' | 'exhausted'

export interface PromoRecord {
  id: string
  appSlug: string
  code: string
  kind: PromoKind
  percentOff: number | null
  amountOff: number | null
  currency: string | null
  trialDays: number | null
  grantPlan: 'perpetual' | 'subscription' | null
  grantEntitlements: Entitlement[] | null
  grantUpdateMonths: number | null
  grantMaxDevices: number | null
  appliesToPlan: 'perpetual' | 'subscription' | null
  appliesToEntitlements: Entitlement[] | null
  maxUses: number | null
  usedCount: number
  validFrom: string | null
  validUntil: string | null
  active: boolean
  providerDiscountId: string | null
  note: string
  createdBy: string
  createdAt: string
}

export interface RedemptionRecord {
  id: string
  codeId: string
  email: string
  licenseId: string | null
  source: RedemptionSource
  discountAmount: number | null
  currency: string | null
  createdAt: string
}

export type PromoPatch = Partial<Pick<PromoRecord, 'active' | 'maxUses' | 'validFrom' | 'validUntil' | 'note' | 'providerDiscountId'>>

/**
 * Port magazynu kodów. `redeem` MUSI być atomowe: jeden e-mail raz na kod, a `usedCount` nigdy nie przekracza `maxUses`
 * (także przy równoległych żądaniach). Okno ważności i aktywność sprawdza serwis, ale baza powtarza je w warunku zapisu.
 */
export interface PromoStore {
  /** False, gdy kod już istnieje. */
  insert(record: PromoRecord): Promise<boolean>
  findByCode(code: string): Promise<PromoRecord | null>
  findById(id: string): Promise<PromoRecord | null>
  update(id: string, patch: PromoPatch): Promise<void>
  redeem(redemption: RedemptionRecord, now: string): Promise<RedeemResult>
  setRedemptionLicense(redemptionId: string, licenseId: string): Promise<void>
  /** Cofa rezerwację (gdy wystawienie licencji się nie powiodło). */
  releaseRedemption(redemptionId: string): Promise<void>
}
