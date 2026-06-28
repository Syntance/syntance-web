'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect, useState } from 'react'
import {
  COOKIE_CONSENT_EVENT,
  readCookieConsent,
} from '@/lib/consent'

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

function applyAnalyticsConsent(): void {
  const consent = readCookieConsent()
  if (!consent?.analytics) {
    if (posthog.__loaded) posthog.opt_out_capturing()
    return
  }

  initPostHog()
  posthog.opt_in_capturing()
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<typeof posthog | null>(null)

  useEffect(() => {
    applyAnalyticsConsent()
    if (readCookieConsent()?.analytics) {
      setClient(posthog.__loaded ? posthog : null)
    }

    const onConsentUpdated = () => {
      applyAnalyticsConsent()
      setClient(readCookieConsent()?.analytics && posthog.__loaded ? posthog : null)
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentUpdated)
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentUpdated)
  }, [])

  if (!client) return <>{children}</>
  return <PHProvider client={client}>{children}</PHProvider>
}
