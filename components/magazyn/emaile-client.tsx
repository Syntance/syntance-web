'use client'

import { useMemo, useState } from 'react'
import type { EmailTemplates } from '@/lib/data/email-templates'
import {
  DbBanner,
  Field,
  Fieldset,
  PageHeader,
  SaveButton,
  StatusMessage,
  magazynInputClass,
  magazynTextareaClass,
} from '@/components/magazyn/ui'

const TEMPLATE_META: Record<keyof EmailTemplates, { label: string; description: string }> = {
  contracts: { label: 'Umowy', description: 'Mail z umowami do podpisu po akceptacji zlecenia.' },
  payment: { label: 'Płatność', description: 'Dane do przelewu zaliczki.' },
  projectKickoff: { label: 'Start realizacji', description: 'Potwierdzenie po zaksięgowaniu zaliczki.' },
  projectComplete: { label: 'Zakończenie', description: 'Podziękowanie po zamknięciu projektu.' },
  dealReminder: { label: 'Przypomnienie', description: 'Ręczny trigger z CRM (Attio).' },
  rejection: { label: 'Odrzucenie', description: 'Informacja o odrzuceniu zlecenia.' },
  quoteRequestClient: { label: 'Wycena → klient', description: 'Potwierdzenie zapytania o wycenę.' },
  quoteRequestOwner: { label: 'Wycena → właściciel', description: 'Powiadomienie o nowym zapytaniu.' },
  contactFormClient: { label: 'Kontakt → klient', description: 'Potwierdzenie formularza kontaktowego.' },
  contactFormOwner: { label: 'Kontakt → właściciel', description: 'Nowa wiadomość z formularza.' },
  meetingBookingClient: { label: 'Spotkanie → klient', description: 'Potwierdzenie rezerwacji spotkania.' },
  meetingBookingOwner: { label: 'Spotkanie → właściciel', description: 'Nowa rezerwacja spotkania.' },
}

const FIELD_LABELS: Record<string, string> = {
  subjectTemplate: 'Temat wiadomości',
  headerEmoji: 'Emoji w nagłówku',
  mailBackgroundColor: 'Tło karty maila',
  sectionPanelBackgroundColor: 'Tło panelu sekcji',
  paymentDetailsPanelBackgroundColor: 'Tło panelu płatności',
  paymentDetailsBorderColor: 'Obramowanie panelu płatności',
  heading: 'Nagłówek',
  headingColor: 'Kolor nagłówka',
  greetingTemplate: 'Powitanie',
  greetingColor: 'Kolor powitania',
  intro: 'Wstęp / treść główna',
  introColor: 'Kolor wstępu',
  body: 'Treść',
  bodyColor: 'Kolor treści',
  body2: 'Treść (ciąg dalszy)',
  body2Color: 'Kolor treści 2',
  bodyTemplate: 'Treść (szablon)',
  footerNote: 'Nota w stopce',
  footerNoteColor: 'Kolor noty',
  referenceLineMutedColor: 'Kolor etykiety referencji',
  referenceLineAccentColor: 'Kolor wartości referencji',
  summarySectionHeadingColor: 'Kolor nagłówka podsumowania',
  tableLabelColor: 'Kolor etykiet tabeli',
  tableValueColor: 'Kolor wartości tabeli',
  tableAccentColor: 'Kolor akcentu tabeli',
  paymentDetailsHeadingColor: 'Kolor nagłówka płatności',
  transferTitleColor: 'Kolor tytułu przelewu',
  transferAmountColor: 'Kolor kwoty',
  mainContentTextColor: 'Kolor treści',
  dateStrongColor: 'Kolor daty',
  meetLinkColor: 'Kolor linku Meet',
  footerLine: 'Linia stopki',
  footerLineColor: 'Kolor linii stopki',
  footerStripBackgroundColor: 'Tło paska stopki',
}

function fieldLabel(key: string) {
  return FIELD_LABELS[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
}

function isLongField(key: string) {
  return (
    key.includes('Template') ||
    key === 'intro' ||
    key === 'body' ||
    key === 'body2' ||
    key === 'footerNote' ||
    key === 'footerLine'
  )
}

function isColorField(key: string) {
  return key.endsWith('Color') || key.includes('BackgroundColor') || key.includes('BorderColor')
}

type Props = {
  templates: EmailTemplates
  dbConnected: boolean
}

export function EmaileClient({ templates, dbConnected }: Props) {
  const keys = Object.keys(templates) as (keyof EmailTemplates)[]
  const [active, setActive] = useState<keyof EmailTemplates>(keys[0] ?? 'contracts')
  const [data, setData] = useState(templates)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [pending, setPending] = useState(false)

  const template = data[active]
  const templateRecord = template as unknown as Record<string, unknown>
  const fields = useMemo(() => Object.keys(templateRecord), [templateRecord])

  const contentFields = fields.filter((k) => !isColorField(k) && k !== 'headerEmoji')
  const colorFields = fields.filter((k) => isColorField(k))
  const emojiField = 'headerEmoji' in templateRecord

  function patchField(field: string, value: string) {
    setData((prev) => ({
      ...prev,
      [active]: { ...prev[active], [field]: value },
    }))
  }

  async function save() {
    setPending(true)
    setStatus(null)
    setError(false)
    try {
      const res = await fetch('/api/magazyn/emaile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Zapis nie powiódł się')
      setStatus('Szablony zapisane.')
    } catch (e) {
      setError(true)
      setStatus(e instanceof Error ? e.message : 'Błąd')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="E-maile" description={`Szablony transakcyjne (${keys.length} typów)`} />
      <DbBanner connected={dbConnected} />

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex shrink-0 flex-row flex-wrap gap-1 lg:w-52 lg:flex-col lg:gap-0.5">
          {keys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                active === key ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5'
              }`}
            >
              {TEMPLATE_META[key]?.label ?? key}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1 space-y-5">
          <div>
            <h2 className="text-lg font-medium">{TEMPLATE_META[active]?.label ?? active}</h2>
            <p className="text-sm text-neutral-500">{TEMPLATE_META[active]?.description}</p>
          </div>

          <Fieldset legend="Treść">
            {emojiField ? (
              <Field label={fieldLabel('headerEmoji')} hint="Opcjonalne — wyświetlane obok nagłówka.">
                <input
                  className={`${magazynInputClass} max-w-[120px]`}
                  value={String(templateRecord.headerEmoji ?? '')}
                  onChange={(e) => patchField('headerEmoji', e.target.value)}
                />
              </Field>
            ) : null}
            {contentFields.map((field) => {
              const key = String(field)
              const value = String(templateRecord[key] ?? '')
              return (
                <Field
                  key={key}
                  label={fieldLabel(key)}
                  hint={key.includes('Template') ? 'Zmienne: {name}, {bookingId}, {amount} itd.' : undefined}
                >
                  {isLongField(key) ? (
                    <textarea
                      className={magazynTextareaClass}
                      rows={key === 'subjectTemplate' ? 2 : 5}
                      value={value}
                      onChange={(e) => patchField(key, e.target.value)}
                    />
                  ) : (
                    <input className={magazynInputClass} value={value} onChange={(e) => patchField(key, e.target.value)} />
                  )}
                </Field>
              )
            })}
          </Fieldset>

          {colorFields.length > 0 ? (
            <Fieldset legend="Kolory">
              <div className="grid gap-4 sm:grid-cols-2">
                {colorFields.map((field) => {
                  const key = String(field)
                  const value = String(templateRecord[key] ?? '#111111')
                  return (
                    <Field key={key} label={fieldLabel(key)}>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={value.startsWith('#') && value.length <= 7 ? value : '#111111'}
                          onChange={(e) => patchField(key, e.target.value)}
                          className="h-10 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
                          aria-label={`Wybierz ${fieldLabel(key)}`}
                        />
                        <input
                          className={magazynInputClass}
                          value={value}
                          onChange={(e) => patchField(key, e.target.value)}
                        />
                      </div>
                    </Field>
                  )
                })}
              </div>
            </Fieldset>
          ) : null}

          <SaveButton pending={pending} label="Zapisz szablony" onClick={save} />
        </div>
      </div>

      <StatusMessage message={status} error={error} />
    </div>
  )
}
