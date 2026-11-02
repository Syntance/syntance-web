'use client'

import { Badge } from '@/components/magazyn/kit'

export const ENTITLEMENTS = ['pro', 'print', 'vector', 'image'] as const
export type Entitlement = (typeof ENTITLEMENTS)[number]
export type Plan = 'perpetual' | 'subscription'

export const ENTITLEMENT_LABEL: Record<Entitlement, string> = {
  pro: 'Pro',
  print: 'Print',
  vector: 'Wektor',
  image: 'Obraz',
}
export const PLAN_LABEL: Record<Plan, string> = { perpetual: 'Wieczysta', subscription: 'Subskrypcja' }

export function EntitlementPicker({
  value,
  onChange,
  legend = 'Uprawnienia',
}: {
  value: Entitlement[]
  onChange: (v: Entitlement[]) => void
  legend?: string
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-neutral-300">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {ENTITLEMENTS.map((e) => {
          const on = value.includes(e)
          return (
            <label
              key={e}
              className={`inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-full border px-3.5 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-purple-400 ${
                on ? 'border-purple-400/50 bg-purple-500/15 text-white' : 'border-white/15 text-neutral-300'
              }`}
            >
              <input
                type="checkbox"
                className="h-4 w-4 accent-purple-500"
                checked={on}
                onChange={(ev) => onChange(ev.target.checked ? [...value, e] : value.filter((x) => x !== e))}
              />
              {ENTITLEMENT_LABEL[e]}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export function EntitlementBadges({ list }: { list: string[] }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {list.map((e) => (
        <Badge key={e} tone="info">
          {ENTITLEMENT_LABEL[e as Entitlement] ?? e}
        </Badge>
      ))}
    </span>
  )
}

/** Stan licencji widziany przez właściciela. */
export function licenseState(l: { status: 'active' | 'revoked'; plan: Plan; expiresAt: string | null }, blocked = false): 'active' | 'revoked' | 'blocked' | 'expired' {
  if (l.status === 'revoked') return 'revoked'
  if (blocked) return 'blocked'
  if (l.plan === 'subscription' && l.expiresAt && Date.parse(l.expiresAt) < Date.now()) return 'expired'
  return 'active'
}

export function StateBadge({ state }: { state: ReturnType<typeof licenseState> }) {
  switch (state) {
    case 'active':
      return <Badge tone="good">Aktywna</Badge>
    case 'revoked':
      return <Badge tone="bad">Unieważniona</Badge>
    case 'blocked':
      return <Badge tone="bad">Klient zablokowany</Badge>
    case 'expired':
      return <Badge tone="warn">Wygasła</Badge>
  }
}

/** Data z pola <input type="date"> → koniec tego dnia (UTC), żeby „do dnia X” obejmowało cały dzień. */
export const dateToIso = (d: string): string => `${d}T23:59:59.000Z`
export const isoToDate = (iso: string | null): string => (iso ? iso.slice(0, 10) : '')

export function addMonthsDate(months: number): string {
  const d = new Date()
  d.setUTCMonth(d.getUTCMonth() + months)
  return d.toISOString().slice(0, 10)
}
