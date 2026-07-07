'use client'

import {
  useEffect,
  useState,
  useRef,
  useMemo,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowRight,
  ArrowDown,
  ChevronDown,
  LayoutTemplate,
  ShoppingCart,
  BadgeCheck,
} from 'lucide-react'
import GradientText from '@/components/GradientText'
import { WebsiteProblemsGrid } from '@/components/sections/website-problems-grid'
import TiltCard from '@/components/tilt-card'
import SubpageScrollbar from '@/components/SubpageScrollbar'
import StickyCtaFloat from '@/components/StickyCtaFloat'
import { ContactForm } from '@/components/contact-form'
import { AnalyticsEvent, trackAnalyticsEvent } from '@/lib/analytics'
import Footer from '@/components/sections/footer'

const scrollbarSections = [
  { id: 'pzm-hero', label: 'Start' },
  { id: 'pzm-bez-strategii', label: 'Problem' },
  { id: 'pzm-obszary', label: '3 obszary' },
  { id: 'pzm-faq', label: 'FAQ' },
  { id: 'pzm-formularz', label: 'Kontakt' },
]

const OBSZARY = [
  {
    icon: LayoutTemplate,
    title: 'Strona internetowa',
    body: 'Buyer persona, lejek, hierarchia treści, performance. Każda sekcja ma rolę w drodze klienta do zakupu — albo jej tam nie ma.',
    cta: 'Jak budujemy strony',
    href: '/strony-www',
    gradient: 'from-blue-500 to-cyan-500',
    trackTarget: 'strony' as const,
  },
  {
    icon: ShoppingCart,
    title: 'Sklep online',
    body: 'Kategorie zbudowane wokół intencji zakupowej klienta, nie wokół katalogu producenta. Checkout zoptymalizowany pod konkretną branżę.',
    cta: 'Jak budujemy sklepy',
    href: '/sklepy-internetowe',
    gradient: 'from-purple-500 to-pink-500',
    trackTarget: 'sklepy' as const,
  },
  {
    icon: BadgeCheck,
    title: 'Komunikacja i wiarygodność',
    body: 'Tone of voice, UVP, dowody. Strona, oferty i LinkedIn mówią jednym głosem — albo klient czuje rozjazd i wychodzi.',
    cta: 'Realizacje i case studies',
    href: '/portfolio',
    gradient: 'from-amber-500 to-orange-500',
    trackTarget: 'realizacje' as const,
  },
]

const FAQ_ITEMS = [
  {
    q: 'Czy muszę wiedzieć, czego potrzebuję?',
    a: 'Nie. Wystarczy kilka zdań o firmie i celu — pomożemy doprecyzować zakres na rozmowie.',
  },
  {
    q: 'Jak szybko odpowiadacie?',
    a: 'Zwykle w ciągu 24 godzin roboczych. Pilne sprawy — zadzwoń: +48 537 110 170.',
  },
  {
    q: 'Czy rozmowa mnie zobowiązuje?',
    a: 'Nie. To wstępna konsultacja — bez presji i bez ukrytych kosztów.',
  },
  {
    q: 'Mam stronę na WordPressie. Polecicie ją wyrzucić?',
    a: 'Niekoniecznie. Czasem optymalizacja lub przebudowa wybranych elementów daje lepszy efekt niż pełny redesign.',
  },
]

function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
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
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
    >
      {children}
    </div>
  )
}

export default function PorozmawiajmyContent() {
  const searchParams = useSearchParams()
  const utm = useMemo(
    () => ({
      utm_source: searchParams?.get('utm_source') ?? undefined,
      utm_medium: searchParams?.get('utm_medium') ?? undefined,
      utm_campaign: searchParams?.get('utm_campaign') ?? undefined,
    }),
    [searchParams],
  )

  const [heroVisible, setHeroVisible] = useState(false)
  useEffect(() => setHeroVisible(true), [])

  const viewTrackedRef = useRef(false)
  useEffect(() => {
    if (viewTrackedRef.current) return
    viewTrackedRef.current = true
    trackAnalyticsEvent(AnalyticsEvent.LeadLandingView, {
      ...utm,
      device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    })
  }, [utm])

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-ph-section]'))
    if (!sections.length) return
    const seen = new Set<string>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const name = e.target.getAttribute('data-ph-section')
          if (!name || seen.has(name) || !e.isIntersecting) continue
          seen.add(name)
          trackAnalyticsEvent(AnalyticsEvent.LeadSectionView, { section_name: name })
        }
      },
      { threshold: 0.35 },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  const scrollToForm = () => {
    document.getElementById('pzm-formularz')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleCta = (position: 'post-3-obszary') => {
    trackAnalyticsEvent(AnalyticsEvent.LeadCtaClick, { position })
    scrollToForm()
  }

  return (
    <div className="min-h-screen w-full" style={{ overflowX: 'clip' }}>
      <SubpageScrollbar sections={scrollbarSections} />

      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section
        id="pzm-hero"
        data-ph-section="hero"
        className="relative z-10 flex min-h-screen items-center justify-center px-6 pt-32 pb-20 lg:px-12"
      >
        <div
          className={`mx-auto max-w-3xl text-center transition-all duration-1000 ${
            heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <h1 className="font-heading glow-text mb-8 text-4xl font-light leading-tight tracking-tight md:text-5xl lg:text-6xl">
            Skuteczna strona musi być zbudowana{' '}
            <GradientText
              colors={['#ffaa40', '#9c40ff', '#ffaa40']}
              animationSpeed={4}
              className="font-medium"
            >
              w oparciu o strategię.
            </GradientText>
          </h1>

          <p className="mx-auto mb-12 max-w-2xl text-lg font-light leading-relaxed tracking-wide text-gray-400 md:text-xl">
            To filozofia, na której budujemy strony i sklepy internetowe.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="group relative w-fit shrink-0">
              <div
                className="animate-gradient absolute -inset-1 -z-10 rounded-full opacity-25 blur-md transition-opacity group-hover:opacity-50"
                style={{
                  backgroundImage: 'linear-gradient(to right, #ffaa40, #9c40ff, #ffaa40)',
                  backgroundSize: '300% 100%',
                }}
              />
              <button
                type="button"
                onClick={() =>
                  document.getElementById('pzm-bez-strategii')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className="relative z-10 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-white px-8 py-3 font-medium tracking-wider text-gray-900 shadow-lg shadow-white/10 transition-all hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Dowiedz się więcej
                <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-1" />
              </button>
            </div>

            <StickyCtaFloat
              heroId="pzm-hero"
              hideSectionId="pzm-formularz"
              href="/cennik"
              label="Sprawdź cenę"
            />
          </div>
        </div>

        <div
          className={`absolute bottom-10 left-1/2 -translate-x-1/2 transition-all delay-700 duration-1000 ${
            heroVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            type="button"
            aria-label="Przewiń w dół"
            onClick={() =>
              document.getElementById('pzm-bez-strategii')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="group flex flex-col items-center gap-2"
          >
            <div className="flex h-10 w-6 justify-center rounded-full border-2 border-gray-600 transition-colors group-hover:border-gray-400">
              <div className="mt-2 h-3 w-1 animate-bounce rounded-full bg-gray-400 transition-colors group-hover:bg-white" />
            </div>
          </button>
        </div>
      </section>

      {/* ─── BEZ STRATEGII ───────────────────────────────────── */}
      <section
        id="pzm-bez-strategii"
        data-ph-section="bez-strategii"
        className="relative z-10 px-6 py-32 lg:px-12"
      >
        <div className="mx-auto max-w-5xl">
          <AnimatedSection className="mb-16 text-center">
            <h2 className="glow-text text-3xl font-light tracking-wide md:text-5xl">
              Strona bez strategii{' '}
              <span className="text-red-400">wygląda tak:</span>
            </h2>
          </AnimatedSection>

          <WebsiteProblemsGrid />
        </div>
      </section>

      <section className="relative z-10 px-6 py-24 lg:px-12">
        <AnimatedSection className="mx-auto max-w-3xl text-center">
          <p className="text-2xl font-light leading-relaxed text-gray-400 md:text-4xl">
            A gdyby strona działała jak{' '}
            <span className="text-white">lejek</span>, nie jak{' '}
            <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              broszura?
            </span>
          </p>
        </AnimatedSection>
      </section>

      {/* ─── TRZY OBSZARY + CALLOUT ───────────────────────────── */}
      <section
        id="pzm-obszary"
        data-ph-section="3-obszary"
        className="relative z-10 bg-linear-to-b from-transparent via-blue-950/10 to-transparent px-6 py-32 lg:px-12"
      >
        <div className="mx-auto max-w-5xl">
          <AnimatedSection className="mb-16 text-center">
            <h2 className="glow-text mb-6 text-3xl font-light tracking-wide md:text-5xl">
              Trzy miejsca, w których{' '}
              <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                strategia decyduje o wyniku
              </span>
            </h2>
          </AnimatedSection>

          <div className="mb-16 grid gap-6 md:grid-cols-3 md:gap-8">
            {OBSZARY.map((item, i) => {
              const Icon = item.icon
              return (
                <AnimatedSection key={item.href} delay={i * 150}>
                  <TiltCard className="h-full">
                    <div className="group relative h-full">
                      <div
                        className={`absolute -inset-0.5 bg-linear-to-r ${item.gradient} rounded-2xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-20`}
                      />
                      <div className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-gray-900/80 p-8 backdrop-blur-sm">
                        <div
                          className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br ${item.gradient}`}
                        >
                          <Icon size={28} className="text-white" />
                        </div>
                        <h3 className="mb-3 text-xl font-medium text-white">{item.title}</h3>
                        <p className="mb-6 grow leading-relaxed text-gray-400">{item.body}</p>
                        <Link
                          href={item.href}
                          onClick={() =>
                            trackAnalyticsEvent(AnalyticsEvent.LeadSubpageClick, {
                              target: item.trackTarget,
                            })
                          }
                          className="group/link mt-auto inline-flex items-center gap-2 text-[15px] font-medium text-white/70 transition-colors hover:text-white"
                        >
                          {item.cta}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </TiltCard>
                </AnimatedSection>
              )
            })}
          </div>

          <AnimatedSection delay={400}>
            <div className="group relative mx-auto max-w-2xl">
              <div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-purple-500 via-pink-500 to-orange-500 opacity-15 blur-xl transition-opacity duration-500 group-hover:opacity-25" />
              <div className="relative rounded-3xl border border-white/10 bg-gray-900/80 p-10 text-center backdrop-blur-sm">
                <p className="mb-3 text-xl leading-relaxed text-gray-300 md:text-2xl">
                  Chcesz zbudować stronę, która{' '}
                  <strong className="font-medium text-white">sprzedaje?</strong>
                </p>
                <p className="mb-8 text-lg text-gray-400">Skontaktuj się z nami</p>
                <div className="relative inline-block w-fit">
                  <div
                    className="animate-gradient absolute -inset-1 -z-10 rounded-full opacity-30 blur-md transition-opacity group-hover:opacity-50"
                    style={{
                      backgroundImage: 'linear-gradient(to right, #9c40ff, #ff6b6b, #9c40ff)',
                      backgroundSize: '300% 100%',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleCta('post-3-obszary')}
                    className="relative z-10 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-white px-8 py-3 font-medium tracking-wider text-gray-900 shadow-lg transition-all hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    Napisz do nas
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────── */}
      <section
        id="pzm-faq"
        data-ph-section="faq"
        className="relative z-10 px-6 py-32 lg:px-12"
      >
        <div className="mx-auto max-w-3xl">
          <AnimatedSection className="mb-16 text-center">
            <h2 className="glow-text text-3xl font-light tracking-wide md:text-5xl">
              Pytania i odpowiedzi
            </h2>
          </AnimatedSection>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <AnimatedSection key={item.q} delay={i * 60}>
                <details className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-colors hover:border-white/20">
                  <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                    <span className="pr-4 font-medium text-white">{item.q}</span>
                    <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-6 pt-0">
                    <p className="leading-relaxed text-gray-400">{item.a}</p>
                  </div>
                </details>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── KONTAKT ──────────────────────────────────────────── */}
      <section
        id="pzm-formularz"
        data-ph-section="form"
        className="relative z-10 scroll-mt-24 bg-linear-to-b from-transparent via-purple-950/10 to-transparent px-6 py-32 lg:px-12"
      >
        <div className="mx-auto max-w-2xl">
          <AnimatedSection className="mb-12 text-center">
            <h2 className="glow-text mb-4 text-3xl font-light tracking-wide md:text-5xl">
              Porozmawiajmy o projekcie
            </h2>
            <p className="text-xl text-gray-400">
              Opisz, czego potrzebujesz — odezwiemy się w ciągu 24 godzin.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="relative">
              <div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-purple-500/20 to-blue-500/20 blur-xl" />
              <div className="relative rounded-3xl border border-white/10 bg-gray-900/80 p-8 backdrop-blur-sm md:p-10">
                <ContactForm idPrefix="pzm" source="porozmawiajmy" />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  )
}
