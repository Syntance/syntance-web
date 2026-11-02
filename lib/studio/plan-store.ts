import type { FeatureDef } from './features'

export interface PlanRecord {
  id: string
  appSlug: string
  slug: string
  name: string
  description: string
  /** `free` = plan bez licencji (jedyny, nieusuwalny): definiuje, co jest darmowe. */
  kind: 'paid' | 'free'
  billing: 'perpetual' | 'subscription'
  updateMonths: number
  maxDevices: number
  features: string[]
  active: boolean
  sortOrder: number
  createdAt: string
}

export type PlanPatch = Partial<Pick<PlanRecord, 'name' | 'description' | 'billing' | 'updateMonths' | 'maxDevices' | 'features' | 'active' | 'sortOrder'>>

export type DeletePlanResult = 'ok' | 'not_found' | 'in_use_by_prices'
export type DeleteFeatureResult = 'ok' | 'not_found' | 'in_use_by_plans'

/** Port magazynu planów i katalogu funkcji. Implementacje: Drizzle/Neon i pamięć (testy). */
export interface PlanStore {
  listFeatures(): Promise<FeatureDef[]>
  upsertFeature(feature: FeatureDef): Promise<void>
  deleteFeature(key: string): Promise<DeleteFeatureResult>
  listPlans(): Promise<PlanRecord[]>
  findPlan(id: string): Promise<PlanRecord | null>
  /** False, gdy slug jest zajęty. */
  insertPlan(plan: PlanRecord): Promise<boolean>
  updatePlan(id: string, patch: PlanPatch): Promise<void>
  deletePlan(id: string): Promise<DeletePlanResult>
}
