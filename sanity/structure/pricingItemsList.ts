import type { StructureBuilder } from 'sanity/structure'

const PRICING_ITEM_ORDERING = [
  { field: 'category.order', direction: 'asc' as const },
  { field: 'order', direction: 'asc' as const },
]

function filteredPricingItemsList(
  S: StructureBuilder,
  title: string,
  filter: string,
  params: Record<string, string>
) {
  return S.documentList()
    .schemaType('pricingItem')
    .title(title)
    .filter(filter)
    .params(params)
    .defaultOrdering(PRICING_ITEM_ORDERING)
}

export function pricingConfiguratorItems(S: StructureBuilder) {
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
    S.divider(),
    S.listItem()
      .title('🧩 Wszystkie pozycje cennika')
      .id('pricingItem-all')
      .child(
        S.documentTypeList('pricingItem')
          .title('Wszystkie pozycje cennika')
          .defaultOrdering(PRICING_ITEM_ORDERING)
      ),
    S.listItem()
      .title('🏷️ Filtruj po typie projektu')
      .id('pricingItem-filter-projectType')
      .child(
        S.documentTypeList('projectType')
          .title('Wybierz typ projektu')
          .child((projectTypeId) =>
            filteredPricingItemsList(
              S,
              'Pozycje cennika',
              '_type == "pricingItem" && references($projectTypeId)',
              { projectTypeId }
            )
          )
      ),
    S.listItem()
      .title('📂 Filtruj po kategorii')
      .id('pricingItem-filter-category')
      .child(
        S.documentTypeList('pricingCategory')
          .title('Wybierz kategorię')
          .child((categoryId) =>
            filteredPricingItemsList(
              S,
              'Pozycje cennika',
              '_type == "pricingItem" && category._ref == $categoryId',
              { categoryId }
            )
          )
      ),
  ]
}
