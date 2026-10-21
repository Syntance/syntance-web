'use client'

import { useCallback, useEffect, useState } from 'react'
import { magazynInputClass, PageHeader, StatusMessage, TabPills } from '@/components/magazyn/ui'

const ENTITLEMENTS = ['pro', 'print', 'vector', 'image'] as const
type Entitlement = (typeof ENTITLEMENTS)[number]
type Tab = 'licenses' | 'customers' | 'orders' | 'prices' | 'audit'

interface LicenseRow {
  id: string
  key: string
  email: string
  plan: 'perpetual' | 'subscription'
  entitlements: string[]
  status: 'active' | 'revoked'
  maxDevices: number
  deviceCount: number
  updatesUntil: string
  expiresAt: string | null
  source: string | null
  createdAt: string
}
interface DeviceRow {
  deviceId: string
  name: string
  activatedAt: string
  lastSeen: string
}
interface Detail {
  license: LicenseRow & { devices: DeviceRow[]; note: string }
  orders: { id: string; kind: string; amountTotal: number | null; currency: string | null; createdAt: string }[]
  audit: { id: string; at: string; actor: string; action: string }[]
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } })
  const data = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) throw new Error(data.error ?? `Błąd ${res.status}`)
  return data
}

const fmt = (iso: string | null): string => (iso ? new Date(iso).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) : '—')
const money = (total: number | null, currency: string | null): string =>
  total === null || !currency ? '—' : `${(total / 100).toFixed(2)} ${currency}`

const TH = 'px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-neutral-500'
const TD = 'px-3 py-2 text-sm text-neutral-200'
const BTN = 'rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-200 transition-colors hover:bg-white/10 disabled:opacity-50'

function EntitlementPicker({ value, onChange }: { value: Entitlement[]; onChange: (v: Entitlement[]) => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      {ENTITLEMENTS.map((e) => (
        <label key={e} className="flex items-center gap-1.5 text-sm text-neutral-300">
          <input
            type="checkbox"
            checked={value.includes(e)}
            onChange={(ev) => onChange(ev.target.checked ? [...value, e] : value.filter((x) => x !== e))}
          />
          {e}
        </label>
      ))}
    </div>
  )
}

function Licenses({ notify }: { notify: (m: string, error?: boolean) => void }) {
  const [q, setQ] = useState('')
  const [rows, setRows] = useState<LicenseRow[]>([])
  const [detail, setDetail] = useState<Detail | null>(null)
  const [form, setForm] = useState({ email: '', plan: 'perpetual' as 'perpetual' | 'subscription', entitlements: ['pro'] as Entitlement[], months: 12, maxDevices: 2, note: '' })

  const load = useCallback(async () => {
    try {
      setRows((await api<{ licenses: LicenseRow[] }>(`/api/magazyn/studio/licenses?q=${encodeURIComponent(q)}`)).licenses)
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Błąd', true)
    }
  }, [q, notify])
  useEffect(() => {
    const t = setTimeout(() => void load(), 250)
    return () => clearTimeout(t)
  }, [load])

  const open = async (id: string) => {
    try {
      setDetail(await api<Detail>(`/api/magazyn/studio/licenses/${id}`))
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Błąd', true)
    }
  }
  const act = async (id: string, body: Record<string, unknown>, ok: string) => {
    try {
      await api(`/api/magazyn/studio/licenses/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
      notify(ok)
      await Promise.all([load(), open(id)])
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Błąd', true)
    }
  }
  const issue = async (e: React.FormEvent) => {
    e.preventDefault()
    const end = new Date()
    end.setUTCMonth(end.getUTCMonth() + form.months)
    try {
      await api('/api/magazyn/studio/licenses', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email,
          plan: form.plan,
          entitlements: form.entitlements,
          updatesUntil: end.toISOString(),
          expiresAt: form.plan === 'subscription' ? end.toISOString() : null,
          maxDevices: form.maxDevices,
          note: form.note,
        }),
      })
      notify('Licencja wystawiona, klucz wysłany e-mailem.')
      setForm({ ...form, email: '', note: '' })
      await load()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Błąd', true)
    }
  }
  const trial = async () => {
    try {
      await api('/api/magazyn/studio/licenses', {
        method: 'POST',
        body: JSON.stringify({ trial: true, email: form.email, days: 14, entitlements: form.entitlements }),
      })
      notify('Licencja próbna (14 dni) wystawiona.')
      await load()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Błąd', true)
    }
  }

  const l = detail?.license
  return (
    <div className="space-y-6">
      <form onSubmit={issue} className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 md:grid-cols-6">
        <input className={`${magazynInputClass} md:col-span-2`} type="email" required placeholder="E-mail klienta" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <select className={magazynInputClass} value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value as 'perpetual' | 'subscription' })}>
          <option value="perpetual">Bezterminowa</option>
          <option value="subscription">Subskrypcja</option>
        </select>
        <input className={magazynInputClass} type="number" min={1} max={120} value={form.months} onChange={(e) => setForm({ ...form, months: Number(e.target.value) })} title="Miesiące aktualizacji / okres" />
        <input className={magazynInputClass} type="number" min={1} max={10} value={form.maxDevices} onChange={(e) => setForm({ ...form, maxDevices: Number(e.target.value) })} title="Limit urządzeń" />
        <div className="flex gap-2">
          <button type="submit" disabled={form.entitlements.length === 0} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50">Wystaw</button>
          <button type="button" onClick={() => void trial()} disabled={!form.email || form.entitlements.length === 0} className={BTN}>Trial 14 dni</button>
        </div>
        <div className="md:col-span-4"><EntitlementPicker value={form.entitlements} onChange={(entitlements) => setForm({ ...form, entitlements })} /></div>
        <input className={`${magazynInputClass} md:col-span-2`} placeholder="Notatka (np. powód wystawienia)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
      </form>

      <input className={magazynInputClass} placeholder="Szukaj po e-mailu lub kluczu…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full divide-y divide-white/10">
          <thead><tr>{['Klient', 'Plan', 'Uprawnienia', 'Urządzenia', 'Ważna do', 'Status', ''].map((h) => <th key={h} className={TH}>{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-white/[0.03]">
                <td className={TD}>{r.email}<div className="font-mono text-xs text-neutral-500">{r.key}</div></td>
                <td className={TD}>{r.plan === 'perpetual' ? 'bezterminowa' : 'subskrypcja'}{r.source ? '' : ' · ręczna'}</td>
                <td className={TD}>{r.entitlements.join(', ')}</td>
                <td className={TD}>{r.deviceCount}/{r.maxDevices}</td>
                <td className={TD}>{fmt(r.expiresAt ?? r.updatesUntil)}</td>
                <td className={TD}><span className={r.status === 'active' ? 'text-emerald-400' : 'text-red-400'}>{r.status === 'active' ? 'aktywna' : 'unieważniona'}</span></td>
                <td className={TD}><button className={BTN} onClick={() => void open(r.id)}>Szczegóły</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td className={TD} colSpan={7}>Brak licencji.</td></tr>}
          </tbody>
        </table>
      </div>

      {l && detail && (
        <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="font-mono text-sm">{l.key}</div>
              <div className="text-sm text-neutral-400">{l.email} · utworzona {fmt(l.createdAt)}{l.note ? ` · ${l.note}` : ''}</div>
            </div>
            <button className={BTN} onClick={() => setDetail(null)}>Zamknij</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {l.status === 'active'
              ? <button className={BTN} onClick={() => { if (confirm('Unieważnić licencję? Aplikacje przestaną ją odświeżać.')) void act(l.id, { action: 'revoke' }, 'Licencja unieważniona.') }}>Unieważnij</button>
              : <button className={BTN} onClick={() => void act(l.id, { action: 'reinstate' }, 'Licencja przywrócona.')}>Przywróć</button>}
            <button className={BTN} onClick={() => void act(l.id, { action: 'resend_key' }, 'Klucz wysłany ponownie.')}>Wyślij klucz ponownie</button>
            <button className={BTN} onClick={() => { const v = prompt('Limit urządzeń (1–10)', String(l.maxDevices)); if (v) void act(l.id, { action: 'limit', maxDevices: Number(v) }, 'Limit zmieniony.') }}>Limit urządzeń</button>
            <button className={BTN} onClick={() => { const v = prompt('Nowa data końca (RRRR-MM-DD)', l.updatesUntil.slice(0, 10)); if (v) void act(l.id, { action: 'extend', until: new Date(`${v}T23:59:59Z`).toISOString() }, 'Okres zmieniony.') }}>Zmień okres</button>
            <button className={BTN} onClick={() => { const v = prompt('Uprawnienia (po przecinku: pro, print, vector, image)', l.entitlements.join(', ')); if (v) void act(l.id, { action: 'entitlements', entitlements: v.split(',').map((s) => s.trim()).filter(Boolean) }, 'Uprawnienia zmienione.') }}>Uprawnienia</button>
          </div>
          <div>
            <div className="mb-1 text-xs uppercase tracking-wide text-neutral-500">Urządzenia ({l.devices.length}/{l.maxDevices})</div>
            {l.devices.length === 0 ? <div className="text-sm text-neutral-500">Brak aktywacji.</div> : l.devices.map((d) => (
              <div key={d.deviceId} className="flex items-center justify-between gap-2 border-t border-white/5 py-1.5 text-sm">
                <span>{d.name || 'bez nazwy'} <span className="font-mono text-xs text-neutral-500">{d.deviceId.slice(0, 10)}…</span> · aktywowane {fmt(d.activatedAt)} · ostatnio {fmt(d.lastSeen)}</span>
                <button className={BTN} onClick={() => { if (confirm('Zwolnić to urządzenie?')) void act(l.id, { action: 'remove_device', deviceId: d.deviceId }, 'Urządzenie zwolnione.') }}>Zwolnij</button>
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="mb-1 text-xs uppercase tracking-wide text-neutral-500">Zamówienia</div>
              {detail.orders.length === 0 ? <div className="text-sm text-neutral-500">Brak.</div> : detail.orders.map((o) => <div key={o.id} className="text-sm">{fmt(o.createdAt)} · {o.kind} · {money(o.amountTotal, o.currency)}</div>)}
            </div>
            <div>
              <div className="mb-1 text-xs uppercase tracking-wide text-neutral-500">Historia</div>
              {detail.audit.map((a) => <div key={a.id} className="text-sm text-neutral-300">{fmt(a.at)} · {a.action} · <span className="text-neutral-500">{a.actor}</span></div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Customers({ notify }: { notify: (m: string, error?: boolean) => void }) {
  const [q, setQ] = useState('')
  const [rows, setRows] = useState<{ email: string; licenses: number; active: number; firstSeen: string }[]>([])
  const load = useCallback(async () => {
    try {
      setRows((await api<{ customers: typeof rows }>(`/api/magazyn/studio/customers?q=${encodeURIComponent(q)}`)).customers)
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Błąd', true)
    }
  }, [q, notify])
  useEffect(() => {
    const t = setTimeout(() => void load(), 250)
    return () => clearTimeout(t)
  }, [load])

  const exportData = async (email: string) => {
    try {
      const data = await api<unknown>(`/api/magazyn/studio/customers?export=${encodeURIComponent(email)}`)
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `dane-${email}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Błąd', true)
    }
  }
  const erase = async (email: string) => {
    if (!confirm(`Wymazać dane ${email}? Licencje zostaną unieważnione, a e-mail zanonimizowany. Nie da się tego cofnąć.`)) return
    try {
      await api(`/api/magazyn/studio/customers?email=${encodeURIComponent(email)}`, { method: 'DELETE' })
      notify('Dane zanonimizowane.')
      await load()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Błąd', true)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-400">Aplikacja nie ma kont logowania — klient to e-mail z licencji. Eksport i wymazanie realizują prawa z art. 15, 17 i 20 RODO.</p>
      <input className={magazynInputClass} placeholder="Szukaj e-maila…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full divide-y divide-white/10">
          <thead><tr>{['E-mail', 'Licencje', 'Aktywne', 'Od', ''].map((h) => <th key={h} className={TH}>{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r) => (
              <tr key={r.email}>
                <td className={TD}>{r.email}</td><td className={TD}>{r.licenses}</td><td className={TD}>{r.active}</td><td className={TD}>{fmt(r.firstSeen)}</td>
                <td className={`${TD} flex gap-2`}><button className={BTN} onClick={() => void exportData(r.email)}>Eksport JSON</button><button className={BTN} onClick={() => void erase(r.email)}>Wymaż dane</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td className={TD} colSpan={5}>Brak klientów.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Orders({ notify }: { notify: (m: string, error?: boolean) => void }) {
  const [rows, setRows] = useState<{ id: string; provider: string; kind: string; reference: string; email: string; amountTotal: number | null; currency: string | null; createdAt: string }[]>([])
  useEffect(() => {
    api<{ orders: typeof rows }>('/api/magazyn/studio/orders').then((d) => setRows(d.orders)).catch((e: unknown) => notify(e instanceof Error ? e.message : 'Błąd', true))
  }, [notify])
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="min-w-full divide-y divide-white/10">
        <thead><tr>{['Data', 'Typ', 'Dostawca / ref.', 'Klient', 'Kwota'].map((h) => <th key={h} className={TH}>{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((o) => <tr key={o.id}><td className={TD}>{fmt(o.createdAt)}</td><td className={TD}>{o.kind}</td><td className={TD}>{o.provider} · <span className="font-mono text-xs">{o.reference}</span></td><td className={TD}>{o.email}</td><td className={TD}>{money(o.amountTotal, o.currency)}</td></tr>)}
          {rows.length === 0 && <tr><td className={TD} colSpan={5}>Brak zamówień. Pojawią się po pierwszym webhooku Paddle.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

function Prices({ notify }: { notify: (m: string, error?: boolean) => void }) {
  type Price = { priceId: string; label: string; plan: 'perpetual' | 'subscription'; entitlements: string[]; updateMonths: number }
  const [rows, setRows] = useState<Price[]>([])
  const [f, setF] = useState({ priceId: '', label: '', plan: 'perpetual' as 'perpetual' | 'subscription', entitlements: ['pro'] as Entitlement[], updateMonths: 12 })
  const load = useCallback(async () => {
    try {
      setRows((await api<{ prices: Price[] }>('/api/magazyn/studio/prices')).prices)
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Błąd', true)
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
      notify(err instanceof Error ? err.message : 'Błąd', true)
    }
  }
  const remove = async (priceId: string) => {
    if (!confirm('Usunąć mapowanie? Zakupy tej ceny przestaną tworzyć licencje.')) return
    try {
      await api(`/api/magazyn/studio/prices?priceId=${encodeURIComponent(priceId)}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Błąd', true)
    }
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-400">Mapowanie price id z Paddle na to, co dostaje klient. Webhook ignoruje zakupy z nieznanym price id.</p>
      <form onSubmit={save} className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 md:grid-cols-5">
        <input className={magazynInputClass} required placeholder="pri_…" value={f.priceId} onChange={(e) => setF({ ...f, priceId: e.target.value })} />
        <input className={magazynInputClass} placeholder="Nazwa (np. Pro roczna)" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} />
        <select className={magazynInputClass} value={f.plan} onChange={(e) => setF({ ...f, plan: e.target.value as 'perpetual' | 'subscription' })}><option value="perpetual">Bezterminowa</option><option value="subscription">Subskrypcja</option></select>
        <input className={magazynInputClass} type="number" min={1} max={120} value={f.updateMonths} onChange={(e) => setF({ ...f, updateMonths: Number(e.target.value) })} title="Miesiące aktualizacji (bezterminowa)" />
        <button type="submit" disabled={f.entitlements.length === 0} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50">Zapisz</button>
        <div className="md:col-span-5"><EntitlementPicker value={f.entitlements} onChange={(entitlements) => setF({ ...f, entitlements })} /></div>
      </form>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full divide-y divide-white/10">
          <thead><tr>{['Price id', 'Nazwa', 'Plan', 'Uprawnienia', 'Aktualizacje', ''].map((h) => <th key={h} className={TH}>{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((p) => <tr key={p.priceId}><td className={`${TD} font-mono text-xs`}>{p.priceId}</td><td className={TD}>{p.label}</td><td className={TD}>{p.plan}</td><td className={TD}>{p.entitlements.join(', ')}</td><td className={TD}>{p.plan === 'perpetual' ? `${p.updateMonths} mies.` : 'okres subskrypcji'}</td><td className={TD}><button className={BTN} onClick={() => void remove(p.priceId)}>Usuń</button></td></tr>)}
            {rows.length === 0 && <tr><td className={TD} colSpan={6}>Brak mapowań.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Audit({ notify }: { notify: (m: string, error?: boolean) => void }) {
  const [rows, setRows] = useState<{ id: string; at: string; actor: string; action: string; target: string }[]>([])
  useEffect(() => {
    api<{ entries: typeof rows }>('/api/magazyn/studio/audit').then((d) => setRows(d.entries)).catch((e: unknown) => notify(e instanceof Error ? e.message : 'Błąd', true))
  }, [notify])
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="min-w-full divide-y divide-white/10">
        <thead><tr>{['Czas', 'Kto', 'Akcja', 'Cel'].map((h) => <th key={h} className={TH}>{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((a) => <tr key={a.id}><td className={TD}>{fmt(a.at)}</td><td className={TD}>{a.actor}</td><td className={TD}>{a.action}</td><td className={`${TD} font-mono text-xs`}>{a.target}</td></tr>)}
          {rows.length === 0 && <tr><td className={TD} colSpan={4}>Brak wpisów.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

export function StudioClient() {
  const [tab, setTab] = useState<Tab>('licenses')
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)
  const notify = useCallback((text: string, error = false) => setMessage({ text, error }), [])

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Syntance Studio" description="Licencje, klienci, zamówienia i ceny aplikacji desktopowej. Moduły i katalog aktualizacji — w następnym etapie." />
      <TabPills
        tabs={[
          { id: 'licenses', label: 'Licencje' },
          { id: 'customers', label: 'Klienci' },
          { id: 'orders', label: 'Zamówienia' },
          { id: 'prices', label: 'Ceny (Paddle)' },
          { id: 'audit', label: 'Audyt' },
        ]}
        active={tab}
        onChange={(t) => { setMessage(null); setTab(t) }}
      />
      <StatusMessage message={message?.text ?? null} error={message?.error} />
      {tab === 'licenses' && <Licenses notify={notify} />}
      {tab === 'customers' && <Customers notify={notify} />}
      {tab === 'orders' && <Orders notify={notify} />}
      {tab === 'prices' && <Prices notify={notify} />}
      {tab === 'audit' && <Audit notify={notify} />}
    </div>
  )
}
