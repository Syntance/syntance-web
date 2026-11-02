'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  BTN_DANGER,
  BTN_PRIMARY,
  Badge,
  EmptyState,
  FilterSelect,
  Pagination,
  SearchBox,
  SkeletonRows,
  SortTh,
  TD,
  TH,
  TableWrap,
  api,
  errMsg,
  fmtDateTime,
  fmtMoney,
  useConfirm,
  useListState,
  useNotify,
  useRemoteList,
} from '@/components/magazyn/kit'
import { Field, magazynInputClass } from '@/components/magazyn/ui'
import { EntitlementPicker, PLAN_LABEL, type Entitlement, type Plan } from '@/components/magazyn/studio/common'
import { Modules } from '@/components/magazyn/studio-modules'

const KIND_LABEL: Record<string, string> = { purchase: 'Zakup', renewal: 'Odnowienie', refund: 'Zwrot', manual: 'Ręczne' }

interface OrderRow {
  id: string
  provider: string
  kind: string
  reference: string
  email: string
  amountTotal: number | null
  currency: string | null
  createdAt: string
}

export function OrdersList() {
  const state = useListState()
  const { data, error, loading } = useRemoteList<OrderRow>('/api/magazyn/studio/orders', state)
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchBox state={state} placeholder="Szukaj: e-mail, numer transakcji…" label="Szukaj zamówień" />
        <FilterSelect state={state} name="kind" label="Rodzaj" options={[{ value: 'all', label: 'Wszystkie rodzaje' }, ...Object.entries(KIND_LABEL).map(([value, label]) => ({ value, label }))]} />
      </div>
      {error ? <p role="alert" className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}
      <TableWrap caption="Zamówienia">
        <thead>
          <tr>
            <SortTh state={state} field="createdAt" defaultSort="createdAt">Data</SortTh>
            <th scope="col" className={TH}>Rodzaj</th>
            <th scope="col" className={TH}>Klient</th>
            <th scope="col" className={TH}>Kwota</th>
            <th scope="col" className={TH}>Dostawca / numer</th>
          </tr>
        </thead>
        {loading && !data ? (
          <SkeletonRows cols={5} />
        ) : (
          <tbody className="divide-y divide-white/5">
            {data?.rows.map((o) => (
              <tr key={o.id}>
                <td className={TD}>{fmtDateTime(o.createdAt)}</td>
                <td className={TD}><Badge tone={o.kind === 'refund' ? 'bad' : 'neutral'}>{KIND_LABEL[o.kind] ?? o.kind}</Badge></td>
                <td className={TD}>{o.email}</td>
                <td className={`${TD} tabular-nums`}>{fmtMoney(o.amountTotal, o.currency)}</td>
                <td className={`${TD} font-mono text-xs`}>{o.provider} · {o.reference}</td>
              </tr>
            ))}
          </tbody>
        )}
      </TableWrap>
      {data && data.rows.length === 0 ? <EmptyState title="Brak zamówień" hint="Zamówienia pojawią się po podłączeniu płatności (Paddle). Licencje wystawione ręcznie lub z kodu nie tworzą zamówień." /> : null}
      {data ? <Pagination state={state} data={data} /> : null}
    </div>
  )
}

interface AuditRow {
  id: string
  at: string
  actor: string
  action: string
  target: string
  meta: Record<string, unknown>
}

const ACTION_GROUPS = [
  { value: '', label: 'Wszystkie akcje' },
  { value: 'license.', label: 'Licencje' },
  { value: 'promo.', label: 'Kody promocyjne' },
  { value: 'customer.', label: 'Klienci (blokady)' },
  { value: 'subject.', label: 'RODO' },
  { value: 'price.', label: 'Ceny' },
  { value: 'module.', label: 'Moduły' },
  { value: 'catalog.', label: 'Katalog' },
]

export function AuditList() {
  const state = useListState()
  const { data, error, loading } = useRemoteList<AuditRow>('/api/magazyn/studio/audit', state)
  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-400">Kto, co i kiedy. Wpisy nie zawierają kluczy licencji, haseł ani adresów e-mail klientów (klient identyfikowany jest skrótem). Przechowywane 12 miesięcy.</p>
      <div className="flex flex-wrap items-center gap-2">
        <SearchBox state={state} placeholder="Szukaj: kto, akcja, cel…" label="Szukaj w audycie" />
        <FilterSelect state={state} name="action" label="Grupa akcji" options={ACTION_GROUPS} />
      </div>
      {error ? <p role="alert" className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}
      <TableWrap caption="Dziennik audytu">
        <thead>
          <tr>
            <SortTh state={state} field="at" defaultSort="at">Czas</SortTh>
            <th scope="col" className={TH}>Kto</th>
            <th scope="col" className={TH}>Akcja</th>
            <th scope="col" className={TH}>Cel</th>
            <th scope="col" className={TH}>Szczegóły</th>
          </tr>
        </thead>
        {loading && !data ? (
          <SkeletonRows cols={5} />
        ) : (
          <tbody className="divide-y divide-white/5">
            {data?.rows.map((a) => (
              <tr key={a.id}>
                <td className={`${TD} whitespace-nowrap`}>{fmtDateTime(a.at)}</td>
                <td className={TD}>{a.actor}</td>
                <td className={`${TD} font-mono text-xs`}>{a.action}</td>
                <td className={`${TD} font-mono text-xs`}>{a.target.slice(0, 12)}{a.target.length > 12 ? '…' : ''}</td>
                <td className={`${TD} max-w-xs truncate font-mono text-xs text-neutral-400`} title={JSON.stringify(a.meta)}>{Object.keys(a.meta).length ? JSON.stringify(a.meta) : '—'}</td>
              </tr>
            ))}
          </tbody>
        )}
      </TableWrap>
      {data && data.rows.length === 0 ? <EmptyState title="Brak wpisów dla tych filtrów" /> : null}
      {data ? <Pagination state={state} data={data} /> : null}
    </div>
  )
}

interface Price {
  priceId: string
  label: string
  plan: Plan
  entitlements: string[]
  updateMonths: number
}

export function Prices() {
  const { notify, node } = useNotify()
  const { confirm, dialog } = useConfirm()
  const [rows, setRows] = useState<Price[] | null>(null)
  const [f, setF] = useState({ priceId: '', label: '', plan: 'perpetual' as Plan, entitlements: ['pro'] as Entitlement[], updateMonths: 12 })

  const load = useCallback(async () => {
    try {
      setRows((await api<{ prices: Price[] }>('/api/magazyn/studio/prices')).prices)
    } catch (e) {
      notify(errMsg(e), true)
    }
  }, [notify])
  useEffect(() => {
    const t = setTimeout(() => void load(), 0)
    return () => clearTimeout(t)
  }, [load])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api('/api/magazyn/studio/prices', { method: 'PUT', body: JSON.stringify(f) })
      notify('Cena zapisana.')
      setF({ ...f, priceId: '', label: '' })
      await load()
    } catch (err) {
      notify(errMsg(err), true)
    }
  }
  const remove = async (p: Price) => {
    if (!(await confirm({ title: 'Usunąć mapowanie ceny?', body: `Zakupy z ceny „${p.label || p.priceId}” przestaną tworzyć licencje.`, confirmLabel: 'Usuń', danger: true }))) return
    try {
      await api(`/api/magazyn/studio/prices?priceId=${encodeURIComponent(p.priceId)}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      notify(errMsg(err), true)
    }
  }

  return (
    <div className="space-y-4">
      {dialog}
      <p className="text-sm text-neutral-400">Mapowanie price id z Paddle na to, co dostaje klient. Webhook ignoruje zakupy z nieznanym price id. Do czasu podłączenia Paddle wystawiaj licencje ręcznie.</p>
      {node}
      <form onSubmit={(e) => void save(e)} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Price id (pri_…)"><input className={`${magazynInputClass} font-mono`} required value={f.priceId} onChange={(e) => setF({ ...f, priceId: e.target.value })} /></Field>
          <Field label="Nazwa"><input className={magazynInputClass} placeholder="np. Pro wieczysta" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} /></Field>
          <Field label="Plan">
            <select className={magazynInputClass} value={f.plan} onChange={(e) => setF({ ...f, plan: e.target.value as Plan })}>
              <option value="perpetual">Wieczysta</option>
              <option value="subscription">Subskrypcja</option>
            </select>
          </Field>
          <Field label="Miesiące aktualizacji" hint="Dla wieczystej."><input className={magazynInputClass} type="number" min={1} max={120} value={f.updateMonths} onChange={(e) => setF({ ...f, updateMonths: Number(e.target.value) })} /></Field>
        </div>
        <EntitlementPicker value={f.entitlements} onChange={(entitlements) => setF({ ...f, entitlements })} />
        <button type="submit" className={BTN_PRIMARY} disabled={f.entitlements.length === 0}>Zapisz cenę</button>
      </form>
      <TableWrap caption="Mapowanie cen">
        <thead><tr>{['Price id', 'Nazwa', 'Plan', 'Uprawnienia', 'Aktualizacje', ''].map((h) => <th key={h} scope="col" className={TH}>{h || <span className="sr-only">Akcje</span>}</th>)}</tr></thead>
        <tbody className="divide-y divide-white/5">
          {rows?.map((p) => (
            <tr key={p.priceId}>
              <td className={`${TD} font-mono text-xs`}>{p.priceId}</td>
              <td className={TD}>{p.label}</td>
              <td className={TD}>{PLAN_LABEL[p.plan]}</td>
              <td className={TD}>{p.entitlements.join(', ')}</td>
              <td className={TD}>{p.plan === 'perpetual' ? `${p.updateMonths} mies.` : 'okres subskrypcji'}</td>
              <td className={`${TD} text-right`}><button type="button" className={BTN_DANGER} onClick={() => void remove(p)}>Usuń</button></td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
      {rows && rows.length === 0 ? <EmptyState title="Brak mapowań cen" hint="Dodaj je po utworzeniu produktów w Paddle." /> : null}
    </div>
  )
}

export function ModulesPage() {
  const { notify, node } = useNotify()
  return (
    <div className="space-y-4">
      {node}
      <Modules notify={notify} />
    </div>
  )
}

