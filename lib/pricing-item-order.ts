import type { PricingItem } from '@/sanity/queries/pricing'

/** Kolejność w konfiguratorze: `orderRank` (drag w Studio), potem legacy `projectTypeOrder` / `order`. */
export function comparePricingItemsForConfigurator(
  a: PricingItem,
  b: PricingItem,
  projectTypeId: string,
): number {
  const aKey = sortKeyForProjectType(a, projectTypeId)
  const bKey = sortKeyForProjectType(b, projectTypeId)

  if (typeof aKey === 'string' && typeof bKey === 'string') {
    return aKey.localeCompare(bKey)
  }
  if (typeof aKey === 'string') return -1
  if (typeof bKey === 'string') return 1
  return aKey - bKey
}

function sortKeyForProjectType(
  item: PricingItem,
  projectTypeId: string,
): string | number {
  if (item.orderRank) {
    return item.orderRank
  }

  const row = item.projectTypeOrder?.find(
    (pto) => pto.projectType != null && pto.projectType === projectTypeId,
  )
  if (row !== undefined && typeof row.order === 'number' && Number.isFinite(row.order)) {
    return row.order
  }

  return item.order ?? 0
}
