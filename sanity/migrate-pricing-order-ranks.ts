/**
 * Migracja orderRank per para (typ projektu × kategoria),
 * zgodnie z listami „Kolejność pozycji (przeciągnij)” w Studio.
 *
 * Uruchom: pnpm exec tsx sanity/migrate-pricing-order-ranks.ts
 */
import { createClient } from '@sanity/client'
import { LexoRank } from 'lexorank'

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
  order?: number
  orderRank?: string
  categoryId: string
  projectTypeIds: string[]
  projectTypeOrder: Array<{ projectTypeId: string; order: number }>
}

type Pair = {
  projectTypeId: string
  categoryId: string
}

function legacyOrder(item: PricingItemRow, projectTypeId: string): number {
  const row = item.projectTypeOrder?.find(
    (entry) => entry.projectTypeId === projectTypeId
  )
  if (row && Number.isFinite(row.order)) return row.order
  return item.order ?? 0
}

async function main() {
  const items = await client.fetch<PricingItemRow[]>(
    `*[_type == "pricingItem"]{
      _id,
      order,
      orderRank,
      "categoryId": category._ref,
      "projectTypeIds": projectTypes[]._ref,
      projectTypeOrder[]{
        "projectTypeId": projectType._ref,
        order
      }
    }`
  )

  const pairKeys = new Set<string>()
  const pairs: Pair[] = []

  for (const item of items) {
    for (const projectTypeId of item.projectTypeIds) {
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

    const sorted = [...bucket].sort(
      (a, b) =>
        legacyOrder(a, pair.projectTypeId) -
        legacyOrder(b, pair.projectTypeId)
    )

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
