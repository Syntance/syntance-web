import type { PricingItem } from '@/lib/data/pricing'
import { comparePricingItemsForConfigurator } from '@/lib/pricing-item-order'

export type ConfiguratorProjectTypeId = 'website' | 'ecommerce' | 'webapp'

export function isConfiguratorProjectType(id: string): id is ConfiguratorProjectTypeId {
  return id === 'website' || id === 'ecommerce' || id === 'webapp'
}

export function rankAtIndex(index: number): string {
  return String(index + 1).padStart(4, '0')
}

export function getItemRankForProjectType(item: PricingItem, projectTypeId: string): string {
  if (isConfiguratorProjectType(projectTypeId)) {
    return item.configuratorOrderRanks?.[projectTypeId] ?? item.orderRank ?? '9999'
  }
  return item.orderRank ?? '9999'
}

export function setItemRankForProjectType(
  item: PricingItem,
  projectTypeId: string,
  rank: string,
): PricingItem {
  if (isConfiguratorProjectType(projectTypeId)) {
    return {
      ...item,
      configuratorOrderRanks: {
        ...item.configuratorOrderRanks,
        [projectTypeId]: rank,
      },
    }
  }
  return { ...item, orderRank: rank }
}

export function itemsForProjectTypeCategory(
  items: PricingItem[],
  projectTypeId: string,
  categoryId: string,
): PricingItem[] {
  return items
    .filter((item) => item.category === categoryId && item.projectTypes.includes(projectTypeId))
    .sort((a, b) => comparePricingItemsForConfigurator(a, b, projectTypeId))
}

export function reorderItemsInCategory(
  items: PricingItem[],
  projectTypeId: string,
  categoryId: string,
  orderedIds: string[],
): PricingItem[] {
  const idSet = new Set(orderedIds)
  const reordered = orderedIds
    .map((id, index) => {
      const item = items.find((i) => i.id === id)
      if (!item) return null
      return setItemRankForProjectType(item, projectTypeId, rankAtIndex(index))
    })
    .filter((item): item is PricingItem => item !== null)

  return items.map((item) => {
    if (item.category !== categoryId || !item.projectTypes.includes(projectTypeId)) return item
    if (!idSet.has(item.id)) return item
    return reordered.find((r) => r.id === item.id) ?? item
  })
}
