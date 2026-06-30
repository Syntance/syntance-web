import {
  sanitizeAnalyticsProps,
  type AnalyticsEventName,
  type AnalyticsEventProps,
} from '@/lib/analytics/events'
import { trackGa4Event } from '@/lib/analytics/ga4'
import { trackPostHogEvent } from '@/lib/analytics/posthog-client'

function withPageContext(props?: AnalyticsEventProps): AnalyticsEventProps {
  if (typeof window === 'undefined') return props ?? {}

  return {
    page_path: window.location.pathname,
    page_title: document.title,
    ...props,
  }
}

export function trackAnalyticsEvent(
  event: AnalyticsEventName | string,
  props?: AnalyticsEventProps,
): void {
  if (typeof window === 'undefined') return

  const payload = sanitizeAnalyticsProps(withPageContext(props))

  try {
    trackPostHogEvent(event, payload)
  } catch {
    // ignore
  }

  try {
    trackGa4Event(event, payload)
  } catch {
    // ignore
  }
}

/** @deprecated Użyj trackAnalyticsEvent — alias dla istniejących wywołań. */
export const trackEvent = trackAnalyticsEvent
