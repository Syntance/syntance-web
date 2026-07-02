/**
 * Uzupełnia brakującą kategorię Strategia i przypisania pozycji do układu cennika.
 *
 * Uruchom: pnpm patch:pricing
 * Wymaga: DATABASE_URL
 */

import { getDatabaseUrl } from '@/lib/db'
import {
  listAllPricingCategoriesAdmin,
  listAllPricingItems,
  replaceAllPricingItems,
  replacePricingCategories,
} from '@/lib/db/queries/pricing'
import {
  mergePricingCategoriesForAdmin,
  mergePricingItemsForAdmin,
  pricingCatalogNeedsMerge,
} from '@/lib/magazyn/pricing-catalog-reference'

async function main() {
  if (!getDatabaseUrl()) {
    throw new Error('DATABASE_URL is not set')
  }

  const [categories, items] = await Promise.all([
    listAllPricingCategoriesAdmin(),
    listAllPricingItems(),
  ])

  if (!pricingCatalogNeedsMerge(categories, items)) {
    console.log('✓ Katalog cennika jest kompletny — brak zmian.')
    return
  }

  const nextCategories = mergePricingCategoriesForAdmin(categories)
  const nextItems = mergePricingItemsForAdmin(items)

  await replacePricingCategories(nextCategories)
  await replaceAllPricingItems(nextItems)

  console.log('✓ Zaktualizowano katalog cennika:')
  console.log(`  - kategorie: ${categories.length} → ${nextCategories.length}`)
  console.log(`  - pozycje: ${items.length} → ${nextItems.length}`)

  const addedCategories = nextCategories.filter(
    (category) => !categories.some((row) => row.id === category.id),
  )
  if (addedCategories.length) {
    console.log(`  - dodane kategorie: ${addedCategories.map((row) => row.name).join(', ')}`)
  }

  const addedItems = nextItems.filter((item) => !items.some((row) => row.id === item.id))
  if (addedItems.length) {
    console.log(`  - dodane pozycje: ${addedItems.map((row) => row.name).join(', ')}`)
  }
}

main().catch((error) => {
  console.error('Patch cennika nie powiódł się:', error)
  process.exit(1)
})
