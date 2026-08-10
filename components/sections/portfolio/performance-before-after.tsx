'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import {
  PSI_SCORE_METRIC_FIELDS,
  PSI_TIMING_METRIC_FIELDS,
  performanceIntroPlaceholder,
  resolvePerformanceMode,
  scoreColorClass,
  scoreRingClass,
  type PerformanceDevice,
  type PortfolioPerformanceReport,
  type PsiDeviceReport,
} from '@/lib/portfolio-performance'

const METRIC_LABELS = PSI_TIMING_METRIC_FIELDS.map(({ key, displayLabel }) => ({
  key,
  label: displayLabel,
}))

const AUDIT_LABELS = PSI_SCORE_METRIC_FIELDS.filter(({ key }) => key !== 'performance').map(
  ({ key, label }) => ({ key, label }),
)

/** Kafel wyniku — mieści się po dwa w karcie urządzenia, także na wąskim mobile. */
function ScoreBadge({ score, label }: { score: number; label: string }) {
  return (
    <div className={`flex flex-col items-center rounded-2xl border px-3 py-3 ${scoreRingClass(score)}`}>
      <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500">{label}</span>
      <span className={`mt-1 text-3xl font-light tabular-nums tracking-tight md:text-4xl ${scoreColorClass(score)}`}>
        {score}
      </span>
    </div>
  )
}

const BADGE_BEFORE =
  'rounded-full border border-[oklch(0.68_0.18_25/0.45)] bg-[oklch(0.68_0.18_25/0.08)] px-3 py-1 text-[11px] font-medium tabular-nums text-[oklch(0.68_0.18_25)]'
const BADGE_AFTER =
  'rounded-full border border-[oklch(0.78_0.16_145/0.35)] bg-[oklch(0.78_0.16_145/0.08)] px-3 py-1 text-[11px] font-medium tabular-nums text-[oklch(0.82_0.12_145)]'

function DeviceMetricBadge({
  device,
  value,
  badgeClass,
  prefix,
}: {
  device: 'Mobile' | 'Desktop'
  value: string | number
  badgeClass: string
  prefix?: string
}) {
  return (
    <span className={badgeClass}>
      {prefix ? `${prefix} ` : ''}
      {device} {value}
    </span>
  )
}

function MobileMetricsRow({
  performance,
  lcp,
  badgeClass,
}: {
  performance: number
  lcp: string
  badgeClass: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <DeviceMetricBadge device="Mobile" value={performance} badgeClass={badgeClass} />
      <DeviceMetricBadge device="Mobile" value={lcp} badgeClass={badgeClass} prefix="LCP" />
    </div>
  )
}

function MetricsGroup({
  label,
  performance,
  lcp,
  badgeClass,
}: {
  label: string
  performance: number
  lcp: string
  badgeClass: string
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-300">{label}</span>
      <MobileMetricsRow performance={performance} lcp={lcp} badgeClass={badgeClass} />
    </div>
  )
}

function PerformanceTeaser({ performance }: { performance: PortfolioPerformanceReport }) {
  const mobileAfter = performance.after.mobile.metrics
  const mobileBefore = performance.before.mobile.metrics
  const mode = resolvePerformanceMode(performance)

  if (mode === 'after-only') {
    return (
      <div
        className="flex w-full flex-wrap items-end justify-center gap-4"
        aria-label={`Wydajność mobile po realizacji: ${mobileAfter.performance}, LCP ${mobileAfter.lcp}`}
      >
        <MetricsGroup
          label="Po realizacji"
          performance={mobileAfter.performance}
          lcp={mobileAfter.lcp}
          badgeClass={BADGE_AFTER}
        />
      </div>
    )
  }

  return (
    <div
      className="flex w-full flex-wrap items-end justify-center gap-4"
      aria-label={`Wydajność mobile przed optymalizacją: ${mobileBefore.performance}, LCP ${mobileBefore.lcp}; po: ${mobileAfter.performance}, LCP ${mobileAfter.lcp}`}
    >
      <MetricsGroup
        label="Przed"
        performance={mobileBefore.performance}
        lcp={mobileBefore.lcp}
        badgeClass={BADGE_BEFORE}
      />

      <span className="pb-1 text-lg font-semibold text-neutral-300" aria-hidden="true">
        →
      </span>

      <MetricsGroup
        label="Po"
        performance={mobileAfter.performance}
        lcp={mobileAfter.lcp}
        badgeClass={BADGE_AFTER}
      />
    </div>
  )
}

function ScreenshotFigure({ caption, report }: { caption: string; report: PsiDeviceReport }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="border-b border-white/10 px-4 py-2 text-xs text-neutral-500">{caption}</div>
      <div className="w-full bg-neutral-950">
        <Image
          key={report.screenshot}
          src={report.screenshot}
          alt={report.screenshotAlt}
          width={0}
          height={0}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="h-auto w-full"
          unoptimized={report.screenshot.includes('blob.vercel-storage.com')}
        />
      </div>
    </figure>
  )
}

function ImprovementsList({ items }: { items: readonly string[] }) {
  if (!items.length) return null
  return (
    <ul className="space-y-2 text-sm leading-relaxed text-neutral-400">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-purple-400/80" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  )
}

function SectionHeader({
  heading,
  report,
}: {
  heading: string
  report: PortfolioPerformanceReport
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-purple-300/70">
        Core Web Vitals
      </p>
      <h2 id="performance-heading" className="text-2xl font-light tracking-wide text-white md:text-3xl">
        {heading}
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-400">
        Pomiary {report.source} —{' '}
        {report.intro?.trim() || performanceIntroPlaceholder(resolvePerformanceMode(report))}
      </p>
    </div>
  )
}

/** Kolejność urządzeń wspólna dla obu trybów — mobile jako pierwsze (ważniejsze). */
const PERFORMANCE_DEVICES = [
  { device: 'mobile', label: 'Mobile' },
  { device: 'desktop', label: 'Desktop' },
] as const satisfies ReadonlyArray<{ device: PerformanceDevice; label: string }>

/**
 * Komplet danych jednego urządzenia — wyniki i tabela razem.
 * Na mobile bloki idą jeden pod drugim, od `lg` obok siebie.
 */
function DeviceBlock({
  label,
  meta,
  children,
}: {
  label: string
  meta?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:p-5">
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-200">
          {label}
        </span>
        {meta ? <span className="text-xs text-neutral-500">{meta}</span> : null}
      </p>
      {children}
    </div>
  )
}

/**
 * Tabela bez własnej ramki — mieści się w bloku urządzenia bez przewijania w bok:
 * nazwa metryki zabiera resztę szerokości i zawija, liczby trzymają się prawej.
 */
function MetricsTable({
  columns,
  rows,
}: {
  columns: readonly string[]
  rows: ReadonlyArray<{ key: string; label: string; cells: readonly ReactNode[] }>
}) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.12em] text-neutral-500">
          <th className="w-full py-2 pr-3 font-medium">Metryka</th>
          {columns.map((column) => (
            <th key={column} className="whitespace-nowrap py-2 pl-3 text-right font-medium">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} className="border-b border-white/5 last:border-0">
            <td className="py-2.5 pr-3 text-neutral-400">{row.label}</td>
            {row.cells.map((cell, index) => (
              <td
                key={columns[index]}
                className="whitespace-nowrap py-2.5 pl-3 text-right tabular-nums"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/**
 * Nowa strona — nie było wersji „przed”, więc pokazujemy sam wynik po publikacji.
 * Bez przełącznika urządzeń: mobile i desktop obok siebie.
 */
function AfterOnlyReport({ report }: { report: PortfolioPerformanceReport }) {
  const screenshots = PERFORMANCE_DEVICES.filter(({ device }) => report.after[device].screenshot)

  return (
    <section aria-labelledby="performance-heading" className="space-y-8">
      <SectionHeader heading="Wyniki po realizacji" report={report} />

      <div className="grid gap-4 lg:grid-cols-2">
        {PERFORMANCE_DEVICES.map(({ device, label }) => {
          const deviceReport = report.after[device]
          return (
            <DeviceBlock
              key={device}
              label={label}
              meta={deviceReport.measuredAt.trim() || undefined}
            >
              <div className="grid grid-cols-2 gap-3">
                {PSI_SCORE_METRIC_FIELDS.map(({ key, label: scoreLabel }) => (
                  <ScoreBadge key={key} score={deviceReport.metrics[key]} label={scoreLabel} />
                ))}
              </div>

              <MetricsTable
                columns={['Wynik']}
                rows={METRIC_LABELS.map(({ key, label: metricLabel }) => ({
                  key,
                  label: metricLabel,
                  cells: [
                    <span key="value" className="text-white">
                      {deviceReport.metrics[key]}
                    </span>,
                  ],
                }))}
              />
            </DeviceBlock>
          )
        })}
      </div>

      {screenshots.length ? (
        <div
          className={`grid gap-4 ${
            screenshots.length > 1 ? 'md:grid-cols-2' : 'mx-auto w-full max-w-md'
          }`}
        >
          {screenshots.map(({ device, label }) => (
            <ScreenshotFigure key={device} caption={label} report={report.after[device]} />
          ))}
        </div>
      ) : null}

      <ImprovementsList items={report.improvements} />
    </section>
  )
}

function DeltaMarker({ delta }: { delta: number }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="text-2xl text-neutral-600" aria-hidden="true">
        →
      </span>
      <span
        className={`rounded-full px-3 py-1 text-sm font-medium tabular-nums ${
          delta > 0
            ? 'bg-[oklch(0.78_0.16_145/0.12)] text-[oklch(0.82_0.12_145)]'
            : 'bg-white/10 text-neutral-300'
        }`}
      >
        {delta > 0 ? '+' : ''}
        {delta} pkt
      </span>
    </div>
  )
}

/** Redesign/migracja — oba urządzenia naraz, bez przełącznika. */
function BeforeAfterReport({ report }: { report: PortfolioPerformanceReport }) {
  const screenshots = PERFORMANCE_DEVICES.flatMap(({ device, label }) =>
    (['before', 'after'] as const)
      .filter((phase) => report[phase][device].screenshot)
      .map((phase) => ({
        key: `${device}-${phase}`,
        caption: `${label} — ${phase === 'before' ? 'przed' : 'po'} · ${
          report[phase][device].measuredAt
        }`,
        report: report[phase][device],
      })),
  )

  return (
    <section aria-labelledby="performance-heading" className="space-y-8">
      <SectionHeader heading="Jak było → jak jest" report={report} />

      <div className="grid gap-4 lg:grid-cols-2">
        {PERFORMANCE_DEVICES.map(({ device, label }) => {
          const before = report.before[device]
          const after = report.after[device]
          return (
            <DeviceBlock key={device} label={label}>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <ScoreBadge score={before.metrics.performance} label="Przed" />
                <DeltaMarker delta={after.metrics.performance - before.metrics.performance} />
                <ScoreBadge score={after.metrics.performance} label="Po" />
              </div>

              <MetricsTable
                columns={['Przed', 'Po']}
                rows={METRIC_LABELS.map(({ key, label: metricLabel }) => ({
                  key,
                  label: metricLabel,
                  cells: [
                    <span key="before" className="text-neutral-500">
                      {before.metrics[key]}
                    </span>,
                    <span key="after" className="text-white">
                      {after.metrics[key]}
                    </span>,
                  ],
                }))}
              />

              <div className="flex flex-wrap gap-2">
                {AUDIT_LABELS.map(({ key, label: auditLabel }) => (
                  <span
                    key={key}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-300"
                  >
                    {auditLabel}: {before.metrics[key]} →{' '}
                    <span className="text-[oklch(0.82_0.12_145)]">{after.metrics[key]}</span>
                  </span>
                ))}
              </div>
            </DeviceBlock>
          )
        })}
      </div>

      {screenshots.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {screenshots.map((item) => (
            <ScreenshotFigure key={item.key} caption={item.caption} report={item.report} />
          ))}
        </div>
      ) : null}

      <ImprovementsList items={report.improvements} />
    </section>
  )
}

export function PerformanceBeforeAfter({ report }: { report: PortfolioPerformanceReport }) {
  return resolvePerformanceMode(report) === 'after-only' ? (
    <AfterOnlyReport report={report} />
  ) : (
    <BeforeAfterReport report={report} />
  )
}

export { PerformanceTeaser }
