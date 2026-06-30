'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { PricingCategoryAdmin, ProjectTypeAdmin } from '@/lib/db/queries/pricing'
import type { PricingItem } from '@/lib/data/pricing'
import { Field, Fieldset, magazynInputClass, magazynTextareaClass } from '@/components/magazyn/ui'

function str(value: string | null | undefined) {
  return value ?? ''
}

function num(value: number | null | undefined) {
  return value ?? 0
}

function optNum(value: number | null | undefined) {
  return value == null ? '' : String(value)
}

function parseOptNum(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : undefined
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function toggleRef(list: string[] | undefined, id: string): string[] {
  const current = list ?? []
  return current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
}

function FlagCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-neutral-400">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

function ItemRefMultiSelect({
  label,
  hint,
  selected,
  options,
  onToggle,
}: {
  label: string
  hint?: string
  selected: string[]
  options: PricingItem[]
  onToggle: (id: string) => void
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-white/10 bg-black/20 p-2">
        {options.length === 0 ? (
          <p className="text-xs text-neutral-500">Brak innych pozycji.</p>
        ) : (
          options.map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-white/5"
            >
              <input
                type="checkbox"
                className="mt-0.5"
                checked={selected.includes(option.id)}
                onChange={() => onToggle(option.id)}
              />
              <span className="min-w-0">
                <span className="block truncate text-neutral-200">{option.name}</span>
                <span className="block truncate text-xs text-neutral-500">{option.id}</span>
              </span>
            </label>
          ))
        )}
      </div>
    </Field>
  )
}

export function PricingItemEditFields({
  item,
  allItems,
  categories,
  projectTypes,
  onUpdate,
  onToggleProjectType,
  allowIdEdit = true,
}: {
  item: PricingItem
  allItems: PricingItem[]
  categories: PricingCategoryAdmin[]
  projectTypes: ProjectTypeAdmin[]
  onUpdate: (patch: Partial<PricingItem>) => void
  onToggleProjectType: (typeId: string) => void
  allowIdEdit?: boolean
}) {
  const refOptions = allItems.filter((entry) => entry.id !== item.id)

  return (
    <div className="space-y-5">
      <Fieldset legend="Podstawowe">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nazwa">
            <input className={magazynInputClass} value={str(item.name)} onChange={(e) => onUpdate({ name: e.target.value })} />
          </Field>
          <Field label="ID (slug)" hint={allowIdEdit ? 'Zmiana ID wymaga zapisu pozycji.' : undefined}>
            <input
              className={magazynInputClass}
              value={str(item.id)}
              readOnly={!allowIdEdit}
              onChange={(e) => onUpdate({ id: slugify(e.target.value) || item.id })}
            />
          </Field>
          <Field label="Kategoria">
            <select className={magazynInputClass} value={str(item.category)} onChange={(e) => onUpdate({ category: e.target.value })}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Opis">
          <textarea className={magazynTextareaClass} rows={3} value={item.description ?? ''} onChange={(e) => onUpdate({ description: e.target.value })} />
        </Field>
        <Field label="Typy projektu">
          <div className="flex flex-wrap gap-2">
            {projectTypes.map((type) => (
              <label key={type.id} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-300">
                <input type="checkbox" checked={item.projectTypes.includes(type.id)} onChange={() => onToggleProjectType(type.id)} />
                {type.name}
              </label>
            ))}
          </div>
        </Field>
      </Fieldset>

      <Fieldset legend="Wycena">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Cena netto (PLN)">
            <input type="number" className={magazynInputClass} value={num(item.price)} onChange={(e) => onUpdate({ price: Number(e.target.value) })} />
          </Field>
          <Field label="Godziny">
            <input type="number" step="0.5" className={magazynInputClass} value={num(item.hours)} onChange={(e) => onUpdate({ hours: Number(e.target.value) })} />
          </Field>
          <Field label="Typ stawki" hint="dev lub consulting — gdy puste, liczone po stawce dev.">
            <select
              className={magazynInputClass}
              value={item.rateType ?? ''}
              onChange={(e) => onUpdate({ rateType: e.target.value === '' ? undefined : (e.target.value as 'dev' | 'consulting') })}
            >
              <option value="">Domyślna (dev)</option>
              <option value="dev">Dev</option>
              <option value="consulting">Consulting</option>
            </select>
          </Field>
          <Field label="Maks. ilość" hint="Puste = bez limitu ilości.">
            <input
              type="number"
              min={1}
              className={magazynInputClass}
              value={optNum(item.maxQuantity)}
              onChange={(e) => onUpdate({ maxQuantity: parseOptNum(e.target.value) })}
            />
          </Field>
          <Field label="Dodatek procentowy (%)" hint="Zamiast stałej ceny — np. wielojęzyczność +20%.">
            <input
              type="number"
              step="0.1"
              className={magazynInputClass}
              value={optNum(item.percentageAdd)}
              onChange={(e) => onUpdate({ percentageAdd: parseOptNum(e.target.value) })}
            />
          </Field>
        </div>
        <FlagCheckbox label="Ukryj cenę w konfiguratorze" checked={item.hidePrice ?? false} onChange={(checked) => onUpdate({ hidePrice: checked })} />
      </Fieldset>

      <Fieldset legend="Zachowanie w konfiguratorze">
        <div className="grid gap-2 sm:grid-cols-2">
          <FlagCheckbox label="Wymagana" checked={item.required ?? false} onChange={(checked) => onUpdate({ required: checked })} />
          <FlagCheckbox label="Domyślnie zaznaczona" checked={item.defaultSelected ?? false} onChange={(checked) => onUpdate({ defaultSelected: checked })} />
          <FlagCheckbox label="Wliczona w bazę pakietu" checked={item.includedInBase ?? false} onChange={(checked) => onUpdate({ includedInBase: checked })} />
          <FlagCheckbox label="Oznacz jako popularna" checked={item.popular ?? false} onChange={(checked) => onUpdate({ popular: checked })} />
          <FlagCheckbox label="Oznacz jako nowość" checked={item.new ?? false} onChange={(checked) => onUpdate({ new: checked })} />
          <FlagCheckbox label="Wyłączona w konfiguratorze" checked={item.disabled ?? false} onChange={(checked) => onUpdate({ disabled: checked })} />
        </div>
      </Fieldset>

      <Fieldset legend="Relacje między pozycjami">
        <ItemRefMultiSelect
          label="Zależności"
          hint="Pozycja dostępna dopiero po wyborze wszystkich zależności."
          selected={item.dependencies ?? []}
          options={refOptions}
          onToggle={(id) => onUpdate({ dependencies: toggleRef(item.dependencies, id) })}
        />
        <ItemRefMultiSelect
          label="Dołączane automatycznie (bundledWith)"
          hint="Po wyborze tej pozycji dołączane są te elementy."
          selected={item.bundledWith ?? []}
          options={refOptions}
          onToggle={(id) => onUpdate({ bundledWith: toggleRef(item.bundledWith, id) })}
        />
      </Fieldset>

      <Fieldset legend="Notyfikacja przy dodaniu">
        <FlagCheckbox label="Pokaż dialog przy dodaniu" checked={item.notificationOnAdd ?? false} onChange={(checked) => onUpdate({ notificationOnAdd: checked })} />
        {item.notificationOnAdd ? (
          <div className="space-y-3">
            <Field label="Tytuł">
              <input className={magazynInputClass} value={str(item.notificationAddTitle)} onChange={(e) => onUpdate({ notificationAddTitle: e.target.value })} />
            </Field>
            <Field label="Treść" hint="Użyj \\n dla nowej linii.">
              <textarea className={magazynTextareaClass} rows={3} value={str(item.notificationAddText)} onChange={(e) => onUpdate({ notificationAddText: e.target.value })} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Tekst potwierdzenia">
                <input className={magazynInputClass} value={str(item.notificationAddConfirmText)} onChange={(e) => onUpdate({ notificationAddConfirmText: e.target.value })} />
              </Field>
              <Field label="Tekst anulowania">
                <input className={magazynInputClass} value={str(item.notificationAddCancelText)} onChange={(e) => onUpdate({ notificationAddCancelText: e.target.value })} />
              </Field>
            </div>
          </div>
        ) : null}
      </Fieldset>

      <Fieldset legend="Notyfikacja przy usunięciu">
        <FlagCheckbox label="Pokaż dialog przy usunięciu" checked={item.notificationOnRemove ?? false} onChange={(checked) => onUpdate({ notificationOnRemove: checked })} />
        {item.notificationOnRemove ? (
          <div className="space-y-3">
            <Field label="Tytuł">
              <input className={magazynInputClass} value={str(item.notificationRemoveTitle)} onChange={(e) => onUpdate({ notificationRemoveTitle: e.target.value })} />
            </Field>
            <Field label="Treść" hint="Użyj \\n dla nowej linii.">
              <textarea className={magazynTextareaClass} rows={3} value={str(item.notificationRemoveText)} onChange={(e) => onUpdate({ notificationRemoveText: e.target.value })} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Tekst potwierdzenia">
                <input className={magazynInputClass} value={str(item.notificationRemoveConfirmText)} onChange={(e) => onUpdate({ notificationRemoveConfirmText: e.target.value })} />
              </Field>
              <Field label="Tekst anulowania">
                <input className={magazynInputClass} value={str(item.notificationRemoveCancelText)} onChange={(e) => onUpdate({ notificationRemoveCancelText: e.target.value })} />
              </Field>
            </div>
          </div>
        ) : null}
      </Fieldset>
    </div>
  )
}

export function PricingItemCallout({
  item,
  allItems,
  categories,
  projectTypes,
  onUpdate,
  onClose,
  allowIdEdit = false,
  onDelete,
  deleteLabel = 'Usuń pozycję',
}: {
  item: PricingItem
  allItems: PricingItem[]
  categories: PricingCategoryAdmin[]
  projectTypes: ProjectTypeAdmin[]
  onUpdate: (patch: Partial<PricingItem>) => void
  onClose: () => void
  allowIdEdit?: boolean
  onDelete?: () => void
  deleteLabel?: string
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prev
    }
  }, [onClose])

  function toggleProjectType(typeId: string) {
    const has = item.projectTypes.includes(typeId)
    onUpdate({
      projectTypes: has ? item.projectTypes.filter((t) => t !== typeId) : [...item.projectTypes, typeId],
    })
  }

  return (
    <>
      <button
        type="button"
        aria-label="Zamknij edycję"
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pricing-item-callout-title"
        className="fixed left-1/2 top-1/2 z-50 flex max-h-[min(92vh,840px)] w-[min(calc(100vw-2rem),42rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-white/15 bg-neutral-950 shadow-2xl shadow-black/50"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Edycja pozycji</p>
            <h3 id="pricing-item-callout-title" className="truncate text-base font-medium text-white">
              {item.name}
            </h3>
            <p className="truncate text-xs text-neutral-500">{item.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Zamknij"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <PricingItemEditFields
            item={item}
            allItems={allItems}
            categories={categories}
            projectTypes={projectTypes}
            onUpdate={onUpdate}
            onToggleProjectType={toggleProjectType}
            allowIdEdit={allowIdEdit}
          />
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 px-5 py-3">
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1 rounded-full border border-red-500/30 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10"
            >
              {deleteLabel}
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            Gotowe
          </button>
        </div>
      </div>
    </>
  )
}

export function patchPricingItemInList(items: PricingItem[], itemId: string, patch: Partial<PricingItem>): PricingItem[] {
  const nextId = patch.id
  const idChanged = nextId != null && nextId !== itemId

  return items.map((item) => {
    if (item.id === itemId) {
      return { ...item, ...patch }
    }
    if (!idChanged) return item
    return {
      ...item,
      dependencies: item.dependencies?.map((dep) => (dep === itemId ? nextId : dep)),
      bundledWith: item.bundledWith?.map((dep) => (dep === itemId ? nextId : dep)),
    }
  })
}
