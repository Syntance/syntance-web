'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Check, ChevronLeft, ChevronRight, Copy, Search } from 'lucide-react'
import { magazynInputClass } from '@/components/magazyn/ui'

/* ───────────── API i formatowanie ───────────── */

/** Kody błędów API → komunikaty dla właściciela. */
const ERROR_PL: Record<string, string> = {
  UNKNOWN_LICENSE: 'Nie znaleziono licencji.',
  UNKNOWN_CODE: 'Nie znaleziono kodu.',
  UNKNOWN_CUSTOMER: 'Nie znaleziono klienta.',
  CODE_EXISTS: 'Taki kod już istnieje.',
  INVALID_CODE_FORMAT: 'Kod: 3–32 znaków A–Z, 0–9, „-” lub „_”.',
  MAX_USES_BELOW_USED: 'Limit użyć nie może być niższy niż liczba dotychczasowych użyć.',
  ALREADY_REDEEMED: 'Ten adres e-mail już wykorzystał ten kod.',
  CODE_EXHAUSTED: 'Kod wyczerpał limit użyć.',
  CODE_INACTIVE: 'Kod jest wyłączony.',
  CODE_EXPIRED: 'Kod wygasł.',
  CODE_NOT_STARTED: 'Kod jeszcze nie obowiązuje.',
  CODE_NOT_REDEEMABLE: 'Ten kod to rabat — nie wystawia licencji.',
  BLOCKED: 'Ten klient jest zablokowany.',
  INVALID_INPUT: 'Nieprawidłowe dane — sprawdź pola formularza.',
  SERVER_MISCONFIGURED: 'Serwer licencji jest źle skonfigurowany (LICENSE_PRIVATE_KEY).',
  Unauthorized: 'Sesja wygasła — zaloguj się ponownie.',
  Forbidden: 'Odrzucono żądanie (CSRF).',
}

export class ApiError extends Error {}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } })
  const data = (await res.json().catch(() => ({}))) as T & { error?: string; message?: string }
  if (!res.ok) {
    const code = data.error ?? ''
    throw new ApiError(ERROR_PL[code] ?? (code || `Błąd ${res.status}`))
  }
  return data
}

export const errMsg = (e: unknown): string => (e instanceof Error ? e.message : 'Nieoczekiwany błąd')

export { fmtDate, fmtDateTime, fmtMoney } from '@/components/magazyn/format'

/* ───────────── Style współdzielone ───────────── */

export const TH = 'px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-neutral-400'
export const TD = 'px-3 py-2.5 text-sm text-neutral-200 align-middle'
export const BTN =
  'inline-flex items-center justify-center gap-1.5 rounded-full border border-white/15 px-3.5 py-2 text-xs font-medium text-neutral-100 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400 disabled:cursor-not-allowed disabled:opacity-50 min-h-[36px]'
export const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400 disabled:cursor-not-allowed disabled:opacity-50 min-h-[40px]'
export const BTN_DANGER =
  'inline-flex items-center justify-center gap-1.5 rounded-full border border-red-400/40 px-3.5 py-2 text-xs font-medium text-red-200 transition-colors hover:bg-red-500/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 disabled:cursor-not-allowed disabled:opacity-50 min-h-[36px]'

/* ───────────── Elementy prezentacyjne ───────────── */

type Tone = 'neutral' | 'good' | 'warn' | 'bad' | 'info'
const TONES: Record<Tone, string> = {
  neutral: 'border-white/15 bg-white/5 text-neutral-200',
  good: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
  warn: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
  bad: 'border-red-400/30 bg-red-500/10 text-red-200',
  info: 'border-purple-400/30 bg-purple-500/10 text-purple-200',
}

/** Znacznik stanu: kolor ZAWSZE idzie w parze z tekstem (WCAG 1.4.1). */
export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}>{children}</span>
}

export function StatCard({ label, value, hint, href, tone }: { label: string; value: React.ReactNode; hint?: string; href?: string; tone?: Tone }) {
  const body = (
    <>
      <div className="text-xs font-medium uppercase tracking-wider text-neutral-400">{label}</div>
      <div className={`mt-2 text-3xl font-medium tabular-nums ${tone === 'warn' ? 'text-amber-200' : tone === 'bad' ? 'text-red-200' : 'text-white'}`}>{value}</div>
      {hint ? <div className="mt-1 text-xs text-neutral-500">{hint}</div> : null}
    </>
  )
  const cls = 'block rounded-2xl border border-white/10 bg-white/[0.03] p-5'
  return href ? (
    <Link href={href} className={`${cls} transition-colors hover:border-purple-400/40 hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}

export function Card({ title, actions, children }: { title?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      {title || actions ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {title ? <h2 className="text-base font-medium text-white">{title}</h2> : <span />}
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/15 px-6 py-10 text-center">
      <p className="text-sm font-medium text-neutral-200">{title}</p>
      {hint ? <p className="max-w-md text-sm text-neutral-400">{hint}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}

export function Breadcrumb({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Ścieżka" className="text-sm text-neutral-400">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-1.5">
            {i > 0 ? <span aria-hidden>/</span> : null}
            {it.href ? (
              <Link href={it.href} className="underline-offset-2 hover:text-white hover:underline">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-neutral-200">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function CopyButton({ value, label = 'Kopiuj' }: { value: string; label?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      className={BTN}
      onClick={() => {
        void navigator.clipboard.writeText(value).then(() => {
          setDone(true)
          setTimeout(() => setDone(false), 1800)
        })
      }}
    >
      {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      <span aria-live="polite">{done ? 'Skopiowano' : label}</span>
    </button>
  )
}

/* ───────────── Powiadomienia ───────────── */

export function useNotify() {
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)
  const notify = useCallback((text: string, error = false) => setMessage({ text, error }), [])
  const node = (
    <div aria-live={message?.error ? 'assertive' : 'polite'} role={message?.error ? 'alert' : 'status'} className="min-h-5">
      {message ? (
        <p className={`rounded-lg border px-3 py-2 text-sm ${message.error ? 'border-red-400/30 bg-red-500/10 text-red-200' : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'}`}>
          {message.text}
        </p>
      ) : null}
    </div>
  )
  return { notify, node }
}

/* ───────────── Potwierdzenia (natywny <dialog>: focus trap i Esc za darmo) ───────────── */

export interface ConfirmOptions {
  title: string
  body?: React.ReactNode
  confirmLabel?: string
  danger?: boolean
}

export function useConfirm() {
  const ref = useRef<HTMLDialogElement>(null)
  const resolver = useRef<((ok: boolean) => void) | null>(null)
  const [opts, setOpts] = useState<ConfirmOptions | null>(null)
  const titleId = useId()

  const confirm = useCallback((o: ConfirmOptions) => {
    setOpts(o)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  useEffect(() => {
    if (opts && ref.current && !ref.current.open) ref.current.showModal()
  }, [opts])

  const finish = (ok: boolean) => {
    ref.current?.close()
    resolver.current?.(ok)
    resolver.current = null
    setOpts(null)
  }

  const dialog = (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault()
        finish(false)
      }}
      className="m-auto w-[min(92vw,28rem)] rounded-2xl border border-white/15 bg-neutral-900 p-0 text-neutral-100 backdrop:bg-black/70"
    >
      {opts ? (
        <div className="space-y-4 p-6">
          <h2 id={titleId} className="text-lg font-medium">
            {opts.title}
          </h2>
          {opts.body ? <div className="text-sm text-neutral-300">{opts.body}</div> : null}
          <div className="flex justify-end gap-2">
            <button type="button" className={BTN} onClick={() => finish(false)} autoFocus>
              Anuluj
            </button>
            <button type="button" className={opts.danger ? BTN_DANGER : BTN_PRIMARY} onClick={() => finish(true)}>
              {opts.confirmLabel ?? 'Potwierdź'}
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  )
  return { confirm, dialog }
}

/** Okno z dowolną zawartością (formularze). */
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      className="m-auto max-h-[90dvh] w-[min(94vw,40rem)] overflow-y-auto rounded-2xl border border-white/15 bg-neutral-900 p-0 text-neutral-100 backdrop:bg-black/70"
    >
      {open ? (
        <div className="space-y-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id={titleId} className="text-lg font-medium">
              {title}
            </h2>
            <button type="button" className={BTN} onClick={onClose} aria-label="Zamknij okno">
              Zamknij
            </button>
          </div>
          {children}
        </div>
      ) : null}
    </dialog>
  )
}

/* ───────────── Lista: stan w adresie URL, sortowanie, paginacja ───────────── */

export interface ListState {
  params: URLSearchParams
  get: (key: string, fallback?: string) => string
  set: (patch: Record<string, string | null>) => void
}

/** Filtry/sortowanie/strona żyją w URL (można je odświeżyć, wkleić, cofnąć). Zmiana filtra wraca na stronę 1. */
export function useListState(): ListState {
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  const params = useMemo(() => new URLSearchParams(search.toString()), [search])
  const set = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(search.toString())
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === '') next.delete(k)
        else next.set(k, v)
      }
      if (!('page' in patch)) next.delete('page')
      const qs = next.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [router, pathname, search],
  )
  return { params, get: (k, f = '') => params.get(k) ?? f, set }
}

export interface PageData<T> {
  rows: T[]
  total: number
  page: number
  pageSize: number
}

export function useRemoteList<T>(endpoint: string, state: ListState, extra: Record<string, string> = {}) {
  const [data, setData] = useState<PageData<T> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)
  const query = useMemo(() => {
    const p = new URLSearchParams(state.params)
    for (const [k, v] of Object.entries(extra)) p.set(k, v)
    return p.toString()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- extra jest stałe dla danej strony
  }, [state.params])

  useEffect(() => {
    let cancelled = false
    const t = setTimeout(() => {
      setLoading(true)
      api<PageData<T>>(`${endpoint}?${query}`)
        .then((d) => {
          if (!cancelled) {
            setData(d)
            setError(null)
          }
        })
        .catch((e: unknown) => !cancelled && setError(errMsg(e)))
        .finally(() => !cancelled && setLoading(false))
    }, 150)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [endpoint, query, tick])

  return { data, error, loading, reload: () => setTick((n) => n + 1) }
}

export function SearchBox({ state, placeholder, label = 'Szukaj' }: { state: ListState; placeholder: string; label?: string }) {
  const [value, setValue] = useState(state.get('q'))
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const id = useId()
  return (
    <div className="relative min-w-[14rem] flex-1">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" aria-hidden />
      <input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        className={`${magazynInputClass} pl-9`}
        onChange={(e) => {
          setValue(e.target.value)
          if (timer.current) clearTimeout(timer.current)
          const v = e.target.value
          timer.current = setTimeout(() => state.set({ q: v }), 300)
        }}
      />
    </div>
  )
}

export function FilterSelect({
  state,
  name,
  label,
  options,
}: {
  state: ListState
  name: string
  label: string
  options: { value: string; label: string }[]
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select id={id} className={magazynInputClass} value={state.get(name, options[0]?.value ?? '')} onChange={(e) => state.set({ [name]: e.target.value })}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function SortTh({ state, field, children, defaultSort }: { state: ListState; field: string; children: React.ReactNode; defaultSort: string }) {
  const sort = state.get('sort', defaultSort)
  const dir = state.get('dir', 'desc')
  const active = sort === field
  return (
    <th scope="col" className={TH} aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-white focus-visible:outline-2 focus-visible:outline-purple-400"
        onClick={() => state.set({ sort: field, dir: active && dir === 'desc' ? 'asc' : 'desc' })}
      >
        {children}
        {active ? dir === 'asc' ? <ArrowUp className="h-3 w-3" aria-hidden /> : <ArrowDown className="h-3 w-3" aria-hidden /> : null}
      </button>
    </th>
  )
}

export function Pagination({ state, data }: { state: ListState; data: PageData<unknown> }) {
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize))
  const from = data.total === 0 ? 0 : (data.page - 1) * data.pageSize + 1
  const to = Math.min(data.total, data.page * data.pageSize)
  return (
    <nav aria-label="Paginacja" className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-400">
      <p aria-live="polite">
        {from}–{to} z {data.total}
      </p>
      <div className="flex items-center gap-2">
        <button type="button" className={BTN} disabled={data.page <= 1} onClick={() => state.set({ page: String(data.page - 1) })}>
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          Poprzednia
        </button>
        <span>
          Strona {data.page} / {pages}
        </span>
        <button type="button" className={BTN} disabled={data.page >= pages} onClick={() => state.set({ page: String(data.page + 1) })}>
          Następna
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </nav>
  )
}

export function TableWrap({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10" tabIndex={0} role="region" aria-label={caption}>
      <table className="min-w-full divide-y divide-white/10">
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  )
}

export function SkeletonRows({ cols, rows = 5 }: { cols: number; rows?: number }) {
  return (
    <tbody aria-hidden>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }, (_, c) => (
            <td key={c} className={TD}>
              <div className="h-4 w-full max-w-[10rem] animate-pulse rounded bg-white/10" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}
