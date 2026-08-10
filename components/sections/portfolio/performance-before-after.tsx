'use client'

import { Fragment } from 'react'
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

function DualScoreCard({
  label,
  mobile,
  desktop,
}: {
  label: string
  mobile: number
  desktop: number
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4">
      <span className="block text-center text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500">
        {label}
      </span>
      <div className="mt-3 grid grid-cols-2 divide-x divide-white/10">
        {PERFORMANCE_DEVICES.map(({ device, label: deviceLabel }) => (
          <div key={device} className="flex flex-col items-center px-1">
            <span className="text-[10px] uppercase tracking-[0.12em] text-neutral-500">
              {deviceLabel}
            </span>
            <span
              className={`text-3xl font-light tabular-nums tracking-tight md:text-4xl ${scoreColorClass(
                device === 'mobile' ? mobile : desktop,
              )}`}
            >
              {device === 'mobile' ? mobile : desktop}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Data pomiaru — jedna linia, jeśli oba urządzenia mierzone tego samego dnia. */
function measuredAtLabel(report: PortfolioPerformanceReport): string | null {
  const mobile = report.after.mobile.measuredAt.trim()
  const desktop = report.after.desktop.measuredAt.trim()
  if (!mobile && !desktop) return null
  if (mobile === desktop) return `Pomiar: ${mobile}`
  return [mobile ? `Mobile: ${mobile}` : null, desktop ? `Desktop: ${desktop}` : null]
    .filter(Boolean)
    .join(' · ')
}

/**
 * Nowa strona — nie było wersji „przed”, więc pokazujemy sam wynik po publikacji.
 * Bez przełącznika urządzeń: mobile i desktop obok siebie.
 */
function AfterOnlyReport({ report }: { report: PortfolioPerformanceReport }) {
  const mobile = report.after.mobile
  const desktop = report.after.desktop
  const measuredAt = measuredAtLabel(report)
  const screenshots = PERFORMANCE_DEVICES.filter(({ device }) => report.after[device].screenshot)

  return (
    <section aria-labelledby="performance-heading" className="space-y-8">
      <SectionHeader heading="Wyniki po realizacji" report={report} />

      <div className="space-y-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PSI_SCORE_METRIC_FIELDS.map(({ key, label }) => (
            <DualScoreCard
              key={key}
              label={label}
              mobile={mobile.metrics[key]}
              desktop={desktop.metrics[key]}
            />
          ))}
        </div>
        {measuredAt ? (
          <p className="text-center text-xs text-neutral-500 sm:text-right">{measuredAt}</p>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-[0.14em] text-neutral-500">
              <th className="px-4 py-3 font-medium">Metryka</th>
              {PERFORMANCE_DEVICES.map(({ device, label }) => (
                <th key={device} className="px-4 py-3 font-medium">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRIC_LABELS.map(({ key, label }) => (
              <tr key={key} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3 text-neutral-400">{label}</td>
                <td className="px-4 py-3 tabular-nums text-white">{mobile.metrics[key]}</td>
                <td className="px-4 py-3 tabular-nums text-white">{desktop.metrics[key]}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

/** Performance przed → po dla jednego urządzenia, jako samodzielna karta. */
function DevicePerformanceCompare({
  label,
  before,
  after,
}: {
  label: string
  before: PsiDeviceReport
  after: PsiDeviceReport
}) {
  const delta = after.metrics.performance - before.metrics.performance

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <p className="mb-3 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-400">
        {label}
      </p>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <ScoreBadge score={before.metrics.performance} label="Przed" />
        <DeltaMarker delta={delta} />
        <ScoreBadge score={after.metrics.performance} label="Po" />
      </div>
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
        {PERFORMANCE_DEVICES.map(({ device, label }) => (
          <DevicePerformanceCompare
            key={device}
            label={label}
            before={report.before[device]}
            after={report.after[device]}
          />
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
            <tr className="bg-white/[0.02]">
              <th rowSpan={2} className="border-b border-white/10 px-4 py-3 font-medium align-bottom">
                Metryka
              </th>
              {PERFORMANCE_DEVICES.map(({ device, label }) => (
                <th
                  key={device}
                  colSpan={2}
                  className="border-b border-white/5 border-l border-l-white/10 px-4 py-2 text-center font-medium text-neutral-300"
                >
                  {label}
                </th>
              ))}
            </tr>
            <tr className="bg-white/[0.02]">
              {PERFORMANCE_DEVICES.map(({ device }) => (
                <Fragment key={device}>
                  <th className="border-b border-white/10 border-l border-l-white/10 px-4 py-2 font-medium">
                    Przed
                  </th>
                  <th className="border-b border-white/10 px-4 py-2 font-medium">Po</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRIC_LABELS.map(({ key, label }) => (
              <tr key={key} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3 text-neutral-400">{label}</td>
                {PERFORMANCE_DEVICES.map(({ device }) => (
                  <Fragment key={device}>
                    <td className="border-l border-white/10 px-4 py-3 tabular-nums text-neutral-500">
                      {report.before[device].metrics[key]}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-white">
                      {report.after[device].metrics[key]}
                    </td>
                  </Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2">
        {PERFORMANCE_DEVICES.map(({ device, label }) => (
          <div key={device} className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500">
              {label}
            </span>
            {AUDIT_LABELS.map(({ key, label: auditLabel }) => (
              <span
                key={key}
                className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-neutral-300"
              >
                {auditLabel}: {report.before[device].metrics[key]} →{' '}
                <span className="text-[oklch(0.82_0.12_145)]">
                  {report.after[device].metrics[key]}
                </span>
              </span>
            ))}
          </div>
        ))}
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
