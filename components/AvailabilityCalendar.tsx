'use client'

import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock, Loader2, AlertCircle } from 'lucide-react'

interface AvailabilityCalendarProps {
  requiredDays: number
  onSelectDate: (date: string) => void
  selectedDate: string | null
}

interface AvailabilityData {
  availableStartDates: string[]
  busyDays: string[]
  requiredDays: number
}

const WEEKDAYS = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz']
const MONTHS = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
]

export function AvailabilityCalendar({
  requiredDays,
  onSelectDate,
  selectedDate,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [availability, setAvailability] = useState<AvailabilityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pobierz dostępność
  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/availability?days=${requiredDays}&months=3`)
        
        if (!response.ok) {
          throw new Error('Nie udało się pobrać dostępności')
        }
        
        const data: AvailabilityData = await response.json()
        setAvailability(data)
      } catch (err) {
        console.error('Availability fetch error:', err)
        setError('Nie udało się załadować kalendarza. Spróbuj ponownie.')
      } finally {
        setLoading(false)
      }
    }

    fetchAvailability()
  }, [requiredDays])

  // Generuj dni miesiąca
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    // Pierwszy dzień miesiąca
    const firstDay = new Date(year, month, 1)
    // Ostatni dzień miesiąca
    const lastDay = new Date(year, month + 1, 0)
    
    // Dzień tygodnia pierwszego dnia (0 = niedziela, konwertujemy na 0 = poniedziałek)
    let startWeekday = firstDay.getDay() - 1
    if (startWeekday < 0) startWeekday = 6
    
    const days: { date: Date; isCurrentMonth: boolean }[] = []
    
    // Dodaj dni z poprzedniego miesiąca
    for (let i = startWeekday - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push({ date, isCurrentMonth: false })
    }
    
    // Dodaj dni bieżącego miesiąca
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i)
      days.push({ date, isCurrentMonth: true })
    }
    
    // Dodaj dni z następnego miesiąca (do wypełnienia 6 tygodni = 42 dni)
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i)
      days.push({ date, isCurrentMonth: false })
    }
    
    return days
  }, [currentMonth])

  // Sprawdź status dnia
  const getDayStatus = (date: Date): 'available' | 'busy' | 'past' | 'unavailable' | 'weekend' => {
    const dateStr = date.toISOString().split('T')[0]
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Przeszłe dni
    if (date < today) return 'past'
    
    // Weekendy (0 = niedziela, 6 = sobota)
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) return 'weekend'
    
    if (!availability) return 'unavailable'
    
    // Zajęte dni
    if (availability.busyDays.includes(dateStr)) return 'busy'
    
    // Dostępne dni (gdzie można rozpocząć projekt)
    if (availability.availableStartDates.includes(dateStr)) return 'available'
    
    return 'unavailable'
  }

  // Nawigacja miesiącami
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  // Czy można cofnąć do poprzedniego miesiąca (nie przed bieżącym)
  const canGoPrevious = useMemo(() => {
    const now = new Date()
    return currentMonth.getFullYear() > now.getFullYear() || 
           (currentMonth.getFullYear() === now.getFullYear() && currentMonth.getMonth() > now.getMonth())
  }, [currentMonth])

  // Czy można iść do przodu (max 3 miesiące)
  const canGoNext = useMemo(() => {
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 3)
    return currentMonth < maxDate
  }, [currentMonth])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        <p className="text-gray-300 text-sm">Sprawdzam dostępność...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-red-400 text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-white text-sm transition-colors"
        >
          Odśwież stronę
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header z informacją */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/20">
        <div className="flex items-center gap-3">
          <Clock size={20} className="text-purple-400 flex-shrink-0" />
          <div>
            <p className="text-white font-medium">
              Wymagane {requiredDays} dni roboczych
            </p>
            <p className="text-gray-300 text-sm">
              Wybierz datę startu projektu - pokazujemy tylko terminy z wystarczającą ilością wolnych dni
            </p>
          </div>
        </div>
      </div>

      {/* Nawigacja miesiącami */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToPreviousMonth}
          disabled={!canGoPrevious}
          className={`p-2 rounded-lg transition-colors ${
            canGoPrevious 
              ? 'text-gray-300 hover:text-white hover:bg-white/10' 
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <ChevronLeft size={20} />
        </button>
        
        <h3 className="text-lg font-medium text-white">
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          onClick={goToNextMonth}
          disabled={!canGoNext}
          className={`p-2 rounded-lg transition-colors ${
            canGoNext 
              ? 'text-gray-300 hover:text-white hover:bg-white/10' 
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Kalendarz */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        {/* Nagłówki dni tygodnia */}
        <div className="grid grid-cols-7 border-b border-white/10">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-2 text-center text-xs text-gray-300 font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Dni */}
        <div className="grid grid-cols-7">
          {calendarDays.map(({ date, isCurrentMonth }, idx) => {
            const dateStr = date.toISOString().split('T')[0]
            const status = getDayStatus(date)
            const isSelected = selectedDate === dateStr
            const isToday = date.toDateString() === new Date().toDateString()
            
            const statusStyles = {
              available: 'bg-green-500/20 text-green-400 hover:bg-green-500/30 cursor-pointer border-green-500/30',
              busy: 'bg-red-500/10 text-red-400/60 cursor-not-allowed',
              past: 'text-gray-300 cursor-not-allowed',
              unavailable: 'text-gray-300 cursor-not-allowed',
              weekend: 'text-gray-300 cursor-not-allowed bg-white/2',
            }

            const handleClick = () => {
              if (status === 'available') {
                onSelectDate(dateStr)
              }
            }

            return (
              <button
                key={idx}
                onClick={handleClick}
                disabled={status !== 'available'}
                className={`
                  relative aspect-square flex items-center justify-center text-sm font-medium
                  transition-all duration-200 border-b border-r border-white/5
                  ${!isCurrentMonth ? 'opacity-30' : ''}
                  ${statusStyles[status]}
                  ${isSelected ? 'ring-2 ring-purple-500 ring-inset bg-purple-500/30 !text-white' : ''}
                  ${isToday && !isSelected ? 'ring-1 ring-white/20 ring-inset' : ''}
                `}
              >
                {date.getDate()}
                
                {/* Wskaźnik dostępności */}
                {status === 'available' && isCurrentMonth && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-400" />
                )}
                
                {/* Wskaźnik zajętości */}
                {status === 'busy' && isCurrentMonth && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-400" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-300">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500/40 border border-green-500/50" />
          <span>Dostępny</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/40" />
          <span>Zajęty</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-500/20 border border-gray-500/30" />
          <span>Niedostępny</span>
        </div>
      </div>

      {/* Wybrany termin */}
      {selectedDate && (
        <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-purple-400" />
            <div>
              <p className="text-gray-300 text-sm">Wybrany termin startu:</p>
              <p className="text-white font-medium">
                {new Date(selectedDate).toLocaleDateString('pl-PL', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p className="text-gray-300 text-sm mt-1">
                Szacowany koniec: {' '}
                {(() => {
                  const start = new Date(selectedDate)
                  let workDaysAdded = 0
                  const end = new Date(start)
                  
                  while (workDaysAdded < requiredDays) {
                    end.setDate(end.getDate() + 1)
                    const dayOfWeek = end.getDay()
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                      workDaysAdded++
                    }
                  }
                  
                  return end.toLocaleDateString('pl-PL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                })()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
