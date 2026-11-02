'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import {
  BTN,
  BTN_DANGER,
  Badge,
  Breadcrumb,
  Card,
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
  fmtDate,
  fmtDateTime,
  fmtMoney,
  useConfirm,
  useListState,
  useNotify,
  useRemoteList,
} from '@/components/magazyn/kit'
import { Field, magazynInputClass } from '@/components/magazyn/ui'
import { EntitlementBadges, PLAN_LABEL, StateBadge, licenseState, type Plan } from '@/components/magazyn/studio/common'
import { IssueLicenseButton } from '@/components/magazyn/studio/licenses'

interface CustomerRow {
  id: string
  email: string
  licenses: number
  active: number
  devices: number
  blocked: boolean
  firstSeen: string
}

export function CustomersList() {
  const state = useListState()
  const { data, error, loading } = useRemoteList<CustomerRow>('/api/magazyn/studio/customers', state)
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchBox state={state} placeholder="Szukaj po e-mailu…" label="Szukaj klientów" />
        <FilterSelect state={state} name="blocked" label="Blokada" options={[{ value: 'all', label: 'Wszyscy' }, { value: 'yes', label: 'Tylko zablokowani' }]} />
      </div>
      {error ? <p role="alert" className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}
      <TableWrap caption="Klienci">
        <thead>
          <tr>
            <SortTh state={state} field="email" defaultSort="firstSeen">Klient</SortTh>
            <SortTh state={state} field="licenses" defaultSort="firstSeen">Licencje</SortTh>
            <th scope="col" className={TH}>Aktywne</th>
            <th scope="col" className={TH}>Urządzenia</th>
            <th scope="col" className={TH}>Status</th>
            <SortTh state={state} field="firstSeen" defaultSort="firstSeen">Od</SortTh>
          </tr>
        </thead>
        {loading && !data ? (
          <SkeletonRows cols={6} />
        ) : (
          <tbody className="divide-y divide-white/5">
            {data?.rows.map((c) => (
              <tr key={c.id} className="hover:bg-white/[0.03]">
                <td className={TD}>
                  <Link href={`/magazyn/studio/klienci/${c.id}`} className="font-medium text-white underline-offset-2 hover:underline">{c.email}</Link>
                </td>
                <td className={`${TD} tabular-nums`}>{c.licenses}</td>
                <td className={`${TD} tabular-nums`}>{c.active}</td>
                <td className={`${TD} tabular-nums`}>{c.devices}</td>
                <td className={TD}>{c.blocked ? <Badge tone="bad">Zablokowany</Badge> : <Badge tone="good">OK</Badge>}</td>
                <td className={TD}>{fmtDate(c.firstSeen)}</td>
              </tr>
            ))}
          </tbody>
        )}
      </TableWrap>
      {data && data.rows.length === 0 ? (
        <EmptyState title="Brak klientów" hint="Klient pojawia się, gdy dostanie pierwszą licencję (zakup, kod lub ręcznie)." />
      ) : null}
      {data ? <Pagination state={state} data={data} /> : null}
    </div>
  )
}

interface CustomerDetailData {
  id: string
  email: string
  blocked: boolean
  blockedReason: string
  licenses: { id: string; key: string; plan: Plan; entitlements: string[]; status: 'active' | 'revoked'; maxDevices: number; updatesUntil: string; expiresAt: string | null; createdAt: string }[]
  devices: { licenseId: string; deviceId: string; name: string; lastSeen: string }[]
  orders: { id: string; kind: string; amountTotal: number | null; currency: string | null; createdAt: string }[]
  redemptions: { code: string; at: string; source: string }[]
  audit: { id: string; at: string; actor: string; action: string }[]
}

export function CustomerDetail({ id }: { id: string }) {
  const { notify, node } = useNotify()
  const { confirm, dialog } = useConfirm()
  const [d, setD] = useState<CustomerDetailData | null>(null)
  const [missing, setMissing] = useState(false)
  const [reason, setReason] = useState('')

  const load = useCallback(async () => {
    try {
      setD(await api<CustomerDetailData>(`/api/magazyn/studio/customers?id=${id}`))
    } catch (e) {
      if (errMsg(e).includes('Nie znaleziono')) setMissing(true)
      else notify(errMsg(e), true)
    }
  }, [id, notify])
  useEffect(() => {
    const t = setTimeout(() => void load(), 0)
    return () => clearTimeout(t)
  }, [load])

  if (missing) return <EmptyState title="Nie znaleziono klienta" action={<Link className={BTN} href="/magazyn/studio/klienci">Wróć do listy</Link>} />
  if (!d) return <p className="text-sm text-neutral-400" role="status">Wczytuję…</p>

  const setBlocked = async (blocked: boolean) => {
    try {
      await api('/api/magazyn/studio/customers', { method: 'PATCH', body: JSON.stringify({ email: d.email, blocked, reason }) })
      notify(blocked ? 'Klient zablokowany — jego licencje odmówią aktywacji i odświeżenia.' : 'Klient odblokowany.')
      setReason('')
      await load()
    } catch (e) {
      notify(errMsg(e), true)
    }
  }

  const exportData = async () => {
    try {
      const data = await api<unknown>(`/api/magazyn/studio/customers?export=${encodeURIComponent(d.email)}`)
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `dane-klienta-${d.id.slice(0, 8)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      notify(errMsg(e), true)
    }
  }

  const erase = async () => {
    if (!(await confirm({ title: 'Wymazać dane klienta (RODO)?', body: 'E-mail i nazwy urządzeń zostaną zanonimizowane, a wszystkie licencje unieważnione. Zamówienia zostają bez e-maila (obowiązek księgowy). Tego nie da się cofnąć.', confirmLabel: 'Wymaż dane', danger: true }))) return
    try {
      await api(`/api/magazyn/studio/customers?email=${encodeURIComponent(d.email)}`, { method: 'DELETE' })
      notify('Dane zanonimizowane.')
      setMissing(true)
    } catch (e) {
      notify(errMsg(e), true)
    }
  }

  return (
    <div className="space-y-5">
      {dialog}
      <Breadcrumb items={[{ href: '/magazyn/studio/klienci', label: 'Klienci' }, { label: d.email }]} />
      {node}
      <Card
        title={d.email}
        actions={<div className="flex gap-2">{d.blocked ? <Badge tone="bad">Zablokowany</Badge> : <Badge tone="good">Bez blokady</Badge>}</div>}
      >
        {d.blocked ? (
          <div className="space-y-3">
            <p className="text-sm text-neutral-300">Powód blokady: {d.blockedReason || '—'}</p>
            <button type="button" className={BTN} onClick={() => void setBlocked(false)}>Odblokuj klienta</button>
          </div>
        ) : (
          <div className="flex flex-wrap items-end gap-2">
            <Field label="Powód blokady (wewnętrzny)">
              <input className={`${magazynInputClass} w-72 max-w-full`} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />
            </Field>
            <button
              type="button"
              className={BTN_DANGER}
              onClick={async () => {
                if (await confirm({ title: 'Zablokować klienta?', body: `Wszystkie licencje ${d.email} przestaną być aktywowane i odświeżane. Możesz odblokować w każdej chwili.`, confirmLabel: 'Zablokuj', danger: true })) await setBlocked(true)
              }}
            >
              Zablokuj klienta
            </button>
          </div>
        )}
        <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          <IssueLicenseButton presetEmail={d.email} onDone={() => void load()} />
          <button type="button" className={BTN} onClick={() => void exportData()}>Eksport danych (RODO)</button>
          <button type="button" className={BTN_DANGER} onClick={() => void erase()}>Wymaż dane (RODO)</button>
        </div>
      </Card>

      <Card title={`Licencje (${d.licenses.length})`}>
        <TableWrap caption="Licencje klienta">
          <thead>
            <tr>{['Plan', 'Uprawnienia', 'Status', 'Urządzenia', 'Do'].map((h) => <th key={h} scope="col" className={TH}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {d.licenses.map((l) => (
              <tr key={l.id}>
                <td className={TD}><Link href={`/magazyn/studio/licencje/${l.id}`} className="underline-offset-2 hover:underline">{PLAN_LABEL[l.plan]}</Link></td>
                <td className={TD}><EntitlementBadges list={l.entitlements} /></td>
                <td className={TD}><StateBadge state={licenseState(l, d.blocked)} /></td>
                <td className={`${TD} tabular-nums`}>{d.devices.filter((x) => x.licenseId === l.id).length} / {l.maxDevices}</td>
                <td className={TD}>{fmtDate(l.plan === 'subscription' ? l.expiresAt : l.updatesUntil)}</td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Urządzenia">
          {d.devices.length === 0 ? <EmptyState title="Brak aktywowanych urządzeń" /> : (
            <ul className="space-y-2 text-sm">
              {d.devices.map((x) => (
                <li key={x.deviceId} className="flex justify-between gap-3"><span>{x.name || 'Bez nazwy'}</span><span className="text-neutral-400">{fmtDateTime(x.lastSeen)}</span></li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Zamówienia i kody">
          {d.orders.length === 0 && d.redemptions.length === 0 ? <EmptyState title="Brak zamówień ani kodów" /> : (
            <ul className="space-y-2 text-sm">
              {d.orders.map((o) => <li key={o.id} className="flex justify-between gap-3"><span>{o.kind}</span><span className="text-neutral-400">{fmtMoney(o.amountTotal, o.currency)} · {fmtDate(o.createdAt)}</span></li>)}
              {d.redemptions.map((r) => <li key={r.code} className="flex justify-between gap-3"><span>Kod {r.code}</span><span className="text-neutral-400">{fmtDate(r.at)}</span></li>)}
            </ul>
          )}
        </Card>
      </div>
      <Card title="Historia">
        {d.audit.length === 0 ? <EmptyState title="Brak wpisów" /> : (
          <ul className="space-y-2 text-sm">
            {d.audit.map((a) => <li key={a.id} className="flex justify-between gap-3"><span>{a.action} <span className="text-neutral-500">· {a.actor}</span></span><span className="shrink-0 text-neutral-400">{fmtDateTime(a.at)}</span></li>)}
          </ul>
        )}
      </Card>
    </div>
  )
}
