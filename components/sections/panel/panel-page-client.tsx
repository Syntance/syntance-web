'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import GradientText from '@/components/GradientText'
import SubpageScrollbar from '@/components/SubpageScrollbar'
import StickyCtaFloat from '@/components/StickyCtaFloat'
import PanelMock from '@/components/sections/panel/panel-mock'
import {
  ANALYTICS_BULLETS,
  PANEL_FAQ,
  PROBLEM_CARDS,
  PROOF_BAR,
  SCROLLBAR_SECTIONS,
  STACK_BADGES,
  SECURITY_PILLARS,
} from '@/components/sections/panel/panel-content'

const PanelShowcase = dynamic(() => import('@/components/sections/panel/panel-showcase'), {
  ssr: false,
  loading: () => (
    <section className="relative z-10 py-20 px-5 md:px-6 lg:px-12" aria-hidden="true">
      <div className="max-w-3xl mx-auto">
        <PanelMock view="overview" animate={false} />
      </div>
    </section>
  ),
})

function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1, rootMargin: '-50px' },
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
    >
      {children}
    </div>
  )
}

function ProofBar({ className = '' }: { className?: string }) {
  return (
    <p
      className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs md:text-sm text-gray-300 ${className}`}
      aria-label="Kluczowe cechy panelu"
    >
      {PROOF_BAR.map((item, index) => (
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
  )
}

export default function PanelPageClient() {
  return (
    <div className="bg-black min-h-screen">
      <SubpageScrollbar sections={SCROLLBAR_SECTIONS} />
      <StickyCtaFloat heroId="panel-hero" hideSectionId="panel-cta" href="/kontakt" label="Umów demo" />

      {/* 1. Hero */}
      <section
        id="panel-hero"
        aria-labelledby="panel-hero-heading"
        className="relative z-10 pt-28 pb-16 md:pt-36 md:pb-24 px-5 md:px-6 lg:px-12"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <AnimatedSection>
              <p className="text-[11px] md:text-xs font-medium uppercase tracking-[0.2em] text-purple-300/70 mb-4">
                Panel sklepu Syntance
              </p>
              <h1
                id="panel-hero-heading"
                className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.12] text-white mb-5"
              >
                Cały sklep z jednego panelu.{' '}
                <span className="text-gray-400">
                  Bez Shopify, bez Sanity, bez pięciu logowań.
                </span>
              </h1>
              <p className="text-sm md:text-lg text-gray-400 leading-relaxed mb-4">
                Strona, produkty, zamówienia, treści, SEO i analityka — wszystkim zarządzasz w jednym,
                autorskim panelu zbudowanym pod Twój biznes.
              </p>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Prosto i intuicyjnie. Zmianę tekstu czy ceny widzisz na stronie w kilka sekund.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link
                  href="/kontakt"
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm md:text-base font-medium tracking-wide transition-all hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  Umów demo panelu
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <a
                  href="#panel-showcase"
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3.5 rounded-full border border-white/15 bg-white/[0.03] text-sm md:text-base font-light text-gray-300 tracking-wide transition-colors hover:border-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  Zobacz, jak działa
                </a>
              </div>

              <ProofBar className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 md:px-5" />
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <PanelMock view="overview" />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 2. Problem */}
      <section
        id="panel-problem"
        aria-labelledby="panel-problem-heading"
        className="relative z-10 py-20 md:py-24 px-5 md:px-6 lg:px-12 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent"
      >
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <h2
              id="panel-problem-heading"
              className="text-2xl md:text-4xl font-light tracking-tight text-white mb-4 leading-snug"
            >
              Sklep w Shopify. Treści w Sanity. Maile w osobnym narzędziu. Analityka w trzech zakładkach.
            </h2>
            <p className="text-sm md:text-lg text-gray-400 leading-relaxed mb-10 max-w-3xl mx-auto">
              Każde narzędzie to osobna subskrypcja, osobne logowanie i osobny rachunek. A dane nigdzie
              się nie spotykają.
            </p>
          </AnimatedSection>

          <ul className="grid sm:grid-cols-3 gap-3 md:gap-4 mb-10">
            {PROBLEM_CARDS.map((card, index) => (
              <AnimatedSection key={card.title} delay={index * 80}>
                <li className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left">
                  <span className="text-2xl mb-3 block" aria-hidden="true">
                    {card.emoji}
                  </span>
                  <p className="text-sm text-gray-300 leading-relaxed">{card.title}</p>
                </li>
              </AnimatedSection>
            ))}
          </ul>

          <AnimatedSection delay={200}>
            <p className="text-base md:text-lg text-white font-light">
              Zebraliśmy to w{' '}
              <GradientText className="font-medium">jednym panelu</GradientText>, zbudowanym pod Twój
              sklep.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* 3. Showcase */}
      <PanelShowcase />

      {/* 4. CMS / PageSpeed */}
      <section
        id="pagespeed"
        aria-labelledby="pagespeed-heading"
        className="relative z-10 py-20 md:py-24 px-5 md:px-6 lg:px-12"
      >
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <header className="text-center mb-10 md:mb-12 max-w-3xl mx-auto">
              <h2
                id="pagespeed-heading"
                className="text-3xl md:text-4xl font-light tracking-tight text-white mb-4"
              >
                Zwykły CMS spowalnia stronę. <GradientText className="font-medium">Nasz — odwrotnie.</GradientText>
              </h2>
              <p className="text-sm md:text-base text-gray-400 leading-relaxed">
                WordPress i ciężkie headless&apos;y ładują treść i grafikę dynamicznie przy każdym wejściu.
                Stąd wtyczki, rozdmuchany kod i spadający PageSpeed.
              </p>
            </header>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-8">
            <AnimatedSection delay={50}>
              <div className="h-full rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                <h3 className="text-lg font-medium text-white mb-3">Lekkie treści (na żywo, robisz sam)</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Teksty, nagłówki, ceny, FAQ, SEO, ogłoszenia — publikacja w sekundy, bez redeploy.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={100}>
              <div className="h-full rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
                <h3 className="text-lg font-medium text-white mb-3">Ciężkie elementy (po redeploy)</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Zdjęcia i grafikę optymalizujemy i wkompilowujemy w build — serwowane statycznie, bez
                  dynamicznego ładowania. Strona schodzi poniżej 1&nbsp;s.
                </p>
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={150}>
            <p className="text-center text-sm md:text-base text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Masz samodzielną edycję treści i wydajność strony statycznej naraz. Eliminujemy kompromis
              typowego CMS: albo wygodna edycja, albo szybkość.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* 5. Analytics */}
      <section
        id="panel-analytics"
        aria-labelledby="panel-analytics-heading"
        className="relative z-10 py-20 md:py-24 px-5 md:px-6 lg:px-12 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent"
      >
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <AnimatedSection>
            <h2 id="panel-analytics-heading" className="text-3xl md:text-4xl font-light text-white mb-4">
              Dwa źródła prawdy. <GradientText className="font-medium">Jeden widok.</GradientText>
            </h2>
            <p className="text-sm md:text-base text-gray-400 leading-relaxed mb-6">
              Ruch i atrybucja z GA4, zachowanie i lejek z PostHog — połączone w panelu. Koniec ze
              sklejaniem danych w Excelu.
            </p>
            <ul className="space-y-3 mb-6">
              {ANALYTICS_BULLETS.map((bullet) => (
                <li key={bullet} className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-purple-400" aria-hidden="true" />
                  {bullet}
                </li>
              ))}
            </ul>
            <p className="text-xs md:text-sm text-gray-500">
              Consent Mode v2, dane w EU, zero danych osobowych w zdarzeniach.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <PanelMock view="stats" />
          </AnimatedSection>
        </div>
      </section>

      {/* 6. Security */}
      <section
        id="panel-security"
        aria-labelledby="panel-security-heading"
        className="relative z-10 py-20 md:py-24 px-5 md:px-6 lg:px-12"
      >
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-10 md:mb-12">
            <h2 id="panel-security-heading" className="text-3xl md:text-4xl font-light text-white mb-4">
              Twój kod. Twoje dane. <GradientText className="font-medium">Zero uzależnienia.</GradientText>
            </h2>
          </AnimatedSection>

          <ul className="grid md:grid-cols-3 gap-4 mb-8">
            {SECURITY_PILLARS.map((pillar, index) => (
              <AnimatedSection key={pillar.title} delay={index * 80}>
                <li className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left">
                  <span className="text-2xl mb-3 block" aria-hidden="true">
                    {pillar.emoji}
                  </span>
                  <h3 className="text-lg font-medium text-white mb-2">{pillar.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{pillar.description}</p>
                </li>
              </AnimatedSection>
            ))}
          </ul>

          <AnimatedSection delay={200}>
            <p className="text-center text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Wolisz standard branżowy? Ten sam projekt wdrożymy na Sanity — wtedy część grafik edytujesz
              sam, kosztem dodatkowej subskrypcji.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* 7. Stack */}
      <section
        id="panel-stack"
        aria-labelledby="panel-stack-heading"
        className="relative z-10 py-20 md:py-24 px-5 md:px-6 lg:px-12 border-t border-white/5"
      >
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-10">
            <h2 id="panel-stack-heading" className="text-3xl md:text-4xl font-light text-white mb-4">
              Sprawdzone technologie. Dobrane do Twojego projektu.
            </h2>
            <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Nie naginamy projektu do jednego narzędzia — składamy stack z najlepszych, sprawdzonych
              klocków. To, czego używamy, masz w opcjach.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
              {STACK_BADGES.map((badge) => (
                <li
                  key={badge.name}
                  className="group rounded-xl border border-white/10 bg-white/[0.02] px-4 py-4 transition-colors hover:border-purple-400/30 hover:bg-purple-500/5"
                >
                  <p className="text-sm font-medium text-gray-400 transition-colors group-hover:text-white">
                    {badge.name}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-600 leading-snug group-hover:text-gray-500">
                    {badge.description}
                  </p>
                </li>
              ))}
            </ul>
            <p className="text-center text-xs md:text-sm text-gray-500 max-w-3xl mx-auto leading-relaxed">
              Domyślnie wdrażamy autorski panel. Sanity, dodatkowe integracje czy inny zestaw płatności
              dobieramy pod konkretny projekt — nie płacisz za to, czego nie używasz.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* 8. FAQ */}
      <section id="panel-faq" aria-labelledby="panel-faq-heading" className="relative z-10 py-20 md:py-24 px-5 md:px-6 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-10">
            <h2 id="panel-faq-heading" className="text-3xl md:text-4xl font-light text-white">
              Najczęstsze pytania
            </h2>
          </AnimatedSection>

          <div className="space-y-3">
            {PANEL_FAQ.map((item, index) => (
              <AnimatedSection key={item.question} delay={index * 40}>
                <details className="group rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden hover:border-white/20 transition-colors">
                  <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none">
                    <span className="font-medium text-white text-left pr-2">{item.question}</span>
                    <ChevronDown
                      size={20}
                      className="shrink-0 text-gray-400 transition-transform duration-300 group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <div className="px-5 pb-5">
                    <p className="text-gray-400 leading-relaxed text-sm md:text-base">{item.answer}</p>
                  </div>
                </details>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CTA */}
      <section id="panel-cta" aria-labelledby="panel-cta-heading" className="relative z-10 py-20 md:py-28 px-5 md:px-6 lg:px-12">
        <AnimatedSection className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-3xl blur-xl opacity-20" />
            <div className="relative rounded-3xl border border-white/10 bg-gray-900/80 backdrop-blur-sm p-10 md:p-14">
              <h2 id="panel-cta-heading" className="text-3xl md:text-4xl font-light text-white mb-4">
                Zobacz panel na własne oczy
              </h2>
              <p className="text-sm md:text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
                Pokażemy Ci panel na żywo i policzymy wycenę pod Twój sklep.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/kontakt"
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium transition-all hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02]"
                >
                  Umów demo
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link
                  href="/cennik"
                  className="inline-flex items-center justify-center min-h-[48px] px-8 py-3.5 rounded-full border border-white/15 text-gray-300 font-light transition-colors hover:border-white/25 hover:text-white"
                >
                  Sprawdź cenę
                </Link>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      <footer className="relative z-10 border-t border-gray-900 pt-12 pb-10 px-5 md:px-6 lg:px-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Powrót do strony głównej
          </Link>
          <p className="text-xs text-gray-500">Panel do zarządzania sklepem internetowym · Syntance</p>
        </div>
      </footer>
    </div>
  )
}
