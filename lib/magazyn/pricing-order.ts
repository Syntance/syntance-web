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

/** Przenosi pozycję między sekcjami układu (zmiana `category` + kolejność w docelowej sekcji). */
export function moveItemBetweenCategories(
  items: PricingItem[],
  projectTypeId: string,
  itemId: string,
  fromCategoryId: string,
  toCategoryId: string,
  toIndex: number,
): PricingItem[] {
  const item = items.find((i) => i.id === itemId)
  if (!item || fromCategoryId === toCategoryId) return items

  const projectTypes = item.projectTypes.includes(projectTypeId)
    ? item.projectTypes
    : [...item.projectTypes, projectTypeId]

  let next = items.map((row) =>
    row.id === itemId ? { ...row, category: toCategoryId, projectTypes } : row,
  )

  const destIds = itemsForProjectTypeCategory(next, projectTypeId, toCategoryId)
    .map((row) => row.id)
    .filter((id) => id !== itemId)
  const safeIndex = Math.max(0, Math.min(toIndex, destIds.length))
  destIds.splice(safeIndex, 0, itemId)
  next = reorderItemsInCategory(next, projectTypeId, toCategoryId, destIds)

  const sourceIds = itemsForProjectTypeCategory(next, projectTypeId, fromCategoryId).map((row) => row.id)
  if (sourceIds.length > 0) {
    next = reorderItemsInCategory(next, projectTypeId, fromCategoryId, sourceIds)
  }

  return next
}

export function createPricingItemForLayout(params: {
  projectTypeId: string
  categoryId: string
  items: PricingItem[]
}): PricingItem {
  const { projectTypeId, categoryId, items } = params
  const id = `item-${crypto.randomUUID().slice(0, 8)}`
  const siblings = itemsForProjectTypeCategory(items, projectTypeId, categoryId)
  const base: PricingItem = {
    id,
    name: 'Nowa pozycja',
    price: 0,
    hours: 0,
    category: categoryId,
    projectTypes: [projectTypeId],
    required: false,
    defaultSelected: false,
    includedInBase: false,
    disabled: false,
  }
  return setItemRankForProjectType(base, projectTypeId, rankAtIndex(siblings.length))
}

export function itemsAvailableForLayout(
  items: PricingItem[],
  projectTypeId: string,
  categoryId: string,
): PricingItem[] {
  const inLayout = new Set(
    itemsForProjectTypeCategory(items, projectTypeId, categoryId).map((item) => item.id),
  )
  return items
    .filter((item) => !inLayout.has(item.id))
    .sort((a, b) => a.name.localeCompare(b.name, 'pl'))
}

export function assignExistingItemToLayout(params: {
  items: PricingItem[]
  itemId: string
  projectTypeId: string
  categoryId: string
}): PricingItem[] {
  const { items, itemId, projectTypeId, categoryId } = params
  const siblings = itemsForProjectTypeCategory(items, projectTypeId, categoryId)
  const rank = rankAtIndex(siblings.length)

  return items.map((item) => {
    if (item.id !== itemId) return item
    const projectTypes = item.projectTypes.includes(projectTypeId)
      ? item.projectTypes
      : [...item.projectTypes, projectTypeId]
    const next: PricingItem = {
      ...item,
      category: categoryId,
      projectTypes,
    }
    return setItemRankForProjectType(next, projectTypeId, rank)
  })
}

export function reorderPackageItemIdsInCategory(
  itemIds: string[],
  items: PricingItem[],
  categoryId: string,
  orderedCategoryIds: string[],
): string[] {
  let categoryIndex = 0
  return itemIds.map((id) => {
    const item = items.find((entry) => entry.id === id)
    if (item?.category === categoryId) {
      const nextId = orderedCategoryIds[categoryIndex]
      categoryIndex += 1
      return nextId ?? id
    }
    return id
  })
}
