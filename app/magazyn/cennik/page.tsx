import {
  fetchPricingData,
  listAllPricingCategoriesAdmin,
  listAllPricingItems,
  listAllProjectTypesAdmin,
} from '@/lib/db/queries/pricing'
import { hasDb } from '@/lib/db'
import { CennikClient } from '@/components/magazyn/cennik-client'
import {
  mergePricingCategoriesForAdmin,
  mergePricingItemsForAdmin,
  pricingCatalogNeedsMerge,
} from '@/lib/magazyn/pricing-catalog-reference'

export const dynamic = 'force-dynamic'

export default async function CennikPage() {
  const [data, items, categories, projectTypes] = await Promise.all([
    fetchPricingData(),
    listAllPricingItems(),
    listAllPricingCategoriesAdmin(),
    listAllProjectTypesAdmin(),
  ])

  const mergedCategories = mergePricingCategoriesForAdmin(categories)
  const mergedItems = mergePricingItemsForAdmin(items)
  const catalogNeedsSave = pricingCatalogNeedsMerge(categories, items)

  return (
    <CennikClient
      config={data.config}
      items={mergedItems}
      categories={mergedCategories}
      projectTypes={projectTypes}
      itemCount={mergedItems.length}
      categoryCount={mergedCategories.length}
      dbConnected={hasDb()}
      catalogNeedsSave={catalogNeedsSave}
    />
  )
}
