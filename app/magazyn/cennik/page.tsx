import {
  fetchPricingData,
  listAllPricingCategoriesAdmin,
  listAllPricingItems,
  listAllProjectTypesAdmin,
} from '@/lib/db/queries/pricing'
import { hasDb } from '@/lib/db'
import { CennikClient } from '@/components/magazyn/cennik-client'

export const dynamic = 'force-dynamic'

export default async function CennikPage() {
  const [data, items, categories, projectTypes] = await Promise.all([
    fetchPricingData(),
    listAllPricingItems(),
    listAllPricingCategoriesAdmin(),
    listAllProjectTypesAdmin(),
  ])

  return (
    <CennikClient
      config={data.config}
      items={items}
      categories={categories}
      projectTypes={projectTypes}
      itemCount={items.length}
      categoryCount={categories.length}
      dbConnected={hasDb()}
    />
  )
}
