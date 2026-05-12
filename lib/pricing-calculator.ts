import type { ComplexitySettings, PricingConfig, PricingItem } from '@/sanity/queries/pricing'
import { defaultPricingData, defaultStartingPrices } from '@/sanity/queries/pricing'

/** Domyślny `id` kategorii „Baza projektu” (musi zgadzać się z `pricingCategory.id`). */
export const DEFAULT_BASE_PROJECT_CATEGORY_ID = 'base'

export function getBaseProjectCategoryId(config: PricingConfig | undefined): string {
  const raw = config?.baseProjectCategoryId?.trim()
  if (raw) return raw
  return DEFAULT_BASE_PROJECT_CATEGORY_ID
}

/**
 * Cena pakietu bazy (PLN netto) z ustawień cennika.
 * Gdy > 0: pozycje z kategorii bazy nie sumują się liniowo — liczy się tylko ta kwota (plus reszta konfiguratora).
 * Gdy 0 / brak: stary model — każda pozycja z własną ceną z CMS.
 */
export function getBaseBundlePriceNet(projectTypeId: string, config: PricingConfig | undefined): number {
  if (!config) return 0
  let raw = 0
  switch (projectTypeId) {
    case 'website':
      raw = config.baseProjectBundlePriceWebsite ?? 0
      break
    case 'ecommerce':
      raw = config.baseProjectBundlePriceEcommerce ?? 0
      break
    case 'webapp':
      raw = config.baseProjectBundlePriceWebapp ?? 0
      break
    default:
      raw = 0
  }
  return typeof raw === 'number' && Number.isFinite(raw) && raw > 0 ? raw : 0
}

/** Cena katalogowa pozycji nie wchodzi do sumy, gdy jest gratis lub pokryta pakietem bazy. */
function isGratisCatalogLine(
  item: PricingItem,
  baseCat: string,
  projectTypeId: string,
  bundleNet: number,
): boolean {
  const forType = item.projectTypes?.includes(projectTypeId) ?? false
  if (!forType) return false
  const isBase = item.category === baseCat
  const coveredByBundle = isBase && bundleNet > 0
  if (coveredByBundle) return true
  if (item.includedInBase === true) return true
  if (item.required === true && isBase) return true
  return false
}

function fallbackComplexity(): ComplexitySettings {
  const c = defaultPricingData.config.complexitySettings
  if (c) return c
  return {
    mediumThreshold: 5,
    highThreshold: 10,
    veryHighThreshold: 15,
    lowDays: 0,
    showLowDaysLabel: false,
    mediumDays: 2,
    showMediumDaysLabel: true,
    highDays: 4,
    showHighDaysLabel: true,
    veryHighDays: 7,
    showVeryHighDaysLabel: true,
    dayPrice: 1200,
  }
}

export type ConfiguratorPricingResult = {
  priceNetto: number
  priceBrutto: number
  deposit: number
  hours: number
  days: number
  baseDays: number
  complexityDays: number
  complexityPrice: number
  complexityWeight: number
  percentageAdd: number
  itemsCount: number
  complexity: 'low' | 'medium' | 'high' | 'very-high'
}

/**
 * Jedna kalkulacja jak w `PricingConfigurator` (netto przed VAT w `priceNetto`; złożoność wliczona).
 *
 * @param projectTypeBasePrice — „od X” z dokumentu typu projektu; gdy brak pakietu `bundleNet`,
 * wchodzi do sumy zamiast sumowania cen katalogowych obowiązkowych pozycji bazy (spójnie z UI „W cenie bazowej”).
 */
export function computeConfiguratorPricing(
  selectedItemIds: string[],
  quantities: Record<string, number>,
  items: PricingItem[],
  projectTypeId: string,
  config: PricingConfig,
  projectTypeBasePrice = 0,
): ConfiguratorPricingResult {
  const baseCat = getBaseProjectCategoryId(config)
  const bundleNet = getBaseBundlePriceNet(projectTypeId, config)

  let totalPrice = 0
  let totalHours = 0
  let percentageAdd = 0
  let totalItemsCount = 0

  selectedItemIds.forEach((id) => {
    const item = items.find((i) => i.id === id)
    if (!item || item.disabled) return

    const qty = quantities[id] ?? 1
    totalItemsCount += qty

    const gratis = isGratisCatalogLine(item, baseCat, projectTypeId, bundleNet)

    if (item.percentageAdd) {
      if (!gratis) {
        percentageAdd += item.percentageAdd
      }
    } else {
      if (!gratis) {
        totalPrice += item.price * qty
      }
      totalHours += item.hours * qty
    }
  })

  const hasRequiredBaseSelected = selectedItemIds.some((id) => {
    const item = items.find((i) => i.id === id)
    return (
      item &&
      !item.disabled &&
      item.required === true &&
      item.category === baseCat &&
      (item.projectTypes?.includes(projectTypeId) ?? false)
    )
  })

  const safeBasePrice =
    typeof projectTypeBasePrice === 'number' && Number.isFinite(projectTypeBasePrice) && projectTypeBasePrice > 0
      ? projectTypeBasePrice
      : 0

  if (bundleNet === 0 && safeBasePrice > 0 && hasRequiredBaseSelected) {
    totalPrice += safeBasePrice
  }

  if (bundleNet > 0) {
    totalPrice += bundleNet
  }

  if (percentageAdd > 0) {
    totalPrice *= 1 + percentageAdd / 100
    totalHours *= 1 + percentageAdd / 100
  }

  const complexitySettings = config.complexitySettings ?? fallbackComplexity()
  let totalComplexityWeight = 0
  selectedItemIds.forEach((id) => {
    const item = items.find((i) => i.id === id)
    if (!item || item.disabled) return
    const qty = quantities[id] ?? 1
    const weight = item.complexityWeight ?? 1
    totalComplexityWeight += weight * qty
  })

  let complexity: ConfiguratorPricingResult['complexity'] = 'low'
  let complexityDays = 0

  if (totalComplexityWeight >= complexitySettings.veryHighThreshold) {
    complexity = 'very-high'
    complexityDays = complexitySettings.veryHighDays
  } else if (totalComplexityWeight >= complexitySettings.highThreshold) {
    complexity = 'high'
    complexityDays = complexitySettings.highDays
  } else if (totalComplexityWeight >= complexitySettings.mediumThreshold) {
    complexity = 'medium'
    complexityDays = complexitySettings.mediumDays
  } else {
    complexity = 'low'
    complexityDays = complexitySettings.lowDays ?? 0
  }

  const complexityPrice = complexityDays * complexitySettings.dayPrice
  const basePriceNetto = Math.round(totalPrice)
  const priceNetto = basePriceNetto + complexityPrice
  const priceBrutto = Math.round(priceNetto * (1 + (config.vatRate || 23) / 100))
  const deposit = Math.max(
    config.depositFixed || 500,
    Math.round((priceNetto * (config.depositPercent || 20)) / 100),
  )
  const workHoursPerDay = config.workHoursPerDay || 6
  const baseDays = Math.ceil(totalHours / workHoursPerDay)
  const days = baseDays + complexityDays

  return {
    priceNetto,
    priceBrutto,
    deposit,
    hours: Math.round(totalHours),
    days,
    baseDays,
    complexityDays,
    complexityPrice,
    complexityWeight: totalComplexityWeight,
    percentageAdd,
    itemsCount: totalItemsCount,
    complexity,
  }
}

export function discoveryPriceNetFromConfig(config: PricingConfig | undefined): number {
  const raw = config?.discoveryWorkshopPrice
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
    return raw
  }
  return defaultStartingPrices.discoveryWorkshopPrice
}
