'use client'

import { useState } from 'react'
import type { PageSeo, SeoSettings } from '@/lib/data/seo-types'
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

const GLOBAL_FIELDS: Array<{ key: keyof SeoSettings; label: string; long?: boolean }> = [
  { key: 'metaTitle', label: 'Meta title' },
  { key: 'metaTitleTemplate', label: 'Szablon tytułu (%s = tytuł podstrony)' },
  { key: 'metaDescription', label: 'Meta description', long: true },
  { key: 'canonicalUrl', label: 'Canonical URL' },
  { key: 'ogTitle', label: 'OG title' },
  { key: 'ogDescription', label: 'OG description', long: true },
  { key: 'ogImageUrl', label: 'OG image URL' },
  { key: 'twitterTitle', label: 'Twitter title' },
  { key: 'twitterDescription', label: 'Twitter description', long: true },
  { key: 'organizationName', label: 'Nazwa organizacji (Schema.org)' },
  { key: 'organizationDescription', label: 'Opis organizacji', long: true },
  { key: 'contactEmail', label: 'E-mail kontaktowy' },
  { key: 'contactPhone', label: 'Telefon' },
]

const PAGE_FIELDS: Array<{ key: keyof PageSeo; label: string; long?: boolean }> = [
  { key: 'metaTitle', label: 'Meta title' },
  { key: 'metaDescription', label: 'Meta description', long: true },
  { key: 'canonicalUrl', label: 'Canonical URL' },
  { key: 'focusKeyword', label: 'Focus keyword' },
  { key: 'ogTitle', label: 'OG title' },
  { key: 'ogDescription', label: 'OG description', long: true },
  { key: 'ogImageUrl', label: 'OG image URL' },
  { key: 'seoNotes', label: 'Notatki wewnętrzne', long: true },
]

type Props = {
  globalSeo: SeoSettings
  pages: PageSeo[]
  dbConnected: boolean
}

export function SeoClient({ globalSeo, pages, dbConnected }: Props) {
  const [tab, setTab] = useState<'global' | 'pages'>('global')
  const [globalForm, setGlobalForm] = useState(globalSeo)
  const [pagesForm, setPagesForm] = useState(pages)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(pages[0]?.slug ?? null)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [pending, setPending] = useState(false)

  const selectedPage = pagesForm.find((p) => p.slug === selectedSlug) ?? null
  const selectedIndex = pagesForm.findIndex((p) => p.slug === selectedSlug)

  async function saveGlobal() {
    setPending(true)
    setStatus(null)
    setError(false)
    try {
      const res = await fetch('/api/magazyn/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(globalForm),
      })
      if (!res.ok) throw new Error('Zapis globalnego SEO nie powiódł się')
      setStatus('Zapisano ustawienia globalne.')
    } catch (e) {
      setError(true)
      setStatus(e instanceof Error ? e.message : 'Błąd')
    } finally {
      setPending(false)
    }
  }

  async function savePage() {
    if (!selectedPage) return
    setPending(true)
    setStatus(null)
    setError(false)
    try {
      const res = await fetch('/api/magazyn/seo/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedPage),
      })
      if (!res.ok) throw new Error('Zapis SEO podstrony nie powiódł się')
      const updated = (await res.json()) as PageSeo
      setPagesForm((prev) => prev.map((p) => (p.slug === updated.slug ? updated : p)))
      setStatus(`Zapisano SEO: ${selectedPage.pageName}.`)
    } catch (e) {
      setError(true)
      setStatus(e instanceof Error ? e.message : 'Błąd')
    } finally {
      setPending(false)
    }
  }

  function updatePage(patch: Partial<PageSeo>) {
    if (selectedIndex < 0) return
    setPagesForm((prev) => prev.map((p, i) => (i === selectedIndex ? { ...p, ...patch } : p)))
  }

  return (
    <div className="space-y-6">
      <PageHeader title="SEO" description="Globalne meta tagi i Schema.org" />
      <DbBanner connected={dbConnected} />

      <TabPills
        tabs={[
          { id: 'global', label: 'Globalne' },
          { id: 'pages', label: `Podstrony (${pagesForm.length})` },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'global' ? (
        <div className="max-w-2xl space-y-5">
          <Fieldset legend="Ustawienia globalne">
            {GLOBAL_FIELDS.map(({ key, label, long }) => (
              <Field key={key} label={label}>
                {long ? (
                  <textarea
                    className={magazynTextareaClass}
                    rows={3}
                    value={String(globalForm[key] ?? '')}
                    onChange={(e) => setGlobalForm({ ...globalForm, [key]: e.target.value })}
                  />
                ) : (
                  <input
                    className={magazynInputClass}
                    value={String(globalForm[key] ?? '')}
                    onChange={(e) => setGlobalForm({ ...globalForm, [key]: e.target.value })}
                  />
                )}
              </Field>
            ))}
          </Fieldset>
          <SaveButton pending={pending} label="Zapisz globalne SEO" onClick={saveGlobal} />
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row">
          <nav className="flex shrink-0 flex-col gap-0.5 lg:w-56">
            {pagesForm.length === 0 ? (
              <p className="rounded-lg border border-dashed border-white/10 p-4 text-sm text-neutral-500">
                Brak wpisów w bazie. Na produkcji dane są po migracji z Sanity — lokalnie dodaj{' '}
                <code className="text-neutral-400">DATABASE_URL</code> do .env.local.
              </p>
            ) : (
              pagesForm.map((p) => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => setSelectedSlug(p.slug)}
                  className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    selectedSlug === p.slug ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5'
                  }`}
                >
                  <span className="block font-medium">{p.pageName}</span>
                  <span className="text-xs text-neutral-500">{p.slug}</span>
                </button>
              ))
            )}
          </nav>

          {selectedPage ? (
            <div className="min-w-0 flex-1 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-medium">{selectedPage.pageName}</h2>
                <label className="flex items-center gap-2 text-sm text-neutral-400">
                  <input
                    type="checkbox"
                    checked={selectedPage.isActive}
                    onChange={(e) => updatePage({ isActive: e.target.checked })}
                  />
                  Aktywna
                </label>
              </div>

              <Fieldset legend="Meta podstrony">
                {PAGE_FIELDS.map(({ key, label, long }) => (
                  <Field key={key} label={label}>
                    {long ? (
                      <textarea
                        className={magazynTextareaClass}
                        rows={3}
                        value={String(selectedPage[key] ?? '')}
                        onChange={(e) => updatePage({ [key]: e.target.value })}
                      />
                    ) : (
                      <input
                        className={magazynInputClass}
                        value={String(selectedPage[key] ?? '')}
                        onChange={(e) => updatePage({ [key]: e.target.value })}
                      />
                    )}
                  </Field>
                ))}
              </Fieldset>

              <SaveButton pending={pending} label="Zapisz SEO podstrony" onClick={savePage} />
            </div>
          ) : null}
        </div>
      )}

      <StatusMessage message={status} error={error} />
    </div>
  )
}
