import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import type { StructureBuilder, StructureResolverContext } from 'sanity/structure'

const API_VERSION = '2024-01-01'

type ProjectTypeRow = {
  _id: string
  name: string
}

type CategoryRow = {
  _id: string
  name: string
}

type OrderablePair = {
  projectType: ProjectTypeRow
  category: CategoryRow
}

async function fetchOrderablePairs(
  context: StructureResolverContext
): Promise<OrderablePair[]> {
  const client = context.getClient({ apiVersion: API_VERSION })
  const [projectTypes, categories, itemLinks] = await Promise.all([
    client.fetch<ProjectTypeRow[]>(
      `*[_type == "projectType"] | order(order asc) { _id, name }`
    ),
    client.fetch<CategoryRow[]>(
      `*[_type == "pricingCategory"] | order(order asc) { _id, name }`
    ),
    client.fetch<Array<{ projectTypeIds: string[]; categoryId: string }>>(
      `*[_type == "pricingItem"]{
        "projectTypeIds": projectTypes[]._ref,
        "categoryId": category._ref
      }`
    ),
  ])

  const pairKeys = new Set<string>()
  const pairs: OrderablePair[] = []

  for (const item of itemLinks) {
    for (const projectTypeId of item.projectTypeIds) {
      const key = `${projectTypeId}::${item.categoryId}`
      if (pairKeys.has(key)) continue
      pairKeys.add(key)

      const projectType = projectTypes.find((row) => row._id === projectTypeId)
      const category = categories.find((row) => row._id === item.categoryId)
      if (!projectType || !category) continue

      pairs.push({ projectType, category })
    }
  }

  return pairs.sort((a, b) => {
    const typeCmp = a.projectType.name.localeCompare(b.projectType.name, 'pl')
    if (typeCmp !== 0) return typeCmp
    return a.category.name.localeCompare(b.category.name, 'pl')
  })
}

function orderablePricingList(
  S: StructureBuilder,
  context: StructureResolverContext,
  pair: OrderablePair
) {
  const { projectType, category } = pair
  return orderableDocumentListDeskItem({
    type: 'pricingItem',
    title: `${projectType.name} → ${category.name}`,
    id: `orderable-pricing-${projectType._id}-${category._id}`,
    filter:
      '_type == "pricingItem" && category._ref == $categoryId && references($projectTypeId)',
    params: {
      categoryId: category._id,
      projectTypeId: projectType._id,
    },
    createIntent: false,
    S,
    context,
  })
}

function pricingOrderLists(
  S: StructureBuilder,
  context: StructureResolverContext
) {
  return fetchOrderablePairs(context).then((pairs) =>
    S.list()
      .title('Kolejność pozycji (przeciągnij)')
      .items(pairs.map((pair) => orderablePricingList(S, context, pair)))
  )
}

export function pricingConfiguratorItems(
  S: StructureBuilder,
  context: StructureResolverContext
) {
  return [
    S.listItem()
      .title('🏷️ Typ pakietu (WWW / sklep / app)')
      .id('projectType')
      .child(
        S.documentTypeList('projectType').title('Typ pakietu (gotowe pakiety)')
      ),
    S.listItem()
      .title('📂 Kategorie w pakietach')
      .id('pricingCategory')
      .child(
        S.documentTypeList('pricingCategory').title('Kategorie w pakietach')
      ),
    S.listItem()
      .title('🧩 Pozycje cennika i dodatki')
      .id('pricingItem-all')
      .child(
        S.documentTypeList('pricingItem').title('Pozycje cennika i dodatki')
      ),
    S.divider(),
    S.listItem()
      .title('↕️ Kolejność pozycji (przeciągnij)')
      .id('pricingItem-ordering')
      .child(() => pricingOrderLists(S, context)),
  ]
}
