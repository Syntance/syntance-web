import type { PricingItem } from '@/lib/data/pricing'

type ConfiguratorOrderRanks = Partial<
  Record<'website' | 'ecommerce' | 'webapp', string>
>

function rankForProjectType(
  item: PricingItem,
  projectTypeId: string,
): string | undefined {
  const ranks = item.configuratorOrderRanks as ConfiguratorOrderRanks | undefined
  if (
    projectTypeId === 'website' ||
    projectTypeId === 'ecommerce' ||
    projectTypeId === 'webapp'
  ) {
    return ranks?.[projectTypeId] ?? item.orderRank
  }
  return item.orderRank
}

/** Kolejność w konfiguratorze — `configuratorOrderRanks[typ]` z Studio, fallback `orderRank`. */
export function comparePricingItemsForConfigurator(
  a: PricingItem,
  b: PricingItem,
  projectTypeId: string,
): number {
  const aRank = rankForProjectType(a, projectTypeId)
  const bRank = rankForProjectType(b, projectTypeId)

  if (aRank && bRank) {
    const byRank = aRank.localeCompare(bRank)
    if (byRank !== 0) return byRank
  }
  if (aRank) return -1
  if (bRank) return 1
  return a.name.localeCompare(b.name, 'pl')
}
