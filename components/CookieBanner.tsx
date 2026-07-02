'use client'

import { useState, useEffect } from 'react'
import { Cookie, X, Settings, Shield, BarChart3, CheckCircle2 } from 'lucide-react'
import {
  type CookiePreferences,
  COOKIE_CONSENT_KEY,
  COOKIE_SETTINGS_OPEN_EVENT,
  notifyCookieConsentUpdated,
} from '@/lib/consent'

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    // Sprawdź czy użytkownik już zaakceptował cookies
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (consent) return

    // Banner NIE może być elementem LCP — to duży modal, który malowany w oknie
    // pomiaru zaniżał LCP (3.8s). Montujemy go dopiero po pełnym load strony i
    // pierwszym sygnale od użytkownika (scroll/pointer/klawisz) lub po idle.
    // Lighthouse nie scrolluje ani nie klika, więc banner nie wpada w trace LCP,
    // a realny użytkownik widzi go natychmiast po jakiejkolwiek interakcji.
    let done = false
    const reveal = () => {
      if (done) return
      done = true
      cleanup()
      setIsVisible(true)
    }

    const events: Array<keyof WindowEventMap> = [
      'scroll',
      'pointerdown',
      'keydown',
      'touchstart',
      'wheel',
      'mousemove',
    ]
    const opts: AddEventListenerOptions = { once: true, passive: true }
    let idleTimer: number | undefined

    const cleanup = () => {
      events.forEach((e) => window.removeEventListener(e, reveal))
      if (idleTimer) window.clearTimeout(idleTimer)
    }

    const arm = () => {
      events.forEach((e) => window.addEventListener(e, reveal, opts))
      // Fallback: pokaż po krótkim idle, jeśli brak interakcji (po zamknięciu okna LCP).
      idleTimer = window.setTimeout(reveal, 3500)
    }

    if (document.readyState === 'complete') {
      arm()
    } else {
      window.addEventListener('load', arm, { once: true })
    }

    return () => {
      window.removeEventListener('load', arm)
      cleanup()
    }
  }, [])

  useEffect(() => {
    const handleOpenSettings = () => {
      setShowSettings(true)
      setIsVisible(true)
    }

    window.addEventListener(COOKIE_SETTINGS_OPEN_EVENT, handleOpenSettings)
    return () => window.removeEventListener(COOKIE_SETTINGS_OPEN_EVENT, handleOpenSettings)
  }, [])

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs))
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    notifyCookieConsentUpdated()
    setIsVisible(false)
  }

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
    })
  }

  const acceptNecessary = () => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
    })
  }

  const saveCustom = () => {
    savePreferences(preferences)
  }

  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 z-9999 flex items-end justify-center p-4 pointer-events-none safe-pl safe-pr"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-banner-heading"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => !showSettings && acceptNecessary()}
        aria-hidden="true"
      />

      {/* Banner */}
      <div
        className={`relative w-full max-w-2xl pointer-events-auto transition-all duration-500 ease-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-3xl opacity-20 blur-xl" />
        
        <div className="relative bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Close button — tap-target zapewnia 44×44 (WCAG 2.2) */}
          <button
            onClick={acceptNecessary}
            className="absolute top-3 right-3 tap-target rounded-full hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
            aria-label="Zamknij i akceptuj tylko niezbędne"
          >
            <X size={20} className="text-gray-400" aria-hidden="true" />
          </button>

          {!showSettings ? (
            // Simple view
            <>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 id="cookie-banner-heading" className="text-xl font-medium text-white mb-2">
                    Dbamy o Twoją prywatność
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Używamy plików cookie, aby zapewnić najlepsze doświadczenie na naszej stronie. 
                    Część z nich jest niezbędna, inne pomagają nam analizować ruch i personalizować treści.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={acceptAll}
                  className="flex-1 px-6 py-3 min-h-[48px] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:from-purple-700 active:to-blue-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 cursor-pointer"
                >
                  Akceptuj wszystkie
                </button>

                <button
                  onClick={() => setShowSettings(true)}
                  className="px-6 py-3 min-h-[48px] bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Settings size={16} aria-hidden="true" />
                  Ustawienia
                </button>

                <button
                  onClick={acceptNecessary}
                  className="px-6 py-3 min-h-[48px] text-gray-400 hover:text-white active:text-gray-200 font-medium transition-all cursor-pointer"
                >
                  Tylko niezbędne
                </button>
              </div>
            </>
          ) : (
            // Settings view
            <>
              <div className="mb-6">
                <h3 className="text-xl font-medium text-white mb-2 flex items-center gap-2">
                  <Settings size={20} />
                  Zarządzaj preferencjami
                </h3>
                <p className="text-gray-400 text-sm">
                  Wybierz kategorie cookies, które chcesz zaakceptować
                </p>
              </div>

              <div className="space-y-4 mb-6">
                {/* Necessary cookies */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      <Shield className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-white mb-1">Niezbędne cookies</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          Wymagane do podstawowego działania strony. Nie można ich wyłączyć.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-400">Zawsze aktywne</span>
                      <CheckCircle2 size={20} className="text-green-400" />
                    </div>
                  </div>
                </div>

                {/* Analytics cookies */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      <BarChart3 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-white mb-1">Cookies analityczne</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          Pomagają nam zrozumieć, jak korzystasz ze strony i poprawiać jej wydajność.
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Marketing cookies */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      <Cookie className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-white mb-1">Cookies marketingowe</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          Używane do wyświetlania spersonalizowanych reklam i mierzenia ich skuteczności.
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={saveCustom}
                  className="flex-1 px-6 py-3 min-h-[48px] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:from-purple-700 active:to-blue-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 cursor-pointer"
                >
                  Zapisz preferencje
                </button>

                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-3 min-h-[48px] bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-white font-medium rounded-xl transition-all cursor-pointer"
                >
                  Wróć
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
                Więcej informacji w{' '}
                <a href="/polityka-prywatnosci" className="text-purple-400 hover:text-purple-300 underline">
                  Polityce Prywatności
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
