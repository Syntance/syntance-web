/**
 * Uzupełnia configuratorOrderRanks per para (typ projektu × kategoria).
 *
 * Uruchom: pnpm exec tsx sanity/migrate-pricing-order-ranks.ts
 */
import { createClient } from '@sanity/client'
import { LexoRank } from 'lexorank'
import {
  CONFIGURATOR_PROJECT_TYPE_SLUGS,
  PRICING_ITEM_CONFIGURATOR_FILTER_PARAMS,
} from './lib/pricingConfiguratorScope'
import type { ConfiguratorProjectTypeSlug } from './lib/configuratorOrderRanks'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'sqgw0wlq'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token =
  process.env.SANITY_API_WRITE_TOKEN ||
  process.env.SANITY_AUTH_TOKEN ||
  ''

if (!token) {
  console.error('Brak tokenu: ustaw SANITY_API_WRITE_TOKEN lub SANITY_AUTH_TOKEN')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
})

type PricingItemRow = {
  _id: string
  name: string
  orderRank?: string
  categoryId: string
  projectTypeIds: string[]
  projectTypeSlugs: string[]
  configuratorOrderRanks?: Partial<Record<ConfiguratorProjectTypeSlug, string>>
}

type Pair = {
  projectTypeId: string
  projectTypeSlug: ConfiguratorProjectTypeSlug
  categoryId: string
}

async function main() {
  const strategiaCategories = await client.fetch<string[]>(
    `*[_type == "pricingCategory" && id.current == "strategia"]._id`
  )
  for (const categoryId of strategiaCategories) {
    await client.patch(categoryId).set({ showInConfigurator: false }).commit()
  }

  const [items, projectTypes] = await Promise.all([
    client.fetch<PricingItemRow[]>(
      `*[_type == "pricingItem" && coalesce(category->showInConfigurator, true) == true && category->id.current in $categorySlugs]{
        _id,
        name,
        orderRank,
        configuratorOrderRanks,
        "categoryId": category._ref,
        "projectTypeIds": projectTypes[]._ref,
        "projectTypeSlugs": projectTypes[]->id.current
      }`,
      { categorySlugs: PRICING_ITEM_CONFIGURATOR_FILTER_PARAMS.categorySlugs }
    ),
    client.fetch<Array<{ _id: string; slug: string }>>(
      `*[_type == "projectType" && id.current in $slugs]{ _id, "slug": id.current }`,
      { slugs: [...CONFIGURATOR_PROJECT_TYPE_SLUGS] }
    ),
  ])

  const projectTypeSlugById = new Map(
    projectTypes.map((row) => [row._id, row.slug as ConfiguratorProjectTypeSlug])
  )

  const pairKeys = new Set<string>()
  const pairs: Pair[] = []

  for (const item of items) {
    for (const projectTypeId of item.projectTypeIds) {
      const projectTypeSlug = projectTypeSlugById.get(projectTypeId)
      if (!projectTypeSlug) continue
      const key = `${projectTypeId}::${item.categoryId}`
      if (pairKeys.has(key)) continue
      pairKeys.add(key)
      pairs.push({ projectTypeId, projectTypeSlug, categoryId: item.categoryId })
    }
  }

  const ranksByItemId = new Map<string, Partial<Record<ConfiguratorProjectTypeSlug, string>>>()

  for (const pair of pairs) {
    const bucket = items.filter(
      (item) =>
        item.categoryId === pair.categoryId &&
        item.projectTypeIds.includes(pair.projectTypeId)
    )

    const sorted = [...bucket].sort((a, b) => {
      const aRank =
        a.configuratorOrderRanks?.[pair.projectTypeSlug] ?? a.orderRank ?? ''
      const bRank =
        b.configuratorOrderRanks?.[pair.projectTypeSlug] ?? b.orderRank ?? ''
      if (aRank && bRank && aRank !== bRank) return aRank.localeCompare(bRank)
      return a.name.localeCompare(b.name, 'pl')
    })

    let rank = LexoRank.min()
    for (const item of sorted) {
      rank = rank.genNext().genNext()
      const existing = ranksByItemId.get(item._id) ?? {}
      existing[pair.projectTypeSlug] = rank.toString()
      ranksByItemId.set(item._id, existing)
    }
  }

  let updated = 0
  const tx = client.transaction()

  for (const [documentId, configuratorOrderRanks] of ranksByItemId) {
    const item = items.find((row) => row._id === documentId)
    if (!item) continue

    const changed = CONFIGURATOR_PROJECT_TYPE_SLUGS.some(
      (slug) => item.configuratorOrderRanks?.[slug] !== configuratorOrderRanks[slug]
    )
    if (!changed) continue

    tx.patch(documentId, { set: { configuratorOrderRanks } })
    updated += 1
  }

  if (updated > 0) {
    await tx.commit()
  }

  console.log(
    `Zaktualizowano configuratorOrderRanks dla ${updated} pozycji (${pairs.length} list kolejności).`
  )
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
