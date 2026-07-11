'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { Suspense, useEffect, useState } from 'react'
import { AnalyticsPageView } from '@/components/analytics/page-view-tracker'
import {
  COOKIE_CONSENT_EVENT,
  readCookieConsent,
  type CookiePreferences,
} from '@/lib/consent'
import { isAnalyticsEligible } from '@/lib/analytics/eligibility'
import {
  disableGa4,
  enableGa4,
  loadGa4,
  updateGa4Consent,
} from '@/lib/analytics/ga4'
import {
  disablePostHog,
  enablePostHog,
  getPostHogClient,
  initPostHog,
} from '@/lib/analytics/posthog-client'

async function syncAnalyticsConsent(consent: CookiePreferences | null): Promise<boolean> {
  updateGa4Consent(
    consent ?? { necessary: true, analytics: false, marketing: false },
  )

  if (!consent?.analytics) {
    disableGa4()
    disablePostHog()
    return false
  }

  const eligible = await isAnalyticsEligible()
  if (!eligible) {
    disableGa4()
    disablePostHog()
    return false
  }

  initPostHog()
  enablePostHog()

  try {
    await loadGa4()
    enableGa4()
  } catch {
    disableGa4()
  }

  return getPostHogClient() !== null || Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)
}

function AnalyticsPageViewGate() {
  return (
    <Suspense fallback={null}>
      <AnalyticsPageView />
    </Suspense>
  )
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [posthogClient, setPosthogClient] = useState<typeof posthog | null>(null)
  const [analyticsReady, setAnalyticsReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const sync = async () => {
      const consent = readCookieConsent()
      const active = await syncAnalyticsConsent(consent)
      if (cancelled) return

      setAnalyticsReady(active)
      setPosthogClient(getPostHogClient())
    }

    void sync()

    const onConsentUpdated = () => {
      void sync()
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentUpdated)
    return () => {
      cancelled = true
      window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentUpdated)
    }
  }, [])

  const content = (
    <>
      {analyticsReady ? <AnalyticsPageViewGate /> : null}
      {children}
    </>
  )

  if (!posthogClient) return content
  return <PHProvider client={posthogClient}>{content}</PHProvider>
}
