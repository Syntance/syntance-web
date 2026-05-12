/**
 * Konfigurator na /cennik pokazuje tylko te typy. Kolejność = kolejność kart (WWW → sklep → app).
 * Inne dokumenty `projectType` w CMS służą podstronom / landingom — nie tu.
 */
export const CONFIGURATOR_PROJECT_TYPE_IDS = ['website', 'ecommerce', 'webapp'] as const

export type ConfiguratorProjectTypeId = (typeof CONFIGURATOR_PROJECT_TYPE_IDS)[number]

const CONFIGURATOR_ORDER = new Map<string, number>(
  CONFIGURATOR_PROJECT_TYPE_IDS.map((id, index) => [id, index]),
)

export function isConfiguratorProjectTypeId(id: string): id is ConfiguratorProjectTypeId {
  return CONFIGURATOR_ORDER.has(id)
}

export function projectTypesForConfigurator<T extends { id: string }>(projectTypes: T[]): T[] {
  return projectTypes
    .filter((pt) => CONFIGURATOR_ORDER.has(pt.id))
    .sort((a, b) => (CONFIGURATOR_ORDER.get(a.id) ?? 99) - (CONFIGURATOR_ORDER.get(b.id) ?? 99))
}
