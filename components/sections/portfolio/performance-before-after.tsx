'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  scoreColorClass,
  scoreRingClass,
  type PerformanceDevice,
  type PortfolioPerformanceReport,
  type PsiCoreMetrics,
} from '@/lib/portfolio-performance'

const METRIC_LABELS: Array<{ key: keyof PsiCoreMetrics; label: string }> = [
  { key: 'fcp', label: 'First Contentful Paint' },
  { key: 'lcp', label: 'Largest Contentful Paint' },
  { key: 'tbt', label: 'Total Blocking Time' },
  { key: 'speedIndex', label: 'Speed Index' },
  { key: 'cls', label: 'Cumulative Layout Shift' },
]

const AUDIT_LABELS: Array<{ key: keyof Pick<PsiCoreMetrics, 'accessibility' | 'bestPractices' | 'seo'>; label: string }> = [
  { key: 'accessibility', label: 'Dostępność' },
  { key: 'bestPractices', label: 'Best Practices' },
  { key: 'seo', label: 'SEO' },
]

function ScoreBadge({ score, label }: { score: number; label: string }) {
  return (
    <div className={`flex flex-col items-center rounded-2xl border px-5 py-4 ${scoreRingClass(score)}`}>
      <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500">{label}</span>
      <span className={`mt-1 text-4xl font-light tabular-nums tracking-tight md:text-5xl ${scoreColorClass(score)}`}>
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

export function PerformanceBeforeAfter({ report }: { report: PortfolioPerformanceReport }) {
  const [device, setDevice] = useState<PerformanceDevice>('mobile')

  const before = report.before[device]
  const after = report.after[device]
  const perfDelta = after.metrics.performance - before.metrics.performance

  return (
    <section aria-labelledby="performance-heading" className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-purple-300/70">
            Core Web Vitals
          </p>
          <h2 id="performance-heading" className="text-2xl font-light tracking-wide text-white md:text-3xl">
            Jak było → jak jest
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-400">
            Pomiary {report.source} — stan po migracji z WordPress na headless (Next.js + Medusa).
            Porównanie przed wdrożeniem optymalizacji i po publikacji nowego stacku.
          </p>
        </div>

        <div
          className="inline-flex gap-1 rounded-full border border-white/10 bg-white/[0.02] p-1"
          role="tablist"
          aria-label="Urządzenie pomiaru"
        >
          {(['mobile', 'desktop'] as const).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={device === id}
              onClick={() => setDevice(id)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                device === id ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {id === 'mobile' ? 'Mobile' : 'Desktop'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <ScoreBadge score={before.metrics.performance} label="Przed" />
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-2xl text-neutral-600" aria-hidden="true">
            →
          </span>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium tabular-nums ${
              perfDelta > 0
                ? 'bg-[oklch(0.78_0.16_145/0.12)] text-[oklch(0.82_0.12_145)]'
                : 'bg-white/10 text-neutral-300'
            }`}
          >
            {perfDelta > 0 ? '+' : ''}
            {perfDelta} pkt
          </span>
        </div>
        <ScoreBadge score={after.metrics.performance} label="Po" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-[0.14em] text-neutral-500">
              <th className="px-4 py-3 font-medium">Metryka</th>
              <th className="px-4 py-3 font-medium">Przed</th>
              <th className="px-4 py-3 font-medium">Po</th>
            </tr>
          </thead>
          <tbody>
            {METRIC_LABELS.map(({ key, label }) => (
              <tr key={key} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3 text-neutral-400">{label}</td>
                <td className="px-4 py-3 tabular-nums text-neutral-500">{before.metrics[key]}</td>
                <td className="px-4 py-3 tabular-nums text-white">{after.metrics[key]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2">
        {AUDIT_LABELS.map(({ key, label }) => (
          <span
            key={key}
            className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-neutral-300"
          >
            {label}: {before.metrics[key]} →{' '}
            <span className="text-[oklch(0.82_0.12_145)]">{after.metrics[key]}</span>
          </span>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <figure className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="border-b border-white/10 px-4 py-2 text-xs text-neutral-500">
            Przed · {before.measuredAt}
          </div>
          <div className="relative aspect-[390/520] w-full bg-neutral-950">
            <Image
              key={before.screenshot}
              src={before.screenshot}
              alt={before.screenshotAlt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top"
              unoptimized={before.screenshot.includes('blob.vercel-storage.com')}
            />
          </div>
        </figure>
        <figure className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="border-b border-white/10 px-4 py-2 text-xs text-neutral-500">
            Po · {after.measuredAt}
          </div>
          <div className="relative aspect-[390/520] w-full bg-neutral-950">
            <Image
              key={after.screenshot}
              src={after.screenshot}
              alt={after.screenshotAlt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top"
              unoptimized={after.screenshot.includes('blob.vercel-storage.com')}
            />
          </div>
        </figure>
      </div>

      <ul className="space-y-2 text-sm leading-relaxed text-neutral-400">
        {report.improvements.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-purple-400/80" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

export { PerformanceTeaser }
