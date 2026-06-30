import type { PricingConfig, PricingPackage, PricingPackageProjectType } from '@/lib/data/pricing'

export function buildDefaultPricingPackages(config: PricingConfig): PricingPackage[] {
  return [
    {
      id: 'website-start',
      name: 'Strona — start',
      description: 'Pakiet startowy dla strony firmowej.',
      projectType: 'website',
      priceNet: config.websiteStartPrice || 5400,
      hours: 27,
      deliveryTime: '7–14 dni roboczych',
      itemIds: [],
      customLines: [],
      sortOrder: 0,
      useAsStartPrice: true,
    },
    {
      id: 'website-advanced',
      name: 'Strona — zaawansowana',
      description: 'Rozbudowana strona z dodatkowymi sekcjami i integracjami.',
      projectType: 'website',
      priceNet: config.websiteAdvancedStartPrice || 12000,
      hours: 60,
      deliveryTime: '14–21 dni roboczych',
      itemIds: [],
      customLines: [],
      sortOrder: 1,
    },
    {
      id: 'ecommerce-standard',
      name: 'Sklep — standard',
      description: 'Headless sklep z podstawowymi integracjami.',
      projectType: 'ecommerce',
      priceNet: config.ecommerceStandardStartPrice || 12000,
      hours: 80,
      deliveryTime: '21–28 dni roboczych',
      itemIds: [],
      customLines: [],
      sortOrder: 0,
      useAsStartPrice: true,
    },
    {
      id: 'ecommerce-pro',
      name: 'Sklep — pro',
      description: 'Sklep z rozszerzonymi integracjami i custom UX.',
      projectType: 'ecommerce',
      priceNet: config.ecommerceProStartPrice || 25000,
      hours: 125,
      deliveryTime: '28–42 dni roboczych',
      itemIds: [],
      customLines: [],
      sortOrder: 1,
    },
  ]
}

export function mergePricingPackagesForAdmin(
  packages: PricingPackage[] | undefined,
  config: PricingConfig,
): PricingPackage[] {
  const source = packages?.length ? packages : buildDefaultPricingPackages(config)
  return [...source]
    .map((pkg) => ({
      ...pkg,
      itemIds: pkg.itemIds ?? [],
      customLines: pkg.customLines ?? [],
    }))
    .sort((a, b) => {
      if (a.projectType !== b.projectType) {
        return a.projectType.localeCompare(b.projectType)
      }
      return a.sortOrder - b.sortOrder
    })
}

export function packagesForProjectType(
  packages: PricingPackage[],
  projectType: PricingPackageProjectType,
): PricingPackage[] {
  return packages
    .filter((pkg) => pkg.projectType === projectType)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getStartPriceFromPackages(
  packages: PricingPackage[] | undefined,
  projectTypeId: string,
): number | undefined {
  if (!packages?.length) return undefined
  const match = packages
    .filter(
      (pkg) =>
        !pkg.disabled &&
        pkg.projectType === projectTypeId &&
        pkg.useAsStartPrice &&
        pkg.priceNet > 0,
    )
    .sort((a, b) => a.sortOrder - b.sortOrder)[0]
  return match?.priceNet
}
