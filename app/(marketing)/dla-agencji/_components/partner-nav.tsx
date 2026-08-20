'use client'

import { useEffect, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { AnalyticsEvent, trackAnalyticsEvent } from '@/lib/analytics'
import { PARTNER_FORM_SECTION_ID, PARTNER_HERO_SECTION_ID } from '../_content'

export function scrollToPartnerForm(label = 'Umów rozmowę partnerską') {
  trackAnalyticsEvent(AnalyticsEvent.SiteCtaClick, {
    label,
    location: '/dla-agencji',
    href: `#${PARTNER_FORM_SECTION_ID}`,
  })
  document
    .getElementById(PARTNER_FORM_SECTION_ID)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/**
 * Pasek CTA przyklejony do dołu — pojawia się po opuszczeniu hero,
 * znika nad sekcją z formularzem (żeby nie dublować akcji).
 */
export function PartnerStickyBar() {
  const [fixed, setFixed] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const hero = document.getElementById(PARTNER_HERO_SECTION_ID)
    if (!hero) return

    const observer = new IntersectionObserver(
      ([entry]) => setFixed(entry.intersectionRatio < 0.35),
      { threshold: [0, 0.15, 0.35, 0.5, 0.7, 1] }
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const section = document.getElementById(PARTNER_FORM_SECTION_ID)
    if (!section) return

    const observer = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting), {
      threshold: 0.12,
    })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  if (!fixed || hidden) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 md:px-8 pointer-events-none">
      <div className="pointer-events-auto max-w-3xl mx-auto rounded-2xl border border-white/15 bg-black/85 backdrop-blur-md shadow-lg shadow-black/40 px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-3">
        <p className="text-sm text-gray-400 text-center sm:text-left">
          Zapytanie partnerskie — odpowiadamy w ciągu 24 godzin roboczych
        </p>
        <button
          type="button"
          onClick={() => scrollToPartnerForm('Sticky bar — rozmowa partnerska')}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white text-gray-900 font-medium text-sm hover:bg-gray-100 transition-colors whitespace-nowrap shadow-md"
        >
          <ClipboardList className="w-4 h-4 shrink-0" aria-hidden />
          Umów rozmowę
        </button>
      </div>
    </div>
  )
}
