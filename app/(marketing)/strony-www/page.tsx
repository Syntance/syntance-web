'use client'

import { useEffect, useState, useRef } from 'react'
import { 
  Zap, 
  Shield, 
  Code2, 
  Search, 
  Palette, 
  Code, 
  Rocket, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  Factory, 
  Lightbulb, 
  Home,
  ChevronDown,
  Target,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import GradientText from '@/components/GradientText'

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

// Komponent karty z glow effect
function GlowCard({ 
  children, 
  gradient = 'from-blue-500 to-cyan-500',
  className = '',
  delay = 0
}: { 
  children: React.ReactNode
  gradient?: string
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
      { threshold: 0.2 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div 
      ref={ref}
      className={`relative group transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500`} />
      <div className="relative bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 h-full">
        {children}
      </div>
    </div>
  )
}

const problems = [
  { icon: XCircle, text: "Wolna", desc: "użytkownicy uciekają po 3 sekundach" },
  { icon: XCircle, text: "Niewidoczna w Google", desc: "brak ruchu organicznego" },
  { icon: XCircle, text: "Przestarzała technologia", desc: "WordPress z 50 wtyczkami" },
  { icon: XCircle, text: "Brak strategii", desc: "\"ładna\" strona bez celu biznesowego" },
]

const solutions = [
  { 
    icon: Zap, 
    title: "Szybkość", 
    description: "PageSpeed 90+ gwarantowany",
    gradient: "from-yellow-500 to-orange-500",
    textColor: "text-yellow-400"
  },
  { 
    icon: Search, 
    title: "SEO-ready", 
    description: "Optymalizacja od pierwszego dnia",
    gradient: "from-green-500 to-emerald-500",
    textColor: "text-green-400"
  },
  { 
    icon: Code2, 
    title: "Nowoczesna technologia", 
    description: "Next.js, headless CMS",
    gradient: "from-blue-500 to-cyan-500",
    textColor: "text-blue-400"
  },
  { 
    icon: Shield, 
    title: "Strategia przed kodem", 
    description: "Warsztat discovery w cenie",
    gradient: "from-purple-500 to-pink-500",
    textColor: "text-purple-400"
  },
]

const targetAudiences = [
  {
    icon: Building2,
    title: "Firmy usługowe",
    description: "Strona jako generator leadów — pozycjonowanie lokalne, formularze kontaktowe, integracje z CRM.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Factory,
    title: "Producenci B2B",
    description: "Katalog produktów, zapytania ofertowe, specyfikacje techniczne — wszystko w jednym miejscu.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Lightbulb,
    title: "Startupy",
    description: "MVP w 4 tygodnie — szybkie wejście na rynek z profesjonalną stroną, którą można rozwijać.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Home,
    title: "Deweloperzy",
    description: "Strony inwestycji z wizualizacjami 3D, galeriami i systemem rezerwacji mieszkań.",
    gradient: "from-green-500 to-emerald-500",
  },
]

const processSteps = [
  {
    number: "01",
    title: "Discovery",
    subtitle: "Poznajemy Twój biznes",
    description: "Warsztat strategiczny, brief, buyer persona. Zanim napiszemy linijkę kodu, rozumiemy Twój cel.",
    icon: Target,
    gradient: "from-purple-500 to-blue-500",
  },
  {
    number: "02",
    title: "Design",
    subtitle: "Projektujemy doświadczenie",
    description: "UX/UI, prototyp w Figma. Design to nie tylko wygląd — to przemyślana ścieżka użytkownika.",
    icon: Palette,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    number: "03",
    title: "Development",
    subtitle: "Budujemy i testujemy",
    description: "Next.js, Sanity CMS. Kod, testy, optymalizacja — rozwijamy projekt z dbałością o każdy detal.",
    icon: Code,
    gradient: "from-cyan-500 to-teal-500",
  },
  {
    number: "04",
    title: "Launch",
    subtitle: "Wdrażamy i wspieramy",
    description: "Wdrożenie, szkolenie z CMS, 30 dni wsparcia technicznego. Nie znikamy po wdrożeniu.",
    icon: Rocket,
    gradient: "from-teal-500 to-green-500",
  },
]

const stats = [
  { value: "90+", label: "PageSpeed Score", desc: "gwarantowany" },
  { value: "<1s", label: "Czas ładowania", desc: "vs 3-5s na WordPress" },
  { value: "0", label: "Wtyczek", desc: "zero dziur bezpieczeństwa" },
]

const faqItems = [
  {
    question: "Ile kosztuje profesjonalna strona internetowa?",
    answer: "Strony zaczynają się od 5 400 PLN netto. Cena zależy od zakresu — liczby podstron, integracji, funkcjonalności. Użyj naszego konfiguratora cennika, aby poznać orientacyjną wycenę.",
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

export default function StronyWWWPage() {
  const [heroVisible, setHeroVisible] = useState(false)

  useEffect(() => {
    setHeroVisible(true)
  }, [])

  return (
    <div className="min-h-screen w-full" style={{ overflowX: 'clip' }}>
      {/* Hero Section - Full viewport */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6 lg:px-12 pt-32 pb-20">
        <div className={`max-w-5xl mx-auto text-center transition-all duration-1000 ${
          heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-widest leading-tight mb-8 glow-text">
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
                  backgroundImage: 'linear-gradient(to right, #2563eb, #7c3aed, #06b6d4, #7c3aed, #2563eb)',
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
            <Link 
              href="/cennik"
              className="px-8 py-4 bg-white text-gray-900 rounded-full font-medium tracking-wider hover:bg-opacity-90 transition-all glow-box"
            >
              Sprawdź cenę
            </Link>
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

      {/* Solution Section - Cards reveal */}
      <section className="relative z-10 py-32 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6 glow-text">
              Strona, która działa
            </h2>
            <p className="text-xl text-gray-400">
              4 filary skutecznej strony internetowej
            </p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {solutions.map((solution, index) => {
              const Icon = solution.icon
              return (
                <GlowCard key={index} gradient={solution.gradient} delay={index * 100}>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${solution.gradient} bg-opacity-10 flex items-center justify-center mb-6`}>
                    <Icon size={28} className={solution.textColor} />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={18} className="text-green-400" />
                    <h3 className="text-lg font-medium text-white">{solution.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{solution.description}</p>
                </GlowCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* Target Audience - Timeline style */}
      <section className="relative z-10 py-32 px-6 lg:px-12 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
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
                <GlowCard key={index} gradient={audience.gradient} delay={index * 150}>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${audience.gradient} bg-opacity-10 flex items-center justify-center mb-6`}>
                    <Icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-3">{audience.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{audience.description}</p>
                </GlowCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* Process Section - Vertical Timeline */}
      <section className="relative z-10 py-32 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6 glow-text">
              Jak pracujemy?
            </h2>
            <p className="text-xl text-gray-400">
              4 kroki do strony, która konwertuje
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
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${step.gradient} bg-opacity-10 border border-white/10 mb-4`}>
                              <span className="text-xs font-mono font-medium text-white tracking-wider">
                                {step.number}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-4">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} bg-opacity-10 flex items-center justify-center`}>
                                <Icon size={24} className="text-white" />
                              </div>
                              <div>
                                <h3 className="text-xl font-medium text-white">{step.title}</h3>
                                <p className={`text-sm bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`}>
                                  {step.subtitle}
                                </p>
                              </div>
                            </div>
                            
                            <p className="text-gray-400 leading-relaxed">{step.description}</p>
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
      <section className="relative z-10 py-32 px-6 lg:px-12">
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
      <section className="relative z-10 py-32 px-6 lg:px-12 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6 glow-text">
              Ile to kosztuje?
            </h2>
            <p className="text-xl text-gray-400">
              Transparentne ceny — bez ukrytych kosztów
            </p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <GlowCard gradient="from-blue-500 to-cyan-500" delay={0}>
              <h3 className="text-2xl font-medium text-white mb-2">Strona firmowa</h3>
              <p className="text-gray-400 text-sm mb-6">Landing page, wizytówka, strona usługowa</p>
              
              <div className="text-4xl font-light text-white mb-1">od 5 400 PLN</div>
              <div className="text-sm text-gray-400 mb-8">netto • 2-4 tygodnie</div>
              
              <ul className="space-y-3">
                {['Do 5 podstron', 'Panel CMS Sanity', 'Optymalizacja SEO', '30 dni wsparcia'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </GlowCard>
            
            <GlowCard gradient="from-purple-500 to-pink-500" delay={100}>
              <h3 className="text-2xl font-medium text-white mb-2">Strona rozbudowana</h3>
              <p className="text-gray-400 text-sm mb-6">Katalog produktów, portal, integracje</p>
              
              <div className="text-4xl font-light text-white mb-1">od 12 000 PLN</div>
              <div className="text-sm text-gray-400 mb-8">netto • 4-8 tygodni</div>
              
              <ul className="space-y-3">
                {['Nieograniczone podstrony', 'Zaawansowane funkcje', 'Integracje (CRM, mailing)', 'Warsztat discovery w cenie'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 size={18} className="text-purple-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </GlowCard>
          </div>
          
          <AnimatedSection delay={200} className="text-center">
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
            {faqItems.map((item, index) => (
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
