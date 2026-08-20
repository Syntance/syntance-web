'use client'

import { useId, useMemo, useState } from 'react'
import { Calculator } from 'lucide-react'
import {
  MIN_PROJECT_NET,
  PARTNER_LEVELS,
  WHITE_LABEL_SURCHARGE,
  type PartnerLevelId,
} from '../_content'

type Mode = 'jawny' | 'white-label'

/** Zamienia to, co wpisał użytkownik ("12 500", "12500 zł", "12.500") na liczbę netto. */
function parseAmount(raw: string): number {
  const digits = raw.replace(/[^\d]/g, '')
  if (digits.length === 0) return 0
  const value = Number(digits)
  return Number.isFinite(value) ? value : 0
}

function formatPln(value: number): string {
  return `${Math.round(value).toLocaleString('pl-PL')} PLN`
}

export default function PartnerCalculator() {
  const retailId = useId()
  const sellId = useId()
  const [retailInput, setRetailInput] = useState('')
  const [sellInput, setSellInput] = useState('')
  const [level, setLevel] = useState<PartnerLevelId>('partner')
  const [mode, setMode] = useState<Mode>('jawny')

  const result = useMemo(() => {
    const retail = parseAmount(retailInput)
    const sell = parseAmount(sellInput)
    if (retail <= 0) return null

    const discount = PARTNER_LEVELS.find((l) => l.id === level)?.discount ?? 0
    const afterDiscount = retail * (1 - discount)
    const withMode = mode === 'white-label' ? afterDiscount * (1 + WHITE_LABEL_SURCHARGE) : afterDiscount
    const belowMinimum = withMode < MIN_PROJECT_NET
    const partnerPrice = belowMinimum ? MIN_PROJECT_NET : withMode

    const hasSell = sell > 0
    const margin = hasSell ? sell - partnerPrice : 0
    const marginPct = hasSell && sell > 0 ? (margin / sell) * 100 : 0

    return { retail, partnerPrice, belowMinimum, hasSell, margin, marginPct }
  }, [retailInput, sellInput, level, mode])

  const fieldClass =
    'w-full px-5 py-4 min-h-[52px] text-base bg-white/5 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 focus:ring-2 focus:ring-purple-500/30 transition-colors'

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-cyan-300 shrink-0" aria-hidden />
        Przelicznik
      </h3>
      <p className="text-sm text-gray-400 mb-8">
        Wpisz kwotę z konfiguratora na <a href="/cennik" className="text-gray-300 underline underline-offset-4 hover:text-white">/cennik</a>{' '}
        i wybierz poziom. Liczymy w przeglądarce — nie zapisujemy ani nie wysyłamy tych danych.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor={retailId} className="block text-sm text-gray-300 mb-2">
            Kwota z konfiguratora (netto)
          </label>
          <input
            id={retailId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={retailInput}
            onChange={(e) => setRetailInput(e.target.value)}
            placeholder="np. 20 000"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor={sellId} className="block text-sm text-gray-300 mb-2">
            Twoja cena dla klienta (netto) — opcjonalnie
          </label>
          <input
            id={sellId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={sellInput}
            onChange={(e) => setSellInput(e.target.value)}
            placeholder="np. 32 000"
            className={fieldClass}
          />
        </div>
      </div>

      <fieldset className="mt-8">
        <legend className="text-sm text-gray-300 mb-3">Poziom partnerski</legend>
        <div className="grid sm:grid-cols-3 gap-3">
          {PARTNER_LEVELS.map((option) => (
            <label
              key={option.id}
              className={`cursor-pointer rounded-xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:ring-offset-2 focus-within:ring-offset-black ${
                level === option.id
                  ? 'border-cyan-400/60 bg-cyan-400/10'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/25'
              }`}
            >
              <input
                type="radio"
                name="partner-level"
                value={option.id}
                checked={level === option.id}
                onChange={() => setLevel(option.id)}
                className="sr-only peer"
              />
              <span className="block text-white font-medium peer-focus-visible:underline">
                {option.name}
              </span>
              <span className="block text-xs text-gray-400 mt-1">
                detal −{Math.round(option.discount * 100)}%
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-sm text-gray-300 mb-3">Tryb współpracy</legend>
        <div className="grid sm:grid-cols-2 gap-3">
          {(
            [
              { id: 'jawny' as const, name: 'Jawny', hint: 'bez dopłaty' },
              { id: 'white-label' as const, name: 'White-label', hint: '+10%' },
            ] satisfies { id: Mode; name: string; hint: string }[]
          ).map((option) => (
            <label
              key={option.id}
              className={`cursor-pointer rounded-xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:ring-offset-2 focus-within:ring-offset-black ${
                mode === option.id
                  ? 'border-violet-400/60 bg-violet-400/10'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/25'
              }`}
            >
              <input
                type="radio"
                name="partner-mode"
                value={option.id}
                checked={mode === option.id}
                onChange={() => setMode(option.id)}
                className="sr-only peer"
              />
              <span className="block text-white font-medium peer-focus-visible:underline">
                {option.name}
              </span>
              <span className="block text-xs text-gray-400 mt-1">{option.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div aria-live="polite" className="mt-8">
        {result === null ? (
          <p className="text-sm text-gray-500">
            Podaj kwotę z konfiguratora, żeby zobaczyć cenę partnerską.
          </p>
        ) : (
          <div className="rounded-xl border border-white/10 bg-black/30 p-6">
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                  Cena partnerska
                </p>
                <p className="text-2xl font-light text-cyan-300">
                  {formatPln(result.partnerPrice)}
                </p>
                <p className="text-xs text-gray-500 mt-1">netto</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Twoja marża</p>
                <p className="text-2xl font-light text-white">
                  {result.hasSell ? formatPln(result.margin) : '—'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {result.hasSell ? 'przy podanej cenie sprzedaży' : 'podaj cenę dla klienta'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Marża %</p>
                <p className="text-2xl font-light text-white">
                  {result.hasSell
                    ? `${result.marginPct.toLocaleString('pl-PL', {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}%`
                    : '—'}
                </p>
                <p className="text-xs text-gray-500 mt-1">od ceny sprzedaży</p>
              </div>
            </div>
            {result.belowMinimum && (
              <p className="mt-6 text-sm text-amber-300/90">
                Wyliczenie schodzi poniżej minimum projektu — przyjmujemy{' '}
                {formatPln(MIN_PROJECT_NET)} netto.
              </p>
            )}
            {result.hasSell && result.margin < 0 && (
              <p className="mt-6 text-sm text-amber-300/90">
                Podana cena sprzedaży jest niższa niż cena partnerska.
              </p>
            )}
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-gray-500">
        Wynik jest orientacyjny. Wiążąca jest wycena po audycie i specyfikacji.
      </p>
    </div>
  )
}
