import { CONFIGURATOR_PROJECT_TYPE_SLUGS } from './pricingConfiguratorScope'

export type ConfiguratorOrderRanks = Partial<
  Record<(typeof CONFIGURATOR_PROJECT_TYPE_SLUGS)[number], string>
>

export type ConfiguratorProjectTypeSlug =
  (typeof CONFIGURATOR_PROJECT_TYPE_SLUGS)[number]

export function isConfiguratorProjectTypeSlug(
  value: string
): value is ConfiguratorProjectTypeSlug {
  return (CONFIGURATOR_PROJECT_TYPE_SLUGS as readonly string[]).includes(value)
}

export function rankForProjectType(
  ranks: ConfiguratorOrderRanks | undefined,
  projectTypeSlug: string,
  fallbackOrderRank?: string
): string | undefined {
  if (isConfiguratorProjectTypeSlug(projectTypeSlug) && ranks?.[projectTypeSlug]) {
    return ranks[projectTypeSlug]
  }
  return fallbackOrderRank
}

export function configuratorOrderRankPatch(
  projectTypeSlug: ConfiguratorProjectTypeSlug,
  orderRank: string
): Record<string, string> {
  return { [`configuratorOrderRanks.${projectTypeSlug}`]: orderRank }
}
