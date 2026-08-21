'use client'

import { useMemo, useState } from 'react'
import {
  DbBanner,
  Field,
  Fieldset,
  PageHeader,
  SaveButton,
  StatusMessage,
  magazynInputClass,
} from '@/components/magazyn/ui'
import {
  buildPricingConditions,
  computePartnerPrice,
  defaultPartnerSettings,
  formatPln,
  type PartnerLevel,
  type PartnerSettings,
} from '@/lib/data/partner'
import { partnerSettingsSchema } from '@/lib/data/partner-schema'

/** Podgląd wyceny w panelu — te same kwoty, które zobaczy agencja na stronie. */
const PREVIEW_RETAIL_NET = 20_000

const PL_CHAR_MAP: Record<string, string> = {
  ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
}

function slugify(value: string, fallback: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, (char) => PL_CHAR_MAP[char] ?? '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug.length > 0 ? slug : fallback
}

export function PartnerClient({
  initialSettings,
  dbConnected,
}: {
  initialSettings: PartnerSettings
  dbConnected: boolean
}) {
  const [settings, setSettings] = useState<PartnerSettings>(initialSettings)
  const [pending, setPending] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState(false)

  const preview = useMemo(
    () =>
      settings.levels.map((level) => ({
        level,
        open: computePartnerPrice(PREVIEW_RETAIL_NET, level.discountPercent, false, settings),
        whiteLabel: computePartnerPrice(PREVIEW_RETAIL_NET, level.discountPercent, true, settings),
      })),
    [settings],
  )

  const conditions = useMemo(() => buildPricingConditions(settings), [settings])

  function patch(values: Partial<PartnerSettings>) {
    setSettings((prev) => ({ ...prev, ...values }))
  }

  function patchLevel(index: number, values: Partial<PartnerLevel>) {
    setSettings((prev) => ({
      ...prev,
      levels: prev.levels.map((level, i) => (i === index ? { ...level, ...values } : level)),
    }))
  }

  function addLevel() {
    setSettings((prev) => ({
      ...prev,
      levels: [
        ...prev.levels,
        {
          id: `poziom-${prev.levels.length + 1}`,
          name: `Poziom ${prev.levels.length + 1}`,
          when: 'kiedy obowiązuje',
          discountPercent: 0,
        },
      ],
    }))
  }

  function removeLevel(index: number) {
    setSettings((prev) => ({ ...prev, levels: prev.levels.filter((_, i) => i !== index) }))
  }

  function resetToDefaults() {
    setSettings(defaultPartnerSettings)
    setError(false)
    setStatus('Przywrócono wartości domyślne — kliknij Zapisz, żeby je utrwalić.')
  }

  async function save() {
    const parsed = partnerSettingsSchema.safeParse(settings)
    if (!parsed.success) {
      setError(true)
      setStatus(parsed.error.issues[0]?.message ?? 'Niepoprawne dane.')
      return
    }
    const ids = parsed.data.levels.map((level) => level.id)
    if (new Set(ids).size !== ids.length) {
      setError(true)
      setStatus('Identyfikatory poziomów muszą być unikalne.')
      return
    }

    setPending(true)
    setError(false)
    setStatus(null)
    try {
      const res = await fetch('/api/magazyn/partner', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
        signal: AbortSignal.timeout(30_000),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? 'Zapis nie powiódł się.')
      }
      setStatus('Zapisano. Strona /dla-agencji korzysta już z nowych wartości.')
    } catch (err) {
      setError(true)
      setStatus(err instanceof Error ? err.message : 'Zapis nie powiódł się.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Model partnerski"
        description="Prowizje, stawki i progi używane na /dla-agencji — w tabeli poziomów, w przeliczniku i w opisie warunków."
      />
      <DbBanner connected={dbConnected} />

      <Fieldset legend="Poziomy partnerskie">
        <p className="text-xs text-neutral-500">
          Rabat liczony od kwoty z konfiguratora na /cennik. Kolejność na liście = kolejność w
          tabeli na stronie.
        </p>
        <ul className="space-y-3">
          {settings.levels.map((level, index) => (
            <li
              key={`${level.id}-${index}`}
              className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4 md:grid-cols-[1fr_1.4fr_auto_auto]"
            >
              <Field label="Nazwa">
                <input
                  className={magazynInputClass}
                  value={level.name}
                  onChange={(e) =>
                    patchLevel(index, {
                      name: e.target.value,
                      id: slugify(e.target.value, `poziom-${index + 1}`),
                    })
                  }
                />
              </Field>
              <Field label="Kiedy obowiązuje">
                <input
                  className={magazynInputClass}
                  value={level.when}
                  onChange={(e) => patchLevel(index, { when: e.target.value })}
                />
              </Field>
              <Field label="Rabat %">
                <input
                  className={magazynInputClass}
                  type="number"
                  min={0}
                  max={90}
                  step={1}
                  value={level.discountPercent}
                  onChange={(e) =>
                    patchLevel(index, { discountPercent: Number(e.target.value) || 0 })
                  }
                />
              </Field>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeLevel(index)}
                  disabled={settings.levels.length <= 1}
                  className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-40"
                >
                  Usuń
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={addLevel}
          disabled={settings.levels.length >= 6}
          className="text-xs text-neutral-400 underline-offset-2 hover:text-white hover:underline disabled:opacity-40"
        >
          + Dodaj poziom
        </button>
      </Fieldset>

      <Fieldset legend="Stawki i progi">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Dopłata za white-label (%)"
            hint="Anonimowość jako usługa dodatkowa — doliczana do ceny partnerskiej."
          >
            <input
              className={magazynInputClass}
              type="number"
              min={0}
              max={100}
              step={1}
              value={settings.whiteLabelSurchargePercent}
              onChange={(e) =>
                patch({ whiteLabelSurchargePercent: Number(e.target.value) || 0 })
              }
            />
          </Field>
          <Field label="Minimum projektu (PLN netto)" hint="Poniżej tej kwoty nie schodzimy.">
            <input
              className={magazynInputClass}
              type="number"
              min={0}
              step={100}
              value={settings.minProjectNet}
              onChange={(e) => patch({ minProjectNet: Number(e.target.value) || 0 })}
            />
          </Field>
          <Field label="Stawka godzinowa — detal (PLN/h)">
            <input
              className={magazynInputClass}
              type="number"
              min={0}
              step={10}
              value={settings.hourlyRateRetail}
              onChange={(e) => patch({ hourlyRateRetail: Number(e.target.value) || 0 })}
            />
          </Field>
          <Field label="Stawka godzinowa — partner (PLN/h)">
            <input
              className={magazynInputClass}
              type="number"
              min={0}
              step={10}
              value={settings.hourlyRatePartner}
              onChange={(e) => patch({ hourlyRatePartner: Number(e.target.value) || 0 })}
            />
          </Field>
          <Field
            label="Audyt i specyfikacja (PLN netto)"
            hint="Wejście w relację, zaliczane na poczet pierwszego projektu."
          >
            <input
              className={magazynInputClass}
              type="number"
              min={0}
              step={100}
              value={settings.auditPriceNet}
              onChange={(e) => patch({ auditPriceNet: Number(e.target.value) || 0 })}
            />
          </Field>
          <Field label="Rundy poprawek w cenie">
            <input
              className={magazynInputClass}
              type="number"
              min={0}
              max={20}
              step={1}
              value={settings.revisionRoundsIncluded}
              onChange={(e) => patch({ revisionRoundsIncluded: Number(e.target.value) || 0 })}
            />
          </Field>
        </div>
      </Fieldset>

      <Fieldset legend={`Podgląd — projekt za ${formatPln(PREVIEW_RETAIL_NET)} netto z konfiguratora`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-neutral-400">
                <th scope="col" className="py-2 pr-4 font-medium">
                  Poziom
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Rabat
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Tryb jawny
                </th>
                <th scope="col" className="py-2 font-medium">
                  White-label
                </th>
              </tr>
            </thead>
            <tbody>
              {preview.map(({ level, open, whiteLabel }, index) => (
                <tr key={`${level.id}-${index}`} className="border-b border-white/5">
                  <th scope="row" className="py-2 pr-4 text-left font-medium text-white">
                    {level.name}
                  </th>
                  <td className="py-2 pr-4 text-neutral-400">−{level.discountPercent}%</td>
                  <td className="py-2 pr-4 text-cyan-300">
                    {formatPln(open.price)}
                    {open.belowMinimum ? (
                      <span className="ml-2 text-xs text-amber-300">minimum</span>
                    ) : null}
                  </td>
                  <td className="py-2 text-cyan-300">
                    {formatPln(whiteLabel.price)}
                    {whiteLabel.belowMinimum ? (
                      <span className="ml-2 text-xs text-amber-300">minimum</span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <p className="mb-2 text-xs text-neutral-500">
            Warunki pod tabelą na stronie generują się z powyższych wartości — nie trzeba ich
            przepisywać ręcznie:
          </p>
          <ul className="space-y-1 text-xs text-neutral-400">
            {conditions.map((condition) => (
              <li key={condition}>— {condition}</li>
            ))}
          </ul>
        </div>
      </Fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <SaveButton pending={pending} label="Zapisz model partnerski" onClick={save} />
        <button
          type="button"
          onClick={resetToDefaults}
          className="text-sm text-neutral-400 underline-offset-2 hover:text-white hover:underline"
        >
          Przywróć domyślne
        </button>
        <StatusMessage message={status} error={error} />
      </div>
    </div>
  )
}
