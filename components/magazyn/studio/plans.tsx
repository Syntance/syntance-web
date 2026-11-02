'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import {
  BTN,
  BTN_DANGER,
  BTN_PRIMARY,
  Badge,
  Card,
  EmptyState,
  Modal,
  TD,
  TH,
  TableWrap,
  api,
  errMsg,
  useConfirm,
  useNotify,
} from '@/components/magazyn/kit'
import { Field, magazynInputClass } from '@/components/magazyn/ui'
import { PLAN_LABEL, type Entitlement, type Plan } from '@/components/magazyn/studio/common'

export interface Feature {
  key: string
  label: string
  entitlement: Entitlement | null
}

export interface PlanRow {
  id: string
  slug: string
  name: string
  description: string
  kind: 'paid' | 'free'
  billing: Plan
  updateMonths: number
  maxDevices: number
  priceAmount: number | null
  priceCurrency: string | null
  features: string[]
  active: boolean
  sortOrder: number
  licenseCount: number
}

const GROUPS: { id: Entitlement | 'free'; label: string }[] = [
  { id: 'free', label: 'Darmowe w aplikacji' },
  { id: 'pro', label: 'Pro' },
  { id: 'print', label: 'Print' },
  { id: 'vector', label: 'Wektor' },
  { id: 'image', label: 'Obraz' },
]

const ENT_ORDER: Entitlement[] = ['pro', 'print', 'vector', 'image']
export function deriveEnts(keys: string[], catalog: Feature[]): Entitlement[] {
  const wanted = new Set(catalog.filter((f) => f.entitlement && keys.includes(f.key)).map((f) => f.entitlement))
  return ENT_ORDER.filter((e) => wanted.has(e))
}

export function useFeatureCatalog() {
  const [features, setFeatures] = useState<Feature[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const reload = useCallback(async () => {
    try {
      setFeatures((await api<{ features: Feature[] }>('/api/magazyn/studio/features')).features)
      setError(null)
    } catch (e) {
      setError(errMsg(e))
    }
  }, [])
  useEffect(() => {
    const t = setTimeout(() => void reload(), 0)
    return () => clearTimeout(t)
  }, [reload])
  return { features, error, reload }
}

/** Wybór funkcji pogrupowany po uprawnieniu; „zaznacz grupę” przyspiesza składanie planu. */
export function FeaturePicker({ catalog, value, onChange }: { catalog: Feature[]; value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (key: string, on: boolean) => onChange(on ? [...value, key] : value.filter((k) => k !== key))
  return (
    <div className="space-y-4">
      {GROUPS.map((g) => {
        const items = catalog.filter((f) => (f.entitlement ?? 'free') === g.id)
        if (items.length === 0) return null
        const all = items.every((f) => value.includes(f.key))
        return (
          <fieldset key={g.id} className="rounded-xl border border-white/10 p-3">
            <legend className="px-1 text-sm font-medium text-neutral-200">{g.label}</legend>
            <button
              type="button"
              className="mb-2 text-xs text-purple-300 underline-offset-2 hover:underline"
              onClick={() => onChange(all ? value.filter((k) => !items.some((f) => f.key === k)) : [...new Set([...value, ...items.map((f) => f.key)])])}
            >
              {all ? 'Odznacz całą grupę' : 'Zaznacz całą grupę'}
            </button>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {items.map((f) => (
                <label key={f.key} className="flex min-h-[36px] cursor-pointer items-center gap-2 text-sm text-neutral-200">
                  <input type="checkbox" className="h-4 w-4 accent-purple-500" checked={value.includes(f.key)} onChange={(e) => toggle(f.key, e.target.checked)} />
                  {f.label}
                </label>
              ))}
            </div>
          </fieldset>
        )
      })}
    </div>
  )
}

/* ───────────── Plany ───────────── */

interface Draft {
  id: string | null
  kind: 'paid' | 'free'
  slug: string
  name: string
  description: string
  billing: Plan
  updateMonths: number
  maxDevices: number
  price: string
  currency: string
  features: string[]
  active: boolean
  sortOrder: number
}

const EMPTY: Draft = { id: null, kind: 'paid', slug: '', name: '', description: '', billing: 'perpetual', updateMonths: 12, maxDevices: 2, price: '', currency: 'EUR', features: [], active: true, sortOrder: 10 }

function PlanModal({ draft, catalog, onClose, onSaved }: { draft: Draft | null; catalog: Feature[]; onClose: () => void; onSaved: () => void }) {
  const { notify, node } = useNotify()
  const [f, setF] = useState<Draft>(draft ?? EMPTY)
  const [pending, setPending] = useState(false)
  useEffect(() => {
    if (draft) setF(draft)
  }, [draft])
  const free = f.kind === 'free'

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setPending(true)
    try {
      const priced = f.price.trim() !== ''
      const body = { name: f.name, description: f.description, billing: f.billing, updateMonths: f.updateMonths, maxDevices: f.maxDevices, priceAmount: priced ? Math.round(Number(f.price.replace(',', '.')) * 100) : null, priceCurrency: priced ? f.currency.toUpperCase() : null, features: f.features, active: f.active, sortOrder: f.sortOrder }
      if (f.id) await api(`/api/magazyn/studio/plans/${f.id}`, { method: 'PATCH', body: JSON.stringify(free ? { name: f.name, description: f.description, features: f.features } : body) })
      else await api('/api/magazyn/studio/plans', { method: 'POST', body: JSON.stringify({ slug: f.slug, ...body }) })
      onSaved()
      onClose()
    } catch (err) {
      notify(errMsg(err), true)
    } finally {
      setPending(false)
    }
  }

  return (
    <Modal open={draft !== null} onClose={onClose} title={f.id ? `Plan: ${f.name}` : 'Nowy plan'}>
      <form onSubmit={(e) => void save(e)} className="space-y-4">
        {free ? (
          <p className="rounded-lg border border-purple-400/30 bg-purple-500/10 px-3 py-2 text-sm text-purple-100">
            Plan Free określa, co działa bez licencji. Aplikacja desktopowa na razie ma te funkcje wpisane na stałe — zmiany tutaj zaczną działać po aktualizacji aplikacji, która czyta zakres z panelu.
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nazwa"><input className={magazynInputClass} required maxLength={80} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Identyfikator (slug)" hint={f.id ? 'Nie można zmienić.' : 'a–z, 0–9, myślnik.'}>
            <input className={`${magazynInputClass} font-mono`} required disabled={Boolean(f.id)} pattern="[a-z0-9][a-z0-9\-]{1,39}" value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} />
          </Field>
        </div>
        <Field label="Opis (wewnętrzny)"><input className={magazynInputClass} maxLength={300} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        {!free && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Rozliczenie">
              <select className={magazynInputClass} value={f.billing} onChange={(e) => setF({ ...f, billing: e.target.value as Plan })}>
                <option value="perpetual">Wieczysta</option>
                <option value="subscription">Subskrypcja</option>
              </select>
            </Field>
            <Field label={f.billing === 'perpetual' ? 'Miesięcy aktualizacji' : 'Miesięcy okresu'}>
              <input className={magazynInputClass} type="number" min={1} max={120} value={f.updateMonths} onChange={(e) => setF({ ...f, updateMonths: Number(e.target.value) })} />
            </Field>
            <Field label="Liczba urządzeń">
              <input className={magazynInputClass} type="number" min={1} max={10} value={f.maxDevices} onChange={(e) => setF({ ...f, maxDevices: Number(e.target.value) })} />
            </Field>
          </div>
        )}
        {!free && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cena na stronie" hint="Tylko do wyświetlenia na landingu. Puste = bez ceny. Zakup wymaga ceny w Paddle (zakładka Ceny).">
              <input className={magazynInputClass} inputMode="decimal" pattern="[0-9]+([.,][0-9]{1,2})?" placeholder="np. 59" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
            </Field>
            <Field label="Waluta (ISO)">
              <input className={`${magazynInputClass} uppercase`} maxLength={3} pattern="[A-Za-z]{3}" value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value })} />
            </Field>
          </div>
        )}
        <div>
          <p className="mb-2 text-sm font-medium text-neutral-300">Moduły i funkcje w planie</p>
          <FeaturePicker catalog={catalog} value={f.features} onChange={(features) => setF({ ...f, features })} />
        </div>
        {!free && (
          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input type="checkbox" className="h-4 w-4 accent-purple-500" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} />
            Plan aktywny (można z niego wystawiać licencje)
          </label>
        )}
        {node}
        <div className="flex justify-end">
          <button type="submit" className={BTN_PRIMARY} disabled={pending}>{pending ? 'Zapisuję…' : 'Zapisz plan'}</button>
        </div>
      </form>
    </Modal>
  )
}

export function PlansPage() {
  const { notify, node } = useNotify()
  const { confirm, dialog } = useConfirm()
  const { features: catalog, error } = useFeatureCatalog()
  const [plans, setPlans] = useState<PlanRow[] | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)

  const load = useCallback(async () => {
    try {
      setPlans((await api<{ plans: PlanRow[] }>('/api/magazyn/studio/plans')).plans)
    } catch (e) {
      notify(errMsg(e), true)
    }
  }, [notify])
  useEffect(() => {
    const t = setTimeout(() => void load(), 0)
    return () => clearTimeout(t)
  }, [load])

  const labelOf = useMemo(() => new Map((catalog ?? []).map((f) => [f.key, f.label])), [catalog])

  const remove = async (p: PlanRow) => {
    const ok = await confirm({
      title: `Usunąć plan „${p.name}”?`,
      body: p.licenseCount > 0 ? `${p.licenseCount} wystawionych licencji zachowa swój zakres (mają własną kopię) i straci tylko powiązanie z planem.` : 'Plan nie ma wystawionych licencji.',
      confirmLabel: 'Usuń plan',
      danger: true,
    })
    if (!ok) return
    try {
      await api(`/api/magazyn/studio/plans/${p.id}`, { method: 'DELETE' })
      notify('Plan usunięty.')
      await load()
    } catch (e) {
      notify(errMsg(e), true)
    }
  }

  const edit = (p: PlanRow) => setDraft({ id: p.id, kind: p.kind, slug: p.slug, name: p.name, description: p.description, billing: p.billing, updateMonths: p.updateMonths, maxDevices: p.maxDevices, price: p.priceAmount === null ? '' : String(p.priceAmount / 100), currency: p.priceCurrency ?? 'EUR', features: p.features, active: p.active, sortOrder: p.sortOrder })

  return (
    <div className="space-y-4">
      {dialog}
      {node}
      {error ? <p role="alert" className="text-sm text-red-200">{error}</p> : null}
      <div className="flex justify-end">
        <button type="button" className={BTN_PRIMARY} disabled={!catalog} onClick={() => setDraft(EMPTY)}>
          <Plus className="h-4 w-4" aria-hidden />
          Nowy plan
        </button>
      </div>
      {plans && plans.length === 0 ? <EmptyState title="Brak planów" /> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {plans?.map((p) => (
          <Card
            key={p.id}
            title={p.name}
            actions={
              <div className="flex flex-wrap gap-2">
                {p.kind === 'free' ? <Badge tone="info">Bez licencji</Badge> : <Badge>{PLAN_LABEL[p.billing]}</Badge>}
                {!p.active ? <Badge tone="warn">Nieaktywny</Badge> : null}
              </div>
            }
          >
            {p.description ? <p className="mb-3 text-sm text-neutral-400">{p.description}</p> : null}
            {p.kind === 'paid' ? (
              <p className="mb-3 text-sm text-neutral-300">
                {p.priceAmount !== null ? `${(p.priceAmount / 100).toFixed(2)} ${p.priceCurrency} · ` : ''}{p.maxDevices} urządz. · {p.billing === 'perpetual' ? `${p.updateMonths} mies. aktualizacji` : `okres ${p.updateMonths} mies.`} · wystawiono: {p.licenseCount}
              </p>
            ) : null}
            <ul className="mb-4 flex flex-wrap gap-1.5" aria-label="Funkcje planu">
              {p.features.map((k) => (
                <li key={k}><Badge tone="neutral">{labelOf.get(k) ?? k}</Badge></li>
              ))}
              {p.features.length === 0 ? <li className="text-sm text-neutral-500">Brak funkcji</li> : null}
            </ul>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={BTN} onClick={() => edit(p)}>Edytuj</button>
              {p.kind === 'paid' ? <button type="button" className={BTN_DANGER} onClick={() => void remove(p)}>Usuń</button> : null}
            </div>
          </Card>
        ))}
      </div>
      <PlanModal draft={draft} catalog={catalog ?? []} onClose={() => setDraft(null)} onSaved={() => { notify('Plan zapisany.'); void load() }} />
    </div>
  )
}

/* ───────────── Katalog funkcji ───────────── */

export function FeaturesPage() {
  const { notify, node } = useNotify()
  const { confirm, dialog } = useConfirm()
  const { features, error, reload } = useFeatureCatalog()
  const [f, setF] = useState({ key: '', label: '', entitlement: 'pro' as Entitlement | 'free' })

  const save = async (e: React.FormEvent, input = f) => {
    e.preventDefault()
    try {
      await api('/api/magazyn/studio/features', { method: 'PUT', body: JSON.stringify({ key: input.key, label: input.label, entitlement: input.entitlement === 'free' ? null : input.entitlement }) })
      notify('Funkcja zapisana.')
      setF({ key: '', label: '', entitlement: 'pro' })
      await reload()
    } catch (err) {
      notify(errMsg(err), true)
    }
  }

  const remove = async (feat: Feature) => {
    if (!(await confirm({ title: `Usunąć funkcję „${feat.label}”?`, body: 'Funkcję można usunąć tylko, gdy żaden plan jej nie zawiera.', confirmLabel: 'Usuń', danger: true }))) return
    try {
      await api(`/api/magazyn/studio/features?key=${encodeURIComponent(feat.key)}`, { method: 'DELETE' })
      await reload()
    } catch (err) {
      notify(errMsg(err), true)
    }
  }

  return (
    <div className="space-y-4">
      {dialog}
      <p className="text-sm text-neutral-400">
        Lista modułów i funkcji, z których składasz plany. Klucz musi odpowiadać identyfikatorowi modułu w aplikacji. „Uprawnienie” to grupa, której wymaga dziś aplikacja (starsze wersje używają tylko jej).
      </p>
      {node}
      {error ? <p role="alert" className="text-sm text-red-200">{error}</p> : null}
      <form onSubmit={(e) => void save(e)} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-4">
        <Field label="Klucz (id modułu)"><input className={`${magazynInputClass} font-mono`} required pattern="[a-z][a-z0-9\-]{1,39}" value={f.key} onChange={(e) => setF({ ...f, key: e.target.value })} /></Field>
        <Field label="Nazwa"><input className={magazynInputClass} required maxLength={100} value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} /></Field>
        <Field label="Uprawnienie">
          <select className={magazynInputClass} value={f.entitlement} onChange={(e) => setF({ ...f, entitlement: e.target.value as Entitlement | 'free' })}>
            {GROUPS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
          </select>
        </Field>
        <div className="flex items-end"><button type="submit" className={BTN_PRIMARY}>Zapisz funkcję</button></div>
      </form>
      <TableWrap caption="Katalog funkcji">
        <thead><tr>{['Klucz', 'Nazwa', 'Uprawnienie', ''].map((h) => <th key={h} scope="col" className={TH}>{h || <span className="sr-only">Akcje</span>}</th>)}</tr></thead>
        <tbody className="divide-y divide-white/5">
          {features?.map((feat) => (
            <tr key={feat.key}>
              <td className={`${TD} font-mono text-xs`}>{feat.key}</td>
              <td className={TD}>{feat.label}</td>
              <td className={TD}><Badge tone={feat.entitlement ? 'info' : 'good'}>{GROUPS.find((g) => g.id === (feat.entitlement ?? 'free'))?.label}</Badge></td>
              <td className={`${TD} space-x-2 text-right`}>
                <button type="button" className={BTN} onClick={() => setF({ key: feat.key, label: feat.label, entitlement: feat.entitlement ?? 'free' })}>Edytuj</button>
                <button type="button" className={BTN_DANGER} onClick={() => void remove(feat)}>Usuń</button>
              </td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  )
}
