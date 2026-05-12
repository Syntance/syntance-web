import type { PricingData } from '@/sanity/queries/pricing'
import { defaultStartingPrices } from '@/sanity/queries/pricing'
import { computeConfiguratorPricing } from '@/lib/pricing-calculator'

/**
 * Minimalny zestaw pozycji jak „pusty” konfigurator: tylko `required` dla danego typu projektu,
 * bez niczego z `defaultSelected`, plus domknięcie `bundledWith`.
 */
export function collectMinimumItemIds(projectTypeId: string, items: PricingData['items']): string[] {
  const ids = new Set<string>()
  const queue: string[] = []

  for (const item of items) {
    if (item.disabled) continue
    if (!item.projectTypes?.includes(projectTypeId)) continue
    if (item.required) {
      queue.push(item.id)
    }
  }

  while (queue.length > 0) {
    const id = queue.pop() ?? ''
    if (ids.has(id)) continue
    ids.add(id)
    const entry = items.find((i) => i.id === id)
    if (!entry || entry.disabled) continue
    const bundled = entry.bundledWith ?? []
    for (const bid of bundled) {
      const child = items.find((i) => i.id === bid)
      if (child?.disabled) continue
      if (!ids.has(bid)) queue.push(bid)
    }
  }

  return [...ids]
}

export function computeConfiguratorMinimumPriceNet(projectTypeId: string, data: PricingData): number {
  const selectedIds = collectMinimumItemIds(projectTypeId, data.items)
  return computeConfiguratorPricing(selectedIds, {}, data.items, projectTypeId, data.config).priceNetto
}

export interface ConfiguratorMinimumPricesNet {
  websiteNet: number
  ecommerceNet: number
  webappNet: number
}

function netForEnabledType(
  projectTypeId: string,
  data: PricingData,
  fallback: number,
): number {
  const pt = data.projectTypes.find((p) => p.id === projectTypeId && !p.disabled)
  if (!pt) return fallback
  const raw = computeConfiguratorMinimumPriceNet(projectTypeId, data)
  return raw > 0 ? raw : fallback
}

export function getConfiguratorMinimumPricesNet(data: PricingData): ConfiguratorMinimumPricesNet {
  return {
    websiteNet: netForEnabledType('website', data, defaultStartingPrices.websiteStartPrice),
    ecommerceNet: netForEnabledType(
      'ecommerce',
      data,
      defaultStartingPrices.ecommerceStandardStartPrice,
    ),
    webappNet: netForEnabledType('webapp', data, defaultStartingPrices.webappStartPrice),
  }
}
