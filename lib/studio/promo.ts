import { randomInt, randomUUID } from 'node:crypto'
import { z } from 'zod'
import { DEFAULT_MAX_DEVICES, ENTITLEMENTS, MAX_DEVICES_LIMIT } from './license-contract'
import { StudioHttpError, type AuditEntry, type LicenseService } from './license-service'
import { addMonths } from './payments'
import type { PromoPatch, PromoRecord, PromoStore, RedemptionSource } from './promo-store'

const DAY = 24 * 60 * 60 * 1000
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export const normalizePromoCode = (input: string): string => input.trim().toUpperCase().replace(/\s+/g, '')
export const PROMO_CODE_PATTERN = /^[A-Z0-9][A-Z0-9_-]{2,31}$/

export function generatePromoCode(length = 10): string {
  let out = ''
  for (let i = 0; i < length; i++) out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
  return out
}

const entitlements = z.array(z.enum(ENTITLEMENTS)).min(1)
const common = {
  /** Puste = wygeneruj. */
  code: z.string().max(32).optional(),
  maxUses: z.number().int().min(1).max(1_000_000).nullable().default(null),
  validFrom: z.iso.datetime().nullable().default(null),
  validUntil: z.iso.datetime().nullable().default(null),
  note: z.string().max(300).default(''),
  providerDiscountId: z.string().max(100).nullable().default(null),
}
const grant = {
  grantEntitlements: entitlements,
  grantMaxDevices: z.number().int().min(1).max(MAX_DEVICES_LIMIT).default(DEFAULT_MAX_DEVICES),
}
const scope = {
  appliesToPlan: z.enum(['perpetual', 'subscription']).nullable().default(null),
  appliesToEntitlements: entitlements.nullable().default(null),
}

export const PromoInput = z
  .discriminatedUnion('kind', [
    z.object({ kind: z.literal('percent'), percentOff: z.number().int().min(1).max(100), ...scope, ...common }),
    z.object({ kind: z.literal('amount'), amountOff: z.number().int().min(1), currency: z.string().regex(/^[A-Z]{3}$/), ...scope, ...common }),
    z.object({
      kind: z.literal('free_license'),
      grantPlan: z.enum(['perpetual', 'subscription']),
      grantUpdateMonths: z.number().int().min(1).max(120).default(12),
      ...grant,
      ...common,
    }),
    z.object({ kind: z.literal('trial'), trialDays: z.number().int().min(1).max(365), ...grant, ...common }),
  ])
  .refine((v) => !v.validFrom || !v.validUntil || Date.parse(v.validFrom) < Date.parse(v.validUntil), {
    message: 'validFrom musi być przed validUntil',
  })
export type PromoInput = z.input<typeof PromoInput>

export const PromoPatchInput = z.object({
  active: z.boolean().optional(),
  maxUses: z.number().int().min(1).max(1_000_000).nullable().optional(),
  validFrom: z.iso.datetime().nullable().optional(),
  validUntil: z.iso.datetime().nullable().optional(),
  note: z.string().max(300).optional(),
  providerDiscountId: z.string().max(100).nullable().optional(),
})

export type PromoProblem = 'INACTIVE' | 'NOT_STARTED' | 'EXPIRED' | 'EXHAUSTED'

/** Czy kod można teraz użyć. Null = tak. */
export function promoProblem(code: PromoRecord, nowMs: number): PromoProblem | null {
  if (!code.active) return 'INACTIVE'
  if (code.validFrom && Date.parse(code.validFrom) > nowMs) return 'NOT_STARTED'
  if (code.validUntil && Date.parse(code.validUntil) <= nowMs) return 'EXPIRED'
  if (code.maxUses !== null && code.usedCount >= code.maxUses) return 'EXHAUSTED'
  return null
}

export interface Quote {
  /** Rabat w jednostkach najmniejszych (nigdy większy niż cena). */
  discount: number
  total: number
}

export interface PromoServiceDeps {
  store: PromoStore
  licenses: LicenseService
  isBlocked: (email: string) => Promise<boolean>
  audit?: (entry: AuditEntry) => Promise<void>
  now?: () => number
  appSlug?: string
}

const Email = z.email().max(254)

export class PromoService {
  private readonly now: () => number
  private readonly appSlug: string
  constructor(private readonly deps: PromoServiceDeps) {
    this.now = deps.now ?? Date.now
    this.appSlug = deps.appSlug ?? 'studio'
  }

  private async audit(entry: AuditEntry): Promise<void> {
    await this.deps.audit?.(entry)
  }

  async create(actor: string, input: PromoInput): Promise<PromoRecord> {
    const parsed = PromoInput.parse(input)
    const wanted = parsed.code?.trim() ? normalizePromoCode(parsed.code) : null
    if (wanted && !PROMO_CODE_PATTERN.test(wanted)) throw new StudioHttpError(400, 'INVALID_CODE_FORMAT')
    const base: PromoRecord = {
      id: randomUUID(),
      appSlug: this.appSlug,
      code: wanted ?? generatePromoCode(),
      kind: parsed.kind,
      percentOff: parsed.kind === 'percent' ? parsed.percentOff : null,
      amountOff: parsed.kind === 'amount' ? parsed.amountOff : null,
      currency: parsed.kind === 'amount' ? parsed.currency : null,
      trialDays: parsed.kind === 'trial' ? parsed.trialDays : null,
      grantPlan: parsed.kind === 'free_license' ? parsed.grantPlan : parsed.kind === 'trial' ? 'subscription' : null,
      grantEntitlements: parsed.kind === 'free_license' || parsed.kind === 'trial' ? parsed.grantEntitlements : null,
      grantUpdateMonths: parsed.kind === 'free_license' ? parsed.grantUpdateMonths : null,
      grantMaxDevices: parsed.kind === 'free_license' || parsed.kind === 'trial' ? parsed.grantMaxDevices : null,
      appliesToPlan: parsed.kind === 'percent' || parsed.kind === 'amount' ? parsed.appliesToPlan : null,
      appliesToEntitlements: parsed.kind === 'percent' || parsed.kind === 'amount' ? parsed.appliesToEntitlements : null,
      maxUses: parsed.maxUses,
      usedCount: 0,
      validFrom: parsed.validFrom,
      validUntil: parsed.validUntil,
      active: true,
      providerDiscountId: parsed.providerDiscountId,
      note: parsed.note,
      createdBy: actor,
      createdAt: new Date(this.now()).toISOString(),
    }
    // Wygenerowany kod może (bardzo rzadko) kolidować — ponawiamy; kod wpisany ręcznie zgłasza konflikt.
    for (let attempt = 0; attempt < (wanted ? 1 : 5); attempt++) {
      const record = attempt === 0 ? base : { ...base, id: randomUUID(), code: generatePromoCode() }
      if (await this.deps.store.insert(record)) {
        await this.audit({ actor, action: 'promo.created', target: record.id, meta: { kind: record.kind, code: record.code } })
        return record
      }
    }
    throw new StudioHttpError(409, 'CODE_EXISTS')
  }

  async update(actor: string, id: string, patch: z.input<typeof PromoPatchInput>): Promise<void> {
    const parsed: PromoPatch = PromoPatchInput.parse(patch)
    const record = await this.deps.store.findById(id)
    if (!record) throw new StudioHttpError(404, 'UNKNOWN_CODE')
    if (parsed.maxUses != null && parsed.maxUses < record.usedCount) throw new StudioHttpError(400, 'MAX_USES_BELOW_USED')
    await this.deps.store.update(id, parsed)
    await this.audit({
      actor,
      action: parsed.active === undefined ? 'promo.updated' : parsed.active ? 'promo.enabled' : 'promo.disabled',
      target: id,
      meta: { fields: Object.keys(parsed) },
    })
  }

  /** Wycena rabatu (kody procentowe/kwotowe) — dla checkoutu; płatność i tak zamyka wyłącznie webhook. */
  async quote(
    codeText: string,
    order: { plan: 'perpetual' | 'subscription'; entitlements: string[]; amount: number; currency: string },
  ): Promise<Quote> {
    const code = await this.deps.store.findByCode(normalizePromoCode(codeText))
    if (!code || code.appSlug !== this.appSlug) throw new StudioHttpError(404, 'UNKNOWN_CODE')
    const problem = promoProblem(code, this.now())
    if (problem) throw new StudioHttpError(410, `CODE_${problem}`)
    if (code.kind !== 'percent' && code.kind !== 'amount') throw new StudioHttpError(400, 'CODE_NOT_A_DISCOUNT')
    if (code.appliesToPlan && code.appliesToPlan !== order.plan) throw new StudioHttpError(400, 'CODE_NOT_APPLICABLE')
    const scoped = code.appliesToEntitlements
    if (scoped && !order.entitlements.some((e) => scoped.some((a) => a === e))) throw new StudioHttpError(400, 'CODE_NOT_APPLICABLE')
    let discount: number
    if (code.kind === 'percent') discount = Math.floor((order.amount * (code.percentOff ?? 0)) / 100)
    else {
      if (code.currency !== order.currency) throw new StudioHttpError(400, 'CODE_NOT_APPLICABLE')
      discount = code.amountOff ?? 0
    }
    discount = Math.min(discount, order.amount)
    return { discount, total: order.amount - discount }
  }

  /**
   * Wykorzystanie kodu z darmową licencją / próbą: rezerwuje użycie (atomowo), wystawia licencję i wysyła klucz e-mailem.
   * Klucz NIE wraca w odpowiedzi — dostaje go tylko właściciel skrzynki (publiczny endpoint nie jest wyrocznią kluczy).
   */
  async redeem(
    actor: string,
    codeText: string,
    emailText: string,
    source: Extract<RedemptionSource, 'manual' | 'redeem'>,
  ): Promise<{ licenseId: string }> {
    const email = Email.parse(emailText).toLowerCase()
    const code = await this.deps.store.findByCode(normalizePromoCode(codeText))
    if (!code || code.appSlug !== this.appSlug) throw new StudioHttpError(404, 'UNKNOWN_CODE')
    if (code.kind !== 'free_license' && code.kind !== 'trial') throw new StudioHttpError(400, 'CODE_NOT_REDEEMABLE')
    const problem = promoProblem(code, this.now())
    if (problem) throw new StudioHttpError(410, `CODE_${problem}`)
    if (await this.deps.isBlocked(email)) throw new StudioHttpError(403, 'BLOCKED')

    const t = new Date(this.now()).toISOString()
    const redemptionId = randomUUID()
    const reserved = await this.deps.store.redeem(
      { id: redemptionId, codeId: code.id, email, licenseId: null, source, discountAmount: null, currency: null, createdAt: t },
      t,
    )
    if (reserved === 'duplicate') throw new StudioHttpError(409, 'ALREADY_REDEEMED')
    if (reserved === 'exhausted') throw new StudioHttpError(410, 'CODE_EXHAUSTED')

    const plan = code.grantPlan ?? 'perpetual'
    const end =
      code.kind === 'trial'
        ? new Date(this.now() + (code.trialDays ?? 14) * DAY).toISOString()
        : addMonths(this.now(), code.grantUpdateMonths ?? 12)
    try {
      const license = await this.deps.licenses.issueManual(
        actor,
        {
          email,
          plan,
          entitlements: code.grantEntitlements ?? ['pro'],
          updatesUntil: end,
          expiresAt: plan === 'subscription' ? end : null,
          maxDevices: code.grantMaxDevices ?? DEFAULT_MAX_DEVICES,
          note: `Kod ${code.code}`,
          sendEmail: true,
        },
        { provider: 'promo', reference: `${code.id}:${email}` },
      )
      await this.deps.store.setRedemptionLicense(redemptionId, license.id)
      await this.audit({ actor, action: 'promo.redeemed', target: code.id, meta: { source, licenseId: license.id } })
      return { licenseId: license.id }
    } catch (error) {
      await this.deps.store.releaseRedemption(redemptionId)
      throw error
    }
  }

  /** Webhook płatności: zapisuje wykorzystanie kodu rabatowego. Nieznany/wyczerpany kod nie może zablokować wydania zapłaconej licencji. */
  async recordPurchase(promo: { code: string; discount: number | null; currency: string | null }, emailText: string, licenseId: string): Promise<void> {
    const code = await this.deps.store.findByCode(normalizePromoCode(promo.code))
    if (!code) {
      await this.audit({ actor: 'paddle', action: 'promo.unknown_code', target: licenseId })
      return
    }
    const t = new Date(this.now()).toISOString()
    const result = await this.deps.store.redeem(
      {
        id: randomUUID(),
        codeId: code.id,
        email: emailText.toLowerCase(),
        licenseId,
        source: 'paddle',
        discountAmount: promo.discount,
        currency: promo.currency,
        createdAt: t,
      },
      t,
    )
    await this.audit({ actor: 'paddle', action: result === 'ok' ? 'promo.redeemed' : 'promo.record_skipped', target: code.id, meta: { result, licenseId } })
  }
}
