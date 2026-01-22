'use client'

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { 
  X, Calendar, Clock, CreditCard, Layers, 
  CheckCircle2, Mail, ArrowRight, ArrowLeft, Loader2
} from 'lucide-react'
import { AvailabilityCalendar } from './AvailabilityCalendar'

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
  calendlyUrl: string // Zachowujemy dla kompatybilności, ale nie używamy
}

export function BookingModal({
  isOpen,
  onClose,
  booking,
}: BookingModalProps) {
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState<'summary' | 'calendar' | 'success'>('summary')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('summary')
      setError('')
      setSelectedDate(null)
    }
  }, [isOpen])

  // Blokuj scroll tła gdy modal jest otwarty
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Oblicz datę końcową projektu
  const calculateEndDate = useCallback((startDate: string, workDays: number): string => {
    const start = new Date(startDate)
    let daysAdded = 0
    const end = new Date(start)
    
    while (daysAdded < workDays) {
      end.setDate(end.getDate() + 1)
      const dayOfWeek = end.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysAdded++
      }
    }
    
    return end.toISOString().split('T')[0]
  }, [])

  const handleSubmitBooking = useCallback(async () => {
    if (!selectedDate) {
      setError('Wybierz datę rozpoczęcia projektu')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const endDate = calculateEndDate(selectedDate, booking.days)

      // 1. Wyślij rezerwację i powiadomienie
      const bookingResponse = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          startDate: selectedDate,
          endDate,
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
            startDate: selectedDate,
            endDate,
          }
        })
      })

      if (!bookingResponse.ok) {
        throw new Error('Nie udało się wysłać rezerwacji')
      }

      // 2. Zablokuj kalendarz (opcjonalne - jeśli Google Calendar jest skonfigurowany)
      try {
        await fetch('/api/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate: selectedDate,
            endDate,
            title: `${booking.projectType} - ${name}`,
            description: `Cena: ${booking.priceNetto.toLocaleString('pl-PL')} PLN\nDni: ${booking.days}\nElementy: ${booking.itemNames.join(', ')}`,
            clientEmail: email,
            clientName: name,
          })
        })
      } catch (calendarErr) {
        // Nie blokuj sukcesu jeśli kalendarz się nie zaktualizował
        console.warn('Calendar blocking failed:', calendarErr)
      }

      setStep('success')
    } catch (err) {
      console.error('Booking failed:', err)
      setError('Nie udało się wysłać rezerwacji. Spróbuj ponownie.')
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedDate, name, email, phone, booking, calculateEndDate])

  const handleProceedToCalendar = async (e: React.FormEvent) => {
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

    setStep('calendar')
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
      >
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 rounded-3xl opacity-30 blur-xl" />
        
        <div className="relative bg-gray-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 shrink-0">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Calendar size={20} className="text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white">
                {step === 'summary' && 'Podsumowanie wyceny'}
                {step === 'calendar' && 'Wybierz termin realizacji'}
                {step === 'success' && 'Rezerwacja wysłana!'}
              </h3>
              <p className="text-sm text-gray-400">
                {step === 'summary' && 'Sprawdź szczegóły przed rezerwacją terminu'}
                {step === 'calendar' && `Projekt wymaga ${booking.days} dni roboczych`}
                {step === 'success' && 'Otrzymasz potwierdzenie na email'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Content */}
          <div className="overflow-y-auto flex-1 scrollbar-thin pr-1">
            {step === 'summary' && (
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
                    <span className="text-gray-300">Zaliczka do zapłaty</span>
                    <span className="text-xl font-bold text-purple-400">
                      {booking.deposit.toLocaleString('pl-PL')} PLN
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Płatność po akceptacji zlecenia, przed rozpoczęciem prac
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
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact form */}
                <form onSubmit={handleProceedToCalendar} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Imię i nazwisko *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Proszę wypełnić to pole.')}
                        onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                        placeholder="Jan Kowalski"
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onInvalid={(e) => {
                          const input = e.target as HTMLInputElement
                          if (input.validity.valueMissing) {
                            input.setCustomValidity('Proszę wypełnić to pole.')
                          } else if (input.validity.typeMismatch) {
                            input.setCustomValidity('Proszę podać prawidłowy adres email.')
                          }
                        }}
                        onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                        placeholder="jan@firma.pl"
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Telefon (opcjonalnie)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+48 123 456 789"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  {error && (
                    <div className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                  >
                    <Calendar size={18} />
                    Wybierz termin realizacji
                    <ArrowRight size={16} />
                  </button>
                </form>
              </div>
            )}

            {step === 'calendar' && (
              <div className="p-6 space-y-6">
                {/* Back button */}
                <button
                  onClick={() => setStep('summary')}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <ArrowLeft size={16} />
                  Wróć do podsumowania
                </button>

                {/* Calendar */}
                <AvailabilityCalendar
                  requiredDays={booking.days}
                  onSelectDate={setSelectedDate}
                  selectedDate={selectedDate}
                />

                {error && (
                  <div className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Submit button */}
                <button
                  onClick={handleSubmitBooking}
                  disabled={!selectedDate || isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Wysyłam rezerwację...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Zarezerwuj ten termin
                    </>
                  )}
                </button>
              </div>
            )}

            {step === 'success' && (
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 size={40} className="text-green-400" />
                </div>
                
                <div>
                  <h4 className="text-2xl font-medium text-white mb-2">
                    Świetnie! Rezerwacja przesłana
                  </h4>
                  <p className="text-gray-400">
                    Otrzymasz email z potwierdzeniem.<br />
                    Skontaktujemy się w celu finalizacji zlecenia.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-left">
                  <div className="text-sm text-gray-400 mb-2">Szczegóły rezerwacji:</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Start projektu:</span>
                      <span className="text-white font-medium">
                        {selectedDate && new Date(selectedDate).toLocaleDateString('pl-PL', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Szacowany koniec:</span>
                      <span className="text-white font-medium">
                        {selectedDate && new Date(calculateEndDate(selectedDate, booking.days)).toLocaleDateString('pl-PL', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </span>
                    </div>
                    <div className="h-px bg-white/10 my-2" />
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
