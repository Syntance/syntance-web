import type { PricingConfig, PricingData, PricingItem, ProjectTypeBundleRow } from '@/lib/data/pricing'
import { defaultStartingPrices } from '@/lib/data/pricing'

/** Domyślny `id` kategorii „Baza projektu” (musi zgadzać się z `pricingCategory.id`). */
export const DEFAULT_BASE_PROJECT_CATEGORY_ID = 'base'

function getProjectTypeBundleRow(
  config: PricingConfig | undefined,
  projectTypeId: string,
): ProjectTypeBundleRow | undefined {
  return config?.projectTypeBundles?.find((r) => r.projectTypeId === projectTypeId)
}

/**
 * Slug kategorii „rdzenia” pakietu dla wybranego typu: wiersz w `projectTypeBundles`, potem zapas / legacy.
 */
export function getBaseProjectCategoryId(config: PricingConfig | undefined, projectTypeId: string): string {
  const row = getProjectTypeBundleRow(config, projectTypeId)
  const fromRow = row?.baseCategorySlug?.trim()
  if (fromRow) return fromRow

  let legacySpecific: string | undefined
  switch (projectTypeId) {
    case 'website':
      legacySpecific = config?.baseProjectCategoryIdWebsite?.trim()
      break
    case 'ecommerce':
      legacySpecific = config?.baseProjectCategoryIdEcommerce?.trim()
      break
    case 'webapp':
      legacySpecific = config?.baseProjectCategoryIdWebapp?.trim()
      break
    default:
      legacySpecific = undefined
  }

  const legacy = config?.baseProjectCategoryId?.trim()
  const resolved = legacySpecific || legacy
  if (resolved) return resolved
  return DEFAULT_BASE_PROJECT_CATEGORY_ID
}

/**
 * Cena pakietu bazy (PLN netto) z wiersza `projectTypeBundles` lub ze starych pól CMS.
 * Gdy istnieje wiersz dla typu i `bundlePriceNet` = 0, nie wracamy do starych pól (świadome „licz z CMS”).
 */
export function getBaseBundlePriceNet(projectTypeId: string, config: PricingConfig | undefined): number {
  if (!config) return 0
  const row = getProjectTypeBundleRow(config, projectTypeId)
  if (row !== undefined) {
    const n = row.bundlePriceNet
    if (typeof n === 'number' && Number.isFinite(n) && n > 0) return n
    return 0
  }
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

/**
 * Łączne roboczogodziny bazy z wiersza `projectTypeBundles` (nie suma godzin pozycji katalogu).
 * Zero = konfigurator sumuje godziny pozycji objętych pakietem / „w bazie” (wcześniejsze zachowanie).
 */
export function getBundleBaseWorkHours(projectTypeId: string, config: PricingConfig | undefined): number {
  if (!config) return 0
  const row = getProjectTypeBundleRow(config, projectTypeId)
  if (row === undefined) return 0
  const n = row.bundleBaseHours
  return typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : 0
}

/** Cena katalogowa pozycji nie wchodzi do sumy, gdy jest w bazie projektu lub pokryta pakietem / ceną bazową typu. */
function isGratisCatalogLine(
  item: PricingItem,
  baseCat: string,
  projectTypeId: string,
  bundleNet: number,
  typeFloorNet: number,
): boolean {
  const forType = item.projectTypes?.includes(projectTypeId) ?? false
  if (!forType) return false
  const isBase = item.category === baseCat
  /** Wszystkie pozycje z kategorii bazy projektu — cena wliczona w pakiet bazowy. */
  if (isBase) return true
  /** Pakiet z CMS: obowiązkowe poza bazą nadal gratis przy ustawionym bundleNet. */
  const coveredByBundle = bundleNet > 0 && item.required === true
  if (coveredByBundle) return true
  /** `basePrice` typu projektu: obowiązkowe poza bazą wchodzą w type floor. */
  const coveredByTypeFloor = bundleNet === 0 && typeFloorNet > 0 && item.required === true
  if (coveredByTypeFloor) return true
  return false
}

/** Czy cena katalogowa pozycji jest wliczona w bazę (UI, PDF, kalkulator). */
export function isCatalogLineIncludedInBasePrice(
  item: PricingItem,
  projectTypeId: string,
  config: PricingConfig | undefined,
  projectTypeBasePrice = 0,
): boolean {
  const baseCat = getBaseProjectCategoryId(config, projectTypeId)
  const bundleNet = getBaseBundlePriceNet(projectTypeId, config)
  const typeFloorNet =
    typeof projectTypeBasePrice === 'number' && Number.isFinite(projectTypeBasePrice) && projectTypeBasePrice > 0
      ? projectTypeBasePrice
      : 0
  return isGratisCatalogLine(item, baseCat, projectTypeId, bundleNet, typeFloorNet)
}

export type ConfiguratorPricingResult = {
  priceNetto: number
  priceBrutto: number
  deposit: number
  hours: number
  days: number
  baseDays: number
  percentageAdd: number
  itemsCount: number
}

/**
 * Jedna kalkulacja jak w `PricingConfigurator` (netto przed VAT w `priceNetto`).
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
  const baseCat = getBaseProjectCategoryId(config, projectTypeId)
  const bundleNet = getBaseBundlePriceNet(projectTypeId, config)
  const cmsBaseHours = getBundleBaseWorkHours(projectTypeId, config)

  const typeFloorNet =
    typeof projectTypeBasePrice === 'number' && Number.isFinite(projectTypeBasePrice) && projectTypeBasePrice > 0
      ? projectTypeBasePrice
      : 0

  let totalPrice = 0
  let extrasHours = 0
  /** Suma godzin pozycji „w bazie” — używana tylko gdy w CMS `bundleBaseHours` = 0. */
  let gratisNonPercentHours = 0
  let percentageAdd = 0
  let totalItemsCount = 0

  selectedItemIds.forEach((id) => {
    const item = items.find((i) => i.id === id)
    if (!item || item.disabled) return

    const qty = quantities[id] ?? 1
    totalItemsCount += qty

    const gratis = isGratisCatalogLine(item, baseCat, projectTypeId, bundleNet, typeFloorNet)

    if (item.percentageAdd) {
      if (!gratis) {
        percentageAdd += item.percentageAdd
      }
    } else {
      if (!gratis) {
        totalPrice += item.price * qty
        extrasHours += item.hours * qty
      } else {
        gratisNonPercentHours += item.hours * qty
      }
    }
  })

  const baseHoursChunk = cmsBaseHours > 0 ? cmsBaseHours : gratisNonPercentHours
  let totalHours = baseHoursChunk + extrasHours

  const hasRequiredForTypeSelected = selectedItemIds.some((id) => {
    const item = items.find((i) => i.id === id)
    return (
      item &&
      !item.disabled &&
      item.required === true &&
      (item.projectTypes?.includes(projectTypeId) ?? false)
    )
  })

  if (bundleNet === 0 && typeFloorNet > 0 && hasRequiredForTypeSelected) {
    totalPrice += typeFloorNet
  }

  if (bundleNet > 0) {
    totalPrice += bundleNet
  }

  if (percentageAdd > 0) {
    totalPrice *= 1 + percentageAdd / 100
    totalHours *= 1 + percentageAdd / 100
  }

  const priceNetto = Math.round(totalPrice)
  const priceBrutto = Math.round(priceNetto * (1 + (config.vatRate || 23) / 100))
  const deposit = Math.max(
    config.depositFixed || 500,
    Math.round((priceNetto * (config.depositPercent || 20)) / 100),
  )
  const workHoursPerDay = config.workHoursPerDay || 6
  const baseDays = Math.ceil(totalHours / workHoursPerDay)
  const days = baseDays

  return {
    priceNetto,
    priceBrutto,
    deposit,
    hours: Math.round(totalHours),
    days,
    baseDays,
    percentageAdd,
    itemsCount: totalItemsCount,
  }
}

export const STRATEGIA_MARKETING_ITEM_ID = 'strategia-marketing'

/** Znane aliasy ID pozycji strategii (admin może zmienić slug w Magazynie). */
const STRATEGIA_WORKSHOP_ITEM_IDS = [
  STRATEGIA_MARKETING_ITEM_ID,
  'strategia-marketingu-i-sprzedazy',
] as const

/** Pozycja warsztatu strategii w katalogu — jak checkbox w konfiguratorze (nie po sztywnym id). */
export function findStrategiaWorkshopItem(items: PricingItem[] | undefined): PricingItem | undefined {
  if (!items?.length) return undefined
  const active = items.filter((i) => !i.disabled)
  const inCategory = active.filter((i) => i.category === 'strategia')

  const byName = inCategory.find((i) =>
    i.name.toLowerCase().includes('strategia marketingu'),
  )
  if (byName) return byName

  for (const id of STRATEGIA_WORKSHOP_ITEM_IDS) {
    const byId = active.find((i) => i.id === id)
    if (byId) return byId
  }

  if (inCategory.length === 1) return inCategory[0]
  return undefined
}

export function discoveryPriceNetFromConfig(config: PricingConfig | undefined): number {
  const raw = config?.discoveryWorkshopPrice
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
    return raw
  }
  return defaultStartingPrices.discoveryWorkshopPrice
}

/** Cena strategii — pozycja z kategorii strategia (jak checkbox w konfiguratorze). */
export function strategiaWorkshopPriceNet(data: PricingData): number {
  const item = findStrategiaWorkshopItem(data.items)
  const fromItem = item?.price
  if (typeof fromItem === 'number' && Number.isFinite(fromItem) && fromItem > 0) {
    return fromItem
  }
  return discoveryPriceNetFromConfig(data.config)
}
