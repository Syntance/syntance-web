'use client'

import { useEffect, useState, useRef } from 'react'
import {
  Check,
  Palette,
  Code,
  Search,
  HeartHandshake,
  ArrowRight,
  XCircle,
  Building2,
  Factory,
  Lightbulb,
  Home,
  ChevronDown,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import GradientText from '@/components/GradientText'
import TiltCard from '@/components/tilt-card'
import SubpageScrollbar from '@/components/SubpageScrollbar'
import StickyCtaFloat from '@/components/StickyCtaFloat'

// Sekcje dla scrollbar
const scrollbarSections = [
  { id: "hero-strony", label: "Start" },
  { id: "problem", label: "Problem" },
  { id: "solution", label: "Rozwiązanie" },
  { id: "audience", label: "Dla kogo" },
  { id: "process", label: "Proces" },
  { id: "tech", label: "Technologia" },
  { id: "pricing", label: "Cennik" },
  { id: "faq", label: "FAQ" },
]

// Komponent animowanej sekcji
function AnimatedSection({ 
  children, 
  className = '', 
  delay = 0 
}: { 
  children: React.ReactNode
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
      { threshold: 0.1, rootMargin: '-50px' }
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

const problems = [
  { icon: XCircle, text: "Wolna", desc: "użytkownicy uciekają po 3 sekundach" },
  { icon: XCircle, text: "Niewidoczna w Google i AI", desc: "brak ruchu organicznego." },
  { icon: XCircle, text: "Przestarzała technologia", desc: "WordPress z 50 wtyczkami" },
  { icon: XCircle, text: "Brak strategii", desc: "\"ładna\" strona bez celu biznesowego" },
]

const solutions = [
  { title: "Szybkość", description: "PageSpeed 90+ gwarantowany" },
  { title: "SEO i AI", description: "Optymalizacja od pierwszego dnia" },
  { title: "Nowoczesna technologia", description: "Next.js, headless CMS" },
  { title: "Strategia przed kodem", description: "Strategia przedwdrożeniowa w cenie" },
]

const targetAudiences = [
  {
    icon: Building2,
    title: "Firmy usługowe",
    description:
      "Strona, która generuje zapytania — nie tylko „ładnie wygląda”. Pozycjonowanie lokalne, formularze z kwalifikacją leadów, integracja z CRM.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Factory,
    title: "Producenci B2B",
    description:
      "Katalog produktów, specyfikacje techniczne, zapytania ofertowe — w jednym miejscu. Koniec z wysyłaniem PDF-ów mailem.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Lightbulb,
    title: "Startupy",
    description:
      "MVP w 3 tygodnie — szybkie wejście na rynek z profesjonalną stroną, którą można skalować. Bez długu technologicznego od dnia 1.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Home,
    title: "Deweloperzy",
    description:
      "Inwestycje z wizualizacjami 3D, galeriami i systemem rezerwacji mieszkań. Strona, która sprzedaje metraż, nie piksele.",
    gradient: "from-green-500 to-emerald-500",
  },
]

/** Zgodne z sekcją „Jak pracujemy” na stronie głównej (`process-studio.tsx`) */
const processSteps = [
  {
    number: 'Etap 1',
    title: 'Poznajemy Twój biznes',
    description:
      'Zanim napiszemy linijkę kodu, rozumiemy cel, klienta i rynek.',
    icon: Search,
    gradient: 'from-blue-400 to-cyan-400',
  },
  {
    number: 'Etap 2',
    title: 'Projektujemy doświadczenie',
    description:
      'To czas na UX/UI oraz copywritting. Design to nie tylko wygląd - to przemyślana ścieżka użytkownika.',
    icon: Palette,
    gradient: 'from-purple-400 to-pink-400',
  },
  {
    number: 'Etap 3',
    title: 'Budujemy i wdrażamy',
    description:
      'Kod, testy, optymalizacja. Rozwijamy projekt z dbałością o każdy detal i wydajność.',
    icon: Code,
    gradient: 'from-amber-400 to-orange-400',
  },
  {
    number: 'Etap 4',
    title: 'Opiekujemy się stroną',
    description:
      'Nie znikamy po wdrożeniu. Wspieramy, aktualizujemy i rozwijamy Twój projekt.',
    note: '30 dni gwarancji + opcja opieki w ramach abonamentu',
    icon: HeartHandshake,
    gradient: 'from-pink-400 to-rose-400',
  },
]

const stats = [
  { value: "90+", label: "PageSpeed Score", desc: "gwarantowany" },
  { value: "<1s", label: "Czas ładowania", desc: "vs 3-5s na WordPress" },
  { value: "0", label: "Wtyczek", desc: "zero dziur bezpieczeństwa" },
]

function getFaqItems(formattedPrice: string) {
  return [
    {
      question: "Ile kosztuje profesjonalna strona internetowa?",
      answer: `Strony zaczynają się od ${formattedPrice} PLN netto. Cena zależy od zakresu — liczby podstron, integracji, funkcjonalności. Użyj naszego konfiguratora cennika, aby poznać orientacyjną wycenę.`,
    },
    {
      question: "Jak długo trwa tworzenie strony internetowej?",
      answer: "Standardowa strona firmowa to 2-4 tygodnie. Projekty enterprise z rozbudowaną funkcjonalnością — 4-8 tygodni. Dokładny timeline ustalamy po warsztacie discovery.",
    },
    {
      question: "Czy mogę sam edytować stronę?",
      answer: "Tak! Każda strona ma panel Sanity CMS — intuicyjny edytor, w którym samodzielnie zmieniasz teksty, zdjęcia i dodajesz podstrony. Bez programisty, bez dodatkowych kosztów.",
    },
    {
      question: "Dlaczego Next.js zamiast WordPress?",
      answer: "Next.js = szybkość (PageSpeed 90+ vs 30-50 na WP), bezpieczeństwo (zero wtyczek = zero dziur), lepsze SEO. WordPress to 60% zhakowanych stron w sieci.",
    },
    {
      question: "Czy oferujecie strony internetowe w Krakowie?",
      answer: "Tak! Obsługujemy klientów z całej Polski, ze szczególnym uwzględnieniem Krakowa i Małopolski. Pracujemy zdalnie lub spotkajmy się na żywo.",
    },
  ]
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('pl-PL').format(price)
}

export default function StronyWWWContent({ startPrice }: { startPrice: number }) {
  const formattedPrice = formatPrice(startPrice)
  const [heroVisible, setHeroVisible] = useState(false)

  useEffect(() => {
    setHeroVisible(true)
  }, [])

  return (
    <div className="min-h-screen w-full" style={{ overflowX: 'clip' }}>
      <SubpageScrollbar sections={scrollbarSections} />
      
      {/* Hero Section - Full viewport */}
      <section id="hero-strony" className="relative z-10 min-h-screen flex items-center justify-center px-6 lg:px-12 pt-32 pb-20">
        <div className={`max-w-5xl mx-auto text-center transition-all duration-1000 ${
          heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h1 className="mb-8 glow-text">
            Strony internetowe{" "}
            <GradientText
              colors={["#06b6d4", "#3b82f6", "#8b5cf6", "#3b82f6", "#06b6d4"]}
              animationSpeed={4}
              className="font-medium"
            >
              dla firm
            </GradientText>
          </h1>
          <p className="text-xl md:text-2xl font-light tracking-wide text-gray-400 mb-6">
            które generują leady, nie tylko wyglądają
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-12">
            Tworzymy szybkie, nowoczesne strony w Next.js. 
            Każdy projekt zaczynamy od strategii — nie od kodu.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="relative group">
              <div 
                className="absolute -inset-1 rounded-full blur-md opacity-25 group-hover:opacity-40 transition-opacity animate-gradient -z-10"
                style={{
                  backgroundImage: 'linear-gradient(to right, #06b6d4, #3b82f6, #8b5cf6, #3b82f6, #06b6d4)',
                  backgroundSize: '300% 100%'
                }}
              />
              <button 
                onClick={() => {
                  document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="relative z-10 px-8 py-4 bg-gray-900/80 backdrop-blur-sm border border-gray-700 text-white rounded-full font-medium tracking-wider hover:bg-gray-800/80 transition-all"
              >
                Dowiedz się więcej
              </button>
            </div>
            <StickyCtaFloat
              heroId="hero-strony"
              hideSectionId="pricing"
            />
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-500 ${
          heroVisible ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Problem Section - Dramatic reveal */}
      <section id="problem" className="relative z-10 py-32 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-light tracking-wide text-center mb-6">
              Dlaczego Twoja strona{' '}
              <span className="text-red-400">nie działa?</span>
            </h2>
            <p className="text-xl text-gray-400 text-center mb-20">
              Większość stron wygląda dobrze, ale nie sprzedaje.
            </p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 gap-6">
            {problems.map((problem, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <div className="flex items-start gap-4 p-6 rounded-2xl bg-red-500/5 border border-red-500/20 hover:border-red-500/40 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <problem.icon className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">{problem.text}</p>
                    <p className="text-gray-400 text-sm">{problem.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Transition - The Turn */}
      <section className="relative z-10 py-24 px-6 lg:px-12">
        <AnimatedSection className="max-w-3xl mx-auto text-center">
          <p className="text-2xl md:text-4xl font-light text-gray-400 leading-relaxed">
            A gdyby strona mogła być{' '}
            <span className="text-white">szybka</span>,{' '}
            <span className="text-white">bezpieczna</span>{' '}
            i naprawdę{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              przynosiła klientów
            </span>?
          </p>
        </AnimatedSection>
      </section>

      {/* Solution Section — ten sam układ co Problem, na zielono + fajki */}
      <section id="solution" className="relative z-10 py-32 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6 glow-text">
              Strona, która{' '}
              <span className="text-green-400">działa.</span>
            </h2>
            <p className="text-xl text-gray-400">
              4 filary skutecznej strony internetowej
            </p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 gap-6">
            {solutions.map((solution, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <div className="flex items-start gap-4 p-6 rounded-2xl bg-green-500/5 border border-green-500/20 hover:border-green-500/40 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-green-400" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">{solution.title}</p>
                    <p className="text-gray-400 text-sm">{solution.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience - Timeline style */}
      <section id="audience" className="relative z-10 py-32 px-6 lg:px-12 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6 glow-text">
              Dla kogo to jest?
            </h2>
            <p className="text-xl text-gray-400">
              Strony dla firm, które traktują internet poważnie
            </p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 gap-8">
            {targetAudiences.map((audience, index) => {
              const Icon = audience.icon
              return (
                <AnimatedSection key={index} delay={index * 150}>
                  <TiltCard className="h-full">
                    <div className="relative group h-full">
                      <div className={`absolute -inset-0.5 bg-gradient-to-r ${audience.gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500`} />
                      <div className="relative h-full p-8 rounded-2xl bg-gray-900/80 backdrop-blur-sm border border-white/10">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${audience.gradient} flex items-center justify-center mb-6`}>
                          <Icon size={32} className="text-white" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-3">{audience.title}</h3>
                        <p className="text-gray-400 leading-relaxed">{audience.description}</p>
                      </div>
                    </div>
                  </TiltCard>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* Process Section - Vertical Timeline */}
      <section id="process" className="relative z-10 py-32 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6 glow-text">
              Jak pracujemy
            </h2>
            <p className="text-xl text-gray-400">
              Proces, który łączy design ze strategią
            </p>
          </AnimatedSection>
          
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500 via-blue-500 to-green-500 opacity-30" />
            
            <div className="space-y-16 md:space-y-24">
              {processSteps.map((step, index) => {
                const Icon = step.icon
                const isLeft = index % 2 === 0
                
                return (
                  <AnimatedSection key={index} delay={index * 150}>
                    <div className="relative">
                      {/* Timeline dot */}
                      <div className={`absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br ${step.gradient} shadow-lg z-10`} />
                      
                      {/* Card */}
                      <div className={`ml-20 md:ml-0 md:w-[calc(50%-40px)] ${isLeft ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'}`}>
                        <div className="group relative">
                          <div className={`absolute -inset-0.5 bg-gradient-to-r ${step.gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-500`} />
                          
                          <div className="relative bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8">
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${step.gradient} border border-white/10 mb-4`}>
                              <span className="text-xs sm:text-sm font-medium text-white tracking-wide whitespace-nowrap">
                                {step.number}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-4">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center`}>
                                <Icon size={24} className="text-white" />
                              </div>
                              <div>
                                <h3 className="text-xl font-medium text-white">{step.title}</h3>
                              </div>
                            </div>

                            <p className="text-gray-400 leading-relaxed">{step.description}</p>
                            {'note' in step && step.note ? (
                              <p className="text-sm text-purple-400/80 italic mt-3">{step.note}</p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="tech" className="relative z-10 py-32 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6">
              <span className="text-gray-400">Technologia, która</span>{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                daje przewagę
              </span>
            </h2>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-5xl md:text-6xl font-light text-white mb-2 glow-text">
                    {stat.value}
                  </div>
                  <div className="text-lg text-gray-300 mb-1">{stat.label}</div>
                  <div className="text-sm text-gray-500">{stat.desc}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
          
          <AnimatedSection delay={300} className="text-center mt-12">
            <Link 
              href="/nextjs" 
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors group"
            >
              <span>Dowiedz się więcej o Next.js</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="relative z-10 py-32 px-6 lg:px-12 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6 glow-text">
              Ile to kosztuje?
            </h2>
            <p className="text-xl text-gray-400 mb-4">
              Strony internetowe już od <span className="text-white font-medium">{formattedPrice} PLN netto</span>
            </p>
            <p className="text-gray-500 mb-12 max-w-xl mx-auto">
              Każdy projekt wyceniamy indywidualnie — cena zależy od liczby podstron, funkcjonalności i integracji. Skorzystaj z naszego konfiguratora, żeby w kilka chwil poznać orientacyjny koszt.
            </p>
          </AnimatedSection>
          
          <AnimatedSection delay={100}>
            <Link 
              href="/cennik" 
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105"
            >
              <span>Sprawdź konfigurator cennika</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-32 px-6 lg:px-12" id="faq">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6 glow-text">
              Pytania i odpowiedzi
            </h2>
          </AnimatedSection>
          
          <div className="space-y-4">
            {getFaqItems(formattedPrice).map((item, index) => (
              <AnimatedSection key={index} delay={index * 50}>
                <details className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <span className="font-medium text-white pr-4">{item.question}</span>
                    <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-300 group-open:rotate-180 flex-shrink-0" />
                  </summary>
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-gray-400 leading-relaxed">{item.answer}</p>
                  </div>
                </details>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-32 px-6 lg:px-12">
        <AnimatedSection className="max-w-4xl mx-auto text-center">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            
            <div className="relative bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-12 md:p-16">
              <h2 className="text-3xl md:text-5xl font-light tracking-wide text-white mb-6">
                Gotowy na stronę, która{' '}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  pracuje na Twój biznes?
                </span>
              </h2>
              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                Zamów bezpłatną wycenę — odpowiadamy w ciągu 24 godzin
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  href="/cennik" 
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105"
                >
                  <span>Bezpłatna wycena</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link 
                  href="/#contact" 
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 text-white font-medium transition-all duration-300 hover:bg-white/5"
                >
                  <span>Porozmawiajmy o projekcie</span>
                </Link>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-900 pt-16 pb-12 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors font-medium">
              ← Powrót do strony głównej
            </Link>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-900">
            <p className="text-center text-sm font-light tracking-wider text-gray-400">
              © Syntance — Strony i sklepy, które działają.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
