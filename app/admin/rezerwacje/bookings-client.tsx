'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, Clock, ExternalLink, Mail, Building2, Loader2 } from 'lucide-react'
import type { MeetingBookingDoc } from '@/lib/sanity/booking'

type Range = 'upcoming' | 'past' | 'all'

interface Props {
  initial: MeetingBookingDoc[]
  range: Range
}

const STATUS_LABELS: Record<MeetingBookingDoc['status'], string> = {
  confirmed: 'Potwierdzona',
  cancelled: 'Anulowana',
  done: 'Odbyta',
  no_show: 'Nie stawił się',
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pl-PL', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function BookingsClient({ initial, range }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const [items, setItems] = useState(initial)
  const [pending, setPending] = useState<string | null>(null)

  async function patch(id: string, status: MeetingBookingDoc['status'], cancelInCalendar = false) {
    setPending(id)
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, cancelInCalendar }),
      })
      if (!res.ok) throw new Error('Błąd')
      setItems((prev) => prev.map((b) => (b._id === id ? { ...b, status } : b)))
    } catch (err) {
      alert('Nie udało się zapisać zmiany.')
      console.error(err)
    } finally {
      setPending(null)
    }
  }

  function setRange(next: Range) {
    const sp = new URLSearchParams(params)
    sp.set('range', next)
    router.push(`/admin/rezerwacje?${sp.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-medium">Rezerwacje</h1>
        <div className="inline-flex rounded-full border border-white/10 bg-white/[0.02] p-1">
          {(['upcoming', 'past', 'all'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={[
                'rounded-full px-4 py-1.5 text-sm transition-colors',
                range === r ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white',
              ].join(' ')}
            >
              {r === 'upcoming' ? 'Nadchodzące' : r === 'past' ? 'Minione' : 'Wszystkie'}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-neutral-400">
          Brak rezerwacji w tym zakresie.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((b) => {
            const busy = pending === b._id
            const past = new Date(b.startAt) < new Date()
            return (
              <li
                key={b._id}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                      <Calendar className="h-4 w-4 text-purple-400" />
                      <span className="font-medium text-white">{formatDateTime(b.startAt)}</span>
                      <Clock className="ml-2 h-4 w-4 text-purple-400" />
                      <span>
                        {new Date(b.startAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                        –
                        {new Date(b.endAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="mt-2 text-lg font-medium text-white">{b.name}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-neutral-300">
                      <a href={`mailto:${b.email}`} className="inline-flex items-center gap-1 hover:text-white">
                        <Mail className="h-3.5 w-3.5" /> {b.email}
                      </a>
                      {b.company && (
                        <span className="inline-flex items-center gap-1 text-neutral-500">
                          <Building2 className="h-3.5 w-3.5" /> {b.company}
                        </span>
                      )}
                    </div>
                    {b.topic && (
                      <p className="mt-2 text-sm text-neutral-400">{b.topic}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={[
                        'rounded-full px-3 py-1 text-xs',
                        b.status === 'confirmed'
                          ? 'bg-green-500/10 text-green-300'
                          : b.status === 'cancelled'
                            ? 'bg-red-500/10 text-red-300'
                            : b.status === 'done'
                              ? 'bg-blue-500/10 text-blue-300'
                              : 'bg-amber-500/10 text-amber-300',
                      ].join(' ')}
                    >
                      {STATUS_LABELS[b.status]}
                    </span>
                    {b.meetLink && (
                      <Link
                        href={b.meetLink}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs text-purple-300 hover:text-purple-200"
                      >
                        Google Meet <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-4">
                  {b.status === 'confirmed' && !past && (
                    <button
                      onClick={() => {
                        if (confirm('Anulować rezerwację (wraz z Google Calendar)?')) {
                          void patch(b._id, 'cancelled', true)
                        }
                      }}
                      disabled={busy}
                      className="rounded-full border border-red-500/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      {busy ? <Loader2 className="inline h-3 w-3 animate-spin" /> : 'Anuluj + usuń z kalendarza'}
                    </button>
                  )}
                  {b.status === 'confirmed' && past && (
                    <button
                      onClick={() => void patch(b._id, 'done')}
                      disabled={busy}
                      className="rounded-full border border-blue-500/30 px-3 py-1.5 text-xs text-blue-300 hover:bg-blue-500/10 disabled:opacity-50"
                    >
                      Oznacz jako odbyte
                    </button>
                  )}
                  {b.status === 'confirmed' && past && (
                    <button
                      onClick={() => void patch(b._id, 'no_show')}
                      disabled={busy}
                      className="rounded-full border border-amber-500/30 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-500/10 disabled:opacity-50"
                    >
                      Nie przyszedł
                    </button>
                  )}
                  {b.status !== 'confirmed' && (
                    <button
                      onClick={() => void patch(b._id, 'confirmed')}
                      disabled={busy}
                      className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/10 disabled:opacity-50"
                    >
                      Przywróć (confirmed)
                    </button>
                  )}
                  <a
                    href={`mailto:${b.email}?subject=Nasze%20spotkanie%20${encodeURIComponent(formatDateTime(b.startAt))}`}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/10"
                  >
                    Napisz do klienta
                  </a>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
