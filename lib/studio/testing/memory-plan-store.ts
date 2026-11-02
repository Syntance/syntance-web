import { DEFAULT_FEATURES, type FeatureDef } from '../features'
import type { DeleteFeatureResult, DeletePlanResult, PlanPatch, PlanRecord, PlanStore } from '../plan-store'

/** Magazyn planów w pamięci — tylko do testów. */
export class MemoryPlanStore implements PlanStore {
  readonly features = new Map<string, FeatureDef>(DEFAULT_FEATURES.map((f) => [f.key, { ...f }]))
  readonly plans = new Map<string, PlanRecord>()
  /** Id planów, do których „przypięto” cenę (blokuje usunięcie). */
  readonly pricedPlans = new Set<string>()

  listFeatures(): Promise<FeatureDef[]> {
    return Promise.resolve([...this.features.values()].map((f) => ({ ...f })))
  }
  upsertFeature(feature: FeatureDef): Promise<void> {
    this.features.set(feature.key, { ...feature })
    return Promise.resolve()
  }
  deleteFeature(key: string): Promise<DeleteFeatureResult> {
    if (!this.features.has(key)) return Promise.resolve('not_found')
    if ([...this.plans.values()].some((p) => p.features.includes(key))) return Promise.resolve('in_use_by_plans')
    this.features.delete(key)
    return Promise.resolve('ok')
  }
  listPlans(): Promise<PlanRecord[]> {
    return Promise.resolve([...this.plans.values()].map((p) => structuredClone(p)))
  }
  findPlan(id: string): Promise<PlanRecord | null> {
    const p = this.plans.get(id)
    return Promise.resolve(p ? structuredClone(p) : null)
  }
  insertPlan(plan: PlanRecord): Promise<boolean> {
    if ([...this.plans.values()].some((p) => p.slug === plan.slug)) return Promise.resolve(false)
    this.plans.set(plan.id, structuredClone(plan))
    return Promise.resolve(true)
  }
  updatePlan(id: string, patch: PlanPatch): Promise<void> {
    const p = this.plans.get(id)
    if (p) Object.assign(p, patch)
    return Promise.resolve()
  }
  deletePlan(id: string): Promise<DeletePlanResult> {
    if (!this.plans.has(id)) return Promise.resolve('not_found')
    if (this.pricedPlans.has(id)) return Promise.resolve('in_use_by_prices')
    this.plans.delete(id)
    return Promise.resolve('ok')
  }
}
