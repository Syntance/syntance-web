'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import type {
  FaqPricingEntrySanity,
  FaqSettingsDocument,
  FaqSimpleEntrySanity,
} from '@/lib/data/faq'
import type { portfolioItems } from '@/lib/db/schema'
import {
  DbBanner,
  Field,
  Fieldset,
  PageHeader,
  SaveButton,
  StatusMessage,
  TabPills,
  magazynInputClass,
  magazynTextareaClass,
} from '@/components/magazyn/ui'

type PortfolioRow = typeof portfolioItems.$inferSelect

type FaqSectionKey = keyof FaqSettingsDocument

const FAQ_SECTIONS: Array<{ key: FaqSectionKey; label: string; pricing?: boolean }> = [
  { key: 'faqCennik', label: 'Cennik', pricing: true },
  { key: 'faqStronyWww', label: 'Strony WWW' },
  { key: 'faqSklepy', label: 'Sklepy' },
  { key: 'faqStrategia', label: 'Strategia' },
  { key: 'faqONas', label: 'O nas' },
  { key: 'faqKontakt', label: 'Kontakt' },
  { key: 'faqAgencje', label: 'Agencje' },
]

type Props = {
  faqSettings: FaqSettingsDocument
  portfolioRows: PortfolioRow[]
  dbConnected: boolean
}

function newKey(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

export function CmsClient({ faqSettings, portfolioRows, dbConnected }: Props) {
  const [tab, setTab] = useState<'faq' | 'portfolio'>('faq')
  const [faq, setFaq] = useState(faqSettings)
  const [faqSection, setFaqSection] = useState<FaqSectionKey>('faqCennik')
  const [portfolio, setPortfolio] = useState(portfolioRows)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [pending, setPending] = useState(false)

  const sectionMeta = FAQ_SECTIONS.find((s) => s.key === faqSection)!
  const entries = useMemo(() => faq[faqSection] ?? [], [faq, faqSection])

  function updateEntry(index: number, patch: Partial<FaqSimpleEntrySanity & FaqPricingEntrySanity>) {
    setFaq((prev) => {
      const list = [...(prev[faqSection] ?? [])]
      list[index] = { ...list[index], ...patch }
      return { ...prev, [faqSection]: list }
    })
  }

  function addEntry() {
    setFaq((prev) => {
      const list = [...(prev[faqSection] ?? [])]
      const base: FaqSimpleEntrySanity = {
        _key: newKey(faqSection),
        question: '',
        answer: '',
        order: list.length,
        isActive: true,
      }
      if (sectionMeta.pricing) {
        const entry: FaqPricingEntrySanity = { ...base, category: 'pricing' }
        list.push(entry)
      } else {
        list.push(base)
      }
      return { ...prev, [faqSection]: list }
    })
  }

  function removeEntry(index: number) {
    setFaq((prev) => {
      const list = [...(prev[faqSection] ?? [])]
      list.splice(index, 1)
      return { ...prev, [faqSection]: list }
    })
  }

  function moveEntry(index: number, dir: -1 | 1) {
    setFaq((prev) => {
      const list = [...(prev[faqSection] ?? [])]
      const next = index + dir
      if (next < 0 || next >= list.length) return prev
      const tmp = list[index]
      list[index] = list[next]
      list[next] = tmp
      return { ...prev, [faqSection]: list.map((e, i) => ({ ...e, order: i })) }
    })
  }

  async function saveFaq() {
    setPending(true)
    setStatus(null)
    setError(false)
    try {
      const res = await fetch('/api/magazyn/cms/faq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faq),
      })
      if (!res.ok) throw new Error('Zapis FAQ nie powiódł się')
      setStatus('FAQ zapisane.')
    } catch (e) {
      setError(true)
      setStatus(e instanceof Error ? e.message : 'Błąd')
    } finally {
      setPending(false)
    }
  }

  async function savePortfolio() {
    setPending(true)
    setStatus(null)
    setError(false)
    try {
      const res = await fetch('/api/magazyn/cms/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: portfolio }),
      })
      if (!res.ok) throw new Error('Zapis portfolio nie powiódł się')
      setStatus('Portfolio zapisane.')
    } catch (e) {
      setError(true)
      setStatus(e instanceof Error ? e.message : 'Błąd')
    } finally {
      setPending(false)
    }
  }

  function updatePortfolio(index: number, patch: Partial<PortfolioRow>) {
    setPortfolio((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function addPortfolio() {
    setPortfolio((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sanityId: null,
        name: '',
        url: '',
        logoUrl: '',
        logoAlt: '',
        sortOrder: prev.length,
        disabled: false,
      },
    ])
  }

  const faqCount = FAQ_SECTIONS.reduce((n, s) => n + (faq[s.key]?.length ?? 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader title="CMS" description={`FAQ (${faqCount} wpisów) · Portfolio (${portfolio.length})`} />
      <DbBanner connected={dbConnected} />

      <TabPills
        tabs={[
          { id: 'faq', label: 'FAQ' },
          { id: 'portfolio', label: 'Portfolio' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'faq' ? (
        <div className="flex flex-col gap-6 lg:flex-row">
          <nav className="flex shrink-0 flex-row flex-wrap gap-1 lg:w-44 lg:flex-col lg:gap-0.5">
            {FAQ_SECTIONS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setFaqSection(s.key)}
                className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  faqSection === s.key ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5'
                }`}
              >
                {s.label}
                <span className="ml-1 text-neutral-500">({faq[s.key]?.length ?? 0})</span>
              </button>
            ))}
          </nav>

          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-medium">{sectionMeta.label}</h2>
              <button
                type="button"
                onClick={addEntry}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-200 hover:bg-white/5"
              >
                <Plus className="h-3.5 w-3.5" /> Dodaj pytanie
              </button>
            </div>

            {entries.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-neutral-500">
                Brak wpisów w tej sekcji. Dodaj pierwsze pytanie lub zaimportuj dane z Sanity (prod).
              </p>
            ) : (
              <ul className="space-y-3">
                {entries.map((entry, index) => (
                  <li key={entry._key ?? index} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-xs text-neutral-500">#{index + 1}</span>
                      <div className="flex items-center gap-1">
                        <button type="button" aria-label="Wyżej" onClick={() => moveEntry(index, -1)} className="rounded p-1 text-neutral-400 hover:bg-white/10">
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button type="button" aria-label="Niżej" onClick={() => moveEntry(index, 1)} className="rounded p-1 text-neutral-400 hover:bg-white/10">
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button type="button" aria-label="Usuń" onClick={() => removeEntry(index)} className="rounded p-1 text-red-400 hover:bg-red-500/10">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Field label="Pytanie">
                        <input
                          className={magazynInputClass}
                          value={entry.question}
                          onChange={(e) => updateEntry(index, { question: e.target.value })}
                        />
                      </Field>
                      <Field label="Odpowiedź">
                        <textarea
                          className={magazynTextareaClass}
                          rows={4}
                          value={entry.answer}
                          onChange={(e) => updateEntry(index, { answer: e.target.value })}
                        />
                      </Field>
                      {sectionMeta.pricing && 'category' in entry ? (
                        <Field label="Kategoria">
                          <select
                            className={magazynInputClass}
                            value={(entry as FaqPricingEntrySanity).category}
                            onChange={(e) =>
                              updateEntry(index, {
                                category: e.target.value as FaqPricingEntrySanity['category'],
                              })
                            }
                          >
                            {(['pricing', 'time', 'trust', 'comparison'] as const).map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </Field>
                      ) : null}
                      <label className="flex items-center gap-2 text-sm text-neutral-400">
                        <input
                          type="checkbox"
                          checked={entry.isActive !== false}
                          onChange={(e) => updateEntry(index, { isActive: e.target.checked })}
                          className="rounded border-white/20"
                        />
                        Aktywny na stronie
                      </label>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <SaveButton pending={pending} label="Zapisz FAQ" onClick={saveFaq} />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={addPortfolio}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-200 hover:bg-white/5"
            >
              <Plus className="h-3.5 w-3.5" /> Dodaj realizację
            </button>
          </div>
          {portfolio.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-neutral-500">
              Brak realizacji w bazie.
            </p>
          ) : (
            <ul className="space-y-3">
              {portfolio.map((item, index) => (
                <li key={item.id}>
                  <Fieldset legend={item.name || `Realizacja ${index + 1}`}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Nazwa">
                        <input className={magazynInputClass} value={item.name} onChange={(e) => updatePortfolio(index, { name: e.target.value })} />
                      </Field>
                      <Field label="URL">
                        <input className={magazynInputClass} value={item.url} onChange={(e) => updatePortfolio(index, { url: e.target.value })} />
                      </Field>
                      <Field label="Logo URL">
                        <input className={magazynInputClass} value={item.logoUrl ?? ''} onChange={(e) => updatePortfolio(index, { logoUrl: e.target.value })} />
                      </Field>
                      <Field label="Logo alt">
                        <input className={magazynInputClass} value={item.logoAlt ?? ''} onChange={(e) => updatePortfolio(index, { logoAlt: e.target.value })} />
                      </Field>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-neutral-400">
                      <input type="checkbox" checked={item.disabled} onChange={(e) => updatePortfolio(index, { disabled: e.target.checked })} />
                      Ukryj na stronie
                    </label>
                  </Fieldset>
                </li>
              ))}
            </ul>
          )}
          <SaveButton pending={pending} label="Zapisz portfolio" onClick={savePortfolio} />
        </div>
      )}

      <StatusMessage message={status} error={error} />
    </div>
  )
}
