import posthog from 'posthog-js'
import type { AnalyticsEventProps } from '@/lib/analytics/events'

let posthogActive = false

export function initPostHog(): typeof posthog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST
  if (!key || !host) return null

  if (!posthog.__loaded) {
    posthog.init(key, {
      api_host: host,
      autocapture: false,
      capture_pageview: false,
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

export function enablePostHog(): void {
  posthogActive = true
  if (posthog.__loaded) posthog.opt_in_capturing()
}

export function disablePostHog(): void {
  posthogActive = false
  if (posthog.__loaded) posthog.opt_out_capturing()
}

export function trackPostHogPageView(path: string): void {
  if (!posthogActive || !posthog.__loaded) return
  posthog.capture('$pageview', {
    $current_url: `${window.location.origin}${path}`,
    page_path: path,
  })
}

export function trackPostHogEvent(event: string, props?: AnalyticsEventProps): void {
  if (!posthogActive || !posthog.__loaded) return
  posthog.capture(event, props)
}

export function getPostHogClient(): typeof posthog | null {
  return posthog.__loaded && posthogActive ? posthog : null
}
