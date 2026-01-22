'use client'

import { useState } from 'react'

interface ContactFormProps {
  /** Unikalny prefix dla ID formularza (dla multiple forms na jednej stronie) */
  idPrefix?: string
  /** Czy pokazać pełną klauzulę RODO */
  showFullRodo?: boolean
  /** Źródło formularza (do śledzenia w analytics) */
  source?: string
  /** Klasy CSS dla kontenera */
  className?: string
}

export function ContactForm({ 
  idPrefix = 'contact', 
  showFullRodo = true,
  source = 'website',
  className = ''
}: ContactFormProps) {
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
    
    setFormStatus('loading')
    setErrorMessage('')

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
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, source }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Wystąpił błąd podczas wysyłania wiadomości.')
      }

      setFormStatus('success')
      setFormData({ name: '', email: '', phone: '', message: '', hp: '' })
      setConsentChecked(false)
    } catch (error) {
      setFormStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Wystąpił błąd podczas wysyłania wiadomości.')
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
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleFormChange}
          placeholder="Imię i nazwisko"
          required
          disabled={formStatus === 'loading'}
          className="w-full px-6 py-4 bg-white bg-opacity-5 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors disabled:opacity-50"
        />
      </div>
      <div>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleFormChange}
          placeholder="Email"
          required
          disabled={formStatus === 'loading'}
          className="w-full px-6 py-4 bg-white bg-opacity-5 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors disabled:opacity-50"
        />
      </div>
      <div>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleFormChange}
          placeholder="Numer telefonu"
          required
          disabled={formStatus === 'loading'}
          className="w-full px-6 py-4 bg-white bg-opacity-5 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors disabled:opacity-50"
        />
      </div>
      <div>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleFormChange}
          placeholder="Wiadomość (min. 10 znaków)"
          rows={5}
          required
          disabled={formStatus === 'loading'}
          className="w-full px-6 py-4 bg-white bg-opacity-5 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors resize-none disabled:opacity-50"
        ></textarea>
        <div className="text-sm text-gray-300 mt-1 text-right">
          {formData.message.length} / 2000 znaków
          {formData.message.length > 0 && formData.message.length < 10 && (
            <span className="text-red-400 ml-2">(min. 10)</span>
          )}
        </div>
      </div>
      
      <button
        type="submit"
        disabled={formStatus === 'loading' || !consentChecked}
        className="w-full px-8 py-4 bg-white text-gray-900 rounded-lg font-medium tracking-wider hover:bg-opacity-90 transition-all glow-box disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {formStatus === 'loading' ? 'Wysyłanie...' : 'Wyślij wiadomość'}
      </button>
      
      {/* Checkbox zgody */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id={`${idPrefix}-consent`}
          checked={consentChecked}
          onChange={(e) => setConsentChecked(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-700 bg-white bg-opacity-5 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-900"
          required
        />
        <label htmlFor={`${idPrefix}-consent`} className="text-sm text-gray-300 leading-relaxed">
          Akceptuję <a href="/polityka-prywatnosci" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gray-300 underline">Politykę Prywatności</a>
          <span className="text-red-400 ml-1">*</span>
        </label>
      </div>
      
      {/* Klauzula informacyjna RODO */}
      {showFullRodo && (
        <div className="text-xs text-gray-300 space-y-1">
          <p>
            Administratorem Twoich danych osobowych jest <strong>Syntance P.S.A.</strong>, z siedzibą w Czerniec 72, 33-390 Łącko, e-mail:{" "}
            <a href="mailto:biuro@syntance.com" className="text-gray-300 hover:text-gray-300 underline">
              biuro@syntance.com
            </a>
            .
          </p>
          <p>
            Dane podane w formularzu będą przetwarzane wyłącznie w celu udzielenia odpowiedzi na Twoje zapytanie lub przedstawienia oferty, na podstawie art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes administratora).
          </p>
          <p>
            Twoje dane nie będą udostępniane innym podmiotom, z wyjątkiem podmiotów świadczących usługi hostingowe i techniczne na rzecz administratora.
          </p>
          <p>
            Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania oraz wniesienia sprzeciwu.
          </p>
          <p>
            Więcej informacji znajdziesz w <a href="/polityka-prywatnosci" className="text-gray-300 hover:text-gray-300 underline font-medium">Polityce Prywatności</a> na naszej stronie.
          </p>
        </div>
      )}
      
      {formStatus === 'success' && (
        <div className="p-4 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg text-green-300 text-center">
          Wiadomość została wysłana pomyślnie!
        </div>
      )}
      
      {formStatus === 'error' && (
        <div className="p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300 text-center">
          {errorMessage || 'Wystąpił błąd podczas wysyłania wiadomości.'}
        </div>
      )}
    </form>
  )
}

export default ContactForm
