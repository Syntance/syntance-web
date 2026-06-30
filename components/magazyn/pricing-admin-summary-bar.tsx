'use client'

import type { PricingAdminSummary } from '@/lib/magazyn/pricing-admin-summary'

type CompareRow = {
  label: string
  priceNet: number
  hours: number
  deliveryTime?: string
}

type Props = {
  title: string
  summary: PricingAdminSummary
  summaryLabel?: string
  summaryHint?: string
  disabledInLayoutCount?: number
  totalActiveInLayoutCount?: number
  compare?: CompareRow
}

function formatPln(value: number) {
  return `${value.toLocaleString('pl-PL')} PLN`
}

function formatHours(value: number) {
  return `${value.toLocaleString('pl-PL', { maximumFractionDigits: 1 })} h`
}

export function PricingAdminSummaryBar({
  title,
  summary,
  summaryLabel = 'Aktywne pozycje',
  summaryHint,
  disabledInLayoutCount = 0,
  totalActiveInLayoutCount,
  compare,
}: Props) {
  const priceDelta = compare != null ? compare.priceNet - summary.priceNet : null
  const hoursDelta = compare != null ? compare.hours - summary.hours : null

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">{title}</p>
      {summaryHint ? <p className="mb-2 text-xs text-neutral-500">{summaryHint}</p> : null}
      <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div>
          <dt className="text-neutral-500">{summaryLabel}</dt>
          <dd className="font-medium text-white">
            {summary.itemCount}
            {compare == null && disabledInLayoutCount > 0 ? (
              <span className="ml-1 font-normal text-neutral-500">
                (+{disabledInLayoutCount} wył. w układzie)
              </span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Suma netto</dt>
          <dd className="font-medium text-white">{formatPln(summary.priceNet)}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Godziny</dt>
          <dd className="font-medium text-white">{formatHours(summary.hours)}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Czas (~)</dt>
          <dd className="font-medium text-white">
            {summary.days > 0 ? `${summary.days} dni rob.` : '—'}
          </dd>
        </div>
        {compare ? (
          <>
            <div className="w-full border-t border-white/5 pt-2">
              <dt className="text-neutral-500">{compare.label}</dt>
              <dd className="font-medium text-white">
                {formatPln(compare.priceNet)} · {formatHours(compare.hours)}
                {compare.deliveryTime ? ` · ${compare.deliveryTime}` : ''}
              </dd>
            </div>
            {(priceDelta !== 0 || hoursDelta !== 0) && priceDelta != null && hoursDelta != null ? (
              <div>
                <dt className="text-neutral-500">Różnica (wpisane − katalog)</dt>
                <dd
                  className={`font-medium ${
                    priceDelta === 0 && hoursDelta === 0 ? 'text-neutral-400' : 'text-amber-300/90'
                  }`}
                >
                  {priceDelta >= 0 ? '+' : ''}
                  {formatPln(priceDelta)} · {hoursDelta >= 0 ? '+' : ''}
                  {formatHours(hoursDelta)}
                </dd>
              </div>
            ) : null}
          </>
        ) : null}
      </dl>
      {summary.percentageAddCount > 0 ? (
        <p className="mt-2 text-xs text-neutral-500">
          {summary.percentageAddCount} poz. procentowych (+{summary.percentageAddTotal}% łącznie) —
          nie wliczone w sumę netto; wpływ zależy od bazy w konfiguratorze.
        </p>
      ) : null}
      {totalActiveInLayoutCount != null ? (
        <p className="mt-2 text-xs text-neutral-500">
          W układzie łącznie: {totalActiveInLayoutCount} aktywnych pozycji
          {disabledInLayoutCount > 0 ? ` (+${disabledInLayoutCount} wyłączonych)` : ''}.
        </p>
      ) : null}
    </div>
  )
}
