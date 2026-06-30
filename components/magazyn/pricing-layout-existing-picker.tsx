'use client'

import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import type { PricingCategoryAdmin } from '@/lib/db/queries/pricing'
import type { PricingItem } from '@/lib/data/pricing'
import { magazynInputClass } from '@/components/magazyn/ui'

type Props = {
  categoryId: string
  categoryName: string
  categories: PricingCategoryAdmin[]
  items: PricingItem[]
  onSelect: (itemId: string) => void
  onClose: () => void
  hint?: string
  warnOnCategoryChange?: boolean
  emptyCatalogMessage?: string
}

function categoryLabel(categories: PricingCategoryAdmin[], categoryId: string): string {
  return categories.find((category) => category.id === categoryId)?.name ?? categoryId
}

export function PricingLayoutExistingPicker({
  categoryId,
  categoryName,
  categories,
  items,
  onSelect,
  onClose,
  hint = 'Pozycja zostanie przypisana do tej kategorii i bieżącego typu projektu.',
  warnOnCategoryChange = true,
  emptyCatalogMessage = 'Wszystkie pozycje są już w tej kategorii.',
}: Props) {
  const [query, setQuery] = useState('')

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

  return (
    <>
      <button
        type="button"
        aria-label="Zamknij wybór pozycji"
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pricing-existing-picker-title"
        className="fixed left-1/2 top-1/2 z-50 flex max-h-[min(88vh,640px)] w-[min(calc(100vw-2rem),32rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-white/15 bg-neutral-950 shadow-2xl shadow-black/50"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Dodaj istniejącą pozycję</p>
            <h3 id="pricing-existing-picker-title" className="truncate text-base font-medium text-white">
              {categoryName}
            </h3>
            <p className="mt-1 text-xs text-neutral-500">{hint}</p>
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

        <div className="shrink-0 border-b border-white/10 px-5 py-3">
          <input
            type="search"
            autoFocus
            placeholder="Szukaj po nazwie, ID lub kategorii…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={magazynInputClass}
          />
        </div>

        <ul className="min-h-0 flex-1 divide-y divide-white/5 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="px-5 py-8 text-center text-sm text-neutral-500">
              {items.length === 0 ? emptyCatalogMessage : 'Brak wyników dla podanego wyszukiwania.'}
            </li>
          ) : (
            filtered.map((item) => {
              const movesCategory = item.category !== categoryId
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className="flex w-full flex-col gap-0.5 px-5 py-3 text-left transition-colors hover:bg-white/[0.04] focus-visible:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple-500/40"
                  >
                    <span className="truncate text-sm font-medium text-white">{item.name}</span>
                    <span className="truncate text-xs text-neutral-500">
                      {item.id} · {categoryLabel(categories, item.category)} ·{' '}
                      {item.price.toLocaleString('pl-PL')} PLN
                    </span>
                    {warnOnCategoryChange && movesCategory ? (
                      <span className="text-xs text-amber-400/90">
                        Zmieni kategorię z „{categoryLabel(categories, item.category)}” na „{categoryName}”
                      </span>
                    ) : null}
                  </button>
                </li>
              )
            })
          )}
        </ul>
      </div>
    </>
  )
}
