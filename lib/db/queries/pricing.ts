import { asc, eq } from 'drizzle-orm'
import { getDb, hasDb } from '@/lib/db'
import {
  pricingCategories,
  pricingConfig,
  pricingItems,
  projectTypes,
} from '@/lib/db/schema'
import {
  defaultPricingData,
  type PricingCategory,
  type PricingData,
  type PricingItem,
  type ProjectType,
} from '@/lib/data/pricing'

export type PricingCategoryAdmin = PricingCategory & {
  sortOrder: number
  showInConfigurator: boolean
}

export type ProjectTypeAdmin = ProjectType & {
  sortOrder: number
}

function mapItem(row: typeof pricingItems.$inferSelect): PricingItem {
  const extra = (row.extra ?? {}) as Record<string, unknown>
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    price: row.price,
    hours: row.hours,
    rateType: (row.rateType as PricingItem['rateType']) ?? undefined,
    category: row.categoryId ?? '',
    projectTypes: row.projectTypes ?? [],
    required: row.required,
    defaultSelected: row.defaultSelected,
    includedInBase: row.includedInBase,
    maxQuantity: row.maxQuantity ?? undefined,
    percentageAdd: row.percentageAdd ?? undefined,
    orderRank: row.orderRank ?? undefined,
    configuratorOrderRanks: row.configuratorOrderRanks ?? undefined,
    dependencies: row.dependencies ?? undefined,
    bundledWith: row.bundledWith ?? undefined,
    popular: row.popular,
    new: row.isNew,
    disabled: row.disabled,
    hidePrice: row.hidePrice,
    notificationOnAdd: extra.notificationOnAdd as boolean | undefined,
    notificationAddTitle: extra.notificationAddTitle as string | undefined,
    notificationAddText: extra.notificationAddText as string | undefined,
    notificationAddConfirmText: extra.notificationAddConfirmText as string | undefined,
    notificationAddCancelText: extra.notificationAddCancelText as string | undefined,
    notificationOnRemove: extra.notificationOnRemove as boolean | undefined,
    notificationRemoveTitle: extra.notificationRemoveTitle as string | undefined,
    notificationRemoveText: extra.notificationRemoveText as string | undefined,
    notificationRemoveConfirmText: extra.notificationRemoveConfirmText as string | undefined,
    notificationRemoveCancelText: extra.notificationRemoveCancelText as string | undefined,
  }
}

export async function listAllPricingCategoriesAdmin(): Promise<PricingCategoryAdmin[]> {
  if (!hasDb()) {
    return defaultPricingData.categories.map((c, index) => ({
      ...c,
      sortOrder: index,
      showInConfigurator: true,
    }))
  }
  const db = getDb()
  const rows = await db.select().from(pricingCategories).orderBy(asc(pricingCategories.sortOrder))
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description ?? undefined,
    icon: r.icon ?? undefined,
    disabled: r.disabled,
    sortOrder: r.sortOrder,
    showInConfigurator: r.showInConfigurator,
  }))
}

export async function listAllProjectTypesAdmin(): Promise<ProjectTypeAdmin[]> {
  if (!hasDb()) {
    return defaultPricingData.projectTypes.map((t, index) => ({
      ...t,
      sortOrder: index,
    }))
  }
  const db = getDb()
  const rows = await db.select().from(projectTypes).orderBy(asc(projectTypes.sortOrder))
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description ?? undefined,
    basePrice: r.basePrice ?? undefined,
    icon: r.icon ?? undefined,
    disabled: r.disabled,
    sortOrder: r.sortOrder,
  }))
}

export async function replacePricingCategories(categories: PricingCategoryAdmin[]): Promise<void> {
  const db = getDb()
  await db.delete(pricingCategories)
  if (!categories.length) return
  await db.insert(pricingCategories).values(
    categories.map((c, index) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      icon: c.icon,
      sortOrder: c.sortOrder ?? index,
      showInConfigurator: c.showInConfigurator ?? true,
      disabled: c.disabled ?? false,
    })),
  )
}

export async function replaceProjectTypes(types: ProjectTypeAdmin[]): Promise<void> {
  const db = getDb()
  await db.delete(projectTypes)
  if (!types.length) return
  await db.insert(projectTypes).values(
    types.map((t, index) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      basePrice: t.basePrice,
      icon: t.icon,
      sortOrder: t.sortOrder ?? index,
      disabled: t.disabled ?? false,
    })),
  )
}

export async function fetchPricingData(): Promise<PricingData> {
  if (!hasDb()) return defaultPricingData
  try {
    const db = getDb()
    const [categories, types, items, configRow] = await Promise.all([
      db.select().from(pricingCategories).orderBy(asc(pricingCategories.sortOrder)),
      db.select().from(projectTypes).orderBy(asc(projectTypes.sortOrder)),
      db.select().from(pricingItems),
      db.query.pricingConfig.findFirst({ where: eq(pricingConfig.id, 'default') }),
    ])

    if (!categories.length || !types.length) return defaultPricingData

    const config = {
      ...defaultPricingData.config,
      ...((configRow?.data as unknown as PricingData['config']) ?? {}),
    }

    return {
      categories: categories
        .filter((c) => c.showInConfigurator && !c.disabled)
        .map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description ?? undefined,
          icon: c.icon ?? undefined,
          disabled: c.disabled,
        })),
      projectTypes: types.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description ?? undefined,
        basePrice: t.basePrice ?? undefined,
        icon: t.icon ?? undefined,
        disabled: t.disabled,
      })),
      items: items.filter((i) => !i.disabled).map(mapItem),
      config,
    }
  } catch (error) {
    console.error('fetchPricingData from DB:', error)
    return defaultPricingData
  }
}

export async function savePricingConfig(data: PricingData['config']): Promise<void> {
  const db = getDb()
  const payload = data as unknown as Record<string, unknown>
  await db
    .insert(pricingConfig)
    .values({ id: 'default', data: payload })
    .onConflictDoUpdate({ target: pricingConfig.id, set: { data: payload } })
}

export async function listAllPricingItems(): Promise<PricingItem[]> {
  if (!hasDb()) return defaultPricingData.items
  const db = getDb()
  const rows = await db.select().from(pricingItems)
  return rows.map(mapItem)
}

export async function upsertPricingItem(item: PricingItem): Promise<void> {
  const db = getDb()
  const {
    notificationOnAdd,
    notificationAddTitle,
    notificationAddText,
    notificationAddConfirmText,
    notificationAddCancelText,
    notificationOnRemove,
    notificationRemoveTitle,
    notificationRemoveText,
    notificationRemoveConfirmText,
    notificationRemoveCancelText,
    new: isNew,
    category,
  } = item

  await db
    .insert(pricingItems)
    .values({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      hours: item.hours,
      rateType: item.rateType,
      categoryId: category,
      projectTypes: item.projectTypes,
      required: item.required ?? false,
      defaultSelected: item.defaultSelected ?? false,
      includedInBase: item.includedInBase ?? false,
      maxQuantity: item.maxQuantity,
      percentageAdd: item.percentageAdd,
      orderRank: item.orderRank,
      configuratorOrderRanks: item.configuratorOrderRanks,
      dependencies: item.dependencies ?? [],
      bundledWith: item.bundledWith ?? [],
      popular: item.popular ?? false,
      isNew: isNew ?? false,
      disabled: item.disabled ?? false,
      hidePrice: item.hidePrice ?? false,
      extra: {
        notificationOnAdd,
        notificationAddTitle,
        notificationAddText,
        notificationAddConfirmText,
        notificationAddCancelText,
        notificationOnRemove,
        notificationRemoveTitle,
        notificationRemoveText,
        notificationRemoveConfirmText,
        notificationRemoveCancelText,
      },
    })
    .onConflictDoUpdate({
      target: pricingItems.id,
      set: {
        name: item.name,
        description: item.description,
        price: item.price,
        hours: item.hours,
        rateType: item.rateType,
        categoryId: category,
        projectTypes: item.projectTypes,
        required: item.required ?? false,
        defaultSelected: item.defaultSelected ?? false,
        includedInBase: item.includedInBase ?? false,
        maxQuantity: item.maxQuantity,
        percentageAdd: item.percentageAdd,
        orderRank: item.orderRank,
        configuratorOrderRanks: item.configuratorOrderRanks,
        dependencies: item.dependencies ?? [],
        bundledWith: item.bundledWith ?? [],
        popular: item.popular ?? false,
        isNew: isNew ?? false,
        disabled: item.disabled ?? false,
        hidePrice: item.hidePrice ?? false,
        extra: {
          notificationOnAdd,
          notificationAddTitle,
          notificationAddText,
          notificationAddConfirmText,
          notificationAddCancelText,
          notificationOnRemove,
          notificationRemoveTitle,
          notificationRemoveText,
          notificationRemoveConfirmText,
          notificationRemoveCancelText,
        },
      },
    })
}

export async function replaceAllPricingItems(items: PricingItem[]): Promise<void> {
  const db = getDb()
  await db.delete(pricingItems)
  for (const item of items) {
    await upsertPricingItem(item)
  }
}

export async function importPricingCatalog(data: {
  categories: Array<{
    id: string
    name: string
    description?: string
    icon?: string
    sortOrder?: number
    showInConfigurator?: boolean
    disabled?: boolean
  }>
  projectTypes: Array<{
    id: string
    name: string
    description?: string
    basePrice?: number
    icon?: string
    sortOrder?: number
    disabled?: boolean
  }>
  items: PricingItem[]
  config: PricingData['config']
}): Promise<void> {
  const db = getDb()
  await db.delete(pricingItems)
  await db.delete(pricingCategories)
  await db.delete(projectTypes)

  if (data.categories.length) {
    await db.insert(pricingCategories).values(
      data.categories.map((c, index) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        icon: c.icon,
        sortOrder: c.sortOrder ?? index,
        showInConfigurator: c.showInConfigurator ?? true,
        disabled: c.disabled ?? false,
      })),
    )
  }

  if (data.projectTypes.length) {
    await db.insert(projectTypes).values(
      data.projectTypes.map((t, index) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        basePrice: t.basePrice,
        icon: t.icon,
        sortOrder: t.sortOrder ?? index,
        disabled: t.disabled ?? false,
      })),
    )
  }

  await savePricingConfig(data.config)
  await replaceAllPricingItems(data.items)
}
