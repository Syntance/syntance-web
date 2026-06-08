/**
 * Jednorazowa migracja: ustawia orderRank na podstawie kolejności kategorii
 * i legacy order (priorytet: typ „website”, potem globalne order).
 *
 * Uruchom: pnpm exec tsx sanity/migrate-pricing-order-ranks.ts
 */
import { createClient } from '@sanity/client'
import { LexoRank } from 'lexorank'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

type PricingItemRow = {
  _id: string
  order?: number
  orderRank?: string
  categoryId: string
  categoryOrder: number
  projectTypeOrder: Array<{ projectTypeSlug: string; order: number }>
}

function legacyOrder(item: PricingItemRow): number {
  const website = item.projectTypeOrder?.find(
    (entry) => entry.projectTypeSlug === 'website'
  )
  if (website && Number.isFinite(website.order)) return website.order
  return item.order ?? 0
}

async function main() {
  const items = await client.fetch<PricingItemRow[]>(
    `*[_type == "pricingItem"]{
      _id,
      order,
      orderRank,
      "categoryId": category._ref,
      "categoryOrder": category->order,
      projectTypeOrder[]{
        "projectTypeSlug": projectType->id.current,
        order
      }
    }`
  )

  const sorted = [...items].sort((a, b) => {
    const categoryDelta = (a.categoryOrder ?? 0) - (b.categoryOrder ?? 0)
    if (categoryDelta !== 0) return categoryDelta
    return legacyOrder(a) - legacyOrder(b)
  })

  let rank = LexoRank.min()
  let updated = 0

  for (const item of sorted) {
    rank = rank.genNext()
    const orderRank = rank.toString()
    if (item.orderRank === orderRank) continue
    await client.patch(item._id).set({ orderRank }).commit()
    updated += 1
  }

  console.log(`Zaktualizowano orderRank dla ${updated} pozycji cennika.`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
