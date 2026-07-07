'use client'

import { useMemo, useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import type {
  FaqPricingCategory,
  FaqPricingEntrySanity,
  FaqSettingsDocument,
  FaqSimpleEntrySanity,
} from '@/lib/data/faq'
import type { portfolioItems } from '@/lib/db/schema'
import {
  CMS_CONTENT_PAGES,
  CMS_FAQ_PAGES,
  CMS_MODULES,
  PRICING_FAQ_SECTIONS,
  SIMPLE_FAQ_SECTION,
  type CmsContentPageId,
  type CmsFaqPageId,
  type CmsModuleId,
} from '@/lib/magazyn/cms-config'
import { PORTFOLIO_PROJECT_TYPE_OPTIONS, slugifyPortfolioName } from '@/lib/magazyn/portfolio-cms'
import { PortfolioPerformanceEditor } from '@/components/magazyn/portfolio-performance-editor'
import { PortfolioListPicker } from '@/components/magazyn/portfolio-list-picker'
import { portfolioHasAdminGallerySeed } from '@/lib/magazyn/portfolio-admin-merge'
import type { StackBadgeRecord } from '@/lib/data/stack-badges'
import { StackBadgesEditor } from '@/components/magazyn/stack-badges-editor'
import type { PortfolioProjectType } from '@/lib/portfolio-content'
import {
  DbBanner,
  Field,
  Fieldset,
  PageHeader,
  SaveButton,
  StatusMessage,
  StringListEditor,
  TabPills,
  magazynInputClass,
  magazynTextareaClass,
} from '@/components/magazyn/ui'
import { UndoRedoToolbar } from '@/components/magazyn/undo-redo-toolbar'
import { useMagazynHistory } from '@/hooks/use-magazyn-history'

type PortfolioRow = typeof portfolioItems.$inferSelect

function normalizePortfolioRow(row: PortfolioRow): PortfolioRow {
  return {
    ...row,
    slug: row.slug || slugifyPortfolioName(row.name || 'realizacja'),
    projectType: row.projectType ?? 'website',
    description: row.description ?? '',
    highlights: row.highlights ?? [],
    stack: row.stack ?? [],
    performance: row.performance ?? null,
    caseStudyEnabled: row.caseStudyEnabled ?? true,
    adminGalleryEnabled: row.adminGalleryEnabled ?? false,
  }
}

type Props = {
  faqSettings: FaqSettingsDocument
  portfolioRows: PortfolioRow[]
  stackBadgeRows: StackBadgeRecord[]
  dbConnected: boolean
  portfolioNeedsInitialSave?: boolean
  stackBadgesNeedsInitialSave?: boolean
}

function newKey(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

function navButtonClass(active: boolean) {
  return `w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
    active ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5 hover:text-white'
  }`
}

type CmsDraft = {
  faq: FaqSettingsDocument
  portfolio: PortfolioRow[]
  stackBadges: StackBadgeRecord[]
}

export function CmsClient({
  faqSettings,
  portfolioRows,
  stackBadgeRows,
  dbConnected,
  portfolioNeedsInitialSave = false,
  stackBadgesNeedsInitialSave = false,
}: Props) {
  const router = useRouter()
  const history = useMagazynHistory<CmsDraft>({
    faq: faqSettings,
    portfolio: portfolioRows.map(normalizePortfolioRow),
    stackBadges: stackBadgeRows,
  })
  const { faq, portfolio, stackBadges } = history.state

  const setFaq = (
    value: FaqSettingsDocument | ((prev: FaqSettingsDocument) => FaqSettingsDocument),
  ) => {
    history.setState((draft) => ({
      ...draft,
      faq: typeof value === 'function' ? value(draft.faq) : value,
    }))
  }

  const setPortfolio = (value: PortfolioRow[] | ((prev: PortfolioRow[]) => PortfolioRow[])) => {
    history.setState((draft) => ({
      ...draft,
      portfolio: typeof value === 'function' ? value(draft.portfolio) : value,
    }))
  }

  const setStackBadges = (
    value: StackBadgeRecord[] | ((prev: StackBadgeRecord[]) => StackBadgeRecord[]),
  ) => {
    history.setState((draft) => ({
      ...draft,
      stackBadges: typeof value === 'function' ? value(draft.stackBadges) : value,
    }))
  }

  const afterSave = () => {
    router.refresh()
  }

  useEffect(() => {
    history.commitSaved({
      faq: faqSettings,
      portfolio: portfolioRows.map(normalizePortfolioRow),
      stackBadges: stackBadgeRows,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync po router.refresh()
  }, [faqSettings, portfolioRows, stackBadgeRows])

  const [activeModule, setActiveModule] = useState<CmsModuleId>('faq')
  const [activeFaqPageId, setActiveFaqPageId] = useState<CmsFaqPageId>('cennik')
  const [activeContentPageId, setActiveContentPageId] = useState<CmsContentPageId>('portfolio')
  const [activeSectionId, setActiveSectionId] = useState<string>('pricing')
  const [activePortfolioId, setActivePortfolioId] = useState<string | null>(
    portfolioRows[0]?.id ?? null,
  )
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [pending, setPending] = useState(false)

  const activeFaqPage = CMS_FAQ_PAGES.find((p) => p.id === activeFaqPageId) ?? CMS_FAQ_PAGES[0]
  const activeContentPage =
    CMS_CONTENT_PAGES.find((p) => p.id === activeContentPageId) ?? CMS_CONTENT_PAGES[0]
  const isPortfolio = activeModule === 'tresci' && activeContentPageId === 'portfolio'
  const isStackBadges = activeModule === 'tresci' && activeContentPageId === 'stack-badges'

  const faqKey = activeModule === 'faq' ? activeFaqPage.faqKey : undefined
  const allFaqEntries = useMemo(() => (faqKey ? (faq[faqKey] ?? []) : []), [faqKey, faq])

  const visibleFaqEntries = useMemo(() => {
    if (activeModule !== 'faq') return []
    if (activeFaqPage.pricing) {
      return allFaqEntries.filter(
        (entry) => (entry as FaqPricingEntrySanity).category === activeSectionId,
      )
    }
    return allFaqEntries
  }, [allFaqEntries, activeFaqPage, activeModule, activeSectionId])

  const faqCount = CMS_FAQ_PAGES.reduce(
    (n, p) => n + (faq[p.faqKey]?.length ?? 0),
    0,
  )

  function selectFaqPage(pageId: CmsFaqPageId) {
    setActiveFaqPageId(pageId)
    const page = CMS_FAQ_PAGES.find((p) => p.id === pageId)
    if (!page) return
    if (page.pricing) {
      setActiveSectionId('pricing')
    } else {
      setActiveSectionId(SIMPLE_FAQ_SECTION.id)
    }
  }

  function selectContentPage(pageId: CmsContentPageId) {
    setActiveContentPageId(pageId)
    if (pageId === 'portfolio') {
      setActivePortfolioId(portfolio[0]?.id ?? null)
    }
  }

  function updateFaqEntry(indexInSection: number, patch: Partial<FaqSimpleEntrySanity & FaqPricingEntrySanity>) {
    if (!faqKey) return
    const entry = visibleFaqEntries[indexInSection]
    if (!entry) return

    setFaq((prev) => {
      const list = [...(prev[faqKey] ?? [])]
      const globalIndex = list.findIndex((row) => row._key === entry._key)
      if (globalIndex < 0) return prev
      list[globalIndex] = { ...list[globalIndex], ...patch }
      return { ...prev, [faqKey]: list }
    })
  }

  function addFaqEntry() {
    if (activeModule !== 'faq' || !faqKey) return

    setFaq((prev) => {
      const list = [...(prev[faqKey] ?? [])]
      const base: FaqSimpleEntrySanity = {
        _key: newKey(faqKey),
        question: '',
        answer: '',
        order: list.length,
        isActive: true,
      }
      if (activeFaqPage.pricing) {
        const entry: FaqPricingEntrySanity = {
          ...base,
          category: activeSectionId as FaqPricingCategory,
        }
        list.push(entry)
      } else {
        list.push(base)
      }
      return { ...prev, [faqKey]: list }
    })
  }

  function removeFaqEntry(indexInSection: number) {
    if (!faqKey) return
    const entry = visibleFaqEntries[indexInSection]
    if (!entry) return

    setFaq((prev) => {
      const list = [...(prev[faqKey] ?? [])]
      const globalIndex = list.findIndex((row) => row._key === entry._key)
      if (globalIndex < 0) return prev
      list.splice(globalIndex, 1)
      return { ...prev, [faqKey]: list.map((row, i) => ({ ...row, order: i })) }
    })
  }

  function moveFaqEntry(indexInSection: number, dir: -1 | 1) {
    if (!faqKey || activeModule !== 'faq') return
    const entry = visibleFaqEntries[indexInSection]
    const swapEntry = visibleFaqEntries[indexInSection + dir]
    if (!entry || !swapEntry) return

    setFaq((prev) => {
      const list = [...(prev[faqKey] ?? [])]
      const indexA = list.findIndex((row) => row._key === entry._key)
      const indexB = list.findIndex((row) => row._key === swapEntry._key)
      if (indexA < 0 || indexB < 0) return prev

      const orderA = list[indexA].order ?? indexA
      const orderB = list[indexB].order ?? indexB
      list[indexA] = { ...list[indexA], order: orderB }
      list[indexB] = { ...list[indexB], order: orderA }

      if (activeFaqPage.pricing) {
        const category = activeSectionId as FaqPricingCategory
        const inCategory = list
          .filter((row) => (row as FaqPricingEntrySanity).category === category)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        inCategory.forEach((row, i) => {
          const idx = list.findIndex((r) => r._key === row._key)
          if (idx >= 0) list[idx] = { ...list[idx], order: i }
        })
      } else {
        return { ...prev, [faqKey]: list.map((row, i) => ({ ...row, order: i })) }
      }

      return { ...prev, [faqKey]: list }
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
      setStatus('Treści FAQ zapisane.')
      afterSave()
    } catch (e) {
      setError(true)
      setStatus(e instanceof Error ? e.message : 'Błąd')
    } finally {
      setPending(false)
    }
  }

  async function savePortfolio() {
    const invalid = portfolio.find((item) => !item.name.trim() || !item.slug.trim() || !item.url.trim())
    if (invalid) {
      setError(true)
      setStatus('Każda realizacja wymaga nazwy, sluga i adresu URL.')
      return
    }

    setPending(true)
    setStatus(null)
    setError(false)
    try {
      const res = await fetch('/api/magazyn/cms/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: portfolio.map((item) => ({
            ...item,
            highlights: (item.highlights ?? []).filter((line) => line.trim()),
            stack: (item.stack ?? []).filter((line) => line.trim()),
            performance: item.performance
              ? {
                  ...item.performance,
                  improvements: (item.performance.improvements ?? []).filter((line) => line.trim()),
                }
              : item.performance,
          })),
        }),
      })
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Zapis portfolio nie powiódł się')
      }
      setStatus('Portfolio zapisane.')
      afterSave()
    } catch (e) {
      setError(true)
      setStatus(e instanceof Error ? e.message : 'Błąd')
    } finally {
      setPending(false)
    }
  }

  async function saveStackBadges() {
    const invalid = stackBadges.find((item) => !item.id.trim() || !item.name.trim())
    if (invalid) {
      setError(true)
      setStatus('Każdy badge wymaga id i nazwy.')
      return
    }

    setPending(true)
    setStatus(null)
    setError(false)
    try {
      const res = await fetch('/api/magazyn/cms/stack-badges', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: stackBadges }),
      })
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Zapis badge nie powiódł się')
      }
      setStatus('Badge technologii zapisane.')
      afterSave()
    } catch (e) {
      setError(true)
      setStatus(e instanceof Error ? e.message : 'Błąd')
    } finally {
      setPending(false)
    }
  }

  function updatePortfolio(id: string, patch: Partial<PortfolioRow>) {
    setPortfolio((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  function addPortfolio() {
    const id = crypto.randomUUID()
    setPortfolio((prev) => [
      ...prev,
      {
        id,
        sanityId: null,
        slug: '',
        name: '',
        url: '',
        projectType: 'website' as PortfolioProjectType,
        description: '',
        highlights: [] as string[],
        stack: [] as string[],
        problemStatement: null,
        rebuildContext: null,
        previewImageFallback: null,
        previewImageAlt: null,
        logoUrl: '',
        logoAlt: '',
        performance: null,
        sortOrder: prev.length,
        disabled: false,
        caseStudyEnabled: true,
        adminGalleryEnabled: false,
      },
    ])
    setActivePortfolioId(id)
  }

  function removePortfolio(id: string) {
    setPortfolio((prev) => {
      const next = prev.filter((row) => row.id !== id)
      if (activePortfolioId === id) {
        setActivePortfolioId(next[0]?.id ?? null)
      }
      return next.map((row, i) => ({ ...row, sortOrder: i }))
    })
  }

  const activePortfolio = portfolio.find((row) => row.id === activePortfolioId) ?? null

  const sectionLabel = isPortfolio
    ? 'Realizacja'
    : isStackBadges
      ? 'Badge technologii'
      : activeFaqPage.pricing
        ? (PRICING_FAQ_SECTIONS.find((s) => s.id === activeSectionId)?.label ?? activeSectionId)
        : SIMPLE_FAQ_SECTION.label

  const contentCount = portfolio.length + stackBadges.length

  const moduleTabs = CMS_MODULES.map((module) => ({
    id: module.id,
    label:
      module.id === 'faq'
        ? `${module.label} (${faqCount})`
        : `${module.label} (${contentCount})`,
  }))

  const pricingTabs = PRICING_FAQ_SECTIONS.map((section) => {
    const count = allFaqEntries.filter(
      (e) => (e as FaqPricingEntrySanity).category === section.id,
    ).length
    return { id: section.id, label: `${section.label} (${count})` }
  })

  let editorContent: ReactNode

  if (isPortfolio) {
    editorContent = (
      <>
        {!activePortfolio ? (
          <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-neutral-500">
            Dodaj pierwszą realizację lub wybierz pozycję z listy.
          </p>
        ) : (
          <Fieldset legend="Treść realizacji">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => removePortfolio(activePortfolio.id)}
                className="inline-flex items-center gap-1 rounded-full border border-red-500/30 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" /> Usuń realizację
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nazwa projektu">
                <input
                  className={magazynInputClass}
                  value={activePortfolio.name}
                  onChange={(e) => {
                    const name = e.target.value
                    const patch: Partial<PortfolioRow> = { name }
                    if (!activePortfolio.slug.trim()) {
                      patch.slug = slugifyPortfolioName(name)
                    }
                    updatePortfolio(activePortfolio.id, patch)
                  }}
                />
              </Field>
              <Field label="Slug (URL case study)" hint="/portfolio/[slug]">
                <input
                  className={magazynInputClass}
                  value={activePortfolio.slug}
                  onChange={(e) =>
                    updatePortfolio(activePortfolio.id, {
                      slug: slugifyPortfolioName(e.target.value),
                    })
                  }
                />
              </Field>
              <Field label="Adres URL projektu">
                <input
                  className={magazynInputClass}
                  value={activePortfolio.url}
                  onChange={(e) => updatePortfolio(activePortfolio.id, { url: e.target.value })}
                />
              </Field>
              <Field label="Typ projektu">
                <select
                  className={magazynInputClass}
                  value={activePortfolio.projectType ?? 'website'}
                  onChange={(e) =>
                    updatePortfolio(activePortfolio.id, {
                      projectType: e.target.value as PortfolioProjectType,
                    })
                  }
                >
                  {PORTFOLIO_PROJECT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Logo URL">
                <input
                  className={magazynInputClass}
                  value={activePortfolio.logoUrl ?? ''}
                  onChange={(e) => updatePortfolio(activePortfolio.id, { logoUrl: e.target.value })}
                />
              </Field>
              <Field label="Logo alt">
                <input
                  className={magazynInputClass}
                  value={activePortfolio.logoAlt ?? ''}
                  onChange={(e) => updatePortfolio(activePortfolio.id, { logoAlt: e.target.value })}
                />
              </Field>
              <Field label="Podgląd — obraz (URL)" hint="Ścieżka w /public lub pełny URL">
                <input
                  className={magazynInputClass}
                  value={activePortfolio.previewImageFallback ?? ''}
                  onChange={(e) =>
                    updatePortfolio(activePortfolio.id, { previewImageFallback: e.target.value })
                  }
                />
              </Field>
              <Field label="Podgląd — alt">
                <input
                  className={magazynInputClass}
                  value={activePortfolio.previewImageAlt ?? ''}
                  onChange={(e) =>
                    updatePortfolio(activePortfolio.id, { previewImageAlt: e.target.value })
                  }
                />
              </Field>
            </div>

            <Field label="Opis (karta + hero case study)">
              <textarea
                className={magazynTextareaClass}
                rows={4}
                value={activePortfolio.description ?? ''}
                onChange={(e) => updatePortfolio(activePortfolio.id, { description: e.target.value })}
              />
            </Field>

            <Field label="Wyzwanie (case study)">
              <textarea
                className={magazynTextareaClass}
                rows={3}
                value={activePortfolio.problemStatement ?? ''}
                onChange={(e) =>
                  updatePortfolio(activePortfolio.id, { problemStatement: e.target.value })
                }
              />
            </Field>

            <Field label="Kontekst przebudowy (case study)">
              <textarea
                className={magazynTextareaClass}
                rows={3}
                value={activePortfolio.rebuildContext ?? ''}
                onChange={(e) =>
                  updatePortfolio(activePortfolio.id, { rebuildContext: e.target.value })
                }
              />
            </Field>

            <StringListEditor
              label="Co wyszło — punkty"
              placeholder="Np. PageSpeed 95+ na mobile"
              items={activePortfolio.highlights ?? []}
              onChange={(highlights) => updatePortfolio(activePortfolio.id, { highlights })}
            />

            <StringListEditor
              label="Badge stacku"
              hint="Technologie wyświetlane jako badge na karcie i w case study"
              placeholder="Np. Next.js"
              items={activePortfolio.stack ?? []}
              onChange={(stack) => updatePortfolio(activePortfolio.id, { stack })}
            />

            <PortfolioPerformanceEditor
              slug={activePortfolio.slug}
              projectName={activePortfolio.name || 'Realizacja'}
              report={activePortfolio.performance ?? null}
              enabled={activePortfolio.performance !== null}
              onChange={(performance) => updatePortfolio(activePortfolio.id, { performance })}
            />

            <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-sm font-medium text-neutral-200">Widoczność na stronie</p>
              <label className="flex items-center gap-2 text-sm text-neutral-400">
                <input
                  type="checkbox"
                  checked={activePortfolio.caseStudyEnabled}
                  onChange={(e) =>
                    updatePortfolio(activePortfolio.id, { caseStudyEnabled: e.target.checked })
                  }
                  className="rounded border-white/20"
                />
                Włącz stronę case study (/portfolio/{activePortfolio.slug || 'slug'})
              </label>
              {portfolioHasAdminGallerySeed(activePortfolio.slug) ? (
                <label className="flex items-center gap-2 text-sm text-neutral-400">
                  <input
                    type="checkbox"
                    checked={activePortfolio.adminGalleryEnabled}
                    onChange={(e) =>
                      updatePortfolio(activePortfolio.id, { adminGalleryEnabled: e.target.checked })
                    }
                    className="rounded border-white/20"
                  />
                  Włącz sekcję panelu (Shop + CMS)
                </label>
              ) : null}
              <label className="flex items-center gap-2 text-sm text-neutral-400">
                <input
                  type="checkbox"
                  checked={activePortfolio.disabled}
                  onChange={(e) => updatePortfolio(activePortfolio.id, { disabled: e.target.checked })}
                  className="rounded border-white/20"
                />
                Ukryj realizację na stronie (portfolio + grid na homepage)
              </label>
            </div>
          </Fieldset>
        )}
        <SaveButton pending={pending} label="Zapisz portfolio" onClick={savePortfolio} />
      </>
    )
  } else if (isStackBadges) {
    editorContent = (
      <StackBadgesEditor
        badges={stackBadges}
        pending={pending}
        needsInitialSave={stackBadgesNeedsInitialSave}
        onChange={setStackBadges}
        onSave={saveStackBadges}
      />
    )
  } else {
    editorContent = (
      <>
        <Fieldset legend={`FAQ — ${sectionLabel}`}>
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={addFaqEntry}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-200 hover:bg-white/5"
            >
              <Plus className="h-3.5 w-3.5" /> Dodaj pytanie
            </button>
          </div>

          {visibleFaqEntries.length === 0 ? (
            <p className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-neutral-500">
              Brak pytań w tej sekcji.
            </p>
          ) : (
            <ul className="space-y-3">
              {visibleFaqEntries.map((entry, index) => (
                <li key={entry._key ?? index} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs text-neutral-500">#{index + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="Wyżej"
                        onClick={() => moveFaqEntry(index, -1)}
                        disabled={index === 0}
                        className="rounded p-1 text-neutral-400 hover:bg-white/10 disabled:opacity-30"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Niżej"
                        onClick={() => moveFaqEntry(index, 1)}
                        disabled={index === visibleFaqEntries.length - 1}
                        className="rounded p-1 text-neutral-400 hover:bg-white/10 disabled:opacity-30"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Usuń"
                        onClick={() => removeFaqEntry(index)}
                        className="rounded p-1 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Field label="Pytanie">
                      <input
                        className={magazynInputClass}
                        value={entry.question}
                        onChange={(e) => updateFaqEntry(index, { question: e.target.value })}
                      />
                    </Field>
                    <Field label="Odpowiedź">
                      <textarea
                        className={magazynTextareaClass}
                        rows={4}
                        value={entry.answer}
                        onChange={(e) => updateFaqEntry(index, { answer: e.target.value })}
                      />
                    </Field>
                    <label className="flex items-center gap-2 text-sm text-neutral-400">
                      <input
                        type="checkbox"
                        checked={entry.isActive !== false}
                        onChange={(e) => updateFaqEntry(index, { isActive: e.target.checked })}
                        className="rounded border-white/20"
                      />
                      Aktywny na stronie
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Fieldset>
        <SaveButton pending={pending} label="Zapisz treści podstrony" onClick={saveFaq} />
      </>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="CMS" description={`FAQ (${faqCount} wpisów) · Treści (${contentCount})`} />
      <UndoRedoToolbar
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        isDirty={history.isDirty}
        onUndo={history.undo}
        onRedo={history.redo}
      />
      <DbBanner connected={dbConnected} />

      <TabPills tabs={moduleTabs} active={activeModule} onChange={setActiveModule} />

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <nav
          aria-label={activeModule === 'faq' ? 'Podstrony FAQ' : 'Typy treści'}
          className="flex shrink-0 flex-row flex-wrap gap-1 xl:w-48 xl:flex-col xl:gap-0.5"
        >
          {activeModule === 'faq'
            ? CMS_FAQ_PAGES.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => selectFaqPage(page.id)}
                  className={navButtonClass(activeFaqPageId === page.id)}
                >
                  {page.label}
                  <span className="ml-1 text-neutral-500">({faq[page.faqKey]?.length ?? 0})</span>
                </button>
              ))
            : CMS_CONTENT_PAGES.map((page) => {
                const count =
                  page.id === 'portfolio'
                    ? portfolio.length
                    : page.id === 'stack-badges'
                      ? stackBadges.length
                      : 0
                return (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => selectContentPage(page.id)}
                    className={navButtonClass(activeContentPageId === page.id)}
                  >
                    {page.label}
                    <span className="ml-1 text-neutral-500">({count})</span>
                  </button>
                )
              })}
        </nav>

        <div className="min-w-0 flex-1 space-y-5">
          <div>
            <h2 className="text-lg font-medium">
              {activeModule === 'faq' ? `FAQ — ${activeFaqPage.label}` : `Treści — ${activeContentPage.label}`}
            </h2>
            <p className="text-sm text-neutral-500">
              {activeModule === 'faq' ? activeFaqPage.path : activeContentPage.path}
            </p>
          </div>

          {activeModule === 'faq' && activeFaqPage.pricing ? (
            <TabPills
              tabs={pricingTabs}
              active={activeSectionId as FaqPricingCategory}
              onChange={(id) => setActiveSectionId(id)}
            />
          ) : null}

          {isPortfolio ? (
            <div className="space-y-4">
              {portfolioNeedsInitialSave ? (
                <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  Realizacje z domyślnej konfiguracji strony. Kliknij{' '}
                  <strong className="font-medium">Zapisz portfolio</strong>, aby przenieść je do bazy.
                </p>
              ) : null}
              <PortfolioListPicker
                items={portfolio.map((item) => ({
                  id: item.id,
                  name: item.name,
                  disabled: item.disabled,
                  caseStudyEnabled: item.caseStudyEnabled,
                }))}
                activeId={activePortfolioId}
                onSelect={setActivePortfolioId}
                onAdd={addPortfolio}
              />
            </div>
          ) : null}

          {editorContent}
        </div>
      </div>

      <StatusMessage message={status} error={error} />
    </div>
  )
}
