'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, CheckCircle2, Calendar, Clock, ArrowRight } from 'lucide-react'
import { trackEvent } from '@/lib/tracking'

interface RangeResponse {
  from: string
  availableDates: string[]
  busyDates: string[]
  rules: { slotMinutes: number; maxAdvanceDays: number; timezone: string }
}

interface DaySlot {
  time: string
  startIso: string
  endIso: string
}

interface DayResponse {
  date: string
  slots: DaySlot[]
}

interface MeetingBookingWidgetProps {
  source?: string
}

const WEEKDAYS_SHORT = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz']
const MONTHS = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
]

function toISODate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatPolishDate(iso: string): string {
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('pl-PL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  } catch {
    return iso
  }
}

type Step = 'calendar' | 'form' | 'success'

export default function MeetingBookingWidget({ source }: MeetingBookingWidgetProps) {
  const [range, setRange] = useState<RangeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [daySlots, setDaySlots] = useState<DaySlot[]>([])
  const [loadingDay, setLoadingDay] = useState(false)
  const [step, setStep] = useState<Step>('calendar')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [topic, setTopic] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/meeting/slots?days=60')
        if (!res.ok) throw new Error('Brak dostępności')
        const data = (await res.json()) as RangeResponse
        if (!cancelled) setRange(data)
      } catch (err) {
        console.error('Range fetch error:', err)
        if (!cancelled) {
          setError('Nie udało się załadować kalendarza. Napisz do mnie bezpośrednio: kamil@syntance.com.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selectedDate) {
      setDaySlots([])
      return
    }
    let cancelled = false
    const load = async () => {
      setLoadingDay(true)
      try {
        const res = await fetch(`/api/meeting/slots?date=${selectedDate}`)
        if (!res.ok) throw new Error('slots error')
        const data = (await res.json()) as DayResponse
        if (!cancelled) setDaySlots(data.slots ?? [])
      } catch (err) {
        console.error('Day slots error:', err)
        if (!cancelled) setDaySlots([])
      } finally {
        if (!cancelled) setLoadingDay(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [selectedDate])

  const availableSet = useMemo(() => new Set(range?.availableDates ?? []), [range])

  const days = useMemo(() => {
    const first = new Date(currentMonth)
    first.setDate(1)
    const startDay = (first.getDay() + 6) % 7
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()

    const cells: Array<{ iso: string; day: number; inMonth: boolean; available: boolean; past: boolean }> = []
    const todayIso = toISODate(new Date())

    for (let i = 0; i < startDay; i++) {
      cells.push({ iso: '', day: 0, inMonth: false, available: false, past: false })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(first.getFullYear(), first.getMonth(), d)
      const iso = toISODate(date)
      cells.push({
        iso,
        day: d,
        inMonth: true,
        available: availableSet.has(iso),
        past: iso < todayIso,
      })
    }
    return cells
  }, [currentMonth, availableSet])

  const goToPrevMonth = useCallback(() => {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
  }, [])
  const goToNextMonth = useCallback(() => {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
  }, [])

  const handlePickDate = useCallback(
    (iso: string) => {
      setSelectedDate(iso)
      setSelectedSlot(null)
      trackEvent('bizcard_slot_selected', { slot_date: iso, source })
    },
    [source]
  )

  const handlePickSlot = useCallback(
    (slot: string) => {
      setSelectedSlot(slot)
      trackEvent('bizcard_slot_selected', { slot_date: selectedDate ?? '', slot_time: slot, source })
    },
    [selectedDate, source]
  )

  const handleGoToForm = useCallback(() => {
    if (!selectedDate || !selectedSlot) return
    setStep('form')
  }, [selectedDate, selectedSlot])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setSubmitError(null)
      if (!name.trim() || !email.trim() || !selectedDate || !selectedSlot) {
        setSubmitError('Uzupełnij imię i email.')
        return
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setSubmitError('Podaj prawidłowy adres email.')
        return
      }

      setSubmitting(true)
      try {
        const res = await fetch('/api/meeting-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            company: company.trim() || undefined,
            topic: topic.trim() || undefined,
            date: selectedDate,
            time: selectedSlot,
            source,
          }),
        })
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null
          throw new Error(body?.error || 'Nie udało się zarezerwować terminu.')
        }
        trackEvent('bizcard_booking_completed', {
          slot_date: selectedDate,
          slot_time: selectedSlot,
          email_domain: email.split('@')[1],
          source,
        })
        setStep('success')
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Coś poszło nie tak. Spróbuj ponownie.')
      } finally {
        setSubmitting(false)
      }
    },
    [name, email, company, topic, selectedDate, selectedSlot, source]
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Ładuję dostępne terminy…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-center">
        <AlertCircle className="mx-auto mb-3 h-6 w-6 text-amber-400" />
        <p className="text-gray-300">{error}</p>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-green-400" />
        <h3 className="text-2xl font-medium text-white">Termin zarezerwowany</h3>
        {selectedDate && selectedSlot && (
          <p className="mt-2 text-gray-300">
            {formatPolishDate(selectedDate)}, godz. {selectedSlot}
          </p>
        )}
        <p className="mt-4 text-gray-400">
          Wysłałem Ci potwierdzenie na <strong className="text-white">{email}</strong> — razem z zaproszeniem do
          kalendarza i linkiem Google Meet. Do zobaczenia!
        </p>
      </div>
    )
  }

  if (step === 'form') {
    return (
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8"
      >
        <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-400">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-400" /> {selectedDate && formatPolishDate(selectedDate)}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-400" /> {selectedSlot} ({range?.rules.slotMinutes ?? 30} min)
          </span>
          <button
            type="button"
            onClick={() => setStep('calendar')}
            className="ml-auto text-xs underline underline-offset-2 hover:text-white"
          >
            Zmień termin
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-gray-400">Imię *</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jan Kowalski"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-purple-500 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-gray-400">Email *</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jan@firma.pl"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-purple-500 focus:outline-none"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm text-gray-400">Firma (opcjonalnie)</span>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Nazwa firmy / marki"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-purple-500 focus:outline-none"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm text-gray-400">O czym chcesz pogadać? (opcjonalnie)</span>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              placeholder="Np. chcę zrobić nową stronę dla gabinetu stomatologicznego."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-purple-500 focus:outline-none"
            />
          </label>
        </div>

        {submitError && (
          <div className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">{submitError}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-4 font-medium tracking-wider text-white shadow-lg transition-all hover:shadow-purple-500/30 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Rezerwuję…
            </>
          ) : (
            <>
              Zarezerwuj {range?.rules.slotMinutes ?? 30} minut <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPrevMonth}
          className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Poprzedni miesiąc"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center text-lg font-medium text-white">
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <button
          type="button"
          onClick={goToNextMonth}
          className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Następny miesiąc"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs uppercase tracking-wider text-gray-500">
        {WEEKDAYS_SHORT.map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((cell, i) => {
          if (!cell.inMonth) {
            return <div key={`empty-${i}`} className="aspect-square" />
          }
          const isSelected = cell.iso === selectedDate
          const disabled = !cell.available || cell.past
          return (
            <button
              key={cell.iso}
              type="button"
              disabled={disabled}
              onClick={() => handlePickDate(cell.iso)}
              className={[
                'relative aspect-square rounded-lg text-sm transition-colors',
                disabled
                  ? 'cursor-not-allowed text-gray-700'
                  : isSelected
                    ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
                    : 'text-gray-300 hover:bg-white/10',
              ].join(' ')}
            >
              {cell.day}
            </button>
          )
        })}
      </div>

      {selectedDate && (
        <div className="mt-6 border-t border-white/10 pt-6">
          <p className="mb-3 text-sm text-gray-400">
            Wybierz godzinę — {formatPolishDate(selectedDate)}:
          </p>
          {loadingDay ? (
            <div className="flex items-center justify-center py-6 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : daySlots.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-sm text-gray-400">
              Brak wolnych godzin tego dnia. Wybierz inny termin.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {daySlots.map((slot) => {
                const isActive = slot.time === selectedSlot
                return (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => handlePickSlot(slot.time)}
                    className={[
                      'rounded-lg border px-4 py-3 text-center transition-all',
                      isActive
                        ? 'border-purple-500 bg-purple-500/10 text-white'
                        : 'border-white/10 bg-white/[0.02] text-gray-300 hover:border-white/20 hover:bg-white/5',
                    ].join(' ')}
                  >
                    {slot.time}
                  </button>
                )
              })}
            </div>
          )}

          <button
            type="button"
            disabled={!selectedSlot}
            onClick={handleGoToForm}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-4 font-medium tracking-wider text-white shadow-lg transition-all hover:shadow-purple-500/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Dalej <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
