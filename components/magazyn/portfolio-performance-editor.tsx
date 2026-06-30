'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Loader2, Upload } from 'lucide-react'
import type { PerformanceDevice, PortfolioPerformanceReport, PsiCoreMetrics } from '@/lib/portfolio-performance'
import {
  PAGESPEED_SCREENSHOT_SLOTS,
  createEmptyPerformanceReport,
  getDeviceReport,
  patchDeviceReport,
  type PageSpeedScreenshotSlot,
} from '@/lib/magazyn/portfolio-performance-cms'
import { Field, StringListEditor, magazynInputClass } from '@/components/magazyn/ui'

type Props = {
  slug: string
  report: PortfolioPerformanceReport | null
  projectName: string
  enabled: boolean
  onChange: (report: PortfolioPerformanceReport | null) => void
}

function MetricFields({
  label,
  phase,
  device,
  report,
  onChange,
}: {
  label: string
  phase: 'before' | 'after'
  device: PerformanceDevice
  report: PortfolioPerformanceReport
  onChange: (report: PortfolioPerformanceReport) => void
}) {
  const deviceReport = getDeviceReport(report, phase, device)

  function patchMetrics(field: keyof PsiCoreMetrics, value: string) {
    const numericFields: Array<keyof PsiCoreMetrics> = [
      'performance',
      'accessibility',
      'bestPractices',
      'seo',
    ]
    const parsed = numericFields.includes(field) ? Number.parseInt(value, 10) || 0 : value
    onChange(
      patchDeviceReport(report, phase, device, {
        metrics: { ...deviceReport.metrics, [field]: parsed },
      }),
    )
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500">{label}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-xs text-neutral-400">Data pomiaru</span>
          <input
            className={magazynInputClass}
            value={deviceReport.measuredAt}
            placeholder="7 cze 2026"
            onChange={(e) =>
              onChange(patchDeviceReport(report, phase, device, { measuredAt: e.target.value }))
            }
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-neutral-400">Performance (0–100)</span>
          <input
            type="number"
            min={0}
            max={100}
            className={magazynInputClass}
            value={deviceReport.metrics.performance || ''}
            onChange={(e) => patchMetrics('performance', e.target.value)}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-neutral-400">LCP</span>
          <input
            className={magazynInputClass}
            value={deviceReport.metrics.lcp}
            placeholder="2,5 s"
            onChange={(e) => patchMetrics('lcp', e.target.value)}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-neutral-400">FCP</span>
          <input
            className={magazynInputClass}
            value={deviceReport.metrics.fcp}
            placeholder="1,1 s"
            onChange={(e) => patchMetrics('fcp', e.target.value)}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-neutral-400">Alt zrzutu</span>
          <input
            className={magazynInputClass}
            value={deviceReport.screenshotAlt}
            onChange={(e) =>
              onChange(
                patchDeviceReport(report, phase, device, { screenshotAlt: e.target.value }),
              )
            }
          />
        </label>
      </div>
    </div>
  )
}

function ScreenshotUploadField({
  slug,
  slot,
  label,
  url,
  alt,
  onUploaded,
  onUrlChange,
}: {
  slug: string
  slot: PageSpeedScreenshotSlot
  label: string
  url: string
  alt: string
  onUploaded: (url: string) => void
  onUrlChange: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    if (!slug.trim()) {
      setError('Ustaw slug realizacji przed uploadem zrzutu.')
      return
    }

    setPending(true)
    setError(null)
    try {
      const body = new FormData()
      body.set('slug', slug)
      body.set('slot', slot)
      body.set('file', file)

      const res = await fetch('/api/magazyn/cms/portfolio/upload', {
        method: 'POST',
        body,
      })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? 'Upload nie powiódł się.')
      }
      onUploaded(data.url)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload nie powiódł się.')
    } finally {
      setPending(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="mb-3 text-sm font-medium text-neutral-200">{label}</p>

      {url ? (
        <div className="relative mb-3 aspect-[390/520] overflow-hidden rounded-lg border border-white/10 bg-neutral-950">
          <Image src={url} alt={alt || label} fill sizes="200px" className="object-cover object-top" />
        </div>
      ) : (
        <div className="mb-3 flex aspect-[390/520] items-center justify-center rounded-lg border border-dashed border-white/10 bg-neutral-950/50 text-xs text-neutral-500">
          Brak zrzutu
        </div>
      )}

      <div className="space-y-2">
        <label className="block space-y-1">
          <span className="text-xs text-neutral-400">URL zrzutu (alternatywa dla uploadu)</span>
          <input
            className={magazynInputClass}
            value={url}
            placeholder="/portfolio/slug/pagespeed-mobile-before.webp"
            onChange={(e) => onUrlChange(e.target.value)}
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleFile(file)
            }}
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-neutral-200 hover:bg-white/5 disabled:opacity-50"
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <Upload className="h-3.5 w-3.5" aria-hidden />
            )}
            {pending ? 'Wgrywam…' : 'Wrzuć zrzut PageSpeed'}
          </button>
        </div>

        {error ? <p className="text-xs text-red-400">{error}</p> : null}
      </div>
    </div>
  )
}

export function PortfolioPerformanceEditor({
  slug,
  report,
  projectName,
  enabled,
  onChange,
}: Props) {
  const activeReport = report ?? createEmptyPerformanceReport()

  function updateReport(next: PortfolioPerformanceReport) {
    onChange(next)
  }

  function updateScreenshot(slot: PageSpeedScreenshotSlot, screenshot: string) {
    const meta = PAGESPEED_SCREENSHOT_SLOTS.find((item) => item.slot === slot)
    if (!meta) return
    const altDefault = `PageSpeed Insights ${meta.label.toLowerCase()} — ${projectName}`
    updateReport(
      patchDeviceReport(activeReport, meta.phase, meta.device, {
        screenshot,
        screenshotAlt:
          getDeviceReport(activeReport, meta.phase, meta.device).screenshotAlt || altDefault,
      }),
    )
  }

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-neutral-100">PageSpeed Insights</h3>
          <p className="text-xs text-neutral-500">
            Zrzuty ekranu i wyniki przed/po optymalizacji — sekcja na karcie portfolio i case study.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-neutral-300">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => {
              const nextEnabled = e.target.checked
              if (nextEnabled && !report) {
                onChange(createEmptyPerformanceReport())
                return
              }
              if (!nextEnabled) {
                onChange(null)
              }
            }}
          />
          Włącz sekcję PageSpeed
        </label>
      </div>

      {enabled ? (
        <>
          <Field label="Źródło pomiaru">
            <input
              className={magazynInputClass}
              value={activeReport.source}
              onChange={(e) => updateReport({ ...activeReport, source: e.target.value })}
            />
          </Field>

          <div className="grid gap-4 lg:grid-cols-2">
            {PAGESPEED_SCREENSHOT_SLOTS.map((item) => {
              const deviceReport = getDeviceReport(activeReport, item.phase, item.device)
              return (
                <ScreenshotUploadField
                  key={item.slot}
                  slug={slug}
                  slot={item.slot}
                  label={item.label}
                  url={deviceReport.screenshot}
                  alt={deviceReport.screenshotAlt}
                  onUploaded={(url) => updateScreenshot(item.slot, url)}
                  onUrlChange={(url) => updateScreenshot(item.slot, url)}
                />
              )
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <MetricFields
              label="Mobile — przed"
              phase="before"
              device="mobile"
              report={activeReport}
              onChange={updateReport}
            />
            <MetricFields
              label="Mobile — po"
              phase="after"
              device="mobile"
              report={activeReport}
              onChange={updateReport}
            />
            <MetricFields
              label="Desktop — przed"
              phase="before"
              device="desktop"
              report={activeReport}
              onChange={updateReport}
            />
            <MetricFields
              label="Desktop — po"
              phase="after"
              device="desktop"
              report={activeReport}
              onChange={updateReport}
            />
          </div>

          <StringListEditor
            label="Co poprawiliśmy"
            placeholder="Np. Priorytetyzacja LCP — hero ładuje się od razu"
            items={[...activeReport.improvements]}
            onChange={(improvements) => updateReport({ ...activeReport, improvements })}
          />
        </>
      ) : null}
    </div>
  )
}
