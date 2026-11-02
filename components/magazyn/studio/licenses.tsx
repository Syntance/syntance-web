'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Eye, EyeOff, Plus } from 'lucide-react'
import {
  BTN,
  BTN_DANGER,
  BTN_PRIMARY,
  Badge,
  Breadcrumb,
  Card,
  CopyButton,
  EmptyState,
  FilterSelect,
  Modal,
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
import {
  EntitlementBadges,
  EntitlementPicker,
  PLAN_LABEL,
  StateBadge,
  addMonthsDate,
  dateToIso,
  isoToDate,
  licenseState,
  type Entitlement,
  type Plan,
} from '@/components/magazyn/studio/common'

interface LicenseRow {
  id: string
  key: string
  email: string
  plan: Plan
  entitlements: string[]
  status: 'active' | 'revoked'
  maxDevices: number
  deviceCount: number
  updatesUntil: string
  expiresAt: string | null
  source: string | null
  note: string
  createdAt: string
}

const sourceLabel = (s: string | null): string => (s === null ? 'Ręcznie' : s.startsWith('promo:') ? 'Kod promocyjny' : s.startsWith('paddle:') ? 'Paddle' : s)
const maskKey = (key: string): string => `${key.slice(0, key.indexOf('-') + 1)}•••••-•••••-•••••-${key.slice(-5)}`

/* ───────────── Wystawianie licencji ───────────── */

function IssueModal({ open, onClose, onDone, presetEmail }: { open: boolean; onClose: () => void; onDone: () => void; presetEmail?: string }) {
  const { notify, node } = useNotify()
  const [f, setF] = useState({
    email: presetEmail ?? '',
    plan: 'perpetual' as Plan,
    entitlements: ['pro'] as Entitlement[],
    until: addMonthsDate(12),
    maxDevices: 2,
    note: '',
    sendEmail: true,
    trialDays: 14,
  })
  const [pending, setPending] = useState(false)
  const [issued, setIssued] = useState<{ key: string; email: string } | null>(null)

  useEffect(() => {
    if (open) {
      setIssued(null)
      setF((s) => ({ ...s, email: presetEmail ?? s.email }))
    }
  }, [open, presetEmail])

  const submit = async (e: React.FormEvent, trial: boolean) => {
    e.preventDefault()
    setPending(true)
    try {
      const body = trial
        ? { trial: true, email: f.email, days: f.trialDays, entitlements: f.entitlements }
        : {
            email: f.email,
            plan: f.plan,
            entitlements: f.entitlements,
            updatesUntil: dateToIso(f.until),
            expiresAt: f.plan === 'subscription' ? dateToIso(f.until) : null,
            maxDevices: f.maxDevices,
            note: f.note,
            sendEmail: f.sendEmail,
          }
      const res = await api<{ license: { key: string; email: string } }>('/api/magazyn/studio/licenses', { method: 'POST', body: JSON.stringify(body) })
      setIssued({ key: res.license.key, email: res.license.email })
      onDone()
    } catch (err) {
      notify(errMsg(err), true)
    } finally {
      setPending(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={issued ? 'Licencja wystawiona' : 'Wystaw licencję ręcznie'}>
      {issued ? (
        <div className="space-y-4">
          <p className="text-sm text-neutral-300">
            Licencja dla <strong>{issued.email}</strong> jest aktywna.{f.sendEmail ? ' Klucz wysłano e-mailem; jeśli wiadomość nie dotrze, użyj „Wyślij klucz ponownie” w szczegółach licencji.' : ''}
          </p>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-black/40 p-3">
            <code className="break-all text-sm text-white">{issued.key}</code>
            <CopyButton value={issued.key} label="Kopiuj klucz" />
          </div>
          <div className="flex justify-end">
            <button type="button" className={BTN_PRIMARY} onClick={onClose}>
              Gotowe
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={(e) => void submit(e, false)} className="space-y-4">
          <Field label="E-mail klienta">
            <input className={magazynInputClass} type="email" required autoComplete="off" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Plan">
              <select className={magazynInputClass} value={f.plan} onChange={(e) => setF({ ...f, plan: e.target.value as Plan })}>
                <option value="perpetual">Wieczysta (płatna jednorazowo)</option>
                <option value="subscription">Subskrypcja</option>
              </select>
            </Field>
            <Field label={f.plan === 'perpetual' ? 'Aktualizacje do dnia' : 'Ważna do dnia'} hint={f.plan === 'perpetual' ? 'Po tej dacie klient zostaje przy ostatniej wersji z okresu.' : 'Po tej dacie licencja przestaje działać.'}>
              <input className={magazynInputClass} type="date" required value={f.until} onChange={(e) => setF({ ...f, until: e.target.value })} />
            </Field>
          </div>
          <EntitlementPicker value={f.entitlements} onChange={(entitlements) => setF({ ...f, entitlements })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Limit urządzeń">
              <input className={magazynInputClass} type="number" min={1} max={10} value={f.maxDevices} onChange={(e) => setF({ ...f, maxDevices: Number(e.target.value) })} />
            </Field>
            <Field label="Notatka (wewnętrzna)">
              <input className={magazynInputClass} maxLength={500} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input type="checkbox" className="h-4 w-4 accent-purple-500" checked={f.sendEmail} onChange={(e) => setF({ ...f, sendEmail: e.target.checked })} />
            Wyślij klucz klientowi e-mailem
          </label>
          {node}
          <div className="flex flex-wrap items-end justify-between gap-3 border-t border-white/10 pt-4">
            <div className="flex items-end gap-2">
              <Field label="Próbna (dni)">
                <input className={`${magazynInputClass} w-24`} type="number" min={1} max={365} value={f.trialDays} onChange={(e) => setF({ ...f, trialDays: Number(e.target.value) })} />
              </Field>
              <button type="button" className={BTN} disabled={pending || !f.email || f.entitlements.length === 0} onClick={(e) => void submit(e, true)}>
                Wystaw próbną
              </button>
            </div>
            <button type="submit" className={BTN_PRIMARY} disabled={pending || f.entitlements.length === 0}>
              {pending ? 'Wystawiam…' : 'Wystaw licencję'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}

export function IssueLicenseButton({ presetEmail, onDone }: { presetEmail?: string; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className={BTN_PRIMARY} onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" aria-hidden />
        Wystaw licencję
      </button>
      <IssueModal open={open} onClose={() => setOpen(false)} onDone={onDone} presetEmail={presetEmail} />
    </>
  )
}

/* ───────────── Lista ───────────── */

export function LicensesList() {
  const state = useListState()
  const { data, error, loading, reload } = useRemoteList<LicenseRow>('/api/magazyn/studio/licenses', state)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchBox state={state} placeholder="Szukaj: e-mail, klucz, notatka…" label="Szukaj licencji" />
        <FilterSelect state={state} name="status" label="Status" options={[{ value: 'all', label: 'Wszystkie statusy' }, { value: 'active', label: 'Aktywne' }, { value: 'revoked', label: 'Unieważnione' }]} />
        <FilterSelect state={state} name="plan" label="Plan" options={[{ value: 'all', label: 'Wszystkie plany' }, { value: 'perpetual', label: 'Wieczyste' }, { value: 'subscription', label: 'Subskrypcje' }]} />
        <IssueLicenseButton onDone={reload} />
      </div>
      {error ? (
        <p role="alert" className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <TableWrap caption="Licencje">
        <thead>
          <tr>
            <SortTh state={state} field="email" defaultSort="createdAt">
              Klient
            </SortTh>
            <th scope="col" className={TH}>
              Plan
            </th>
            <th scope="col" className={TH}>
              Uprawnienia
            </th>
            <th scope="col" className={TH}>
              Status
            </th>
            <th scope="col" className={TH}>
              Urządzenia
            </th>
            <SortTh state={state} field="updatesUntil" defaultSort="createdAt">
              Aktualizacje do
            </SortTh>
            <SortTh state={state} field="createdAt" defaultSort="createdAt">
              Wystawiona
            </SortTh>
          </tr>
        </thead>
        {loading && !data ? (
          <SkeletonRows cols={7} />
        ) : (
          <tbody className="divide-y divide-white/5">
            {data?.rows.map((l) => (
              <tr key={l.id} className="hover:bg-white/[0.03]">
                <td className={TD}>
                  <Link href={`/magazyn/studio/licencje/${l.id}`} className="font-medium text-white underline-offset-2 hover:underline">
                    {l.email}
                  </Link>
                  <div className="text-xs text-neutral-500">{sourceLabel(l.source)}</div>
                </td>
                <td className={TD}>{PLAN_LABEL[l.plan]}</td>
                <td className={TD}>
                  <EntitlementBadges list={l.entitlements} />
                </td>
                <td className={TD}>
                  <StateBadge state={licenseState(l)} />
                </td>
                <td className={`${TD} tabular-nums`}>
                  {l.deviceCount} / {l.maxDevices}
                </td>
                <td className={TD}>{fmtDate(l.plan === 'subscription' ? l.expiresAt : l.updatesUntil)}</td>
                <td className={TD}>{fmtDate(l.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        )}
      </TableWrap>
      {data && data.rows.length === 0 ? (
        <EmptyState
          title={state.get('q') || state.get('status') || state.get('plan') ? 'Brak licencji dla tych filtrów' : 'Nie wystawiono jeszcze żadnej licencji'}
          hint="Wystaw licencję ręcznie albo wygeneruj kod promocyjny z darmową licencją."
          action={<IssueLicenseButton onDone={reload} />}
        />
      ) : null}
      {data ? <Pagination state={state} data={data} /> : null}
    </div>
  )
}

/* ───────────── Szczegóły ───────────── */

interface Detail {
  license: {
    id: string
    key: string
    email: string
    plan: Plan
    entitlements: Entitlement[]
    updatesUntil: string
    expiresAt: string | null
    maxDevices: number
    status: 'active' | 'revoked'
    devices: { deviceId: string; name: string; activatedAt: string; lastSeen: string }[]
    source: { provider: string; reference: string } | null
    note: string
    createdAt: string
  }
  orders: { id: string; kind: string; amountTotal: number | null; currency: string | null; createdAt: string }[]
  audit: { id: string; at: string; actor: string; action: string }[]
  redemptions: { code: string; at: string }[]
  customerId: string
  blocked: boolean
}

export function LicenseDetail({ id }: { id: string }) {
  const { notify, node } = useNotify()
  const { confirm, dialog } = useConfirm()
  const [d, setD] = useState<Detail | null>(null)
  const [missing, setMissing] = useState(false)
  const [reveal, setReveal] = useState(false)
  const [terms, setTerms] = useState({ plan: 'perpetual' as Plan, until: '', note: '' })
  const [ents, setEnts] = useState<Entitlement[]>([])
  const [limit, setLimit] = useState(2)

  const load = useCallback(async () => {
    try {
      const res = await api<Detail>(`/api/magazyn/studio/licenses/${id}`)
      setD(res)
      setTerms({ plan: res.license.plan, until: isoToDate(res.license.plan === 'subscription' ? res.license.expiresAt : res.license.updatesUntil), note: res.license.note })
      setEnts(res.license.entitlements)
      setLimit(res.license.maxDevices)
    } catch (e) {
      if (errMsg(e).includes('Nie znaleziono')) setMissing(true)
      else notify(errMsg(e), true)
    }
  }, [id, notify])

  useEffect(() => {
    const t = setTimeout(() => void load(), 0)
    return () => clearTimeout(t)
  }, [load])

  const act = async (body: Record<string, unknown>, ok: string) => {
    try {
      const res = await api<{ ok?: boolean }>(`/api/magazyn/studio/licenses/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
      notify(body.action === 'resend_key' && res.ok === false ? 'Nie udało się wysłać wiadomości — sprawdź konfigurację Resend.' : ok, body.action === 'resend_key' && res.ok === false)
      await load()
    } catch (e) {
      notify(errMsg(e), true)
    }
  }

  if (missing) return <EmptyState title="Nie znaleziono licencji" action={<Link className={BTN} href="/magazyn/studio/licencje">Wróć do listy</Link>} />
  if (!d) return <p className="text-sm text-neutral-400" role="status">Wczytuję…</p>
  const l = d.license
  const state = licenseState(l, d.blocked)

  return (
    <div className="space-y-5">
      {dialog}
      <Breadcrumb items={[{ href: '/magazyn/studio/licencje', label: 'Licencje' }, { label: l.email }]} />
      {node}

      <Card
        title="Licencja"
        actions={
          <div className="flex flex-wrap gap-2">
            <StateBadge state={state} />
            <Badge>{PLAN_LABEL[l.plan]}</Badge>
          </div>
        }
      >
        <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-neutral-400">Klient</dt>
            <dd>
              <Link className="text-white underline-offset-2 hover:underline" href={`/magazyn/studio/klienci/${d.customerId}`}>
                {l.email}
              </Link>
              {d.blocked ? <span className="ml-2"><Badge tone="bad">zablokowany</Badge></span> : null}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-400">Wystawiona</dt>
            <dd>
              {fmtDateTime(l.createdAt)} · {l.source ? (l.source.provider === 'promo' ? 'kod promocyjny' : l.source.provider) : 'ręcznie'}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-neutral-400">Klucz licencji</dt>
            <dd className="mt-1 flex flex-wrap items-center gap-2">
              <code className="rounded-lg bg-black/40 px-2.5 py-1.5 text-sm text-white">{reveal ? l.key : maskKey(l.key)}</code>
              <button type="button" className={BTN} onClick={() => setReveal((v) => !v)} aria-pressed={reveal}>
                {reveal ? <EyeOff className="h-3.5 w-3.5" aria-hidden /> : <Eye className="h-3.5 w-3.5" aria-hidden />}
                {reveal ? 'Ukryj' : 'Pokaż'}
              </button>
              <CopyButton value={l.key} label="Kopiuj klucz" />
              <button
                type="button"
                className={BTN}
                onClick={async () => {
                  if (await confirm({ title: 'Wysłać klucz e-mailem?', body: `Klucz trafi na adres ${l.email}.`, confirmLabel: 'Wyślij' })) await act({ action: 'resend_key' }, 'Klucz wysłano.')
                }}
              >
                Wyślij klucz ponownie
              </button>
            </dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          {l.status === 'active' ? (
            <button
              type="button"
              className={BTN_DANGER}
              onClick={async () => {
                if (await confirm({ title: 'Unieważnić licencję?', body: 'Klient straci dostęp przy najbliższej walidacji online (do 30 dni, a aktywacja i odświeżenie odmówią od razu). Możesz ją później przywrócić.', confirmLabel: 'Unieważnij', danger: true })) await act({ action: 'revoke' }, 'Licencję unieważniono.')
              }}
            >
              Unieważnij licencję
            </button>
          ) : (
            <button type="button" className={BTN} onClick={() => void act({ action: 'reinstate' }, 'Licencję przywrócono.')}>
              Przywróć licencję
            </button>
          )}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Warunki">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              void act(
                { action: 'terms', plan: terms.plan, updatesUntil: dateToIso(terms.until), expiresAt: terms.plan === 'subscription' ? dateToIso(terms.until) : null, note: terms.note },
                'Warunki zapisano.',
              )
            }}
          >
            <Field label="Plan">
              <select className={magazynInputClass} value={terms.plan} onChange={(e) => setTerms({ ...terms, plan: e.target.value as Plan })}>
                <option value="perpetual">Wieczysta</option>
                <option value="subscription">Subskrypcja</option>
              </select>
            </Field>
            <Field label={terms.plan === 'perpetual' ? 'Aktualizacje do dnia' : 'Ważna do dnia'}>
              <input className={magazynInputClass} type="date" required value={terms.until} onChange={(e) => setTerms({ ...terms, until: e.target.value })} />
            </Field>
            <Field label="Notatka (wewnętrzna)">
              <input className={magazynInputClass} maxLength={500} value={terms.note} onChange={(e) => setTerms({ ...terms, note: e.target.value })} />
            </Field>
            <button type="submit" className={BTN_PRIMARY}>
              Zapisz warunki
            </button>
          </form>
        </Card>

        <Card title="Uprawnienia i urządzenia">
          <div className="space-y-5">
            <EntitlementPicker value={ents} onChange={setEnts} />
            <button type="button" className={BTN} disabled={ents.length === 0} onClick={() => void act({ action: 'entitlements', entitlements: ents }, 'Uprawnienia zapisano.')}>
              Zapisz uprawnienia
            </button>
            <div className="flex flex-wrap items-end gap-2 border-t border-white/10 pt-4">
              <Field label="Limit urządzeń">
                <input className={`${magazynInputClass} w-24`} type="number" min={1} max={10} value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
              </Field>
              <button type="button" className={BTN} onClick={() => void act({ action: 'limit', maxDevices: limit }, 'Limit zapisano.')}>
                Zapisz limit
              </button>
            </div>
          </div>
        </Card>
      </div>

      <Card title={`Aktywowane urządzenia (${l.devices.length} / ${l.maxDevices})`}>
        {l.devices.length === 0 ? (
          <EmptyState title="Żadne urządzenie nie aktywowało tej licencji" />
        ) : (
          <TableWrap caption="Urządzenia licencji">
            <thead>
              <tr>
                {['Nazwa', 'Aktywowano', 'Ostatnio widziane', ''].map((h) => (
                  <th key={h} scope="col" className={TH}>
                    {h || <span className="sr-only">Akcje</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {l.devices.map((dev) => (
                <tr key={dev.deviceId}>
                  <td className={TD}>
                    {dev.name || 'Bez nazwy'}
                    <div className="font-mono text-xs text-neutral-500">{dev.deviceId.slice(0, 12)}…</div>
                  </td>
                  <td className={TD}>{fmtDateTime(dev.activatedAt)}</td>
                  <td className={TD}>{fmtDateTime(dev.lastSeen)}</td>
                  <td className={`${TD} text-right`}>
                    <button
                      type="button"
                      className={BTN_DANGER}
                      onClick={async () => {
                        if (await confirm({ title: 'Dezaktywować urządzenie?', body: `„${dev.name || 'Bez nazwy'}” zwolni miejsce; klient może aktywować licencję na innym urządzeniu.`, confirmLabel: 'Dezaktywuj', danger: true })) await act({ action: 'remove_device', deviceId: dev.deviceId }, 'Urządzenie dezaktywowano.')
                      }}
                    >
                      Dezaktywuj
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Zamówienia i kody">
          {d.orders.length === 0 && d.redemptions.length === 0 ? (
            <EmptyState title="Brak zamówień" hint="Licencja wystawiona ręcznie lub z kodu nie ma zamówienia." />
          ) : (
            <ul className="space-y-2 text-sm">
              {d.orders.map((o) => (
                <li key={o.id} className="flex justify-between gap-3">
                  <span>{o.kind}</span>
                  <span className="text-neutral-400">
                    {fmtMoney(o.amountTotal, o.currency)} · {fmtDate(o.createdAt)}
                  </span>
                </li>
              ))}
              {d.redemptions.map((r) => (
                <li key={r.code} className="flex justify-between gap-3">
                  <span>Kod {r.code}</span>
                  <span className="text-neutral-400">{fmtDate(r.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Historia zmian">
          {d.audit.length === 0 ? (
            <EmptyState title="Brak wpisów" />
          ) : (
            <ul className="space-y-2 text-sm">
              {d.audit.map((a) => (
                <li key={a.id} className="flex justify-between gap-3">
                  <span>
                    {a.action} <span className="text-neutral-500">· {a.actor}</span>
                  </span>
                  <span className="shrink-0 text-neutral-400">{fmtDateTime(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
