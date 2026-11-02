import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { ENTITLEMENTS, MAX_DEVICES_LIMIT } from './license-contract'
import { deriveEntitlements, unknownFeatures } from './features'
import { StudioHttpError, type AuditEntry, type LicenseService } from './license-service'
import { addMonths } from './payments'
import type { PlanPatch, PlanRecord, PlanStore } from './plan-store'
import type { LicenseRecord } from './store'

const FeatureKeys = z.array(z.string().min(1).max(40)).max(64)

export const PlanInput = z.object({
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]{1,39}$/, 'slug: a–z, 0–9, myślnik, 2–40 znaków'),
  name: z.string().trim().min(1).max(80),
  description: z.string().max(300).default(''),
  billing: z.enum(['perpetual', 'subscription']),
  updateMonths: z.number().int().min(1).max(120).default(12),
  maxDevices: z.number().int().min(1).max(MAX_DEVICES_LIMIT).default(2),
  features: FeatureKeys,
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(1000).default(10),
})
export type PlanInput = z.input<typeof PlanInput>

export const PlanPatchInput = PlanInput.omit({ slug: true }).partial()

export const FeatureInput = z.object({
  key: z.string().regex(/^[a-z][a-z0-9-]{1,39}$/, 'klucz: a–z, 0–9, myślnik, 2–40 znaków'),
  label: z.string().trim().min(1).max(100),
  entitlement: z.enum(ENTITLEMENTS).nullable(),
})
export type FeatureInput = z.input<typeof FeatureInput>

export interface IssueFromPlanInput {
  email: string
  note?: string
  sendEmail?: boolean
  /** Nadpisania dla tej jednej licencji (plan zostaje bez zmian). */
  features?: string[]
  maxDevices?: number
  untilIso?: string
}

export interface PlanServiceDeps {
  store: PlanStore
  licenses: LicenseService
  audit?: (entry: AuditEntry) => Promise<void>
  now?: () => number
}

export class PlanService {
  private readonly now: () => number
  constructor(private readonly deps: PlanServiceDeps) {
    this.now = deps.now ?? Date.now
  }

  private async audit(entry: AuditEntry): Promise<void> {
    await this.deps.audit?.(entry)
  }

  private async validateFeatures(keys: string[], kind: 'paid' | 'free'): Promise<void> {
    const catalog = await this.deps.store.listFeatures()
    const unknown = unknownFeatures(keys, catalog)
    if (unknown.length) throw new StudioHttpError(400, 'UNKNOWN_FEATURE', { unknown })
    // Plan płatny bez żadnej funkcji płatnej nie niósłby uprawnień — certyfikat wymaga co najmniej jednego.
    if (kind === 'paid' && deriveEntitlements(keys, catalog).length === 0) throw new StudioHttpError(400, 'NO_PAID_FEATURES')
  }

  async createPlan(actor: string, input: PlanInput): Promise<PlanRecord> {
    const parsed = PlanInput.parse(input)
    if (parsed.slug === 'free') throw new StudioHttpError(409, 'SLUG_TAKEN')
    await this.validateFeatures(parsed.features, 'paid')
    const record: PlanRecord = { id: randomUUID(), appSlug: 'studio', kind: 'paid', createdAt: new Date(this.now()).toISOString(), ...parsed }
    if (!(await this.deps.store.insertPlan(record))) throw new StudioHttpError(409, 'SLUG_TAKEN')
    await this.audit({ actor, action: 'plan.created', target: record.id, meta: { slug: record.slug, features: record.features } })
    return record
  }

  async updatePlan(actor: string, id: string, patch: z.input<typeof PlanPatchInput>): Promise<void> {
    const parsed: PlanPatch = PlanPatchInput.parse(patch)
    const plan = await this.deps.store.findPlan(id)
    if (!plan) throw new StudioHttpError(404, 'UNKNOWN_PLAN')
    if (plan.kind === 'free' && (parsed.billing !== undefined || parsed.active === false)) throw new StudioHttpError(400, 'FREE_PLAN_FIXED')
    if (parsed.features) await this.validateFeatures(parsed.features, plan.kind)
    await this.deps.store.updatePlan(id, parsed)
    await this.audit({ actor, action: 'plan.updated', target: id, meta: { fields: Object.keys(parsed) } })
  }

  /** Usunięcie planu nie rusza wystawionych licencji (mają własną kopię zakresu). Cena powiązana z planem blokuje usunięcie. */
  async deletePlan(actor: string, id: string): Promise<void> {
    const plan = await this.deps.store.findPlan(id)
    if (!plan) throw new StudioHttpError(404, 'UNKNOWN_PLAN')
    if (plan.kind === 'free') throw new StudioHttpError(400, 'FREE_PLAN_FIXED')
    const result = await this.deps.store.deletePlan(id)
    if (result === 'in_use_by_prices') throw new StudioHttpError(409, 'PLAN_IN_USE_BY_PRICES')
    if (result === 'not_found') throw new StudioHttpError(404, 'UNKNOWN_PLAN')
    await this.audit({ actor, action: 'plan.deleted', target: id, meta: { slug: plan.slug } })
  }

  async upsertFeature(actor: string, input: FeatureInput): Promise<void> {
    const feature = FeatureInput.parse(input)
    await this.deps.store.upsertFeature(feature)
    await this.audit({ actor, action: 'feature.upserted', target: feature.key, meta: { entitlement: feature.entitlement } })
  }

  async deleteFeature(actor: string, key: string): Promise<void> {
    const result = await this.deps.store.deleteFeature(key)
    if (result === 'not_found') throw new StudioHttpError(404, 'UNKNOWN_FEATURE')
    if (result === 'in_use_by_plans') throw new StudioHttpError(409, 'FEATURE_IN_USE')
    await this.audit({ actor, action: 'feature.deleted', target: key })
  }

  /** Wystawia licencję o ustawieniach planu (z ewentualnymi nadpisaniami dla tej jednej licencji). */
  async issueFromPlan(actor: string, planId: string, input: IssueFromPlanInput): Promise<LicenseRecord> {
    const plan = await this.deps.store.findPlan(planId)
    if (!plan) throw new StudioHttpError(404, 'UNKNOWN_PLAN')
    if (plan.kind !== 'paid') throw new StudioHttpError(400, 'FREE_PLAN_NOT_ISSUABLE')
    if (!plan.active) throw new StudioHttpError(409, 'PLAN_INACTIVE')
    const until = input.untilIso ?? addMonths(this.now(), plan.updateMonths)
    return this.deps.licenses.issueManual(actor, {
      email: input.email,
      plan: plan.billing,
      features: input.features ?? plan.features,
      planId: plan.id,
      updatesUntil: until,
      expiresAt: plan.billing === 'subscription' ? until : null,
      maxDevices: input.maxDevices ?? plan.maxDevices,
      note: input.note ?? '',
      sendEmail: input.sendEmail ?? true,
    })
  }
}
