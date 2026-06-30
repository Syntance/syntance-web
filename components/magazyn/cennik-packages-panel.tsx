'use client'

import { useMemo, useState } from 'react'
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd'
import { CircleMinus, GripVertical, ListPlus, Pencil, Plus, Trash2 } from 'lucide-react'
import type { PricingCategoryAdmin, ProjectTypeAdmin } from '@/lib/db/queries/pricing'
import type {
  PricingItem,
  PricingPackage,
  PricingPackageCustomLine,
  PricingPackageProjectType,
} from '@/lib/data/pricing'
import { PricingLayoutExistingPicker } from '@/components/magazyn/pricing-layout-existing-picker'
import { PricingAdminSummaryBar } from '@/components/magazyn/pricing-admin-summary-bar'
import { patchPricingItemInList, PricingItemCallout, PricingItemListBadges } from '@/components/magazyn/cennik-item-edit'
import {
  isPricingDependencyParent,
  pricingItemListRowBorderClass,
} from '@/lib/magazyn/pricing-dependencies'
import {
  resolvePackageCatalogItems,
  summarizeActivePricingItems,
} from '@/lib/magazyn/pricing-admin-summary'
import {
  createPricingItemForLayout,
  reorderPackageItemIdsInCategory,
} from '@/lib/magazyn/pricing-order'
import {
  Field,
  Fieldset,
  SaveButton,
  magazynInputClass,
  magazynTextareaClass,
} from '@/components/magazyn/ui'

const PROJECT_TYPE_TABS: Array<{ id: PricingPackageProjectType; label: string }> = [
  { id: 'website', label: 'Strony WWW' },
  { id: 'ecommerce', label: 'Sklepy' },
  { id: 'webapp', label: 'Aplikacje web' },
]

type Props = {
  packages: PricingPackage[]
  setPackages: (value: PricingPackage[]) => void
  items: PricingItem[]
  setItems: (value: PricingItem[]) => void
  categories: PricingCategoryAdmin[]
  projectTypes: ProjectTypeAdmin[]
  workHoursPerDay: number
  pending: boolean
  onSave: () => void
}

function str(value: string | null | undefined) {
  return value ?? ''
}

function num(value: number | null | undefined) {
  return value ?? 0
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function CustomLinesEditor({
  lines,
  onChange,
}: {
  lines: PricingPackageCustomLine[]
  onChange: (lines: PricingPackageCustomLine[]) => void
}) {
  function updateLine(index: number, patch: Partial<PricingPackageCustomLine>) {
    onChange(lines.map((line, i) => (i === index ? { ...line, ...patch } : line)))
  }

  return (
    <div className="space-y-2">
      <div>
        <span className="text-sm font-medium text-neutral-300">Własne pozycje w pakiecie</span>
        <p className="text-xs text-neutral-500">Pozycje spoza katalogu — np. copywriting, SLA.</p>
      </div>
      {lines.length === 0 ? (
        <p className="text-xs text-neutral-500">Brak własnych pozycji.</p>
      ) : (
        <ul className="space-y-2">
          {lines.map((line, index) => (
            <li
              key={line.id}
              className="grid gap-2 rounded-lg border border-white/10 bg-black/20 p-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <input
                className={magazynInputClass}
                placeholder="Nazwa pozycji"
                value={line.name}
                onChange={(e) => updateLine(index, { name: e.target.value })}
              />
              <input
                className={magazynInputClass}
                placeholder="Opis (opcjonalnie)"
                value={str(line.description)}
                onChange={(e) => updateLine(index, { description: e.target.value })}
              />
              <button
                type="button"
                aria-label="Usuń pozycję"
                onClick={() => onChange(lines.filter((_, i) => i !== index))}
                className="rounded-lg border border-red-500/30 px-2 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="mx-auto h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => onChange([...lines, { id: crypto.randomUUID(), name: '' }])}
        className="text-xs text-neutral-400 underline-offset-2 hover:text-white hover:underline"
      >
        + Dodaj własną pozycję
      </button>
    </div>
  )
}

function itemsAvailableForPackageCategory(
  items: PricingItem[],
  packageRow: PricingPackage,
  categoryId: string,
): PricingItem[] {
  const selected = new Set(packageRow.itemIds)
  return items
    .filter(
      (item) =>
        !item.disabled &&
        item.projectTypes.includes(packageRow.projectType) &&
        item.category === categoryId &&
        !selected.has(item.id),
    )
    .sort((a, b) => a.name.localeCompare(b.name, 'pl'))
}

function packageItemsInCategory(
  items: PricingItem[],
  packageRow: PricingPackage,
  categoryId: string,
): PricingItem[] {
  return packageRow.itemIds
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is PricingItem => item != null && item.category === categoryId)
}

function PackageItemsLayout({
  packageRow,
  items,
  setItems,
  categories,
  projectTypes,
  onChangeItemIds,
}: {
  packageRow: PricingPackage
  items: PricingItem[]
  setItems: (value: PricingItem[]) => void
  categories: PricingCategoryAdmin[]
  projectTypes: ProjectTypeAdmin[]
  onChangeItemIds: (itemIds: string[]) => void
}) {
  const [existingPickerCategoryId, setExistingPickerCategoryId] = useState<string | null>(null)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingItemIsNew, setEditingItemIsNew] = useState(false)

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  )

  const existingPickerCategory = existingPickerCategoryId
    ? sortedCategories.find((category) => category.id === existingPickerCategoryId)
    : null

  const editingItem = editingItemId ? items.find((item) => item.id === editingItemId) : null

  function openItemEditor(itemId: string, isNew = false) {
    setEditingItemId(itemId)
    setEditingItemIsNew(isNew)
  }

  function closeItemEditor() {
    setEditingItemId(null)
    setEditingItemIsNew(false)
  }

  function addItemToPackage(itemId: string) {
    if (packageRow.itemIds.includes(itemId)) return
    onChangeItemIds([...packageRow.itemIds, itemId])
    setExistingPickerCategoryId(null)
  }

  function addNewItemToCategory(categoryId: string) {
    const newItem = createPricingItemForLayout({
      projectTypeId: packageRow.projectType,
      categoryId,
      items,
    })
    setItems([...items, newItem])
    onChangeItemIds([...packageRow.itemIds, newItem.id])
    openItemEditor(newItem.id, true)
  }

  function removeItemFromPackage(itemId: string) {
    onChangeItemIds(packageRow.itemIds.filter((id) => id !== itemId))
  }

  function removeItem(itemId: string) {
    setItems(items.filter((item) => item.id !== itemId))
    onChangeItemIds(packageRow.itemIds.filter((id) => id !== itemId))
    if (editingItemId === itemId) closeItemEditor()
  }

  function updateItem(itemId: string, patch: Partial<PricingItem>) {
    const nextId = patch.id
    if (nextId != null && nextId !== itemId) {
      openItemEditor(nextId, editingItemIsNew)
      if (packageRow.itemIds.includes(itemId)) {
        onChangeItemIds(packageRow.itemIds.map((id) => (id === itemId ? nextId : id)))
      }
    }
    setItems(patchPricingItemInList(items, itemId, patch))
  }

  function onDragEnd(result: DropResult) {
    const { destination, source } = result
    if (!destination || destination.droppableId !== source.droppableId) return

    const categoryId = source.droppableId.replace(/^pkg-cat-/, '')
    const list = packageItemsInCategory(items, packageRow, categoryId)
    const ids = list.map((item) => item.id)
    const from = source.index
    const to = destination.index
    if (from === to) return

    const nextIds = [...ids]
    const [moved] = nextIds.splice(from, 1)
    nextIds.splice(to, 0, moved)
    onChangeItemIds(
      reorderPackageItemIdsInCategory(packageRow.itemIds, items, categoryId, nextIds),
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <span className="text-sm font-medium text-neutral-300">Pozycje z katalogu cennika</span>
        <p className="text-xs text-neutral-500">
          Dodawaj i układaj pozycje według sekcji — jak w układzie cennika ({packageRow.itemIds.length}{' '}
          wybranych). Przeciągnij w ramach sekcji, aby zmienić kolejność.
        </p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        {sortedCategories.map((cat) => {
          const list = packageItemsInCategory(items, packageRow, cat.id)
          const droppableId = `pkg-cat-${cat.id}`
          return (
            <Fieldset key={cat.id} legend={`${cat.name} (${list.length})`}>
              <div className="mb-3 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setExistingPickerCategoryId(cat.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed border-white/15 px-3 py-1 text-xs text-neutral-400 hover:border-white/25 hover:text-white"
                >
                  <ListPlus className="h-3.5 w-3.5" aria-hidden />
                  Dodaj istniejącą
                </button>
                <button
                  type="button"
                  onClick={() => addNewItemToCategory(cat.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed border-white/15 px-3 py-1 text-xs text-neutral-400 hover:border-white/25 hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  Nowa pozycja
                </button>
              </div>
              <Droppable droppableId={droppableId}>
                {(provided) => (
                  <>
                    {list.length === 0 ? (
                      <p className="mb-2 text-sm text-neutral-500">
                        Brak pozycji w pakiecie — dodaj z katalogu lub utwórz nową.
                      </p>
                    ) : (
                      <ul ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                        {list.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(dragProvided, snapshot) => {
                              const dependencyParent = isPricingDependencyParent(item.id, items)
                              return (
                              <li
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${pricingItemListRowBorderClass({ isDragging: snapshot.isDragging, isDependencyParent: dependencyParent })}`}
                              >
                                <button
                                  type="button"
                                  {...dragProvided.dragHandleProps}
                                  className="cursor-grab text-neutral-500 hover:text-white"
                                  aria-label="Przeciągnij"
                                >
                                  <GripVertical className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openItemEditor(item.id)}
                                  className="min-w-0 flex-1 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-white/5"
                                >
                                  <div className="truncate text-sm font-medium text-neutral-200">
                                    {item.name}
                                  </div>
                                  <div className="truncate text-xs text-neutral-500">
                                    {item.id} · {num(item.price).toLocaleString('pl-PL')} PLN · {item.hours}h
                                  </div>
                                </button>
                                <div className="flex shrink-0 items-center gap-1.5">
                                  <PricingItemListBadges item={item} allItems={items} />
                                  <button
                                    type="button"
                                    onClick={() => openItemEditor(item.id)}
                                    className="shrink-0 rounded p-1.5 text-neutral-500 transition-colors hover:bg-white/10 hover:text-white"
                                    aria-label={`Edytuj ${item.name}`}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeItemFromPackage(item.id)}
                                    className="shrink-0 rounded p-1.5 text-neutral-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                                    aria-label={`Usuń ${item.name} z pakietu`}
                                  >
                                    <CircleMinus className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </li>
                              )
                            }}
                          </Draggable>
                        ))}
                      </ul>
                    )}
                    {list.length === 0 ? (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[2px]">
                        {provided.placeholder}
                      </div>
                    ) : (
                      provided.placeholder
                    )}
                  </>
                )}
              </Droppable>
            </Fieldset>
          )
        })}
      </DragDropContext>

      {existingPickerCategory ? (
        <PricingLayoutExistingPicker
          categoryId={existingPickerCategory.id}
          categoryName={existingPickerCategory.name}
          categories={categories}
          items={itemsAvailableForPackageCategory(items, packageRow, existingPickerCategory.id)}
          onSelect={addItemToPackage}
          onClose={() => setExistingPickerCategoryId(null)}
          hint="Pozycja zostanie dodana do pakietu w tej sekcji."
          warnOnCategoryChange={false}
          emptyCatalogMessage="Brak pozycji do dodania — wszystkie z tej sekcji są już w pakiecie lub nie ma ich w katalogu."
        />
      ) : null}

      {editingItem ? (
        <PricingItemCallout
          item={editingItem}
          allItems={items}
          categories={categories}
          projectTypes={projectTypes}
          onUpdate={(patch) => updateItem(editingItem.id, patch)}
          onClose={closeItemEditor}
          allowIdEdit={editingItemIsNew}
          onDelete={() => removeItem(editingItem.id)}
          deleteLabel={editingItemIsNew ? 'Usuń pozycję' : 'Usuń całkowicie'}
        />
      ) : null}
    </div>
  )
}

export function PackagesPanel({
  packages,
  setPackages,
  items,
  setItems,
  categories,
  projectTypes,
  workHoursPerDay,
  pending,
  onSave,
}: Props) {
  const [projectType, setProjectType] = useState<PricingPackageProjectType>('website')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const visiblePackages = useMemo(
    () =>
      packages
        .filter((pkg) => pkg.projectType === projectType)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [packages, projectType],
  )

  const expandedPackage = expandedId
    ? visiblePackages.find((pkg) => pkg.id === expandedId) ?? null
    : null

  const packageSummary = useMemo(() => {
    if (!expandedPackage) return null
    const catalogItems = resolvePackageCatalogItems(items, expandedPackage.itemIds)
    const disabledCount = expandedPackage.itemIds.filter((id) => {
      const item = items.find((entry) => entry.id === id)
      return item?.disabled === true
    }).length
    const missingCount = expandedPackage.itemIds.filter((id) => !items.some((item) => item.id === id)).length

    return {
      title: `Podsumowanie pakietu · ${expandedPackage.name || 'Bez nazwy'}`,
      summary: summarizeActivePricingItems(catalogItems, workHoursPerDay),
      disabledInLayoutCount: disabledCount + missingCount,
      compare: {
        label: 'W pakiecie (wpisane)',
        priceNet: num(expandedPackage.priceNet),
        hours: num(expandedPackage.hours),
        deliveryTime: str(expandedPackage.deliveryTime) || undefined,
      },
    }
  }, [expandedPackage, items, workHoursPerDay])

  function updatePackage(id: string, patch: Partial<PricingPackage>) {
    if (patch.useAsStartPrice) {
      const target = packages.find((p) => p.id === id)
      if (target) {
        setPackages(
          packages.map((pkg) => {
            if (pkg.id === id) return { ...pkg, ...patch }
            if (pkg.projectType === target.projectType) {
              return { ...pkg, useAsStartPrice: false }
            }
            return pkg
          }),
        )
        if (patch.id && patch.id !== id) setExpandedId(patch.id)
        return
      }
    }

    setPackages(packages.map((pkg) => (pkg.id === id ? { ...pkg, ...patch } : pkg)))
    if (patch.id && patch.id !== id) setExpandedId(patch.id)
  }

  function addPackage() {
    const id = `pkg-${slugify(projectType)}-${crypto.randomUUID().slice(0, 8)}`
    const next: PricingPackage = {
      id,
      name: projectType === 'ecommerce' ? 'Nowy pakiet sklepu' : 'Nowy pakiet',
      projectType,
      priceNet: 0,
      hours: 0,
      deliveryTime: '',
      itemIds: [],
      customLines: [],
      sortOrder: visiblePackages.length,
      disabled: false,
    }
    setPackages([...packages, next])
    setExpandedId(id)
  }

  function removePackage(id: string) {
    const removed = packages.find((p) => p.id === id)
    const next = packages.filter((pkg) => pkg.id !== id)
    if (!removed) {
      setPackages(next)
      return
    }
    let order = 0
    setPackages(
      next.map((pkg) => {
        if (pkg.projectType !== removed.projectType) return pkg
        const row = { ...pkg, sortOrder: order }
        order += 1
        return row
      }),
    )
    if (expandedId === id) setExpandedId(null)
  }

  function movePackage(id: string, dir: -1 | 1) {
    const list = visiblePackages
    const index = list.findIndex((pkg) => pkg.id === id)
    const swap = list[index + dir]
    if (index < 0 || !swap) return
    setPackages(
      packages.map((pkg) => {
        if (pkg.id === list[index].id) return { ...pkg, sortOrder: swap.sortOrder }
        if (pkg.id === swap.id) return { ...pkg, sortOrder: list[index].sortOrder }
        return pkg
      }),
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-neutral-400">
        Gotowe pakiety stron i sklepów — cena netto, czas realizacji oraz lista pozycji. Pakiet z
        opcją „Cena od” ustawia kwotę na podstronach marketingowych.
      </p>

      <div className="inline-flex flex-wrap gap-1 rounded-full border border-white/10 bg-white/[0.02] p-1">
        {PROJECT_TYPE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setProjectType(tab.id)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              projectType === tab.id ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {packageSummary ? (
        <PricingAdminSummaryBar
          title={packageSummary.title}
          summary={packageSummary.summary}
          disabledInLayoutCount={packageSummary.disabledInLayoutCount}
          compare={packageSummary.compare}
        />
      ) : (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-3 text-xs text-neutral-500">
          Rozwiń pakiet, aby zobaczyć podsumowanie ceny i czasu z aktywnych pozycji katalogu.
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={addPackage}
          className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-200 hover:bg-white/5"
        >
          <Plus className="h-3.5 w-3.5" /> Dodaj pakiet
        </button>
      </div>

      {visiblePackages.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-neutral-500">
          Brak pakietów dla tego typu — dodaj pierwszy pakiet.
        </p>
      ) : (
        <ul className="space-y-3">
          {visiblePackages.map((pkg, index) => {
            const open = expandedId === pkg.id
            return (
              <li
                key={pkg.id}
                className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]"
              >
                <div className="flex w-full items-center gap-3 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setExpandedId(open ? null : pkg.id)}
                    className="min-w-0 flex-1 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-white">{pkg.name || 'Bez nazwy'}</span>
                      {pkg.popular ? (
                        <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-purple-300">
                          Popularny
                        </span>
                      ) : null}
                      {pkg.useAsStartPrice ? (
                        <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-400">
                          Cena od
                        </span>
                      ) : null}
                      {pkg.disabled ? (
                        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-500">
                          Wyłączony
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-0.5 text-xs text-neutral-500">
                      {num(pkg.priceNet).toLocaleString('pl-PL')} PLN netto · {pkg.hours}h
                      {pkg.deliveryTime ? ` · ${pkg.deliveryTime}` : ''}
                      {' · '}
                      {pkg.itemIds.length + pkg.customLines.length} poz.
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => movePackage(pkg.id, -1)}
                      disabled={index === 0}
                      aria-label="Przesuń pakiet wyżej"
                      className="rounded px-2 py-1 text-xs text-neutral-400 hover:bg-white/10 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => movePackage(pkg.id, 1)}
                      disabled={index === visiblePackages.length - 1}
                      aria-label="Przesuń pakiet niżej"
                      className="rounded px-2 py-1 text-xs text-neutral-400 hover:bg-white/10 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <span className="px-1 text-xs text-neutral-500" aria-hidden>
                      {open ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {open ? (
                  <div className="space-y-4 border-t border-white/10 px-4 py-4">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removePackage(pkg.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-red-500/30 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Usuń pakiet
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Nazwa pakietu">
                        <input
                          className={magazynInputClass}
                          value={pkg.name}
                          onChange={(e) => updatePackage(pkg.id, { name: e.target.value })}
                        />
                      </Field>
                      <Field label="ID (slug)">
                        <input
                          className={magazynInputClass}
                          value={pkg.id}
                          onChange={(e) =>
                            updatePackage(pkg.id, { id: slugify(e.target.value) || pkg.id })
                          }
                        />
                      </Field>
                      <Field label="Cena netto (PLN)">
                        <input
                          type="number"
                          min={0}
                          className={magazynInputClass}
                          value={num(pkg.priceNet)}
                          onChange={(e) =>
                            updatePackage(pkg.id, { priceNet: Number(e.target.value) })
                          }
                        />
                      </Field>
                      <Field label="Roboczogodziny">
                        <input
                          type="number"
                          min={0}
                          step={0.5}
                          className={magazynInputClass}
                          value={num(pkg.hours)}
                          onChange={(e) => updatePackage(pkg.id, { hours: Number(e.target.value) })}
                        />
                      </Field>
                      <Field label="Czas realizacji" hint="Np. 14–21 dni roboczych">
                        <input
                          className={magazynInputClass}
                          value={str(pkg.deliveryTime)}
                          onChange={(e) => updatePackage(pkg.id, { deliveryTime: e.target.value })}
                        />
                      </Field>
                    </div>

                    <Field label="Opis pakietu">
                      <textarea
                        className={magazynTextareaClass}
                        rows={2}
                        value={str(pkg.description)}
                        onChange={(e) => updatePackage(pkg.id, { description: e.target.value })}
                      />
                    </Field>

                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 text-sm text-neutral-400">
                        <input
                          type="checkbox"
                          checked={pkg.popular ?? false}
                          onChange={(e) => updatePackage(pkg.id, { popular: e.target.checked })}
                        />
                        Oznacz jako popularny
                      </label>
                      <label className="flex items-center gap-2 text-sm text-neutral-400">
                        <input
                          type="checkbox"
                          checked={pkg.useAsStartPrice ?? false}
                          onChange={(e) =>
                            updatePackage(pkg.id, { useAsStartPrice: e.target.checked })
                          }
                        />
                        Użyj jako cena „od” na stronie
                      </label>
                      <label className="flex items-center gap-2 text-sm text-neutral-400">
                        <input
                          type="checkbox"
                          checked={pkg.disabled ?? false}
                          onChange={(e) => updatePackage(pkg.id, { disabled: e.target.checked })}
                        />
                        Wyłączony
                      </label>
                    </div>

                    <PackageItemsLayout
                      packageRow={pkg}
                      items={items}
                      setItems={setItems}
                      categories={categories}
                      projectTypes={projectTypes}
                      onChangeItemIds={(itemIds) => updatePackage(pkg.id, { itemIds })}
                    />

                    <CustomLinesEditor
                      lines={pkg.customLines}
                      onChange={(customLines) => updatePackage(pkg.id, { customLines })}
                    />
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}

      <SaveButton pending={pending} label="Zapisz pakiety" onClick={onSave} />
    </div>
  )
}
