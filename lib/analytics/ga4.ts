import type { CookiePreferences } from '@/lib/consent'
import { mapEventToGa4, sanitizeAnalyticsProps, type AnalyticsEventProps } from '@/lib/analytics/events'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

let ga4Loaded = false
let ga4Enabled = false

function getMeasurementId(): string | undefined {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || undefined
}

export function isGa4Configured(): boolean {
  return Boolean(getMeasurementId())
}

function gtag(...args: unknown[]): void {
  window.gtag?.(...args)
}

export function setGa4DefaultConsent(): void {
  if (!isGa4Configured()) return

  window.dataLayer = window.dataLayer ?? []
  window.gtag =
    window.gtag ??
    function gtagShim(...args: unknown[]) {
      window.dataLayer?.push(args)
    }

  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500,
  })
}

export function updateGa4Consent(consent: CookiePreferences): void {
  if (!isGa4Configured()) return

  gtag('consent', 'update', {
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    ad_storage: consent.marketing ? 'granted' : 'denied',
    ad_user_data: consent.marketing ? 'granted' : 'denied',
    ad_personalization: consent.marketing ? 'granted' : 'denied',
    functionality_storage: consent.necessary ? 'granted' : 'denied',
    personalization_storage: consent.analytics ? 'granted' : 'denied',
  })
}

export async function loadGa4(): Promise<boolean> {
  const measurementId = getMeasurementId()
  if (!measurementId || ga4Loaded) return ga4Loaded

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('GA4 script failed to load'))
    document.head.appendChild(script)
  })

  window.dataLayer = window.dataLayer ?? []
  window.gtag =
    window.gtag ??
    function gtagShim(...args: unknown[]) {
      window.dataLayer?.push(args)
    }

  gtag('js', new Date())
  gtag('config', measurementId, {
    send_page_view: false,
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure',
    allow_google_signals: false,
  })

  ga4Loaded = true
  return true
}

export function enableGa4(): void {
  ga4Enabled = true
}

export function disableGa4(): void {
  ga4Enabled = false
}

export function trackGa4PageView(path: string, title?: string): void {
  if (!ga4Enabled || !ga4Loaded) return

  const measurementId = getMeasurementId()
  if (!measurementId) return

  gtag('event', 'page_view', {
    page_path: path,
    page_title: title ?? document.title,
    page_location: `${window.location.origin}${path}`,
  })
}

export function trackGa4Event(event: string, props?: AnalyticsEventProps): void {
  if (!ga4Enabled || !ga4Loaded) return

  const mapping = mapEventToGa4(event, props)
  if (!mapping) return

  const params = mapping.mapProps?.(sanitizeAnalyticsProps(props) ?? {}) ?? {}
  gtag('event', mapping.event, params)
}
