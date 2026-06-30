'use client'

import { useMemo, useState } from 'react'
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd'
import { CircleMinus, GripVertical, ListPlus, Pencil, Plus, Trash2 } from 'lucide-react'
import type { PricingCategoryAdmin, ProjectTypeAdmin } from '@/lib/db/queries/pricing'
import type { PricingConfig, PricingItem } from '@/lib/data/pricing'
import { getBaseProjectCategoryId } from '@/lib/pricing-calculator'
import { PricingAdminSummaryBar } from '@/components/magazyn/pricing-admin-summary-bar'
import {
  isPricingDependencyParent,
  pricingItemListRowBorderClass,
} from '@/lib/magazyn/pricing-dependencies'
import {
  patchPricingItemInList,
  PricingItemCallout,
  PricingItemListBadges,
} from '@/components/magazyn/cennik-item-edit'
import {
  itemsForProjectTypeCategory,
  reorderItemsInCategory,
  createPricingItemForLayout,
  itemsAvailableForLayout,
  assignExistingItemToLayout,
} from '@/lib/magazyn/pricing-order'
import {
  basicItemsInProjectTypeLayout,
  itemsInProjectTypeLayout,
  summarizeActivePricingItems,
} from '@/lib/magazyn/pricing-admin-summary'
import { PricingLayoutExistingPicker } from '@/components/magazyn/pricing-layout-existing-picker'
import {
  Field,
  Fieldset,
  MagazynActiveToggle,
  SaveButton,
  magazynInputClass,
  magazynTextareaClass,
} from '@/components/magazyn/ui'

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

export type CennikSection = 'config' | 'packages' | 'layout' | 'project-types' | 'categories' | 'items'

export const CENNIK_SECTIONS: Array<{ id: CennikSection; label: string }> = [
  { id: 'config', label: 'Konfiguracja' },
  { id: 'packages', label: 'Pakiety' },
  { id: 'layout', label: 'Układ cennika' },
  { id: 'project-types', label: 'Typy projektu' },
  { id: 'categories', label: 'Kategorie' },
  { id: 'items', label: 'Pozycje' },
]

type SharedProps = {
  pending: boolean
  status: string | null
  error: boolean
}

export function ConfigPanel({
  configForm,
  setConfigForm,
  pending,
  onSave,
}: SharedProps & {
  configForm: PricingConfig
  setConfigForm: (value: PricingConfig) => void
  onSave: () => void
}) {
  return (
    <div className="space-y-5">
      <Fieldset legend="Podstawowe">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="VAT (%)">
            <input type="number" className={magazynInputClass} value={num(configForm.vatRate)} onChange={(e) => setConfigForm({ ...configForm, vatRate: Number(e.target.value) })} />
          </Field>
          <Field label="Zaliczka (%)">
            <input type="number" className={magazynInputClass} value={num(configForm.depositPercent)} onChange={(e) => setConfigForm({ ...configForm, depositPercent: Number(e.target.value) })} />
          </Field>
          <Field label="Zaliczka min. (PLN)">
            <input type="number" className={magazynInputClass} value={num(configForm.depositFixed)} onChange={(e) => setConfigForm({ ...configForm, depositFixed: Number(e.target.value) })} />
          </Field>
        </div>
        <Field label="Link Calendly">
          <input className={magazynInputClass} value={str(configForm.calendlyUrl)} onChange={(e) => setConfigForm({ ...configForm, calendlyUrl: e.target.value })} />
        </Field>
      </Fieldset>

      <Fieldset legend="Teksty CTA">
        {(['reserve', 'workshop', 'pdf'] as const).map((key) => (
          <Field key={key} label={key === 'reserve' ? 'Rezerwacja' : key === 'workshop' ? 'Warsztat discovery' : 'PDF / oferta'}>
            <input
              className={magazynInputClass}
              value={str(configForm.ctaTexts?.[key])}
              onChange={(e) => setConfigForm({ ...configForm, ctaTexts: { ...configForm.ctaTexts, [key]: e.target.value } })}
            />
          </Field>
        ))}
      </Fieldset>

      <Fieldset legend="Ceny startowe (netto)">
        <p className="mb-3 text-xs text-neutral-500">
          Zapasowe wartości — preferuj sekcję <strong className="font-medium text-neutral-400">Pakiety</strong>{' '}
          z opcją „Cena od”.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(
            [
              ['discoveryWorkshopPrice', 'Discovery workshop'],
              ['websiteStartPrice', 'Strona — start'],
              ['websiteAdvancedStartPrice', 'Strona — zaawansowana'],
              ['ecommerceStandardStartPrice', 'Sklep — standard'],
              ['ecommerceProStartPrice', 'Sklep — pro'],
              ['webappStartPrice', 'Aplikacja web'],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <input type="number" className={magazynInputClass} value={num(configForm[key])} onChange={(e) => setConfigForm({ ...configForm, [key]: Number(e.target.value) })} />
            </Field>
          ))}
        </div>
      </Fieldset>

      <Fieldset legend="Stawki roboczogodzin">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Dev (PLN/h)">
            <input type="number" className={magazynInputClass} value={num(configForm.hourlyRateDev)} onChange={(e) => setConfigForm({ ...configForm, hourlyRateDev: Number(e.target.value) })} />
          </Field>
          <Field label="Konsulting (PLN/h)">
            <input type="number" className={magazynInputClass} value={num(configForm.hourlyRateConsulting)} onChange={(e) => setConfigForm({ ...configForm, hourlyRateConsulting: Number(e.target.value) })} />
          </Field>
          <Field label="Godzin / dzień">
            <input type="number" className={magazynInputClass} value={num(configForm.workHoursPerDay)} onChange={(e) => setConfigForm({ ...configForm, workHoursPerDay: Number(e.target.value) })} />
          </Field>
        </div>
      </Fieldset>

      <SaveButton pending={pending} label="Zapisz konfigurację" onClick={onSave} />
    </div>
  )
}

export function ProjectTypesPanel({
  projectTypes,
  setProjectTypes,
  pending,
  onSave,
}: SharedProps & {
  projectTypes: ProjectTypeAdmin[]
  setProjectTypes: (value: ProjectTypeAdmin[]) => void
  onSave: () => void
}) {
  function update(index: number, patch: Partial<ProjectTypeAdmin>) {
    setProjectTypes(projectTypes.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function addRow() {
    const id = `type-${crypto.randomUUID().slice(0, 8)}`
    setProjectTypes([...projectTypes, { id, name: 'Nowy typ', sortOrder: projectTypes.length, disabled: false }])
  }

  function remove(index: number) {
    setProjectTypes(projectTypes.filter((_, i) => i !== index).map((row, i) => ({ ...row, sortOrder: i })))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button type="button" onClick={addRow} className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-200 hover:bg-white/5">
          <Plus className="h-3.5 w-3.5" /> Dodaj typ
        </button>
      </div>
      <ul className="space-y-3">
        {projectTypes.map((type, index) => (
          <li key={type.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs text-neutral-500">#{index + 1} · {type.id}</span>
              <button type="button" aria-label="Usuń typ" onClick={() => remove(index)} className="rounded p-1 text-red-400 hover:bg-red-500/10">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nazwa">
                <input className={magazynInputClass} value={str(type.name)} onChange={(e) => update(index, { name: e.target.value })} />
              </Field>
              <Field label="ID (slug)">
                <input className={magazynInputClass} value={str(type.id)} onChange={(e) => update(index, { id: slugify(e.target.value) || type.id })} />
              </Field>
              <Field label="Cena bazowa (netto)">
                <input type="number" className={magazynInputClass} value={num(type.basePrice)} onChange={(e) => update(index, { basePrice: Number(e.target.value) })} />
              </Field>
              <Field label="Ikona">
                <input className={magazynInputClass} value={str(type.icon)} onChange={(e) => update(index, { icon: e.target.value })} />
              </Field>
            </div>
            <Field label="Opis">
              <textarea className={magazynTextareaClass} rows={2} value={str(type.description)} onChange={(e) => update(index, { description: e.target.value })} />
            </Field>
            <MagazynActiveToggle
              active={!(type.disabled ?? false)}
              onChange={(active) => update(index, { disabled: !active })}
            />
          </li>
        ))}
      </ul>
      <SaveButton pending={pending} label="Zapisz typy projektu" onClick={onSave} />
    </div>
  )
}

export function CategoriesPanel({
  categories,
  setCategories,
  pending,
  onSave,
}: SharedProps & {
  categories: PricingCategoryAdmin[]
  setCategories: (value: PricingCategoryAdmin[]) => void
  onSave: () => void
}) {
  function update(index: number, patch: Partial<PricingCategoryAdmin>) {
    setCategories(categories.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function addRow() {
    const id = `cat-${crypto.randomUUID().slice(0, 8)}`
    setCategories([...categories, { id, name: 'Nowa kategoria', sortOrder: categories.length, showInConfigurator: true, disabled: false }])
  }

  function remove(index: number) {
    setCategories(categories.filter((_, i) => i !== index).map((row, i) => ({ ...row, sortOrder: i })))
  }

  function move(index: number, dir: -1 | 1) {
    const next = index + dir
    if (next < 0 || next >= categories.length) return
    const list = [...categories]
    const tmp = list[index]
    list[index] = list[next]
    list[next] = tmp
    setCategories(list.map((row, i) => ({ ...row, sortOrder: i })))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button type="button" onClick={addRow} className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-200 hover:bg-white/5">
          <Plus className="h-3.5 w-3.5" /> Dodaj kategorię
        </button>
      </div>
      <ul className="space-y-3">
        {categories.map((cat, index) => (
          <li key={cat.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs text-neutral-500">Kolejność {index + 1}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(index, -1)} className="rounded px-2 py-1 text-xs text-neutral-400 hover:bg-white/10">↑</button>
                <button type="button" onClick={() => move(index, 1)} className="rounded px-2 py-1 text-xs text-neutral-400 hover:bg-white/10">↓</button>
                <button type="button" aria-label="Usuń kategorię" onClick={() => remove(index)} className="rounded p-1 text-red-400 hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nazwa">
                <input className={magazynInputClass} value={str(cat.name)} onChange={(e) => update(index, { name: e.target.value })} />
              </Field>
              <Field label="ID (slug)">
                <input className={magazynInputClass} value={str(cat.id)} onChange={(e) => update(index, { id: slugify(e.target.value) || cat.id })} />
              </Field>
              <Field label="Ikona">
                <input className={magazynInputClass} value={str(cat.icon)} onChange={(e) => update(index, { icon: e.target.value })} />
              </Field>
            </div>
            <Field label="Opis">
              <textarea className={magazynTextareaClass} rows={2} value={str(cat.description)} onChange={(e) => update(index, { description: e.target.value })} />
            </Field>
            <div className="mt-2 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-neutral-400">
                <input type="checkbox" checked={cat.showInConfigurator ?? true} onChange={(e) => update(index, { showInConfigurator: e.target.checked })} />
                Widoczna w konfiguratorze
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-400">
                <input type="checkbox" checked={cat.disabled ?? false} onChange={(e) => update(index, { disabled: e.target.checked })} />
                Wyłączona
              </label>
            </div>
          </li>
        ))}
      </ul>
      <SaveButton pending={pending} label="Zapisz kategorie" onClick={onSave} />
    </div>
  )
}

export function LayoutPanel({
  projectTypes,
  categories,
  items,
  setItems,
  config,
  pending,
  onSave,
}: SharedProps & {
  projectTypes: ProjectTypeAdmin[]
  categories: PricingCategoryAdmin[]
  items: PricingItem[]
  setItems: (value: PricingItem[]) => void
  config: PricingConfig
  onSave: () => void
}) {
  const activeTypes = projectTypes.filter((t) => !t.disabled)
  const [projectTypeId, setProjectTypeId] = useState(activeTypes[0]?.id ?? projectTypes[0]?.id ?? '')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingItemIsNew, setEditingItemIsNew] = useState(false)
  const [existingPickerCategoryId, setExistingPickerCategoryId] = useState<string | null>(null)
  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder)
  const editingItem = editingItemId ? items.find((i) => i.id === editingItemId) : null

  const layoutSummary = useMemo(() => {
    const baseCategoryId = getBaseProjectCategoryId(config, projectTypeId)
    const inLayout = itemsInProjectTypeLayout(items, projectTypeId)
    const active = inLayout.filter((item) => !item.disabled)
    const basic = basicItemsInProjectTypeLayout(items, projectTypeId, baseCategoryId)
    const workHoursPerDay = num(config.workHoursPerDay) || 6
    return {
      disabledInLayoutCount: inLayout.length - active.length,
      totalActiveInLayoutCount: active.length,
      basic: summarizeActivePricingItems(basic, workHoursPerDay),
    }
  }, [items, projectTypeId, config])

  const layoutSummaryTitle =
    activeTypes.find((type) => type.id === projectTypeId)?.name ??
    projectTypes.find((type) => type.id === projectTypeId)?.name ??
    'Układ'

  function openItemEditor(itemId: string, isNew = false) {
    setEditingItemId(itemId)
    setEditingItemIsNew(isNew)
  }

  function closeItemEditor() {
    setEditingItemId(null)
    setEditingItemIsNew(false)
  }

  function addItemToCategory(categoryId: string) {
    const newItem = createPricingItemForLayout({
      projectTypeId,
      categoryId,
      items,
    })
    setItems([...items, newItem])
    openItemEditor(newItem.id, true)
  }

  function addExistingItemToCategory(categoryId: string, itemId: string) {
    setItems(
      assignExistingItemToLayout({
        items,
        itemId,
        projectTypeId,
        categoryId,
      }),
    )
    setExistingPickerCategoryId(null)
  }

  const existingPickerCategory = existingPickerCategoryId
    ? sortedCategories.find((category) => category.id === existingPickerCategoryId)
    : null

  function removeItem(itemId: string) {
    setItems(items.filter((item) => item.id !== itemId))
    if (editingItemId === itemId) closeItemEditor()
  }

  function removeItemFromLayout(itemId: string) {
    setItems(
      items.map((item) =>
        item.id === itemId
          ? { ...item, projectTypes: item.projectTypes.filter((typeId) => typeId !== projectTypeId) }
          : item,
      ),
    )
    if (editingItemId === itemId) closeItemEditor()
  }

  const activeProjectTypeName =
    activeTypes.find((type) => type.id === projectTypeId)?.name ??
    projectTypes.find((type) => type.id === projectTypeId)?.name ??
    'tego typu'

  function updateItem(itemId: string, patch: Partial<PricingItem>) {
    if (patch.id && patch.id !== itemId) {
      openItemEditor(patch.id, editingItemIsNew)
    }
    setItems(patchPricingItemInList(items, itemId, patch))
  }

  function onDragEnd(result: DropResult) {
    const { destination, source } = result
    if (!destination || destination.droppableId !== source.droppableId) return

    const categoryId = source.droppableId.replace(/^cat-/, '')
    const list = itemsForProjectTypeCategory(items, projectTypeId, categoryId)
    const ids = list.map((i) => i.id)
    const from = source.index
    const to = destination.index
    if (from === to) return

    const nextIds = [...ids]
    const [moved] = nextIds.splice(from, 1)
    nextIds.splice(to, 0, moved)
    setItems(reorderItemsInCategory(items, projectTypeId, categoryId, nextIds))
  }

  function normalizeRanks() {
    let next = [...items]
    for (const type of activeTypes) {
      for (const cat of sortedCategories) {
        const list = itemsForProjectTypeCategory(next, type.id, cat.id)
        const ids = list.map((i) => i.id)
        next = reorderItemsInCategory(next, type.id, cat.id, ids)
      }
    }
    setItems(next)
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-neutral-400">
        Ułóż pozycje w konfiguratorze: wybierz typ projektu, przeciągnij w ramach kategorii, kliknij
        pozycję aby edytować — dodaj nową pozycję lub wybierz istniejącą z listy. Ikona minus usuwa
        pozycję tylko z bieżącego układu; całkowite usunięcie jest w edycji pozycji.
      </p>

      <div className="flex flex-wrap gap-1 rounded-full border border-white/10 bg-white/[0.02] p-1">
        {activeTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setProjectTypeId(type.id)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${projectTypeId === type.id ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}
          >
            {type.name}
          </button>
        ))}
      </div>

      <PricingAdminSummaryBar
        title={`Podsumowanie układu · ${layoutSummaryTitle}`}
        summary={layoutSummary.basic}
        summaryLabel="Podstawowe pozycje"
        summaryHint="Wymagane, domyślnie włączone lub z kategorii bazy projektu."
        disabledInLayoutCount={layoutSummary.disabledInLayoutCount}
        totalActiveInLayoutCount={layoutSummary.totalActiveInLayoutCount}
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="space-y-4">
          {sortedCategories.map((cat) => {
            const list = itemsForProjectTypeCategory(items, projectTypeId, cat.id)
            const droppableId = `cat-${cat.id}`
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
                    onClick={() => addItemToCategory(cat.id)}
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
                          Brak pozycji — dodaj pierwszą w tej kategorii.
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
                                  <button type="button" {...dragProvided.dragHandleProps} className="cursor-grab text-neutral-500 hover:text-white" aria-label="Przeciągnij">
                                    <GripVertical className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openItemEditor(item.id)}
                                    className="min-w-0 flex-1 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-white/5"
                                  >
                                    <div className="truncate text-sm font-medium">{item.name}</div>
                                    <div className="truncate text-xs text-neutral-500">{item.id} · {num(item.price).toLocaleString('pl-PL')} PLN</div>
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
                                      onClick={() => removeItemFromLayout(item.id)}
                                      className="shrink-0 rounded p-1.5 text-neutral-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                                      aria-label={`Usuń ${item.name} z układu ${activeProjectTypeName}`}
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
        </div>
      </DragDropContext>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={normalizeRanks} className="rounded-full border border-white/10 px-4 py-2 text-sm text-neutral-300 hover:bg-white/5">
          Normalizuj kolejność (wszystkie typy)
        </button>
        <SaveButton pending={pending} label="Zapisz układ i pozycje" onClick={onSave} />
      </div>

      {existingPickerCategory ? (
        <PricingLayoutExistingPicker
          categoryId={existingPickerCategory.id}
          categoryName={existingPickerCategory.name}
          categories={categories}
          items={itemsAvailableForLayout(items, projectTypeId, existingPickerCategory.id)}
          onSelect={(itemId) => addExistingItemToCategory(existingPickerCategory.id, itemId)}
          onClose={() => setExistingPickerCategoryId(null)}
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

export function ItemsPanel({
  items,
  setItems,
  categories,
  projectTypes,
  pending,
  onSave,
}: SharedProps & {
  items: PricingItem[]
  setItems: (value: PricingItem[]) => void
  categories: PricingCategoryAdmin[]
  projectTypes: ProjectTypeAdmin[]
  onSave: () => void
}) {
  const [query, setQuery] = useState('')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const editingItem = editingItemId ? items.find((i) => i.id === editingItemId) : null

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q),
    )
  }, [items, query])

  function updateItem(itemId: string, patch: Partial<PricingItem>) {
    if (patch.id && patch.id !== itemId) {
      setEditingItemId(patch.id)
    }
    setItems(patchPricingItemInList(items, itemId, patch))
  }

  function removeItem(itemId: string) {
    setItems(items.filter((item) => item.id !== itemId))
    if (editingItemId === itemId) setEditingItemId(null)
  }

  return (
    <div className="space-y-4">
      <input
        type="search"
        placeholder="Szukaj po nazwie, ID lub kategorii…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={magazynInputClass}
      />
      <ul className="divide-y divide-white/5 rounded-xl border border-white/10">
        {filtered.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.02]">
            <div className="min-w-0">
              <div className="truncate font-medium">{item.name}</div>
              <div className="text-xs text-neutral-500">
                {item.id} · {item.category} · {num(item.price).toLocaleString('pl-PL')} PLN
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEditingItemId(item.id)}
              className="shrink-0 rounded p-1.5 text-neutral-500 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={`Edytuj ${item.name}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
      <SaveButton pending={pending} label="Zapisz pozycje" onClick={onSave} />

      {editingItem ? (
        <PricingItemCallout
          item={editingItem}
          allItems={items}
          categories={categories}
          projectTypes={projectTypes}
          onUpdate={(patch) => updateItem(editingItem.id, patch)}
          onClose={() => setEditingItemId(null)}
          allowIdEdit
          onDelete={() => removeItem(editingItem.id)}
          deleteLabel="Usuń całkowicie"
        />
      ) : null}
    </div>
  )
}
