'use client'

import { useState } from 'react'
import { AnalyticsEvent, trackAnalyticsEvent } from '@/lib/analytics'

/** Pola kwalifikujące lead partnerski — widoczne tylko na `/dla-agencji`. */
export const PARTNER_ENTITY_OPTIONS = ['Agencja', 'Studio', 'Freelancer', 'Inny'] as const
export const PARTNER_MODE_OPTIONS = ['Jawny', 'White-label', 'Jeszcze nie wiem'] as const
export const PARTNER_VOLUME_OPTIONS = ['1 projekt', '2–3 projekty', '4+ projektów', 'Nie wiem'] as const

/**
 * Wybór jednokrotny jako kafelki zamiast `<select>`.
 * Natywny popup selecta renderuje się w jasnym schemacie systemu i na ciemnym tle
 * gubi tekst opcji — a jego stylowania nie da się kontrolować w każdej przeglądarce.
 * Radiogroup wygląda spójnie z przelicznikiem na /dla-agencji i działa wszędzie tak samo.
 */
function ChoiceGroup({
  name,
  legend,
  options,
  value,
  onChange,
  disabled = false,
  required = false,
  hint,
}: {
  name: string
  legend: string
  options: readonly string[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
  hint?: string
}) {
  return (
    <fieldset disabled={disabled} className="disabled:opacity-50">
      <legend className="text-sm text-gray-300 mb-3">
        {legend}
        {required && <span className="text-red-400 ml-1">*</span>}
        {hint && <span className="text-gray-500 ml-2">({hint})</span>}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <label
            key={option}
            className={`cursor-pointer select-none rounded-full border px-4 py-2.5 text-sm transition-colors focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:ring-offset-2 focus-within:ring-offset-gray-950 ${
              value === option
                ? 'border-purple-400/60 bg-purple-400/15 text-white'
                : 'border-gray-800 bg-white/5 text-gray-400 hover:border-gray-600 hover:text-gray-200'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

interface ContactFormProps {
  /** Unikalny prefix dla ID formularza (dla multiple forms na jednej stronie) */
  idPrefix?: string
  /** Źródło formularza (do śledzenia w analytics) */
  source?: string
  /** Klasy CSS dla kontenera */
  className?: string
  /** `partner` dokłada pola kwalifikujące (typ podmiotu, tryb, wolumen). */
  variant?: 'default' | 'partner'
}

export function ContactForm({
  idPrefix = 'contact',
  source = 'website',
  className = '',
  variant = 'default'
}: ContactFormProps) {
  const isPartner = variant === 'partner'
  const [partnerData, setPartnerData] = useState({
    entityType: '',
    preferredMode: '',
    yearlyVolume: '',
  })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    hp: '' // honeypot field
  })
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [consentChecked, setConsentChecked] = useState(false)

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check consent first
    if (!consentChecked) {
      setFormStatus('error')
      setErrorMessage('Musisz wyrazić zgodę na przetwarzanie danych osobowych.')
      return
    }

    // Kafelki wyboru nie mają natywnego `required` (input jest sr-only, więc przeglądarka
    // nie potrafiłaby pokazać przy nim dymka walidacji) — sprawdzamy je tutaj.
    if (isPartner && (!partnerData.entityType || !partnerData.preferredMode)) {
      setFormStatus('error')
      setErrorMessage('Wybierz typ podmiotu i preferowany tryb współpracy.')
      return
    }

    setFormStatus('loading')
    setErrorMessage('')
    trackAnalyticsEvent(AnalyticsEvent.ContactFormSubmit, { source })

    // Client-side validation
    if (formData.name.length < 2) {
      setFormStatus('error')
      setErrorMessage('Imię i nazwisko musi mieć co najmniej 2 znaki.')
      return
    }

    // Walidacja numeru telefonu - minimum 9 cyfr
    const phoneDigits = formData.phone.replace(/\D/g, '')
    if (phoneDigits.length < 9) {
      setFormStatus('error')
      setErrorMessage('Podaj prawidłowy numer telefonu (minimum 9 cyfr).')
      return
    }

    if (formData.message.length < 10) {
      setFormStatus('error')
      setErrorMessage('Wiadomość musi mieć co najmniej 10 znaków.')
      return
    }

    if (formData.message.length > 2000) {
      setFormStatus('error')
      setErrorMessage('Wiadomość może mieć maksymalnie 2000 znaków.')
      return
    }

    try {
      // 30s timeout dla form submission (rules: 60-quality "External API: 30s upload")
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source,
          ...(isPartner ? { partner: partnerData } : {}),
        }),
        signal: AbortSignal.timeout(30_000),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Wystąpił błąd podczas wysyłania wiadomości.')
      }

      setFormStatus('success')
      setFormData({ name: '', email: '', phone: '', message: '', hp: '' })
      setPartnerData({ entityType: '', preferredMode: '', yearlyVolume: '' })
      setConsentChecked(false)
      trackAnalyticsEvent(AnalyticsEvent.ContactFormSuccess, { source })
    } catch (error) {
      setFormStatus('error')
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        setErrorMessage('Połączenie zbyt wolne. Spróbuj ponownie za chwilę.')
      } else {
        setErrorMessage(error instanceof Error ? error.message : 'Wystąpił błąd podczas wysyłania wiadomości.')
      }
    }
  }

  return (
    <form onSubmit={handleFormSubmit} className={`space-y-6 ${className}`}>
      {/* Honeypot field - hidden from users */}
      <input
        type="text"
        name="hp"
        value={formData.hp}
        onChange={handleFormChange}
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
      />
      
      <div>
        <label htmlFor={`${idPrefix}-name`} className="sr-only">Imię i nazwisko</label>
        <input
          type="text"
          id={`${idPrefix}-name`}
          name="name"
          value={formData.name}
          onChange={handleFormChange}
          placeholder="Imię i nazwisko"
          required
          autoComplete="name"
          autoCapitalize="words"
          enterKeyHint="next"
          disabled={formStatus === 'loading'}
          className="w-full px-5 sm:px-6 py-4 min-h-[52px] text-base bg-white/5 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 focus:ring-2 focus:ring-purple-500/30 transition-colors disabled:opacity-50"
        />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-email`} className="sr-only">Adres email</label>
        <input
          type="email"
          id={`${idPrefix}-email`}
          name="email"
          value={formData.email}
          onChange={handleFormChange}
          placeholder="Email"
          required
          autoComplete="email"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode="email"
          enterKeyHint="next"
          disabled={formStatus === 'loading'}
          className="w-full px-5 sm:px-6 py-4 min-h-[52px] text-base bg-white/5 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 focus:ring-2 focus:ring-purple-500/30 transition-colors disabled:opacity-50"
        />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-phone`} className="sr-only">Numer telefonu</label>
        <input
          type="tel"
          id={`${idPrefix}-phone`}
          name="phone"
          value={formData.phone}
          onChange={handleFormChange}
          placeholder="Numer telefonu"
          required
          autoComplete="tel"
          inputMode="tel"
          enterKeyHint="next"
          disabled={formStatus === 'loading'}
          className="w-full px-5 sm:px-6 py-4 min-h-[52px] text-base bg-white/5 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 focus:ring-2 focus:ring-purple-500/30 transition-colors disabled:opacity-50"
        />
      </div>
      {isPartner && (
        <div className="space-y-6">
          <ChoiceGroup
            name={`${idPrefix}-entityType`}
            legend="Typ podmiotu"
            required
            options={PARTNER_ENTITY_OPTIONS}
            value={partnerData.entityType}
            disabled={formStatus === 'loading'}
            onChange={(value) => setPartnerData(prev => ({ ...prev, entityType: value }))}
          />
          <ChoiceGroup
            name={`${idPrefix}-preferredMode`}
            legend="Preferowany tryb"
            required
            options={PARTNER_MODE_OPTIONS}
            value={partnerData.preferredMode}
            disabled={formStatus === 'loading'}
            onChange={(value) => setPartnerData(prev => ({ ...prev, preferredMode: value }))}
          />
          <ChoiceGroup
            name={`${idPrefix}-yearlyVolume`}
            legend="Orientacyjny wolumen roczny"
            hint="opcjonalnie"
            options={PARTNER_VOLUME_OPTIONS}
            value={partnerData.yearlyVolume}
            disabled={formStatus === 'loading'}
            onChange={(value) => setPartnerData(prev => ({ ...prev, yearlyVolume: value }))}
          />
        </div>
      )}

      <div>
        <label htmlFor={`${idPrefix}-message`} className="sr-only">Wiadomość</label>
        <textarea
          id={`${idPrefix}-message`}
          name="message"
          value={formData.message}
          onChange={handleFormChange}
          placeholder="Wiadomość (min. 10 znaków)"
          rows={5}
          required
          enterKeyHint="send"
          disabled={formStatus === 'loading'}
          className="w-full px-5 sm:px-6 py-4 text-base bg-white/5 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 focus:ring-2 focus:ring-purple-500/30 transition-colors resize-none disabled:opacity-50"
        ></textarea>
        <div className="text-sm text-gray-400 mt-1 text-right">
          {formData.message.length} / 2000 znaków
          {formData.message.length > 0 && formData.message.length < 10 && (
            <span className="text-red-400 ml-2">(min. 10)</span>
          )}
        </div>
      </div>
      
      <button
        type="submit"
        disabled={formStatus === 'loading' || !consentChecked}
        aria-busy={formStatus === 'loading'}
        className="w-full px-8 py-4 min-h-[52px] bg-white text-gray-900 rounded-lg font-medium tracking-wider hover:bg-white/90 active:bg-white/80 transition-all glow-box disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2"
      >
        {formStatus === 'loading' ? (
          <>
            <span
              className="inline-block w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            />
            Wysyłanie...
          </>
        ) : (
          'Wyślij wiadomość'
        )}
      </button>
      
      {/* Checkbox zgody */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id={`${idPrefix}-consent`}
          checked={consentChecked}
          onChange={(e) => setConsentChecked(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-700 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-900"
          required
        />
        <label htmlFor={`${idPrefix}-consent`} className="text-sm text-gray-300 leading-relaxed">
          Akceptuję{' '}
          <a
            href="/polityka-prywatnosci"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 underline underline-offset-4 hover:text-white"
          >
            Politykę Prywatności
          </a>
          <span className="text-red-400 ml-1">*</span>
        </label>
      </div>
      
      {formStatus === 'success' && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-300 text-center"
        >
          Gotowe. Wiadomość trafiła do nas — odezwiemy się w 24h.
        </div>
      )}

      {formStatus === 'error' && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-center"
        >
          {errorMessage || 'Wystąpił błąd podczas wysyłania wiadomości.'}
        </div>
      )}
    </form>
  )
}

export default ContactForm
