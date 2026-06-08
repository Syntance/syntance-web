import type { StructureBuilder, StructureResolverContext } from 'sanity/structure'

const API_VERSION = '2024-01-01'

const PRICING_ITEM_ORDERING = [
  { field: 'category.order', direction: 'asc' as const },
  { field: 'order', direction: 'asc' as const },
]

type FilterDoc = {
  _id: string
  name: string
}

function allPricingItemsList(S: StructureBuilder) {
  return S.documentTypeList('pricingItem')
    .title('Wszystkie pozycje')
    .defaultOrdering(PRICING_ITEM_ORDERING)
}

function pricingItemsByProjectTypeList(
  S: StructureBuilder,
  context: StructureResolverContext
) {
  return context
    .getClient({ apiVersion: API_VERSION })
    .fetch<FilterDoc[]>(
      `*[_type == "projectType"] | order(order asc) { _id, name }`
    )
    .then((projectTypes) =>
      S.list()
        .title('Według typu projektu')
        .items(
          projectTypes.map((projectType) =>
            S.listItem()
              .id(`pricingItem-projectType-${projectType._id}`)
              .title(projectType.name)
              .child(
                S.documentList()
                  .schemaType('pricingItem')
                  .title(projectType.name)
                  .filter(
                    '_type == "pricingItem" && references($projectTypeId)'
                  )
                  .params({ projectTypeId: projectType._id })
                  .defaultOrdering(PRICING_ITEM_ORDERING)
              )
          )
        )
    )
}

function pricingItemsByCategoryList(
  S: StructureBuilder,
  context: StructureResolverContext
) {
  return context
    .getClient({ apiVersion: API_VERSION })
    .fetch<FilterDoc[]>(
      `*[_type == "pricingCategory"] | order(order asc) { _id, name }`
    )
    .then((categories) =>
      S.list()
        .title('Według kategorii')
        .items(
          categories.map((category) =>
            S.listItem()
              .id(`pricingItem-category-${category._id}`)
              .title(category.name)
              .child(
                S.documentList()
                  .schemaType('pricingItem')
                  .title(category.name)
                  .filter(
                    '_type == "pricingItem" && category._ref == $categoryId'
                  )
                  .params({ categoryId: category._id })
                  .defaultOrdering(PRICING_ITEM_ORDERING)
              )
          )
        )
    )
}

export function pricingItemsListItem(
  S: StructureBuilder,
  context: StructureResolverContext
) {
  return S.listItem()
    .title('🧩 Pozycje cennika i dodatki')
    .id('pricingItem')
    .child(
      S.list()
        .title('Pozycje cennika i dodatki')
        .items([
          S.listItem()
            .title('📋 Wszystkie pozycje')
            .id('pricingItem-all')
            .child(allPricingItemsList(S)),
          S.divider(),
          S.listItem()
            .title('🏷️ Według typu projektu')
            .id('pricingItem-by-projectType')
            .child(() => pricingItemsByProjectTypeList(S, context)),
          S.listItem()
            .title('📂 Według kategorii')
            .id('pricingItem-by-category')
            .child(() => pricingItemsByCategoryList(S, context)),
        ])
    )
}
