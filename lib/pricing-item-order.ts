import type { PricingItem } from '@/sanity/queries/pricing'

/** Kolejność w konfiguratorze — wyłącznie `orderRank` ustawiany przeciąganiem w Studio. */
export function comparePricingItemsForConfigurator(
  a: PricingItem,
  b: PricingItem,
): number {
  if (a.orderRank && b.orderRank) {
    return a.orderRank.localeCompare(b.orderRank)
  }
  if (a.orderRank) return -1
  if (b.orderRank) return 1
  return a.name.localeCompare(b.name, 'pl')
}
