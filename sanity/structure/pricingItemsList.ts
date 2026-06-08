import type { StructureBuilder, StructureResolverContext } from 'sanity/structure'
import PricingItemOrderList from '../components/PricingItemOrderList'
import {
  CONFIGURATOR_PROJECT_TYPE_SLUGS,
  PRICING_ITEM_CONFIGURATOR_FILTER,
  PRICING_ITEM_CONFIGURATOR_FILTER_PARAMS,
  PRICING_ITEM_STRATEGY_FILTER,
} from '../lib/pricingConfiguratorScope'

const API_VERSION = '2024-01-01'

type ProjectTypeRow = {
  _id: string
  name: string
  slug: string
}

type CategoryRow = {
  _id: string
  name: string
  slug: string
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
      `*[_type == "projectType" && id.current in $slugs] | order(order asc) {
        _id,
        name,
        "slug": id.current
      }`,
      { slugs: [...CONFIGURATOR_PROJECT_TYPE_SLUGS] }
    ),
    client.fetch<CategoryRow[]>(
      `*[_type == "pricingCategory" && coalesce(showInConfigurator, true) == true && id.current in $slugs] | order(order asc) {
        _id,
        name,
        "slug": id.current
      }`,
      { slugs: PRICING_ITEM_CONFIGURATOR_FILTER_PARAMS.categorySlugs }
    ),
    client.fetch<Array<{ projectTypeSlugs: string[]; categorySlug: string }>>(
      `*[_type == "pricingItem" && coalesce(category->showInConfigurator, true) == true && category->id.current in $categorySlugs]{
        "projectTypeSlugs": projectTypes[]->id.current,
        "categorySlug": category->id.current
      }`,
      { categorySlugs: PRICING_ITEM_CONFIGURATOR_FILTER_PARAMS.categorySlugs }
    ),
  ])

  const projectTypeBySlug = new Map(projectTypes.map((row) => [row.slug, row]))
  const categoryBySlug = new Map(categories.map((row) => [row.slug, row]))
  const pairKeys = new Set<string>()
  const pairs: OrderablePair[] = []

  for (const item of itemLinks) {
    if (!categoryBySlug.has(item.categorySlug)) continue

    for (const projectTypeSlug of item.projectTypeSlugs) {
      if (!CONFIGURATOR_PROJECT_TYPE_SLUGS.includes(
        projectTypeSlug as (typeof CONFIGURATOR_PROJECT_TYPE_SLUGS)[number]
      )) {
        continue
      }

      const key = `${projectTypeSlug}::${item.categorySlug}`
      if (pairKeys.has(key)) continue
      pairKeys.add(key)

      const projectType = projectTypeBySlug.get(projectTypeSlug)
      const category = categoryBySlug.get(item.categorySlug)
      if (!projectType || !category) continue

      pairs.push({ projectType, category })
    }
  }

  return pairs.sort((a, b) => {
    const typeOrder =
      CONFIGURATOR_PROJECT_TYPE_SLUGS.indexOf(
        a.projectType.slug as (typeof CONFIGURATOR_PROJECT_TYPE_SLUGS)[number]
      ) -
      CONFIGURATOR_PROJECT_TYPE_SLUGS.indexOf(
        b.projectType.slug as (typeof CONFIGURATOR_PROJECT_TYPE_SLUGS)[number]
      )
    if (typeOrder !== 0) return typeOrder
    return a.category.name.localeCompare(b.category.name, 'pl')
  })
}

function orderablePricingList(
  S: StructureBuilder,
  _context: StructureResolverContext,
  pair: OrderablePair
) {
  const { projectType, category } = pair
  const listId = `orderable-pricing-${projectType._id}-${category._id}`
  const filter = `${PRICING_ITEM_CONFIGURATOR_FILTER} && category._ref == $categoryId && references($projectTypeId)`
  const params = {
    ...PRICING_ITEM_CONFIGURATOR_FILTER_PARAMS,
    categoryId: category._id,
    projectTypeId: projectType._id,
  }
  const listTitle = `Pozycje: ${projectType.name} → ${category.name}`

  const documentListNode = S.documentTypeList('pricingItem')
    .title(listTitle)
    .filter(filter)
    .params(params)
    .canHandleIntent(() => false)
    .child((documentId) =>
      S.document()
        .documentId(documentId)
        .schemaType('pricingItem')
        .title('Edycja pozycji cennika')
    )

  return S.listItem()
    .title(listTitle)
    .id(listId)
    .schemaType('pricingItem')
    .child(
      Object.assign(documentListNode.serialize(), {
        __preserveInstance: true,
        key: listId,
        type: 'component',
        component: PricingItemOrderList,
        options: {
          filter,
          params,
        },
      })
    )
}

function pricingOrderLists(
  S: StructureBuilder,
  context: StructureResolverContext
) {
  return fetchOrderablePairs(context).then((pairs) =>
    S.list()
      .title('Kolejność pozycji cennika (przeciągnij)')
        .items(pairs.map((pair) => orderablePricingList(S, context, pair)))
  )
}

function configuratorPricingItemsList(S: StructureBuilder) {
  return S.documentList()
    .schemaType('pricingItem')
    .title('Pozycje cennika i dodatki')
    .filter(PRICING_ITEM_CONFIGURATOR_FILTER)
    .params(PRICING_ITEM_CONFIGURATOR_FILTER_PARAMS)
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
        S.documentTypeList('projectType')
          .title('Typ pakietu (gotowe pakiety)')
          .filter('id.current in $slugs')
          .params({ slugs: [...CONFIGURATOR_PROJECT_TYPE_SLUGS] })
      ),
    S.listItem()
      .title('📂 Kategorie w pakietach')
      .id('pricingCategory')
      .child(
        S.documentTypeList('pricingCategory')
          .title('Kategorie w pakietach (konfigurator)')
          .filter('coalesce(showInConfigurator, true) == true && id.current in $slugs')
          .params({ slugs: PRICING_ITEM_CONFIGURATOR_FILTER_PARAMS.categorySlugs })
      ),
    S.listItem()
      .title('🧩 Pozycje cennika i dodatki')
      .id('pricingItem-all')
      .child(configuratorPricingItemsList(S)),
    S.listItem()
      .title('📊 Usługi strategii (poza konfiguratorem)')
      .id('pricingItem-strategia')
      .child(
        S.documentList()
          .schemaType('pricingItem')
          .title('Usługi strategii')
          .filter(PRICING_ITEM_STRATEGY_FILTER)
      ),
    S.divider(),
    S.listItem()
      .title('↕️ Kolejność pozycji (przeciągnij)')
      .id('pricingItem-ordering')
      .child(() => pricingOrderLists(S, context)),
  ]
}
