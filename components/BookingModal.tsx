'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  X, Send, Clock, CreditCard, Layers,
  CheckCircle2, Mail, Loader2, Globe,
} from 'lucide-react'

interface BookingDetails {
  projectType: string
  priceNetto: number
  priceBrutto: number
  deposit: number
  days: number
  hours: number
  complexity: 'low' | 'medium' | 'high' | 'very-high'
  itemsCount: number
  selectedItems: string[]
  itemNames: string[]
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  booking: BookingDetails
  /** Zachowane dla kompatybilności wywołania — nieużywane po usunięciu rezerwacji terminu. */
  calendlyUrl?: string
}

export function BookingModal({
  isOpen,
  onClose,
  booking,
}: BookingModalProps) {
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [hasExistingSite, setHasExistingSite] = useState(false)
  const [existingSiteUrl, setExistingSiteUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset stanu po otwarciu modala (rules: 60-quality / "Race conditions").
  useEffect(() => {
    if (isOpen) {
      setStep('form')
      setError('')
    }
  }, [isOpen])

  // Body scroll lock z zachowaniem pozycji (mobile UX) + Escape close (a11y).
  useEffect(() => {
    if (!isOpen) return

    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.overflow = 'hidden'

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)

    return () => {
      const top = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
      const restored = top ? parseInt(top.replace('-', '').replace('px', ''), 10) : scrollY
      window.scrollTo(0, restored)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim()) {
      setError('Proszę podać imię i email')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Podaj prawidłowy adres email')
      return
    }

    // Walidacja URL gdy zaznaczono istniejącą stronę.
    if (hasExistingSite && existingSiteUrl.trim()) {
      const url = existingSiteUrl.trim()
      const looksLikeUrl = /^https?:\/\/.+\..+/i.test(url) || /^[\w-]+(\.[\w-]+)+/i.test(url)
      if (!looksLikeUrl) {
        setError('Podaj prawidłowy link do strony (np. https://twojadomena.pl)')
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Send inquiry (30s timeout — rules 60-quality "Timeouty").
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(30_000),
        body: JSON.stringify({
          name,
          email,
          companyName: companyName.trim() || undefined,
          phone,
          description: description.trim() || undefined,
          hasExistingSite,
          existingSiteUrl: hasExistingSite ? existingSiteUrl.trim() || undefined : undefined,
          booking: {
            projectType: booking.projectType,
            priceNetto: booking.priceNetto,
            priceBrutto: booking.priceBrutto,
            deposit: booking.deposit,
            days: booking.days,
            hours: booking.hours,
            complexity: booking.complexity,
            itemsCount: booking.itemsCount,
            items: booking.itemNames,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Nie udało się wysłać zapytania')
      }

      setStep('success')
    } catch (err) {
      console.error('Inquiry failed:', err)
      if (err instanceof DOMException && err.name === 'TimeoutError') {
        setError('Połączenie zbyt wolne. Spróbuj ponownie za chwilę.')
      } else {
        setError('Nie udało się wysłać zapytania. Spróbuj ponownie.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const getComplexityLabel = (complexity: string) => {
    switch (complexity) {
      case 'very-high': return 'Bardzo wysoka'
      case 'high': return 'Wysoka'
      case 'medium': return 'Średnia'
      default: return 'Niska'
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'very-high': return 'text-purple-400'
      case 'high': return 'text-red-400'
      case 'medium': return 'text-amber-400'
      default: return 'text-green-400'
    }
  }

  if (!isOpen || !mounted) return null

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed z-[10000] w-full max-w-2xl px-4"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxHeight: '90vh',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-modal-title"
      >
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 rounded-3xl opacity-30 blur-xl" />

        <div className="relative bg-gray-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 shrink-0">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Send size={18} className="text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 id="inquiry-modal-title" className="text-lg font-medium text-white">
                {step === 'form' && 'Wyślij formularz o wycenę'}
                {step === 'success' && 'Zapytanie wysłane!'}
              </h3>
              <p className="text-sm text-gray-400">
                {step === 'form' && 'Sprawdź podsumowanie i napisz parę słów o projekcie'}
                {step === 'success' && 'Otrzymasz potwierdzenie na email'}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Zamknij"
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 scrollbar-thin pr-1">
            {step === 'form' && (
              <div className="p-6 space-y-6">
                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                      <CreditCard size={16} />
                      Cena netto
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {booking.priceNetto.toLocaleString('pl-PL')} <span className="text-sm font-normal text-gray-400">PLN</span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Brutto: {booking.priceBrutto.toLocaleString('pl-PL')} PLN
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                      <Clock size={16} />
                      Czas realizacji
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {booking.days} <span className="text-sm font-normal text-gray-400">dni roboczych</span>
                    </div>
                    <div className={`text-sm mt-1 ${getComplexityColor(booking.complexity)}`}>
                      Złożoność: {getComplexityLabel(booking.complexity)}
                    </div>
                  </div>
                </div>

                {/* Deposit info */}
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Zaliczka do zapłaty</span>
                    <span className="text-xl font-bold text-purple-400">
                      {booking.deposit.toLocaleString('pl-PL')} PLN
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Płatność po akceptacji zlecenia, przed rozpoczęciem prac. Termin realizacji ustalimy indywidualnie.
                  </p>
                </div>

                {/* Selected items */}
                <div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                    <Layers size={16} />
                    Wybrane elementy ({booking.itemsCount})
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 max-h-40 overflow-y-auto">
                    <div className="p-3 space-y-1">
                      {booking.itemNames.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Inquiry form */}
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="inquiry-name" className="block text-sm text-gray-400 mb-1">
                        Imię i nazwisko *
                      </label>
                      <input
                        id="inquiry-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        placeholder="Jan Kowalski"
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-base placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="inquiry-email" className="block text-sm text-gray-400 mb-1">
                        Email *
                      </label>
                      <input
                        id="inquiry-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        inputMode="email"
                        placeholder="jan@firma.pl"
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-base placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="inquiry-company" className="block text-sm text-gray-400 mb-1">
                        Nazwa firmy (opcjonalnie)
                      </label>
                      <input
                        id="inquiry-company"
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        autoComplete="organization"
                        placeholder="Firma sp. z o.o."
                        maxLength={120}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-base placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="inquiry-phone" className="block text-sm text-gray-400 mb-1">
                        Telefon (opcjonalnie)
                      </label>
                    <input
                      id="inquiry-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="+48 123 456 789"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-base placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="inquiry-description" className="block text-sm text-gray-400 mb-1">
                      Krótki opis firmy i potrzeb (opcjonalnie)
                    </label>
                    <textarea
                      id="inquiry-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Czym zajmuje się Twoja firma? Co chcesz osiągnąć dzięki nowej stronie?"
                      rows={4}
                      maxLength={2000}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-base placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-y min-h-[96px]"
                    />
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {description.length}/2000
                    </div>
                  </div>

                  {/* Existing site checkbox + link field */}
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        checked={hasExistingSite}
                        onChange={(e) => {
                          setHasExistingSite(e.target.checked)
                          if (!e.target.checked) setExistingSiteUrl('')
                        }}
                        className="mt-0.5 w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-2 focus:ring-purple-500/40 cursor-pointer"
                      />
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        Mam już stronę internetową
                      </span>
                    </label>

                    {hasExistingSite && (
                      <div className="pl-8">
                        <label htmlFor="inquiry-existing-url" className="block text-sm text-gray-400 mb-1">
                          Link do obecnej strony
                        </label>
                        <div className="relative">
                          <Globe
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                            aria-hidden="true"
                          />
                          <input
                            id="inquiry-existing-url"
                            type="url"
                            value={existingSiteUrl}
                            onChange={(e) => setExistingSiteUrl(e.target.value)}
                            autoComplete="url"
                            inputMode="url"
                            placeholder="https://twojadomena.pl"
                            className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-base placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div role="alert" className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                        <span>Wysyłam zapytanie...</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} aria-hidden="true" />
                        <span>Wyślij formularz</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-gray-500 text-center leading-relaxed">
                    Termin realizacji ustalimy indywidualnie po kontakcie. Odpowiadamy w 24h.
                  </p>
                </form>
              </div>
            )}

            {step === 'success' && (
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 size={40} className="text-green-400" />
                </div>

                <div>
                  <h4 className="text-2xl font-medium text-white mb-2">
                    Świetnie! Zapytanie wysłane
                  </h4>
                  <p className="text-gray-400">
                    Otrzymasz email z potwierdzeniem.<br />
                    Skontaktujemy się w ciągu 24h, żeby ustalić termin realizacji.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-left">
                  <div className="text-sm text-gray-400 mb-2">Podsumowanie wyceny:</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Typ projektu:</span>
                      <span className="text-white font-medium">{booking.projectType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cena netto:</span>
                      <span className="text-white font-medium">{booking.priceNetto.toLocaleString('pl-PL')} PLN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Czas realizacji:</span>
                      <span className="text-white font-medium">{booking.days} dni roboczych</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Zaliczka:</span>
                      <span className="text-purple-400 font-medium">{booking.deposit.toLocaleString('pl-PL')} PLN</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-center text-sm text-gray-400">
                  <Mail size={14} />
                  Wysłaliśmy szczegóły na {email}
                </div>

                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl transition-all border border-white/10"
                >
                  Zamknij
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )

  return createPortal(modalContent, document.body)
}
