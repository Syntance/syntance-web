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

export type PsiDeviceReport = {
  measuredAt: string
  metrics: PsiCoreMetrics
  screenshot: string
  screenshotAlt: string
}

export type PortfolioPerformanceReport = {
  source: string
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
