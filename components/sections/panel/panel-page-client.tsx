'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import GradientText from '@/components/GradientText'
import SubpageScrollbar from '@/components/SubpageScrollbar'
import StickyCtaFloat from '@/components/StickyCtaFloat'
import PanelMock from '@/components/sections/panel/panel-mock'
import PricingStudioNew from '@/components/sections/pricing-studio-new'
import Footer from '@/components/sections/footer'
import {
  ANALYTICS_BULLETS,
  PANEL_FAQ,
  PROBLEM_CARDS,
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

export default function PanelPageClient() {
  const scrollToNext = () => {
    const element = document.getElementById('panel-problem')
    if (!element) return

    const navbarHeight = 100
    const elementRect = element.getBoundingClientRect()
    const elementTop = elementRect.top + window.scrollY
    window.scrollTo({ top: elementTop - navbarHeight, behavior: 'smooth' })
  }

  return (
    <div className="bg-black min-h-screen">
      <SubpageScrollbar sections={SCROLLBAR_SECTIONS} />

      {/* 1. Hero — pełny viewport, wyśrodkowany jak na HP */}
      <section
        id="panel-hero"
        aria-labelledby="panel-hero-heading"
        className="relative z-10 flex min-h-screen items-center px-5 pb-20 pt-32 md:px-6 lg:px-12"
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-purple-300/70 md:text-xs">
              SYNTANCE CMS & SYNTANCE SHOP
              </p>
              <h1
                id="panel-hero-heading"
                className="mb-5 text-3xl font-light leading-[1.12] tracking-tight text-white sm:text-4xl md:text-5xl"
              >
                Jeden panel do sklepu, treści i SEO{' '}
                <span className="text-gray-400">
                  — zamiast pięciu narzędzi.
                </span>
              </h1>
              <p className="mb-8 text-sm leading-relaxed text-gray-400 md:text-lg">
                Syntance CMS i Syntance Shop to autorski panel do zarządzania stroną i sklepem internetowym zbudowanymi w Next.js. 
                Produkty, zamówienia i płatności prowadzisz w Syntance Shop; treści, stronę i SEO — w Syntance CMS. 
                Jeden panel, jedno logowanie — zmianę ceny czy tekstu widzisz na stronie w kilka sekund, bez wtyczek i abonamentów.
              </p>

              <div className="flex flex-col flex-wrap items-stretch gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={scrollToNext}
                  className="group inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-3.5 text-sm font-light tracking-wide text-gray-300 transition-colors hover:border-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black md:text-base"
                >
                  Zobacz panel w akcji
                  <ChevronDown
                    className="h-4 w-4 shrink-0 transition-transform group-hover:translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
                    aria-hidden="true"
                  />
                </button>
                <StickyCtaFloat heroId="panel-hero" hideSectionId="panel-cta" />
              </div>
            </div>

            <div className="hidden lg:block">
              <PanelMock view="overview" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <button
            type="button"
            onClick={scrollToNext}
            className="group flex cursor-pointer flex-col items-center gap-2"
            aria-label="Przewiń w dół"
          >
            <div className="flex h-10 w-6 justify-center rounded-full border-2 border-gray-600 transition-colors group-hover:border-gray-400">
              <div className="mt-2 h-3 w-1 animate-bounce rounded-full bg-gray-400 transition-colors motion-reduce:animate-none group-hover:bg-white" />
            </div>
          </button>
        </div>
      </section>

      {/* 2. Problem — poniżej foldu, wejście przy scrollu */}
      <section
        id="panel-problem"
        aria-labelledby="panel-problem-heading"
        className="relative z-10 scroll-mt-24 px-5 py-20 md:px-6 md:py-24 lg:px-12 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent"
      >
        <div className="mx-auto max-w-4xl text-center">
          <AnimatedSection>
            <h2
              id="panel-problem-heading"
              className="mb-4 text-2xl font-light leading-snug tracking-tight text-white md:text-4xl"
            >
              Sklep w Shopify. Treści w osobnym CMS. Zmiana maila do klienta — u programisty. Analityka w trzech zakładkach.
            </h2>
            <p className="mx-auto mb-10 max-w-3xl text-sm leading-relaxed text-gray-400 md:text-lg">
            Każde narzędzie to osobne logowanie, osobny rachunek i osobny panel do nauczenia. A dane nigdzie się nie spotykają.
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
              biznes.
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

      {/* 9. Cennik — ta sama sekcja co na stronie głównej */}
      <PricingStudioNew sectionId="panel-cta" headingId="panel-cta-heading" />

      <Footer />
    </div>
  )
}
