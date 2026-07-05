'use client'

import Link from 'next/link'
import AnimatedSection from '@/components/AnimatedSection'
import PanelOverviewMock from '@/components/sections/panel-overview-mock'

const proofItems = [
  'PageSpeed 90+',
  'Autorski CMS w standardzie',
  'RODO',
  '100% Twoje dane',
]

export default function CMSSection() {
  return (
    <section
      id="cms-section"
      aria-labelledby="cms-heading"
      className="relative z-10 py-20 md:py-24 px-5 md:px-6 lg:px-12"
    >
      <div className="max-w-5xl mx-auto">
        <AnimatedSection>
          <header className="text-center mb-8 md:mb-10">
            <p className="text-[11px] md:text-xs font-medium uppercase tracking-[0.2em] text-purple-300/70 mb-3">
              Syntance Panel
            </p>
            <h2
              id="cms-heading"
              className="text-3xl md:text-5xl font-light tracking-tight md:tracking-widest text-white mb-4 md:mb-5 max-w-3xl mx-auto leading-[1.15]"
            >
              Jeden panel zamiast pięciu narzędzi.
            </h2>
            <p className="text-sm md:text-lg font-light text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Strona, treści, produkty, zamówienia i analityka — wszystkim zarządzasz z jednego miejsca.
              Bez Shopify, bez wtyczek, bez pięciu logowań.
            </p>
          </header>
        </AnimatedSection>

        <AnimatedSection>
          <p
            className="mb-8 md:mb-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 md:px-6 text-xs md:text-sm text-gray-300"
            aria-label="Kluczowe cechy panelu"
          >
            {proofItems.map((item, index) => (
              <span key={item} className="inline-flex items-center gap-3">
                {index > 0 && (
                  <span className="text-gray-600" aria-hidden="true">
                    ·
                  </span>
                )}
                {item}
              </span>
            ))}
          </p>
        </AnimatedSection>

        <AnimatedSection>
          <div className="mb-10 md:mb-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/panel"
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 md:px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm md:text-base font-medium tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Zobacz interaktywne demo
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/panel/realizacje"
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 md:px-8 py-3.5 rounded-full border border-white/15 bg-white/[0.03] text-sm md:text-base font-light text-gray-300 tracking-wide transition-colors hover:border-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Zobacz w realizacjach
            </Link>
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <PanelOverviewMock />
          <p className="mt-4 text-center text-xs text-gray-500">
            Pełny interaktywny showcase panelu — na{' '}
            <Link href="/panel" className="text-gray-400 underline underline-offset-4 hover:text-white">
              syntance.com/panel
            </Link>
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}
