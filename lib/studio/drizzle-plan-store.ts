import { eq, sql } from 'drizzle-orm'
import { getDb, schema } from '@/lib/db'
import type { FeatureDef } from './features'
import type { DeleteFeatureResult, DeletePlanResult, PlanPatch, PlanRecord, PlanStore } from './plan-store'

type PlanRow = typeof schema.studioPlans.$inferSelect

function toPlan(r: PlanRow): PlanRecord {
  return {
    id: r.id,
    appSlug: r.appSlug,
    slug: r.slug,
    name: r.name,
    description: r.description,
    kind: r.kind,
    billing: r.billing,
    updateMonths: r.updateMonths,
    maxDevices: r.maxDevices,
    features: r.features,
    active: r.active,
    sortOrder: r.sortOrder,
    createdAt: r.createdAt.toISOString(),
  }
}

const isUniqueViolation = (error: unknown): boolean => {
  const e = error as { code?: unknown; cause?: { code?: unknown } } | null
  return e?.code === '23505' || e?.cause?.code === '23505'
}

export class DrizzlePlanStore implements PlanStore {
  private get db() {
    return getDb()
  }

  async listFeatures(): Promise<FeatureDef[]> {
    const rows = await this.db.select().from(schema.studioFeatures).orderBy(schema.studioFeatures.createdAt, schema.studioFeatures.key)
    return rows.map((r) => ({ key: r.key, label: r.label, entitlement: r.entitlement }))
  }

  async upsertFeature(f: FeatureDef): Promise<void> {
    await this.db
      .insert(schema.studioFeatures)
      .values({ key: f.key, label: f.label, entitlement: f.entitlement })
      .onConflictDoUpdate({ target: schema.studioFeatures.key, set: { label: f.label, entitlement: f.entitlement } })
  }

  async deleteFeature(key: string): Promise<DeleteFeatureResult> {
    const used = await this.db.execute(sql`select 1 from studio_plans where features @> ${JSON.stringify([key])}::jsonb limit 1`)
    if (used.rows.length > 0) return 'in_use_by_plans'
    const rows = await this.db.delete(schema.studioFeatures).where(eq(schema.studioFeatures.key, key)).returning({ key: schema.studioFeatures.key })
    return rows.length > 0 ? 'ok' : 'not_found'
  }

  async listPlans(): Promise<PlanRecord[]> {
    const rows = await this.db.select().from(schema.studioPlans).orderBy(schema.studioPlans.sortOrder, schema.studioPlans.name)
    return rows.map(toPlan)
  }

  async findPlan(id: string): Promise<PlanRecord | null> {
    const [row] = await this.db.select().from(schema.studioPlans).where(eq(schema.studioPlans.id, id)).limit(1)
    return row ? toPlan(row) : null
  }

  async insertPlan(p: PlanRecord): Promise<boolean> {
    try {
      await this.db.insert(schema.studioPlans).values({ ...p, createdAt: new Date(p.createdAt) })
      return true
    } catch (error) {
      if (isUniqueViolation(error)) return false
      throw error
    }
  }

  async updatePlan(id: string, patch: PlanPatch): Promise<void> {
    if (Object.keys(patch).length === 0) return
    await this.db.update(schema.studioPlans).set(patch).where(eq(schema.studioPlans.id, id))
  }

  async deletePlan(id: string): Promise<DeletePlanResult> {
    const priced = await this.db.select({ id: schema.studioPrices.priceId }).from(schema.studioPrices).where(eq(schema.studioPrices.planId, id)).limit(1)
    if (priced.length > 0) return 'in_use_by_prices'
    const rows = await this.db.delete(schema.studioPlans).where(eq(schema.studioPlans.id, id)).returning({ id: schema.studioPlans.id })
    return rows.length > 0 ? 'ok' : 'not_found'
  }
}
