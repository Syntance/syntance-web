'use client'

import { ChevronRight, Plus } from 'lucide-react'

type PortfolioListItem = {
  id: string
  name: string
  disabled?: boolean
  caseStudyEnabled?: boolean
}

type Props = {
  items: PortfolioListItem[]
  activeId: string | null
  onSelect: (id: string) => void
  onAdd: () => void
}

function itemLabel(item: PortfolioListItem, index: number): string {
  return item.name.trim() || `Realizacja ${index + 1}`
}

/** ~3 wiersze listy (py-2.5 + text-sm + gap) — powyżej włącza scroll. */
const LIST_VISIBLE_ROWS = 3
const listScrollClass =
  'max-h-[calc(var(--portfolio-list-row)*3+0.5rem)] overflow-y-auto overscroll-y-contain [scrollbar-color:oklch(0.35_0_0)_transparent] [scrollbar-width:thin]'

export function PortfolioListPicker({ items, activeId, onSelect, onAdd }: Props) {
  const countLabel =
    items.length === 0
      ? 'Brak projektów'
      : items.length === 1
        ? '1 projekt'
        : `${items.length} projektów`

  return (
    <div
      className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 [--portfolio-list-row:2.75rem]"
    >
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-neutral-200">Realizacja</p>
          <p className="text-xs text-neutral-500">{countLabel}</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-dashed border-white/15 px-3 text-xs font-medium text-neutral-300 transition-colors hover:border-white/25 hover:bg-white/[0.04] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Dodaj
        </button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/10 px-3 py-6 text-center text-sm text-neutral-500">
          Brak realizacji — dodaj pierwszą pozycję.
        </p>
      ) : (
        <ul
          role="listbox"
          aria-label="Lista realizacji portfolio"
          className={`space-y-1 pr-0.5 ${items.length > LIST_VISIBLE_ROWS ? listScrollClass : ''}`}
        >
          {items.map((item, index) => {
            const active = item.id === activeId
            const label = itemLabel(item, index)
            return (
              <li key={item.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => onSelect(item.id)}
                  className={`group flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40 ${
                    active
                      ? 'border-white/15 bg-white/10 text-white'
                      : 'border-transparent text-neutral-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-neutral-200'
                  }`}
                >
                  <span
                    className={`size-1.5 shrink-0 rounded-full transition-colors ${
                      active ? 'bg-purple-400' : 'bg-neutral-600 group-hover:bg-neutral-500'
                    }`}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  {item.disabled ? (
                    <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-500">
                      ukryta
                    </span>
                  ) : null}
                  {!item.disabled && item.caseStudyEnabled === false ? (
                    <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-500">
                      bez CS
                    </span>
                  ) : null}
                  <ChevronRight
                    className={`h-3.5 w-3.5 shrink-0 transition-opacity ${
                      active ? 'text-neutral-400 opacity-100' : 'opacity-0 group-hover:opacity-60'
                    }`}
                    aria-hidden
                  />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
