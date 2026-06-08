/**
 * Uzupełnia brakujące orderRank per para (typ projektu × kategoria),
 * zgodnie z listami „Kolejność pozycji (przeciągnij)” w Studio.
 *
 * Uruchom: pnpm exec tsx sanity/migrate-pricing-order-ranks.ts
 */
import { createClient } from '@sanity/client'
import { LexoRank } from 'lexorank'
import {
  CONFIGURATOR_PROJECT_TYPE_SLUGS,
  PRICING_ITEM_CONFIGURATOR_FILTER_PARAMS,
} from './lib/pricingConfiguratorScope'

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
}

type Pair = {
  projectTypeId: string
  categoryId: string
}

function compareForPair(a: PricingItemRow, b: PricingItemRow): number {
  if (a.orderRank && b.orderRank) {
    return a.orderRank.localeCompare(b.orderRank)
  }
  if (a.orderRank) return -1
  if (b.orderRank) return 1
  return a.name.localeCompare(b.name, 'pl')
}

async function main() {
  const strategiaCategories = await client.fetch<string[]>(
    `*[_type == "pricingCategory" && id.current == "strategia"]._id`
  )
  for (const categoryId of strategiaCategories) {
    await client.patch(categoryId).set({ showInConfigurator: false }).commit()
  }

  const items = await client.fetch<PricingItemRow[]>(
    `*[_type == "pricingItem" && coalesce(category->showInConfigurator, true) == true && category->id.current in $categorySlugs]{
      _id,
      name,
      orderRank,
      "categoryId": category._ref,
      "projectTypeIds": projectTypes[]._ref
    }`,
    { categorySlugs: PRICING_ITEM_CONFIGURATOR_FILTER_PARAMS.categorySlugs }
  )

  const pairKeys = new Set<string>()
  const pairs: Pair[] = []

  const configuratorProjectTypeIds = await client.fetch<string[]>(
    `*[_type == "projectType" && id.current in $slugs]._id`,
    { slugs: [...CONFIGURATOR_PROJECT_TYPE_SLUGS] }
  )
  const configuratorProjectTypeIdSet = new Set(configuratorProjectTypeIds)

  for (const item of items) {
    for (const projectTypeId of item.projectTypeIds) {
      if (!configuratorProjectTypeIdSet.has(projectTypeId)) continue
      const key = `${projectTypeId}::${item.categoryId}`
      if (pairKeys.has(key)) continue
      pairKeys.add(key)
      pairs.push({ projectTypeId, categoryId: item.categoryId })
    }
  }

  const rankByItemId = new Map<string, string>()

  for (const pair of pairs) {
    const bucket = items.filter(
      (item) =>
        item.categoryId === pair.categoryId &&
        item.projectTypeIds.includes(pair.projectTypeId)
    )

    const sorted = [...bucket].sort(compareForPair)

    let rank = LexoRank.min()
    for (const item of sorted) {
      rank = rank.genNext().genNext()
      rankByItemId.set(item._id, rank.toString())
    }
  }

  let updated = 0
  const tx = client.transaction()

  for (const [documentId, orderRank] of rankByItemId) {
    const item = items.find((row) => row._id === documentId)
    if (!item || item.orderRank === orderRank) continue
    tx.patch(documentId, { set: { orderRank } })
    updated += 1
  }

  if (updated > 0) {
    await tx.commit()
  }

  console.log(
    `Zaktualizowano orderRank dla ${updated} pozycji (${pairs.length} list kolejności).`
  )
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
