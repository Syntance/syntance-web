import {
  fetchPricingData,
  listAllPricingCategoriesAdmin,
  listAllPricingItems,
  listAllProjectTypesAdmin,
} from '@/lib/db/queries/pricing'
import { hasDb } from '@/lib/db'
import { CennikClient } from '@/components/magazyn/cennik-client'
import {
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

  const catalogNeedsSave = pricingCatalogNeedsMerge(categories, items)

  return (
    <CennikClient
      config={data.config}
      items={items}
      categories={categories}
      projectTypes={projectTypes}
      itemCount={items.length}
      categoryCount={categories.length}
      dbConnected={hasDb()}
      catalogNeedsSave={catalogNeedsSave}
    />
  )
}
