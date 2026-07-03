export type PsiCoreMetrics = {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
  fcp: string
  lcp: string
  tbt: string
  speedIndex: string
  cls: string
}

export const PSI_SCORE_METRIC_FIELDS = [
  { key: 'performance', label: 'Performance', hint: '0–100' },
  { key: 'accessibility', label: 'Dostępność', hint: '0–100' },
  { key: 'bestPractices', label: 'Best Practices', hint: '0–100' },
  { key: 'seo', label: 'SEO', hint: '0–100' },
] as const satisfies ReadonlyArray<{
  key: keyof Pick<PsiCoreMetrics, 'performance' | 'accessibility' | 'bestPractices' | 'seo'>
  label: string
  hint: string
}>

export const PSI_TIMING_METRIC_FIELDS = [
  { key: 'fcp', label: 'FCP', displayLabel: 'First Contentful Paint', hint: 'np. 1,1 s' },
  { key: 'lcp', label: 'LCP', displayLabel: 'Largest Contentful Paint', hint: 'np. 2,5 s' },
  { key: 'tbt', label: 'TBT', displayLabel: 'Total Blocking Time', hint: 'np. 40 ms' },
  { key: 'speedIndex', label: 'Speed Index', displayLabel: 'Speed Index', hint: 'np. 2,8 s' },
  { key: 'cls', label: 'CLS', displayLabel: 'Cumulative Layout Shift', hint: 'np. 0,083' },
] as const satisfies ReadonlyArray<{
  key: keyof Pick<PsiCoreMetrics, 'fcp' | 'lcp' | 'tbt' | 'speedIndex' | 'cls'>
  label: string
  displayLabel: string
  hint: string
}>

export const DEFAULT_PERFORMANCE_INTRO =
  'stan po migracji z WordPress na headless (Next.js + Medusa). Porównanie przed wdrożeniem optymalizacji i po publikacji nowego stacku.'

export type PsiDeviceReport = {
  measuredAt: string
  metrics: PsiCoreMetrics
  screenshot: string
  screenshotAlt: string
}

export type PortfolioPerformanceReport = {
  source: string
  /** Akapit pod nagłówkiem sekcji PageSpeed na case study. */
  intro?: string
  before: {
    mobile: PsiDeviceReport
    desktop: PsiDeviceReport
  }
  after: {
    mobile: PsiDeviceReport
    desktop: PsiDeviceReport
  }
  improvements: readonly string[]
}

export type PerformanceDevice = 'mobile' | 'desktop'

export function scoreTone(score: number): 'poor' | 'mid' | 'good' {
  if (score >= 90) return 'good'
  if (score >= 50) return 'mid'
  return 'poor'
}

export function scoreColorClass(score: number): string {
  const tone = scoreTone(score)
  if (tone === 'good') return 'text-[oklch(0.78_0.16_145)]'
  if (tone === 'mid') return 'text-[oklch(0.78_0.14_75)]'
  return 'text-[oklch(0.68_0.18_25)]'
}

export function scoreRingClass(score: number): string {
  const tone = scoreTone(score)
  if (tone === 'good') return 'border-[oklch(0.78_0.16_145/0.45)] bg-[oklch(0.78_0.16_145/0.08)]'
  if (tone === 'mid') return 'border-[oklch(0.78_0.14_75/0.45)] bg-[oklch(0.78_0.14_75/0.08)]'
  return 'border-[oklch(0.68_0.18_25/0.45)] bg-[oklch(0.68_0.18_25/0.08)]'
}
