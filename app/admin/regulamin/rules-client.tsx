'use client'

import { useState } from 'react'
import { Loader2, Save, Plus, X } from 'lucide-react'
import type { BookingRules } from '@/lib/sanity/booking'

const DAYS = [
  { value: 1, label: 'Pon' },
  { value: 2, label: 'Wt' },
  { value: 3, label: 'Śr' },
  { value: 4, label: 'Czw' },
  { value: 5, label: 'Pt' },
  { value: 6, label: 'Sob' },
  { value: 0, label: 'Ndz' },
]

export function RulesClient({ initial }: { initial: BookingRules }) {
  const [rules, setRules] = useState(initial)
  const [newSlot, setNewSlot] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  function toggleDay(day: number) {
    const has = rules.workingDays.includes(day)
    setRules((r) => ({
      ...r,
      workingDays: has ? r.workingDays.filter((d) => d !== day) : [...r.workingDays, day].sort(),
    }))
  }

  function addSlot() {
    const v = newSlot.trim()
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) return
    if (rules.slotPresets.includes(v)) return
    setRules((r) => ({ ...r, slotPresets: [...r.slotPresets, v].sort() }))
    setNewSlot('')
  }

  function removeSlot(slot: string) {
    setRules((r) => ({ ...r, slotPresets: r.slotPresets.filter((s) => s !== slot) }))
  }

  async function handleSave() {
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch('/api/admin/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotMinutes: rules.slotMinutes,
          workingDays: rules.workingDays,
          workingHoursStart: rules.workingHoursStart,
          workingHoursEnd: rules.workingHoursEnd,
          slotPresets: rules.slotPresets,
          bufferBeforeMinutes: rules.bufferBeforeMinutes,
          bufferAfterMinutes: rules.bufferAfterMinutes,
          minNoticeHours: rules.minNoticeHours,
          maxAdvanceDays: rules.maxAdvanceDays,
        }),
      })
      if (!res.ok) throw new Error()
      setMsg({ type: 'ok', text: 'Zapisano.' })
    } catch {
      setMsg({ type: 'err', text: 'Nie udało się zapisać.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-medium">Reguły rezerwacji</h1>
        <p className="mt-1 text-neutral-400">
          To widzi klient na <code>/porozmawiajmy</code>. Zmiany są natychmiastowe.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-6">
        {/* Długość slota */}
        <div>
          <label className="mb-1 block text-sm text-neutral-400">Długość slota (minuty)</label>
          <input
            type="number"
            min={5}
            max={240}
            value={rules.slotMinutes}
            onChange={(e) => setRules((r) => ({ ...r, slotMinutes: Number(e.target.value) }))}
            className="w-32 rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Dni robocze */}
        <div>
          <span className="mb-2 block text-sm text-neutral-400">Dni robocze</span>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => {
              const active = rules.workingDays.includes(d.value)
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDay(d.value)}
                  className={[
                    'rounded-full border px-4 py-1.5 text-sm transition-colors',
                    active
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-white/10 text-neutral-400 hover:border-white/20',
                  ].join(' ')}
                >
                  {d.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Godziny pracy */}
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-1 block text-sm text-neutral-400">Godzina startu pracy</span>
            <input
              type="time"
              value={rules.workingHoursStart}
              onChange={(e) => setRules((r) => ({ ...r, workingHoursStart: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
            />
          </label>
          <label>
            <span className="mb-1 block text-sm text-neutral-400">Godzina końca pracy</span>
            <input
              type="time"
              value={rules.workingHoursEnd}
              onChange={(e) => setRules((r) => ({ ...r, workingHoursEnd: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
            />
          </label>
        </div>

        {/* Sloty preset */}
        <div>
          <span className="mb-2 block text-sm text-neutral-400">
            Godziny slotów (presety). Pusta lista = automatyczne generowanie co {rules.slotMinutes} min w widełkach.
          </span>
          <div className="mb-3 flex flex-wrap gap-2">
            {rules.slotPresets.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm"
              >
                {s}
                <button
                  type="button"
                  onClick={() => removeSlot(s)}
                  className="text-neutral-400 hover:text-white"
                  aria-label={`Usuń ${s}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {rules.slotPresets.length === 0 && (
              <span className="text-xs text-neutral-500">(brak — generuję automatycznie)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              className="w-32 rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={addSlot}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
            >
              <Plus className="h-4 w-4" /> Dodaj slot
            </button>
          </div>
        </div>

        {/* Bufory */}
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-1 block text-sm text-neutral-400">Bufor przed spotkaniem (min)</span>
            <input
              type="number"
              min={0}
              value={rules.bufferBeforeMinutes}
              onChange={(e) => setRules((r) => ({ ...r, bufferBeforeMinutes: Number(e.target.value) }))}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
            />
          </label>
          <label>
            <span className="mb-1 block text-sm text-neutral-400">Bufor po spotkaniu (min)</span>
            <input
              type="number"
              min={0}
              value={rules.bufferAfterMinutes}
              onChange={(e) => setRules((r) => ({ ...r, bufferAfterMinutes: Number(e.target.value) }))}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
            />
          </label>
        </div>

        {/* Horyzont */}
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-1 block text-sm text-neutral-400">Minimalne wyprzedzenie (godziny)</span>
            <input
              type="number"
              min={0}
              value={rules.minNoticeHours}
              onChange={(e) => setRules((r) => ({ ...r, minNoticeHours: Number(e.target.value) }))}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
            />
          </label>
          <label>
            <span className="mb-1 block text-sm text-neutral-400">Maks. wyprzedzenie (dni)</span>
            <input
              type="number"
              min={1}
              value={rules.maxAdvanceDays}
              onChange={(e) => setRules((r) => ({ ...r, maxAdvanceDays: Number(e.target.value) }))}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
            />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-neutral-200 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Zapisz reguły
        </button>
        {msg && (
          <span className={msg.type === 'ok' ? 'text-sm text-green-300' : 'text-sm text-red-300'}>
            {msg.text}
          </span>
        )}
      </div>
    </div>
  )
}
