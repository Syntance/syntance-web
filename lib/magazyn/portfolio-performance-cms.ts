import type {
  PerformanceDevice,
  PortfolioPerformanceReport,
  PsiCoreMetrics,
  PsiDeviceReport,
} from '@/lib/portfolio-performance'

export type PageSpeedScreenshotSlot =
  | 'mobile-before'
  | 'desktop-before'
  | 'mobile-after'
  | 'desktop-after'

export const PAGESPEED_SCREENSHOT_SLOTS: Array<{
  slot: PageSpeedScreenshotSlot
  label: string
  phase: 'before' | 'after'
  device: PerformanceDevice
}> = [
  { slot: 'mobile-before', label: 'Mobile — przed', phase: 'before', device: 'mobile' },
  { slot: 'desktop-before', label: 'Desktop — przed', phase: 'before', device: 'desktop' },
  { slot: 'mobile-after', label: 'Mobile — po', phase: 'after', device: 'mobile' },
  { slot: 'desktop-after', label: 'Desktop — po', phase: 'after', device: 'desktop' },
]

const EMPTY_METRICS: PsiCoreMetrics = {
  performance: 0,
  accessibility: 0,
  bestPractices: 0,
  seo: 0,
  fcp: '',
  lcp: '',
  tbt: '',
  speedIndex: '',
  cls: '',
}

function emptyDeviceReport(): PsiDeviceReport {
  return {
    measuredAt: '',
    metrics: { ...EMPTY_METRICS },
    screenshot: '',
    screenshotAlt: '',
  }
}

export function createEmptyPerformanceReport(): PortfolioPerformanceReport {
  return {
    source: 'Google PageSpeed Insights',
    intro: '',
    before: {
      mobile: emptyDeviceReport(),
      desktop: emptyDeviceReport(),
    },
    after: {
      mobile: emptyDeviceReport(),
      desktop: emptyDeviceReport(),
    },
    improvements: [],
  }
}

export function hasPerformanceContent(
  report: PortfolioPerformanceReport | null | undefined,
): boolean {
  if (!report) return false
  const phases = [report.before, report.after] as const
  return phases.some(
    (phase) =>
      phase.mobile.screenshot.trim() ||
      phase.desktop.screenshot.trim() ||
      phase.mobile.metrics.performance > 0 ||
      phase.desktop.metrics.performance > 0,
  )
}

export function getDeviceReport(
  report: PortfolioPerformanceReport,
  phase: 'before' | 'after',
  device: PerformanceDevice,
): PsiDeviceReport {
  return report[phase][device]
}

export function patchDeviceReport(
  report: PortfolioPerformanceReport,
  phase: 'before' | 'after',
  device: PerformanceDevice,
  patch: Partial<PsiDeviceReport>,
): PortfolioPerformanceReport {
  return {
    ...report,
    [phase]: {
      ...report[phase],
      [device]: {
        ...report[phase][device],
        ...patch,
        metrics: patch.metrics
          ? { ...report[phase][device].metrics, ...patch.metrics }
          : report[phase][device].metrics,
      },
    },
  }
}

export function patchPerformanceScreenshot(
  report: PortfolioPerformanceReport,
  slot: PageSpeedScreenshotSlot,
  screenshot: string,
  screenshotAlt?: string,
): PortfolioPerformanceReport {
  const meta = PAGESPEED_SCREENSHOT_SLOTS.find((item) => item.slot === slot)
  if (!meta) return report

  return patchDeviceReport(report, meta.phase, meta.device, {
    screenshot,
    ...(screenshotAlt !== undefined ? { screenshotAlt } : {}),
  })
}

export function filenameForPageSpeedSlot(slot: PageSpeedScreenshotSlot): string {
  switch (slot) {
    case 'mobile-before':
      return 'pagespeed-mobile-before.webp'
    case 'desktop-before':
      return 'pagespeed-desktop-before.webp'
    case 'mobile-after':
      return 'pagespeed-mobile-after.webp'
    case 'desktop-after':
      return 'pagespeed-desktop-after.webp'
  }
}

export function publicPathForPageSpeedScreenshot(slug: string, slot: PageSpeedScreenshotSlot): string {
  return `/portfolio/${slug}/${filenameForPageSpeedSlot(slot)}`
}
