'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import {
  BTN,
  BTN_PRIMARY,
  Badge,
  Breadcrumb,
  Card,
  CopyButton,
  EmptyState,
  Modal,
  TD,
  TH,
  TableWrap,
  api,
  errMsg,
  fmtDate,
  fmtDateTime,
  fmtMoney,
  useConfirm,
  useNotify,
} from '@/components/magazyn/kit'
import { Field, magazynInputClass } from '@/components/magazyn/ui'
import { EntitlementBadges, EntitlementPicker, PLAN_LABEL, dateToIso, isoToDate, type Entitlement, type Plan } from '@/components/magazyn/studio/common'

type Kind = 'percent' | 'amount' | 'free_license' | 'trial'

interface Promo {
  id: string
  code: string
  kind: Kind
  percentOff: number | null
  amountOff: number | null
  currency: string | null
  trialDays: number | null
  grantPlan: Plan | null
  grantEntitlements: string[] | null
  grantUpdateMonths: number | null
  grantMaxDevices: number | null
  maxUses: number | null
  usedCount: number
  validFrom: string | null
  validUntil: string | null
  active: boolean
  providerDiscountId: string | null
  note: string
  createdAt: string
}

const KIND_LABEL: Record<Kind, string> = {
  percent: 'Rabat %',
  amount: 'Rabat kwotowy',
  free_license: 'Darmowa licencja',
  trial: 'Wydłużony trial',
}

function describe(p: Promo): string {
  switch (p.kind) {
    case 'percent':
      return `−${p.percentOff}%`
    case 'amount':
      return `−${((p.amountOff ?? 0) / 100).toFixed(2)} ${p.currency}`
    case 'free_license':
      return `${p.grantPlan ? PLAN_LABEL[p.grantPlan] : ''}, ${p.grantUpdateMonths} mies. aktualizacji`
    case 'trial':
      return `${p.trialDays} dni`
  }
}

function promoState(p: Promo): { label: string; tone: 'good' | 'warn' | 'bad' | 'neutral' } {
  const now = Date.now()
  if (!p.active) return { label: 'Wyłączony', tone: 'neutral' }
  if (p.validUntil && Date.parse(p.validUntil) <= now) return { label: 'Wygasł', tone: 'warn' }
  if (p.validFrom && Date.parse(p.validFrom) > now) return { label: 'Jeszcze nie działa', tone: 'warn' }
  if (p.maxUses !== null && p.usedCount >= p.maxUses) return { label: 'Wyczerpany', tone: 'warn' }
  return { label: 'Aktywny', tone: 'good' }
}

const usage = (p: Promo): string => `${p.usedCount}${p.maxUses === null ? '' : ` / ${p.maxUses}`}`

/* ───────────── Tworzenie ───────────── */

function CreateModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const { notify, node } = useNotify()
  const [f, setF] = useState({
    kind: 'free_license' as Kind,
    code: '',
    percentOff: 20,
    amount: 10,
    currency: 'EUR',
    trialDays: 30,
    grantPlan: 'perpetual' as Plan,
    grantUpdateMonths: 12,
    grantMaxDevices: 2,
    entitlements: ['pro'] as Entitlement[],
    maxUses: '',
    validUntil: '',
    note: '',
    providerDiscountId: '',
  })
  const [pending, setPending] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPending(true)
    const common = {
      code: f.code.trim() || undefined,
      maxUses: f.maxUses ? Number(f.maxUses) : null,
      validUntil: f.validUntil ? dateToIso(f.validUntil) : null,
      note: f.note,
      providerDiscountId: f.providerDiscountId.trim() || null,
    }
    const body =
      f.kind === 'percent'
        ? { kind: f.kind, percentOff: f.percentOff, appliesToEntitlements: f.entitlements.length === 0 || f.entitlements.length === 4 ? null : f.entitlements, ...common }
        : f.kind === 'amount'
          ? { kind: f.kind, amountOff: Math.round(f.amount * 100), currency: f.currency.toUpperCase(), ...common }
          : f.kind === 'trial'
            ? { kind: f.kind, trialDays: f.trialDays, grantEntitlements: f.entitlements, grantMaxDevices: f.grantMaxDevices, ...common }
            : { kind: f.kind, grantPlan: f.grantPlan, grantUpdateMonths: f.grantUpdateMonths, grantEntitlements: f.entitlements, grantMaxDevices: f.grantMaxDevices, ...common }
    try {
      await api('/api/magazyn/studio/promo', { method: 'POST', body: JSON.stringify(body) })
      onDone()
      onClose()
    } catch (err) {
      notify(errMsg(err), true)
    } finally {
      setPending(false)
    }
  }

  const isDiscount = f.kind === 'percent' || f.kind === 'amount'
  return (
    <Modal open={open} onClose={onClose} title="Nowy kod promocyjny">
      <form onSubmit={(e) => void submit(e)} className="space-y-4">
        <Field label="Rodzaj kodu">
          <select className={magazynInputClass} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as Kind })}>
            {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
              <option key={k} value={k}>{KIND_LABEL[k]}</option>
            ))}
          </select>
        </Field>
        <Field label="Kod" hint="Zostaw puste, by wygenerować losowy. 3–32 znaków: A–Z, 0–9, „-”, „_”.">
          <input className={`${magazynInputClass} font-mono uppercase`} maxLength={32} value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} />
        </Field>

        {f.kind === 'percent' && (
          <Field label="Rabat (%)">
            <input className={magazynInputClass} type="number" min={1} max={100} required value={f.percentOff} onChange={(e) => setF({ ...f, percentOff: Number(e.target.value) })} />
          </Field>
        )}
        {f.kind === 'amount' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kwota rabatu">
              <input className={magazynInputClass} type="number" min={0.01} step={0.01} required value={f.amount} onChange={(e) => setF({ ...f, amount: Number(e.target.value) })} />
            </Field>
            <Field label="Waluta (ISO)">
              <input className={`${magazynInputClass} uppercase`} maxLength={3} pattern="[A-Za-z]{3}" required value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value })} />
            </Field>
          </div>
        )}
        {f.kind === 'trial' && (
          <Field label="Długość triala (dni)">
            <input className={magazynInputClass} type="number" min={1} max={365} required value={f.trialDays} onChange={(e) => setF({ ...f, trialDays: Number(e.target.value) })} />
          </Field>
        )}
        {f.kind === 'free_license' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Plan licencji">
              <select className={magazynInputClass} value={f.grantPlan} onChange={(e) => setF({ ...f, grantPlan: e.target.value as Plan })}>
                <option value="perpetual">Wieczysta</option>
                <option value="subscription">Subskrypcja</option>
              </select>
            </Field>
            <Field label="Miesięcy aktualizacji / ważności">
              <input className={magazynInputClass} type="number" min={1} max={120} value={f.grantUpdateMonths} onChange={(e) => setF({ ...f, grantUpdateMonths: Number(e.target.value) })} />
            </Field>
          </div>
        )}
        <EntitlementPicker legend={isDiscount ? 'Dotyczy uprawnień (wszystkie zaznaczone = bez ograniczeń)' : 'Uprawnienia licencji'} value={f.entitlements} onChange={(entitlements) => setF({ ...f, entitlements })} />
        {!isDiscount && (
          <Field label="Limit urządzeń">
            <input className={`${magazynInputClass} w-28`} type="number" min={1} max={10} value={f.grantMaxDevices} onChange={(e) => setF({ ...f, grantMaxDevices: Number(e.target.value) })} />
          </Field>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Limit użyć" hint="Puste = bez limitu. Jeden e-mail może użyć kodu raz.">
            <input className={magazynInputClass} type="number" min={1} value={f.maxUses} onChange={(e) => setF({ ...f, maxUses: e.target.value })} />
          </Field>
          <Field label="Ważny do dnia" hint="Puste = bezterminowo.">
            <input className={magazynInputClass} type="date" value={f.validUntil} onChange={(e) => setF({ ...f, validUntil: e.target.value })} />
          </Field>
        </div>
        {isDiscount && (
          <Field label="Id rabatu w Paddle (opcjonalnie)" hint="Uzupełnisz po utworzeniu odpowiadającego rabatu w Paddle — checkout zastosuje go tym samym kodem.">
            <input className={`${magazynInputClass} font-mono`} maxLength={100} value={f.providerDiscountId} onChange={(e) => setF({ ...f, providerDiscountId: e.target.value })} />
          </Field>
        )}
        <Field label="Notatka (wewnętrzna)">
          <input className={magazynInputClass} maxLength={300} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
        </Field>
        {node}
        <div className="flex justify-end">
          <button type="submit" className={BTN_PRIMARY} disabled={pending || (f.entitlements.length === 0 && !isDiscount)}>
            {pending ? 'Tworzę…' : 'Utwórz kod'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/* ───────────── Lista ───────────── */

export function PromoList() {
  const { notify, node } = useNotify()
  const [codes, setCodes] = useState<Promo[] | null>(null)
  const [create, setCreate] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const load = useCallback(async () => {
    try {
      setCodes((await api<{ codes: Promo[] }>('/api/magazyn/studio/promo')).codes)
    } catch (e) {
      notify(errMsg(e), true)
    }
  }, [notify])
  useEffect(() => {
    const t = setTimeout(() => void load(), 0)
    return () => clearTimeout(t)
  }, [load])

  const shown = useMemo(
    () => (codes ?? []).filter((c) => (filter === 'all' ? true : filter === 'active' ? promoState(c).label === 'Aktywny' : promoState(c).label !== 'Aktywny')),
    [codes, filter],
  )

  return (
    <div className="space-y-4">
      {node}
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="promo-filter">Filtr kodów</label>
        <select id="promo-filter" className={`${magazynInputClass} max-w-48`} value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
          <option value="all">Wszystkie kody</option>
          <option value="active">Tylko aktywne</option>
          <option value="inactive">Nieaktywne</option>
        </select>
        <button type="button" className={BTN_PRIMARY} onClick={() => setCreate(true)}>
          <Plus className="h-4 w-4" aria-hidden />
          Nowy kod
        </button>
      </div>
      <TableWrap caption="Kody promocyjne">
        <thead>
          <tr>{['Kod', 'Rodzaj', 'Wartość', 'Użycia', 'Ważny do', 'Status'].map((h) => <th key={h} scope="col" className={TH}>{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {shown.map((c) => {
            const s = promoState(c)
            return (
              <tr key={c.id} className="hover:bg-white/[0.03]">
                <td className={TD}><Link href={`/magazyn/studio/kody/${c.id}`} className="font-mono font-medium text-white underline-offset-2 hover:underline">{c.code}</Link></td>
                <td className={TD}>{KIND_LABEL[c.kind]}</td>
                <td className={TD}>{describe(c)}</td>
                <td className={`${TD} tabular-nums`}>{usage(c)}</td>
                <td className={TD}>{fmtDate(c.validUntil)}</td>
                <td className={TD}><Badge tone={s.tone}>{s.label}</Badge></td>
              </tr>
            )
          })}
        </tbody>
      </TableWrap>
      {codes && shown.length === 0 ? (
        <EmptyState
          title={codes.length === 0 ? 'Nie utworzono jeszcze żadnego kodu' : 'Brak kodów dla tego filtra'}
          hint="Kod może dać rabat w checkoucie (po podłączeniu Paddle) albo od razu darmową licencję / dłuższy trial."
          action={codes.length === 0 ? <button type="button" className={BTN_PRIMARY} onClick={() => setCreate(true)}>Utwórz pierwszy kod</button> : undefined}
        />
      ) : null}
      <CreateModal open={create} onClose={() => setCreate(false)} onDone={() => void load()} />
    </div>
  )
}

/* ───────────── Szczegóły ───────────── */

interface PromoDetailData {
  code: Promo
  redemptions: { id: string; email: string; licenseId: string | null; source: string; discountAmount: number | null; currency: string | null; createdAt: string }[]
  audit: { id: string; at: string; actor: string; action: string }[]
}

const SOURCE_LABEL: Record<string, string> = { manual: 'Nadany ręcznie', redeem: 'Wykorzystany przez klienta', paddle: 'Zakup (Paddle)' }

export function PromoDetail({ id }: { id: string }) {
  const { notify, node } = useNotify()
  const { confirm, dialog } = useConfirm()
  const [d, setD] = useState<PromoDetailData | null>(null)
  const [missing, setMissing] = useState(false)
  const [grantEmail, setGrantEmail] = useState('')
  const [edit, setEdit] = useState({ maxUses: '', validUntil: '', note: '', providerDiscountId: '' })

  const load = useCallback(async () => {
    try {
      const res = await api<PromoDetailData>(`/api/magazyn/studio/promo/${id}`)
      setD(res)
      setEdit({ maxUses: res.code.maxUses?.toString() ?? '', validUntil: isoToDate(res.code.validUntil), note: res.code.note, providerDiscountId: res.code.providerDiscountId ?? '' })
    } catch (e) {
      if (errMsg(e).includes('Nie znaleziono')) setMissing(true)
      else notify(errMsg(e), true)
    }
  }, [id, notify])
  useEffect(() => {
    const t = setTimeout(() => void load(), 0)
    return () => clearTimeout(t)
  }, [load])

  if (missing) return <EmptyState title="Nie znaleziono kodu" action={<Link className={BTN} href="/magazyn/studio/kody">Wróć do listy</Link>} />
  if (!d) return <p className="text-sm text-neutral-400" role="status">Wczytuję…</p>
  const c = d.code
  const s = promoState(c)
  const redeemable = c.kind === 'free_license' || c.kind === 'trial'

  const patch = async (body: Record<string, unknown>, ok: string) => {
    try {
      await api(`/api/magazyn/studio/promo/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
      notify(ok)
      await load()
    } catch (e) {
      notify(errMsg(e), true)
    }
  }

  const grant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!(await confirm({ title: 'Nadać licencję z tego kodu?', body: `Klucz zostanie wysłany e-mailem na ${grantEmail}. To zużywa jedno użycie kodu.`, confirmLabel: 'Nadaj' }))) return
    try {
      await api('/api/magazyn/studio/promo/redeem', { method: 'POST', body: JSON.stringify({ code: c.code, email: grantEmail }) })
      notify('Licencja nadana, klucz wysłano e-mailem.')
      setGrantEmail('')
      await load()
    } catch (err) {
      notify(errMsg(err), true)
    }
  }

  return (
    <div className="space-y-5">
      {dialog}
      <Breadcrumb items={[{ href: '/magazyn/studio/kody', label: 'Kody promocyjne' }, { label: c.code }]} />
      {node}
      <Card title={c.code} actions={<Badge tone={s.tone}>{s.label}</Badge>}>
        <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          <div><dt className="text-neutral-400">Rodzaj</dt><dd>{KIND_LABEL[c.kind]} · {describe(c)}</dd></div>
          <div><dt className="text-neutral-400">Użycia</dt><dd className="tabular-nums">{usage(c)}</dd></div>
          {redeemable ? <div><dt className="text-neutral-400">Uprawnienia licencji</dt><dd><EntitlementBadges list={c.grantEntitlements ?? []} /> · limit urządzeń {c.grantMaxDevices}</dd></div> : null}
          <div><dt className="text-neutral-400">Utworzony</dt><dd>{fmtDateTime(c.createdAt)}</dd></div>
        </dl>
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
          <CopyButton value={c.code} label="Kopiuj kod" />
          {c.active ? (
            <button
              type="button"
              className={BTN}
              onClick={async () => {
                if (await confirm({ title: 'Wyłączyć kod?', body: 'Nikt nie wykorzysta go ponownie. Dotychczasowe licencje zostają. Możesz włączyć go z powrotem.', confirmLabel: 'Wyłącz', danger: true })) await patch({ active: false }, 'Kod wyłączony.')
              }}
            >
              Wyłącz kod
            </button>
          ) : (
            <button type="button" className={BTN} onClick={() => void patch({ active: true }, 'Kod włączony.')}>Włącz kod</button>
          )}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Ustawienia">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              void patch(
                {
                  maxUses: edit.maxUses ? Number(edit.maxUses) : null,
                  validUntil: edit.validUntil ? dateToIso(edit.validUntil) : null,
                  note: edit.note,
                  providerDiscountId: edit.providerDiscountId.trim() || null,
                },
                'Zapisano.',
              )
            }}
          >
            <Field label="Limit użyć" hint="Puste = bez limitu."><input className={magazynInputClass} type="number" min={Math.max(1, c.usedCount)} value={edit.maxUses} onChange={(e) => setEdit({ ...edit, maxUses: e.target.value })} /></Field>
            <Field label="Ważny do dnia"><input className={magazynInputClass} type="date" value={edit.validUntil} onChange={(e) => setEdit({ ...edit, validUntil: e.target.value })} /></Field>
            {c.kind === 'percent' || c.kind === 'amount' ? (
              <Field label="Id rabatu w Paddle"><input className={`${magazynInputClass} font-mono`} maxLength={100} value={edit.providerDiscountId} onChange={(e) => setEdit({ ...edit, providerDiscountId: e.target.value })} /></Field>
            ) : null}
            <Field label="Notatka"><input className={magazynInputClass} maxLength={300} value={edit.note} onChange={(e) => setEdit({ ...edit, note: e.target.value })} /></Field>
            <button type="submit" className={BTN_PRIMARY}>Zapisz</button>
          </form>
        </Card>

        {redeemable ? (
          <Card title="Nadaj klientowi">
            <form onSubmit={(e) => void grant(e)} className="space-y-4">
              <p className="text-sm text-neutral-400">Wystawia licencję z tego kodu i wysyła klucz e-mailem — bez czekania, aż klient sam wpisze kod.</p>
              <Field label="E-mail klienta"><input className={magazynInputClass} type="email" required value={grantEmail} onChange={(e) => setGrantEmail(e.target.value)} /></Field>
              <button type="submit" className={BTN_PRIMARY} disabled={!c.active}>Nadaj licencję</button>
            </form>
          </Card>
        ) : (
          <Card title="Rabat w checkoucie">
            <p className="text-sm text-neutral-400">
              Kody rabatowe zadziałają po podłączeniu Paddle: w checkout przekazujesz <code>custom_data.promo_code</code>, a webhook zapisze użycie i kwotę rabatu. Do tego czasu możesz tworzyć je i planować.
            </p>
          </Card>
        )}
      </div>

      <Card title={`Wykorzystania (${d.redemptions.length})`}>
        {d.redemptions.length === 0 ? (
          <EmptyState title="Kod nie został jeszcze wykorzystany" />
        ) : (
          <TableWrap caption="Wykorzystania kodu">
            <thead><tr>{['Klient', 'Sposób', 'Rabat', 'Kiedy'].map((h) => <th key={h} scope="col" className={TH}>{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-white/5">
              {d.redemptions.map((r) => (
                <tr key={r.id}>
                  <td className={TD}>{r.licenseId ? <Link className="underline-offset-2 hover:underline" href={`/magazyn/studio/licencje/${r.licenseId}`}>{r.email}</Link> : r.email}</td>
                  <td className={TD}>{SOURCE_LABEL[r.source] ?? r.source}</td>
                  <td className={TD}>{fmtMoney(r.discountAmount, r.currency)}</td>
                  <td className={TD}>{fmtDateTime(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </div>
  )
}
