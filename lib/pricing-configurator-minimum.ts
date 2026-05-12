import type { PricingData } from '@/sanity/queries/pricing'
import { defaultStartingPrices } from '@/sanity/queries/pricing'
import { computeConfiguratorPricing, getBaseBundlePriceNet } from '@/lib/pricing-calculator'

/** Ostatnia deska ratunku, gdy brak typu w CMS albo zero z konfiguratora i z basePrice typu. */
function configOrDefaultFallbackNet(projectTypeId: string, data: PricingData): number {
  const cfg = data.config
  switch (projectTypeId) {
    case 'website': {
      const n = cfg.websiteStartPrice
      if (typeof n === 'number' && Number.isFinite(n) && n > 0) return n
      return defaultStartingPrices.websiteStartPrice
    }
    case 'ecommerce': {
      const n = cfg.ecommerceStandardStartPrice
      if (typeof n === 'number' && Number.isFinite(n) && n > 0) return n
      return defaultStartingPrices.ecommerceStandardStartPrice
    }
    case 'webapp': {
      const n = cfg.webappStartPrice
      if (typeof n === 'number' && Number.isFinite(n) && n > 0) return n
      return defaultStartingPrices.webappStartPrice
    }
    default:
      return 0
  }
}

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
  const basePrice = data.projectTypes.find((p) => p.id === projectTypeId)?.basePrice ?? 0
  return computeConfiguratorPricing(
    selectedIds,
    {},
    data.items,
    projectTypeId,
    data.config,
    basePrice,
  ).priceNetto
}

export interface ConfiguratorMinimumPricesNet {
  websiteNet: number
  ecommerceNet: number
  webappNet: number
}

/**
 * Publiczna „cena od której zaczyna się projekt” (netto): jedno pole w CMS — **Cena pakietu gotowego**
 * w wierszu `projectTypeBundles`; potem kalkulacja pustego konfiguratora, `basePrice` dokumentu typu,
 * na końcu zapasowe pola w cenniku / stałe w kodzie.
 */
export function getProjectStartPriceNet(projectTypeId: string, data: PricingData): number {
  const bundleNet = getBaseBundlePriceNet(projectTypeId, data.config)
  if (typeof bundleNet === 'number' && Number.isFinite(bundleNet) && bundleNet > 0) {
    return bundleNet
  }

  const fromConfigurator = computeConfiguratorMinimumPriceNet(projectTypeId, data)
  if (fromConfigurator > 0) {
    return fromConfigurator
  }

  const pt = data.projectTypes.find((p) => p.id === projectTypeId)
  const baseFromType =
    pt && typeof pt.basePrice === 'number' && Number.isFinite(pt.basePrice) && pt.basePrice > 0
      ? pt.basePrice
      : 0
  if (baseFromType > 0) {
    return baseFromType
  }

  return configOrDefaultFallbackNet(projectTypeId, data)
}

function minimumNetForProjectType(projectTypeId: string, data: PricingData): number {
  const pt = data.projectTypes.find((p) => p.id === projectTypeId && !p.disabled)
  if (!pt) {
    return configOrDefaultFallbackNet(projectTypeId, data)
  }

  return getProjectStartPriceNet(projectTypeId, data)
}

/**
 * Minimalne kwoty netto: meta, FAQ, layouty, podstrony — zgodnie z `getProjectStartPriceNet`
 * (najpierw cena pakietu gotowego z CMS).
 */
export function getConfiguratorMinimumPricesNet(data: PricingData): ConfiguratorMinimumPricesNet {
  return {
    websiteNet: minimumNetForProjectType('website', data),
    ecommerceNet: minimumNetForProjectType('ecommerce', data),
    webappNet: minimumNetForProjectType('webapp', data),
  }
}
