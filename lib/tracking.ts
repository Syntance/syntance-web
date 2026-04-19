/**
 * Lekki wrapper do trackingu zdarzeń (PostHog / Plausible / Vercel Analytics).
 * Wywołuje `window.posthog.capture(...)` jeśli jest dostępny; w przeciwnym razie no-op.
 *
 * Celowo bez twardej zależności na PostHog — można podpiąć skrypt snippetem
 * w `app/layout.tsx` lub przez provider bez zmian w kodzie wywołań.
 */

type EventProps = Record<string, string | number | boolean | undefined>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GlobalWithTrackers = typeof globalThis & {
  posthog?: { capture?: (event: string, props?: EventProps) => void }
  plausible?: (event: string, options?: { props?: EventProps }) => void
}

export function trackEvent(event: string, props?: EventProps): void {
  if (typeof window === 'undefined') return

  const w = window as GlobalWithTrackers
  try {
    w.posthog?.capture?.(event, props)
  } catch {
    // ignore
  }
  try {
    w.plausible?.(event, props ? { props } : undefined)
  } catch {
    // ignore
  }
}
