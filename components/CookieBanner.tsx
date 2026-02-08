'use client'

import { useState, useEffect } from 'react'
import { Cookie, X, Settings, Shield, BarChart3, CheckCircle2 } from 'lucide-react'

type CookiePreferences = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

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
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Opóźnienie dla lepszego UX
      setTimeout(() => setIsVisible(true), 1000)
    }
  }, [])

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs))
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    
    // Tutaj możesz dodać logikę inicjalizacji analytics/marketing
    if (prefs.analytics) {
      // np. inicjalizacja Google Analytics
      console.log('Analytics enabled')
    }
    if (prefs.marketing) {
      // np. inicjalizacja Meta Pixel
      console.log('Marketing enabled')
    }
    
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
    <div className="fixed inset-0 z-[9999] flex items-end justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => !showSettings && acceptNecessary()}
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
          {/* Close button */}
          <button
            onClick={acceptNecessary}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Zamknij"
          >
            <X size={20} className="text-gray-400" />
          </button>

          {!showSettings ? (
            // Simple view
            <>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium text-white mb-2">
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                >
                  Akceptuj wszystkie
                </button>
                
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Settings size={16} />
                  Ustawienia
                </button>
                
                <button
                  onClick={acceptNecessary}
                  className="px-6 py-3 text-gray-400 hover:text-white font-medium transition-all"
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25"
                >
                  Zapisz preferencje
                </button>
                
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all"
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
