/** Typy projektu widoczne w konfiguratorze /cennik. */
export const CONFIGURATOR_PROJECT_TYPE_SLUGS = [
  'website',
  'ecommerce',
  'webapp',
] as const

/** Kategorie pakietów w konfiguratorze (bez np. strategii). */
export const CONFIGURATOR_CATEGORY_SLUGS = [
  'base',
  'pages',
  'sections',
  'features',
  'integrations',
  'payments',
  'shipping',
] as const

/** Pozycje konfiguratora — wyklucza kategorię „strategia” i inne poza /cennik. */
export const PRICING_ITEM_CONFIGURATOR_FILTER = `_type == "pricingItem" && coalesce(category->showInConfigurator, true) == true && category->id.current in $categorySlugs && count((projectTypes[]->id.current)[@ in $projectTypeSlugs]) > 0`

export const PRICING_ITEM_CONFIGURATOR_FILTER_PARAMS = {
  categorySlugs: [...CONFIGURATOR_CATEGORY_SLUGS],
  projectTypeSlugs: [...CONFIGURATOR_PROJECT_TYPE_SLUGS],
}

/** Usługi spoza konfiguratora (np. strategia marketingu). */
export const PRICING_ITEM_STRATEGY_FILTER = `_type == "pricingItem" && category->id.current == "strategia"`
