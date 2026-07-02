export type CookiePreferences = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

export const COOKIE_CONSENT_KEY = 'cookie-consent'
export const COOKIE_CONSENT_EVENT = 'cookie-consent-updated'
export const COOKIE_SETTINGS_OPEN_EVENT = 'cookie-settings-open'

export function readCookieConsent(): CookiePreferences | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CookiePreferences
  } catch {
    return null
  }
}

export function notifyCookieConsentUpdated(): void {
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT))
}

export function openCookieSettings(): void {
  window.dispatchEvent(new CustomEvent(COOKIE_SETTINGS_OPEN_EVENT))
}
