'use client'

import { useState } from 'react'
import { Loader2, Trash2, Plus } from 'lucide-react'
import type { BookingTimeBlock } from '@/lib/sanity/booking'

function fmt(iso: string) {
  return new Date(iso).toLocaleString('pl-PL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function todayYmd() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function localDateTimeToIso(dateYmd: string, hm: string): string {
  // Europe/Warsaw ≈ client local (zakładamy że admin operuje w PL).
  return new Date(`${dateYmd}T${hm}:00`).toISOString()
}

export function BlocksClient({ initial }: { initial: BookingTimeBlock[] }) {
  const [items, setItems] = useState(initial)
  const [pending, setPending] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [allDay, setAllDay] = useState(true)
  const [startDate, setStartDate] = useState(todayYmd())
  const [endDate, setEndDate] = useState(todayYmd())
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Usunąć blokadę?')) return
    setPending(id)
    try {
      const res = await fetch(`/api/admin/blocks/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setItems((prev) => prev.filter((b) => b._id !== id))
    } catch {
      alert('Nie udało się usunąć.')
    } finally {
      setPending(null)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!title.trim()) {
      setFormError('Podaj powód (np. Urlop).')
      return
    }
    const startAt = allDay
      ? localDateTimeToIso(startDate, '00:00')
      : localDateTimeToIso(startDate, startTime)
    const endAt = allDay
      ? localDateTimeToIso(endDate, '23:59')
      : localDateTimeToIso(endDate, endTime)

    if (new Date(endAt) <= new Date(startAt)) {
      setFormError('Koniec musi być po starcie.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), allDay, startAt, endAt }),
      })
      if (!res.ok) throw new Error()
      const data = (await res.json()) as { id: string }
      setItems((prev) => [
        { _id: data.id, title: title.trim(), allDay, startAt, endAt },
        ...prev,
      ])
      setTitle('')
    } catch {
      setFormError('Nie udało się dodać blokady.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-medium">Blokady czasu</h1>
        <p className="mt-1 text-neutral-400">
          Dodaj ręczne blokady, żeby klient nie widział danego slotu w widgetcie. Google Calendar jest czytany osobno — tu blokujesz dodatkowo (np. urlop w przyszłym miesiącu, deep work po południu).
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      >
        <h2 className="mb-4 text-lg font-medium">Nowa blokada</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="mb-1 block text-sm text-neutral-400">Powód / notatka</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Urlop, deep work, święta…"
              className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
            />
          </label>

          <label className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm">Cały dzień</span>
          </label>

          <label>
            <span className="mb-1 block text-sm text-neutral-400">Od (data)</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
            />
          </label>
          <label>
            <span className="mb-1 block text-sm text-neutral-400">Do (data)</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
            />
          </label>

          {!allDay && (
            <>
              <label>
                <span className="mb-1 block text-sm text-neutral-400">Od (godzina)</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
                />
              </label>
              <label>
                <span className="mb-1 block text-sm text-neutral-400">Do (godzina)</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
                />
              </label>
            </>
          )}
        </div>

        {formError && <p className="mt-3 text-sm text-red-300">{formError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-neutral-200 disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Dodaj blokadę
        </button>
      </form>

      <section>
        <h2 className="mb-3 text-lg font-medium">Lista blokad</h2>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center text-neutral-400">
            Brak blokad.
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((b) => (
              <li
                key={b._id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
              >
                <div>
                  <div className="font-medium">{b.title}</div>
                  <div className="text-xs text-neutral-400">
                    {fmt(b.startAt)} → {fmt(b.endAt)}
                    {b.allDay ? ' · cały dzień' : ''}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(b._id)}
                  disabled={pending === b._id}
                  className="rounded-full border border-red-500/30 p-2 text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                  aria-label="Usuń blokadę"
                >
                  {pending === b._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
