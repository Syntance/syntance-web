'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackGa4PageView } from '@/lib/analytics/ga4'
import { trackPostHogPageView } from '@/lib/analytics/posthog-client'

export function AnalyticsPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) return

    const query = searchParams?.toString()
    const path = query ? `${pathname}?${query}` : pathname

    trackGa4PageView(path)
    trackPostHogPageView(path)
  }, [pathname, searchParams])

  return null
}
