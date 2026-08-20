'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, ClipboardList } from 'lucide-react'
import GradientText from '@/components/GradientText'
import { PARTNER_HERO_SECTION_ID, PARTNER_PRICING_SECTION_ID } from '../_content'
import { scrollToPartnerForm, scrollToSection } from './partner-nav'

const badges = [
  'Kara umowna za opóźnienie',
  'PageSpeed 96+ albo poprawiamy na nasz koszt',
  'Kod w Twoim repo od dnia 1',
]

export default function PartnerHero() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <section
      id={PARTNER_HERO_SECTION_ID}
      className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 lg:px-12 pt-32 pb-24"
    >
      <div
        className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h1 className="mb-6 glow-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wide leading-tight">
          Strony{' '}
          <GradientText
            colors={['#06b6d4', '#3b82f6', '#8b5cf6', '#3b82f6', '#06b6d4']}
            animationSpeed={4}
            className="font-medium"
          >
            Next.js
          </GradientText>{' '}
          dla agencji — w terminie, z karą umowną po naszej stronie.
        </h1>
        <p className="text-lg md:text-xl font-light tracking-wide text-gray-400 mb-8 max-w-3xl mx-auto">
          Pracujemy pod Twoją marką albo obok niej — tryb wybierasz Ty. Rozliczenie to procent od
          naszego cennika detalicznego, więc znasz punkt odniesienia zanim zapytasz o wycenę.
        </p>
        <ul className="flex flex-wrap justify-center gap-2 mb-10 text-xs md:text-sm text-gray-400">
          {badges.map((badge) => (
            <li
              key={badge}
              className="px-3 py-1 rounded-full border border-white/10 bg-white/5"
            >
              {badge}
            </li>
          ))}
        </ul>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            type="button"
            onClick={() => scrollToPartnerForm('Hero — rozmowa partnerska')}
            className="relative group inline-flex"
          >
            <span
              className="absolute -inset-1 rounded-full blur-md opacity-25 group-hover:opacity-40 transition-opacity animate-gradient -z-10"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #06b6d4, #3b82f6, #8b5cf6, #3b82f6, #06b6d4)',
                backgroundSize: '300% 100%',
              }}
              aria-hidden
            />
            <span className="relative z-10 px-8 py-4 rounded-full bg-white text-gray-900 font-medium tracking-wide hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
              <ClipboardList className="w-5 h-5" aria-hidden />
              Umów rozmowę partnerską
            </span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection(PARTNER_PRICING_SECTION_ID)}
            className="px-8 py-4 rounded-full border border-gray-600 text-white font-medium tracking-wide hover:border-gray-400 hover:bg-white/5 transition-all inline-flex items-center gap-2"
          >
            Jak liczymy cenę
            <ArrowRight className="w-4 h-4" aria-hidden />
          </button>
        </div>
      </div>
      <div
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden
      >
        <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  )
}
