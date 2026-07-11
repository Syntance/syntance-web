export async function isAnalyticsEligible(): Promise<boolean> {
  try {
    const res = await fetch('/api/analytics-eligibility', {
      credentials: 'same-origin',
      cache: 'no-store',
    })
    if (!res.ok) return true

    const data = (await res.json()) as { eligible?: boolean }
    return data.eligible !== false
  } catch {
    return true
  }
}
