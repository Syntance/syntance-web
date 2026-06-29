'use client'

import { Loader2, Save } from 'lucide-react'

export const magazynInputClass =
  'w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-neutral-600 outline-none focus-visible:border-purple-500/60 focus-visible:ring-2 focus-visible:ring-purple-500/30'

export const magazynTextareaClass = `${magazynInputClass} min-h-[88px] resize-y`

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
      {description ? <p className="mt-1 text-sm text-neutral-400">{description}</p> : null}
    </div>
  )
}

export function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <legend className="px-1 text-sm font-medium text-neutral-200">{legend}</legend>
      {children}
    </fieldset>
  )
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-neutral-300">{label}</span>
      {children}
      {hint ? <p className="text-xs text-neutral-500">{hint}</p> : null}
    </label>
  )
}

export function TabPills<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: Array<{ id: T; label: string }>
  active: T
  onChange: (id: T) => void
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-full border border-white/10 bg-white/[0.02] p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
            active === tab.id ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function SaveButton({
  pending,
  label = 'Zapisz',
  onClick,
}: {
  pending: boolean
  label?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:bg-neutral-200 disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
      {pending ? 'Zapisuję…' : label}
    </button>
  )
}

export function StatusMessage({ message, error }: { message: string | null; error?: boolean }) {
  if (!message) return null
  return (
    <p
      role="status"
      className={`text-sm ${error ? 'text-red-300' : 'text-green-400'}`}
    >
      {message}
    </p>
  )
}

export function DbBanner({ connected }: { connected: boolean }) {
  if (connected) return null
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      Brak połączenia z bazą (<code className="text-amber-200">DATABASE_URL</code>). W Vercel → Storage → Neon skopiuj
      connection string do <code className="text-amber-200">.env.local</code> i zrestartuj dev server. Na produkcji dane są w Neon.
    </div>
  )
}
