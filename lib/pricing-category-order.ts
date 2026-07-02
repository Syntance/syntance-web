import type { PricingCategory } from '@/lib/data/pricing'

type CategoryWithOrder = Pick<PricingCategory, 'sortOrder'>

export function compareCategoriesForConfigurator(
  a: CategoryWithOrder,
  b: CategoryWithOrder,
): number {
  const aOrder = a.sortOrder ?? 9999
  const bOrder = b.sortOrder ?? 9999
  if (aOrder !== bOrder) return aOrder - bOrder
  return 0
}

export function sortCategoriesForConfigurator<T extends CategoryWithOrder>(
  categories: T[],
): T[] {
  return [...categories].sort(compareCategoriesForConfigurator)
}
