'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect, useState } from 'react'
import {
  COOKIE_CONSENT_EVENT,
  readCookieConsent,
} from '@/lib/consent'

const ELIGIBILITY_CACHE_KEY = 'posthog-analytics-eligible'

function initPostHog(): typeof posthog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST
  if (!key || !host) return null

  if (!posthog.__loaded) {
    posthog.init(key, {
      api_host: host,
      autocapture: false,
      capture_pageview: 'history_change',
      capture_pageleave: true,
      opt_out_capturing_by_default: true,
      persistence: 'localStorage+cookie',
      session_recording: {
        sampleRate: 0.1,
      },
    })
  }

  return posthog
}

async function isAnalyticsEligible(): Promise<boolean> {
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

async function applyAnalyticsConsent(): Promise<boolean> {
  const consent = readCookieConsent()
  if (!consent?.analytics) {
    if (posthog.__loaded) posthog.opt_out_capturing()
    return false
  }

  const eligible = await isAnalyticsEligible()
  if (!eligible) {
    if (posthog.__loaded) posthog.opt_out_capturing()
    return false
  }

  initPostHog()
  posthog.opt_in_capturing()
  return posthog.__loaded
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<typeof posthog | null>(null)

  useEffect(() => {
    let cancelled = false

    const sync = async () => {
      const active = await applyAnalyticsConsent()
      if (!cancelled && active) setClient(posthog)
      else if (!cancelled) setClient(null)
    }

    void sync()

    const onConsentUpdated = () => {
      sessionStorage.removeItem(ELIGIBILITY_CACHE_KEY)
      void sync()
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentUpdated)
    return () => {
      cancelled = true
      window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentUpdated)
    }
  }, [])

  if (!client) return <>{children}</>
  return <PHProvider client={client}>{children}</PHProvider>
}
