import type { PricingItem } from '@/lib/data/pricing'

export function isPricingDependencyParent(itemId: string, allItems: PricingItem[]): boolean {
  return allItems.some((item) => item.dependencies?.includes(itemId))
}

export function getPricingDependencyRequirements(
  item: PricingItem,
  allItems: PricingItem[],
): Array<{ id: string; name: string }> {
  return (item.dependencies ?? [])
    .map((depId) => {
      const dep = allItems.find((entry) => entry.id === depId)
      return { id: depId, name: dep?.name?.trim() || depId }
    })
    .filter((entry, index, list) => list.findIndex((row) => row.id === entry.id) === index)
}

export function pricingItemListRowBorderClass(options: {
  isDragging: boolean
  isDependencyParent: boolean
}): string {
  if (options.isDragging) return 'border-purple-500/60 bg-purple-500/10'
  if (options.isDependencyParent) return 'border-orange-500/50 bg-orange-500/[0.06]'
  return 'border-white/10 bg-black/20'
}
