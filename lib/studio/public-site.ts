import { asc, eq } from 'drizzle-orm'
import { getDb, hasDb, schema } from '@/lib/db'
import { getLatestRelease, type ReleaseRow } from './releases'

export interface PublicPlan {
  slug: string
  name: string
  description: string
  billing: 'perpetual' | 'subscription'
  updateMonths: number
  maxDevices: number
  priceAmount: number | null
  priceCurrency: string | null
  features: string[]
}

export interface PublicStudioData {
  release: ReleaseRow | null
  freePlan: { features: string[] } | null
  plans: PublicPlan[]
  /** key → nazwa funkcji (do wyświetlania list). */
  featureLabels: Record<string, string>
}

const EMPTY: PublicStudioData = { release: null, freePlan: null, plans: [], featureLabels: {} }

/**
 * Dane publicznego landingu Syntance Studio: najnowsze opublikowane wydanie, plan Free i aktywne plany płatne.
 * Awaria bazy nie może wywrócić strony marketingowej — wtedy pokazujemy wersję bez pobierania i cen.
 */
export async function getPublicStudioData(): Promise<PublicStudioData> {
  if (!hasDb()) return EMPTY
  try {
    const db = getDb()
    const [release, plans, features] = await Promise.all([
      getLatestRelease('stable'),
      db.select().from(schema.studioPlans).where(eq(schema.studioPlans.appSlug, 'studio')).orderBy(asc(schema.studioPlans.sortOrder), asc(schema.studioPlans.name)),
      db.select().from(schema.studioFeatures),
    ])
    const free = plans.find((p) => p.kind === 'free')
    return {
      release,
      freePlan: free ? { features: free.features } : null,
      plans: plans
        .filter((p) => p.kind === 'paid' && p.active && p.priceAmount !== null && p.priceCurrency !== null)
        .map((p) => ({
          slug: p.slug,
          name: p.name,
          description: p.description,
          billing: p.billing,
          updateMonths: p.updateMonths,
          maxDevices: p.maxDevices,
          priceAmount: p.priceAmount,
          priceCurrency: p.priceCurrency,
          features: p.features,
        })),
      featureLabels: Object.fromEntries(features.map((f) => [f.key, f.label])),
    }
  } catch (error) {
    console.error('[studio-site] nie udało się wczytać danych landingu', error instanceof Error ? error.message : error)
    return EMPTY
  }
}

export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency }).format(amount / 100)
}
