import type { PricingItem } from '@/lib/data/pricing'

export type PricingAdminSummary = {
  itemCount: number
  priceNet: number
  hours: number
  days: number
  percentageAddCount: number
  percentageAddTotal: number
}

export function itemsInProjectTypeLayout(items: PricingItem[], projectTypeId: string) {
  return items.filter((item) => item.projectTypes.includes(projectTypeId))
}

/** Wymagane, domyślnie włączone lub z kategorii bazy projektu. */
export function isBasicPricingItem(item: PricingItem, baseCategoryId: string): boolean {
  return item.required === true || item.defaultSelected === true || item.category === baseCategoryId
}

export function basicItemsInProjectTypeLayout(
  items: PricingItem[],
  projectTypeId: string,
  baseCategoryId: string,
): PricingItem[] {
  return itemsInProjectTypeLayout(items, projectTypeId).filter(
    (item) => !item.disabled && isBasicPricingItem(item, baseCategoryId),
  )
}

export function summarizeActivePricingItems(
  activeItems: PricingItem[],
  workHoursPerDay: number,
): PricingAdminSummary {
  let priceNet = 0
  let hours = 0
  let percentageAddCount = 0
  let percentageAddTotal = 0

  for (const item of activeItems) {
    if (item.percentageAdd != null && item.percentageAdd > 0) {
      percentageAddCount += 1
      percentageAddTotal += item.percentageAdd
      hours += item.hours
      continue
    }
    priceNet += item.price
    hours += item.hours
  }

  const safeHoursPerDay = workHoursPerDay > 0 ? workHoursPerDay : 6
  const days = hours > 0 ? Math.ceil(hours / safeHoursPerDay) : 0

  return {
    itemCount: activeItems.length,
    priceNet: Math.round(priceNet),
    hours: Math.round(hours * 10) / 10,
    days,
    percentageAddCount,
    percentageAddTotal,
  }
}

export function resolvePackageCatalogItems(items: PricingItem[], itemIds: string[]): PricingItem[] {
  return itemIds
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is PricingItem => item != null && !item.disabled)
}
