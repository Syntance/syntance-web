'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import type { StackBadgeRecord } from '@/lib/data/stack-badges'
import { slugifyStackBadgeName } from '@/lib/data/stack-badges'
import {
  Field,
  Fieldset,
  SaveButton,
  magazynInputClass,
  magazynTextareaClass,
} from '@/components/magazyn/ui'

type Props = {
  badges: StackBadgeRecord[]
  pending: boolean
  needsInitialSave?: boolean
  onChange: (badges: StackBadgeRecord[]) => void
  onSave: () => void
}

function navButtonClass(active: boolean) {
  return `w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
    active ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5 hover:text-white'
  }`
}

export function StackBadgesEditor({
  badges,
  pending,
  needsInitialSave = false,
  onChange,
  onSave,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(badges[0]?.id ?? null)
  const activeBadge = badges.find((badge) => badge.id === activeId) ?? null

  function updateBadge(id: string, patch: Partial<StackBadgeRecord>) {
    onChange(badges.map((badge) => (badge.id === id ? { ...badge, ...patch } : badge)))
  }

  function addBadge() {
    const id = `badge-${crypto.randomUUID().slice(0, 8)}`
    const next: StackBadgeRecord = {
      id,
      name: '',
      definition: '',
      dotColor: 'oklch(0.78 0 0)',
      showInHero: false,
      showInValues: true,
      sortOrder: badges.length,
    }
    onChange([...badges, next])
    setActiveId(id)
  }

  function removeBadge(id: string) {
    const next = badges.filter((badge) => badge.id !== id).map((badge, index) => ({
      ...badge,
      sortOrder: index,
    }))
    onChange(next)
    if (activeId === id) {
      setActiveId(next[0]?.id ?? null)
    }
  }

  function moveBadge(id: string, dir: -1 | 1) {
    const index = badges.findIndex((badge) => badge.id === id)
    const swapIndex = index + dir
    if (index < 0 || swapIndex < 0 || swapIndex >= badges.length) return
    const next = [...badges]
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
    onChange(next.map((badge, i) => ({ ...badge, sortOrder: i })))
  }

  return (
    <div className="space-y-5">
      {needsInitialSave ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Badge z domyślnej konfiguracji strony. Kliknij{' '}
          <strong className="font-medium">Zapisz badge</strong>, aby przenieść je do bazy.
        </p>
      ) : null}

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav aria-label="Lista badge" className="flex shrink-0 flex-col gap-0.5 lg:w-56">
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <span className="text-xs text-neutral-500">{badges.length} pozycji</span>
            <button
              type="button"
              onClick={addBadge}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 text-xs text-neutral-200 hover:bg-white/5"
            >
              <Plus className="h-3.5 w-3.5" /> Dodaj
            </button>
          </div>
          {badges.map((badge, index) => (
            <div key={badge.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveId(badge.id)}
                className={`${navButtonClass(activeId === badge.id)} min-w-0 flex-1`}
              >
                <span className="block truncate font-medium">{badge.name || 'Bez nazwy'}</span>
              </button>
              <button
                type="button"
                aria-label="Wyżej"
                disabled={index === 0}
                onClick={() => moveBadge(badge.id, -1)}
                className="rounded p-1 text-neutral-500 hover:bg-white/5 disabled:opacity-30"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Niżej"
                disabled={index === badges.length - 1}
                onClick={() => moveBadge(badge.id, 1)}
                className="rounded p-1 text-neutral-500 hover:bg-white/5 disabled:opacity-30"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </nav>

        {activeBadge ? (
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => removeBadge(activeBadge.id)}
                className="inline-flex items-center gap-1 rounded-full border border-red-500/30 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" /> Usuń badge
              </button>
            </div>

            <Fieldset legend="Definicja badge">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nazwa (wyświetlana)">
                  <input
                    className={magazynInputClass}
                    value={activeBadge.name}
                    onChange={(e) => {
                      const name = e.target.value
                      const patch: Partial<StackBadgeRecord> = { name }
                      if (activeBadge.id.startsWith('badge-') || !activeBadge.name.trim()) {
                        const slug = slugifyStackBadgeName(name)
                        if (slug) patch.id = slug
                      }
                      updateBadge(activeBadge.id, patch)
                      if (patch.id && patch.id !== activeBadge.id) {
                        setActiveId(patch.id)
                      }
                    }}
                  />
                </Field>
                <Field label="Kolor kropki (OKLCH / hex)">
                  <input
                    className={magazynInputClass}
                    value={activeBadge.dotColor}
                    onChange={(e) => updateBadge(activeBadge.id, { dotColor: e.target.value })}
                  />
                </Field>
              </div>

              <Field label="Definicja (popup po kliknięciu)">
                <textarea
                  className={magazynTextareaClass}
                  rows={4}
                  value={activeBadge.definition}
                  onChange={(e) => updateBadge(activeBadge.id, { definition: e.target.value })}
                  placeholder="Krótki opis technologii widoczny po kliknięciu badge na stronie głównej."
                />
              </Field>

              <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-sm font-medium text-neutral-200">Gdzie pokazać</p>
                <label className="flex items-center gap-2 text-sm text-neutral-400">
                  <input
                    type="checkbox"
                    checked={activeBadge.showInHero}
                    onChange={(e) => updateBadge(activeBadge.id, { showInHero: e.target.checked })}
                    className="rounded border-white/20"
                  />
                  Hero (sekcja startowa)
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-400">
                  <input
                    type="checkbox"
                    checked={activeBadge.showInValues}
                    onChange={(e) => updateBadge(activeBadge.id, { showInValues: e.target.checked })}
                    className="rounded border-white/20"
                  />
                  Dlaczego My?
                </label>
              </div>
            </Fieldset>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-neutral-500">
            Dodaj pierwszy badge lub wybierz pozycję z listy.
          </p>
        )}
      </div>

      <SaveButton pending={pending} label="Zapisz badge" onClick={onSave} />
    </div>
  )
}
