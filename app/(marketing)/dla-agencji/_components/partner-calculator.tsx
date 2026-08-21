'use client'

import { useId, useMemo, useState } from 'react'
import { Calculator } from 'lucide-react'
import { computePartnerPrice, formatPln, type PartnerSettings } from '@/lib/data/partner'

type Mode = 'jawny' | 'white-label'

/** Zamienia to, co wpisał użytkownik ("12 500", "12500 zł", "12.500") na liczbę netto. */
function parseAmount(raw: string): number {
  const digits = raw.replace(/[^\d]/g, '')
  if (digits.length === 0) return 0
  const value = Number(digits)
  return Number.isFinite(value) ? value : 0
}

export default function PartnerCalculator({ settings }: { settings: PartnerSettings }) {
  const retailId = useId()
  const sellId = useId()
  const [retailInput, setRetailInput] = useState('')
  const [sellInput, setSellInput] = useState('')
  const [levelId, setLevelId] = useState(settings.levels[0]?.id ?? '')
  const [mode, setMode] = useState<Mode>('jawny')

  const result = useMemo(() => {
    const retail = parseAmount(retailInput)
    const sell = parseAmount(sellInput)
    if (retail <= 0) return null

    const discountPercent =
      settings.levels.find((level) => level.id === levelId)?.discountPercent ?? 0
    const { price, belowMinimum } = computePartnerPrice(
      retail,
      discountPercent,
      mode === 'white-label',
      settings,
    )

    const hasSell = sell > 0
    const margin = hasSell ? sell - price : 0
    const marginPct = hasSell ? (margin / sell) * 100 : 0

    return { partnerPrice: price, belowMinimum, hasSell, margin, marginPct }
  }, [retailInput, sellInput, levelId, mode, settings])

  const fieldClass =
    'w-full px-5 py-4 min-h-[52px] text-base bg-white/5 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 focus:ring-2 focus:ring-purple-500/30 transition-colors'
  const optionClass =
    'cursor-pointer rounded-xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:ring-offset-2 focus-within:ring-offset-black'

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-cyan-300 shrink-0" aria-hidden />
        Przelicznik
      </h3>
      <p className="text-sm text-gray-400 mb-8">
        Wpisz kwotę z konfiguratora na{' '}
        <a href="/cennik" className="text-gray-300 underline underline-offset-4 hover:text-white">
          /cennik
        </a>{' '}
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
          {settings.levels.map((option) => (
            <label
              key={option.id}
              className={`${optionClass} ${
                levelId === option.id
                  ? 'border-cyan-400/60 bg-cyan-400/10'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/25'
              }`}
            >
              <input
                type="radio"
                name="partner-level"
                value={option.id}
                checked={levelId === option.id}
                onChange={() => setLevelId(option.id)}
                className="sr-only"
              />
              <span className="block text-white font-medium">{option.name}</span>
              <span className="block text-xs text-gray-400 mt-1">
                detal −{option.discountPercent}%
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
              {
                id: 'white-label' as const,
                name: 'White-label',
                hint: `+${settings.whiteLabelSurchargePercent}%`,
              },
            ] satisfies { id: Mode; name: string; hint: string }[]
          ).map((option) => (
            <label
              key={option.id}
              className={`${optionClass} ${
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
                className="sr-only"
              />
              <span className="block text-white font-medium">{option.name}</span>
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
                {formatPln(settings.minProjectNet)} netto.
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
