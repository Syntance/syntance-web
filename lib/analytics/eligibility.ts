const ELIGIBILITY_CACHE_KEY = 'syntance-analytics-eligible'

export async function isAnalyticsEligible(): Promise<boolean> {
  try {
    const cached = sessionStorage.getItem(ELIGIBILITY_CACHE_KEY)
    if (cached === '0') return false
    if (cached === '1') return true

    const res = await fetch('/api/analytics-eligibility', {
      credentials: 'same-origin',
      cache: 'no-store',
    })
    if (!res.ok) return true

    const data = (await res.json()) as { eligible?: boolean }
    const eligible = data.eligible !== false
    sessionStorage.setItem(ELIGIBILITY_CACHE_KEY, eligible ? '1' : '0')
    return eligible
  } catch {
    return true
  }
}

export function clearAnalyticsEligibilityCache(): void {
  sessionStorage.removeItem(ELIGIBILITY_CACHE_KEY)
}
