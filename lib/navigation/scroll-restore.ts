const SCROLL_RESTORE_PREFIX = 'syntance:scroll-restore:'
const POPSTATE_SESSION_KEY = 'syntance:history-back'

let popStateNavigation = false

export function markPopStateNavigation(): void {
  popStateNavigation = true
  try {
    sessionStorage.setItem(POPSTATE_SESSION_KEY, '1')
  } catch {
    // sessionStorage niedostępne (np. tryb prywatny) — flaga w pamięci wystarczy
  }
}

function consumePopStateNavigation(): boolean {
  const value = popStateNavigation
  popStateNavigation = false
  return value
}

function scrollRestoreKey(pathname: string): string {
  return `${SCROLL_RESTORE_PREFIX}${pathname}`
}

function readScrollRestore(pathname: string): number | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(scrollRestoreKey(pathname))
  if (raw === null) return null
  const y = Number.parseInt(raw, 10)
  return Number.isFinite(y) ? y : null
}

export function saveScrollForRestore(pathname: string, scrollY: number): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(scrollRestoreKey(pathname), String(Math.round(scrollY)))
}

export function clearScrollRestore(pathname: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(scrollRestoreKey(pathname))
}

export function consumeScrollRestore(pathname: string): number | null {
  if (typeof window === 'undefined') return null
  const y = readScrollRestore(pathname)
  if (y === null) return null
  sessionStorage.removeItem(scrollRestoreKey(pathname))
  return y
}

export function isNavbarNavigationSource(element: Element): boolean {
  return Boolean(
    element.closest('nav') ||
      element.closest('#mobile-menu-drawer') ||
      element.closest('[data-nav-source="navbar"]'),
  )
}

export function consumeHistoryTraversal(): boolean {
  if (typeof window === 'undefined') return false
  if (consumePopStateNavigation()) return true

  try {
    if (sessionStorage.getItem(POPSTATE_SESSION_KEY) === '1') {
      sessionStorage.removeItem(POPSTATE_SESSION_KEY)
      return true
    }
  } catch {
    // ignore
  }

  const nav = performance.getEntriesByType('navigation').at(-1) as
    | PerformanceNavigationTiming
    | undefined
  return nav?.type === 'back_forward'
}

export function restoreScrollPosition(scrollY: number): void {
  const apply = () => {
    window.scrollTo({ top: scrollY, behavior: 'auto' })
  }

  apply()
  requestAnimationFrame(apply)
  for (const delay of [50, 150, 400, 800, 1200]) {
    window.setTimeout(apply, delay)
  }
}

export function peekScrollRestore(pathname: string): number | null {
  return readScrollRestore(pathname)
}

// Rejestracja PRZED React useLayoutEffect — inaczej cofnięcie nie jest wykrywane na czas.
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    markPopStateNavigation()
  })

  window.addEventListener('pageshow', (event: PageTransitionEvent) => {
    if (event.persisted) {
      markPopStateNavigation()
    }
  })
}
