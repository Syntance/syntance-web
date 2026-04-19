'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, Check, Mail } from 'lucide-react'
import MeetingBookingWidget from '@/components/MeetingBookingWidget'
import { trackEvent } from '@/lib/tracking'

const BULLETS = [
  'Pokażę, co zmieniłbym na Twojej obecnej stronie — konkretne wskazówki, nie ogólniki.',
  'Wycenię projekt na bazie Twoich celów — dostaniesz realny zakres i cenę, nie „od X do Y”.',
  'Bez presji sprzedażowej — jak nie pasuje, rozstajemy się bez zobowiązań.',
]

export default function PorozmawiajmyContent() {
  const searchParams = useSearchParams()
  const source = useMemo(() => {
    const s = searchParams?.get('utm_source') ?? undefined
    const c = searchParams?.get('utm_campaign') ?? undefined
    return [s, c].filter(Boolean).join('|') || undefined
  }, [searchParams])

  const viewTrackedRef = useRef(false)
  useEffect(() => {
    if (viewTrackedRef.current) return
    viewTrackedRef.current = true
    trackEvent('bizcard_landing_view', {
      utm_source: searchParams?.get('utm_source') ?? undefined,
      utm_campaign: searchParams?.get('utm_campaign') ?? undefined,
      utm_medium: searchParams?.get('utm_medium') ?? undefined,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    })
  }, [searchParams])

  const handleCtaClick = useCallback((position: 'hero') => {
    trackEvent('bizcard_cta_clicked', { position })
    const el = document.getElementById('booking')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleEmailClick = useCallback(() => {
    trackEvent('bizcard_email_clicked')
  }, [])

  return (
    <div className="min-h-screen w-full bg-black text-[#F5F3FF]" style={{ overflowX: 'clip' }}>
      {/* Minimalny top bar z logo */}
      <header className="px-6 pt-10 md:px-10">
        <div className="mx-auto max-w-[800px]">
          <Link
            href="/"
            className="text-sm font-medium tracking-wider text-gray-400 transition-colors hover:text-white"
          >
            Syntance
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[800px] px-6 pt-10 pb-24 md:px-10 md:pt-16">
        {/* Hero — personalne powitanie */}
        <section className="mb-16">
          <p className="mb-4 text-lg text-gray-400">👋 Dzięki za wizytówkę.</p>
          <h1 className="mb-6 text-[clamp(1.9rem,5vw,3rem)] font-light leading-[1.1] tracking-tight text-white">
            Jestem <span className="font-medium">Kamil</span>, founder Syntance.
            <br className="hidden sm:block" />
            Umówmy <span className="text-purple-400">30 minut</span> — pokażę Ci, jak strona może realnie
            sprzedawać.
          </h1>

          <button
            type="button"
            onClick={() => handleCtaClick('hero')}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-4 font-medium tracking-wider text-white shadow-lg transition-all hover:shadow-purple-500/30"
          >
            Wybierz termin <ArrowRight className="h-4 w-4" />
          </button>
        </section>

        {/* 3 punkty — co dostajesz z rozmowy */}
        <section className="mb-16">
          <h2 className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-gray-400">
            Co dostajesz z tej rozmowy
          </h2>
          <ul className="space-y-4">
            {BULLETS.map((bullet, i) => (
              <li key={i} className="flex items-start gap-3 text-[17px] md:text-lg text-gray-200 leading-relaxed">
                <Check className="mt-1 h-5 w-5 flex-none text-purple-400" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Social proof — jedna linia */}
        <section className="mb-16">
          <p className="text-sm text-gray-500">
            Wybrane projekty: <span className="text-gray-300">RetroHouse</span>,{' '}
            <span className="text-gray-300">Lumine</span>,{' '}
            <span className="text-gray-300">OZE Asystent</span> — i kolejne w drodze.
          </p>
        </section>

        {/* Widget rezerwacji */}
        <section id="booking" className="mb-12 scroll-mt-24">
          <h2 className="mb-6 text-xl font-medium text-white md:text-2xl">Wybierz termin</h2>
          <MeetingBookingWidget source={source} />
        </section>

        {/* Email fallback */}
        <section className="mb-16 text-center">
          <a
            href="mailto:kamil@syntance.com?subject=Rozmowa%20z%20wizytówki"
            onClick={handleEmailClick}
            className="inline-flex min-h-11 items-center gap-2 text-sm text-gray-400 underline underline-offset-4 transition-colors hover:text-white"
          >
            <Mail className="h-4 w-4" />
            Wolisz napisać? kamil@syntance.com
          </a>
        </section>
      </main>

      {/* Minimalny footer */}
      <footer className="border-t border-white/5 px-6 py-8 md:px-10">
        <div className="mx-auto flex max-w-[800px] flex-col items-start justify-between gap-4 text-sm text-gray-500 md:flex-row md:items-center">
          <div>
            <span className="font-medium text-gray-300">Syntance</span>
            <span className="ml-2">— strategia, strony www, analityka</span>
          </div>
          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()}</span>
            <Link
              href="/polityka-prywatnosci"
              className="transition-colors hover:text-gray-300"
            >
              Polityka prywatności
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
