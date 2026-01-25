'use client'

import { useEffect, useState, useRef } from 'react'
import { 
  Zap, 
  Shield, 
  Code2, 
  Scale,
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Factory,
  Store,
  Repeat,
  Users,
  CreditCard,
  ChevronDown,
  Server,
  Layout,
  Database,
  ShoppingCart,
  Percent,
  Lock,
  Layers
} from 'lucide-react'
import Link from 'next/link'
import GradientText from '@/components/GradientText'
import TiltCard from '@/components/tilt-card'

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
  gradient = 'from-purple-500 to-pink-500',
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
  { icon: Percent, text: "Prowizje", desc: "Shopify pobiera do 2% od każdej transakcji" },
  { icon: XCircle, text: "Limity", desc: "WooCommerce pada przy 1000+ produktów" },
  { icon: Layers, text: "Szablonowość", desc: "Twój sklep wygląda jak tysiące innych" },
  { icon: Lock, text: "Vendor lock-in", desc: "migracja = budowanie od zera" },
]

const solutions = [
  { 
    icon: Zap, 
    title: "Szybkość", 
    description: "PageSpeed 90+ vs 40-60 na Shopify",
    gradient: "from-yellow-500 to-orange-500",
    textColor: "text-yellow-400"
  },
  { 
    icon: Scale, 
    title: "Skalowalność", 
    description: "10 czy 100 000 produktów — bez różnicy",
    gradient: "from-green-500 to-emerald-500",
    textColor: "text-green-400"
  },
  { 
    icon: Code2, 
    title: "Customizacja", 
    description: "Każda funkcja na życzenie",
    gradient: "from-blue-500 to-cyan-500",
    textColor: "text-blue-400"
  },
  { 
    icon: Shield, 
    title: "Własność", 
    description: "Kod jest Twój, nie wynajmujesz platformy",
    gradient: "from-purple-500 to-pink-500",
    textColor: "text-purple-400"
  },
]

const targetAudiences = [
  {
    icon: Factory,
    title: "Producenci",
    description: "Katalog B2B, zapytania hurtowe, integracje z ERP. Własny kanał sprzedaży bez pośredników.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Store,
    title: "D2C Brands",
    description: "Własny kanał sprzedaży, pełna marża. Buduj relację z klientem bez marketplace'ów.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Repeat,
    title: "Subskrypcje",
    description: "Portal klienta, recurring billing, zarządzanie subskrypcjami. Model SaaS dla e-commerce.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Users,
    title: "Marketplace",
    description: "Wielosprzedawcowość, system prowizji, panel sprzedawcy. Twoja własna platforma handlowa.",
    gradient: "from-green-500 to-emerald-500",
  },
]

const techStack = [
  {
    layer: "Backend",
    tech: "MedusaJS",
    why: "Open-source, modułowy, bez prowizji",
    icon: Server,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    layer: "Frontend",
    tech: "Next.js 14",
    why: "SSR/SSG, PageSpeed 90+",
    icon: Layout,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    layer: "Płatności",
    tech: "Stripe / Przelewy24",
    why: "Bezpieczne, polskie metody",
    icon: CreditCard,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    layer: "CMS",
    tech: "Sanity",
    why: "Edycja treści bez programisty",
    icon: Database,
    gradient: "from-amber-500 to-orange-500",
  },
]

const standardFeatures = [
  "Katalog produktów z wariantami",
  "Koszyk i checkout",
  "Płatności online (Stripe/P24)",
  "Panel administracyjny",
  "Responsywność mobile-first",
  "SEO-ready (meta, sitemap, schema)",
]

const proFeatures = [
  "Portal klienta (historia, faktury)",
  "Integracja z kurierami (InPost, DPD)",
  "Subskrypcje i recurring",
  "Multi-currency / multi-language",
  "Integracje ERP/CRM",
]

const comparisonData = [
  { feature: "Prowizje", saas: "0.5-2% od transakcji", headless: "0% — zero prowizji" },
  { feature: "PageSpeed", saas: "40-60/100", headless: "90+/100" },
  { feature: "Własność kodu", saas: "Wynajem platformy", headless: "100% Twój kod" },
  { feature: "Customizacja", saas: "Limity szablonu", headless: "Bez ograniczeń" },
  { feature: "Skalowalność", saas: "Problemy przy wzroście", headless: "Nieograniczona" },
]

const faqItems = [
  {
    question: "Ile kosztuje sklep internetowy headless?",
    answer: "Sklepy zaczynają się od 12 000 PLN (standard) do 25 000+ PLN (pro). Cena zależy od liczby funkcji, integracji i stopnia customizacji.",
  },
  {
    question: "Czym różni się headless od Shopify?",
    answer: "Headless = pełna własność kodu, zero prowizji od sprzedaży, nieograniczona customizacja. Shopify = wynajem platformy, prowizje 0.5-2%, ograniczenia szablonu.",
  },
  {
    question: "Jak długo trwa budowa sklepu?",
    answer: "Sklep standard (katalog, koszyk, płatności): 4-6 tygodni. Sklep pro z integracjami: 6-10 tygodni.",
  },
  {
    question: "Czy MedusaJS to sprawdzona technologia?",
    answer: "Tak! MedusaJS to open-source backed by $9M VC funding. Używany przez firmy jak Tekla, Summer Health i setki innych.",
  },
  {
    question: "Czy mogę migrować z WooCommerce/Shopify?",
    answer: "Tak, przeprowadzamy pełną migrację — produkty, warianty, klienci, historia zamówień.",
  },
]

export default function SklepyInternetowePage() {
  const [heroVisible, setHeroVisible] = useState(false)

  useEffect(() => {
    setHeroVisible(true)
  }, [])

  return (
    <div className="min-h-screen w-full" style={{ overflowX: 'clip' }}>
      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6 lg:px-12 pt-32 pb-20">
        <div className={`max-w-5xl mx-auto text-center transition-all duration-1000 ${
          heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-widest leading-tight mb-8 glow-text">
            Sklepy internetowe{" "}
            <GradientText
              colors={["#a855f7", "#ec4899", "#a855f7"]}
              animationSpeed={4}
              className="font-medium"
            >
              headless
            </GradientText>
          </h1>
          <p className="text-xl md:text-2xl font-light tracking-wide text-gray-400 mb-6">
            Twój sklep, Twoje zasady — zero prowizji
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-12">
            Budujemy szybkie sklepy e-commerce w architekturze headless. 
            MedusaJS + Next.js = pełna kontrola i nieograniczona skalowalność.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="relative group">
              <div 
                className="absolute -inset-1 rounded-full blur-md opacity-25 group-hover:opacity-40 transition-opacity animate-gradient -z-10"
                style={{
                  backgroundImage: 'linear-gradient(to right, #9333ea, #ec4899, #f472b6, #ec4899, #9333ea)',
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

      {/* Problem Section */}
      <section id="problem" className="relative z-10 py-32 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-light tracking-wide text-center mb-6">
              Dlaczego SaaS{' '}
              <span className="text-red-400">Cię ogranicza?</span>
            </h2>
            <p className="text-xl text-gray-400 text-center mb-20">
              Shopify, WooCommerce — czas na coś lepszego.
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

      {/* Transition */}
      <section className="relative z-10 py-24 px-6 lg:px-12">
        <AnimatedSection className="max-w-3xl mx-auto text-center">
          <p className="text-2xl md:text-4xl font-light text-gray-400 leading-relaxed">
            Co to znaczy{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              headless
            </span>?
          </p>
        </AnimatedSection>
      </section>

      {/* What is Headless */}
      <section className="relative z-10 py-16 px-6 lg:px-12">
        <AnimatedSection className="max-w-3xl mx-auto">
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-lg text-gray-300 leading-relaxed">
              <strong className="text-white">Frontend</strong> (to, co widzi klient) jest{' '}
              <strong className="text-white">oddzielony od backendu</strong>{' '}
              (logika, baza, płatności). Dzięki temu masz ultra-szybki frontend w Next.js 
              połączony z potężnym silnikiem e-commerce MedusaJS.
            </p>
          </div>
        </AnimatedSection>
      </section>

      {/* Solution Section */}
      <section className="relative z-10 py-32 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6 glow-text">
              Sklep bez limitów
            </h2>
            <p className="text-xl text-gray-400">
              4 przewagi headless nad SaaS
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

      {/* Target Audience */}
      <section className="relative z-10 py-32 px-6 lg:px-12 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6 glow-text">
              Dla kogo to jest?
            </h2>
            <p className="text-xl text-gray-400">
              Sklepy dla firm, które chcą kontroli
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

      {/* Tech Stack */}
      <section className="relative z-10 py-32 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6 glow-text">
              Stack technologiczny
            </h2>
            <p className="text-xl text-gray-400">
              MedusaJS + Next.js — enterprise-grade bez prowizji
            </p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 gap-6">
            {techStack.map((tech, index) => {
              const Icon = tech.icon
              return (
                <AnimatedSection key={index} delay={index * 100}>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tech.gradient} bg-opacity-10 flex items-center justify-center flex-shrink-0`}>
                        <Icon size={24} className="text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">{tech.layer}</div>
                        <h3 className="text-lg font-medium text-white mb-1">{tech.tech}</h3>
                        <p className="text-gray-400 text-sm">{tech.why}</p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="relative z-10 py-32 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Headless
              </span>{' '}
              <span className="text-gray-400">vs. Shopify/WooCommerce</span>
            </h2>
          </AnimatedSection>
          
          <AnimatedSection delay={100}>
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Kryterium</th>
                    <th className="text-center py-4 px-6 text-gray-400 font-medium">SaaS</th>
                    <th className="text-center py-4 px-6 font-medium bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Headless</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 text-white font-medium">{row.feature}</td>
                      <td className="py-4 px-6 text-center text-gray-400">{row.saas}</td>
                      <td className="py-4 px-6 text-center text-green-400 font-medium">{row.headless}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 py-32 px-6 lg:px-12 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6 glow-text">
              Ile to kosztuje?
            </h2>
            <p className="text-xl text-gray-400">
              Wybierz pakiet dopasowany do Twoich potrzeb
            </p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <AnimatedSection delay={0}>
              <TiltCard className="h-full">
                <div className="relative group h-full">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500" />
                  <div className="relative h-full p-6 md:p-8 rounded-2xl bg-gray-900/80 backdrop-blur-sm border border-white/10">
                    <div className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium mb-4">
                      Standard
                    </div>
                    <h3 className="text-3xl font-medium text-white mb-2">od 12 000 PLN</h3>
                    <p className="text-gray-400 text-sm mb-8">netto • 4-6 tygodni</p>
                    
                    <ul className="space-y-3">
                      {standardFeatures.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3 text-gray-300">
                          <CheckCircle2 size={18} className="text-blue-400 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TiltCard>
            </AnimatedSection>
            
            <AnimatedSection delay={100}>
              <TiltCard className="h-full">
                <div className="relative group h-full">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500" />
                  <div className="relative h-full p-6 md:p-8 rounded-2xl bg-gray-900/80 backdrop-blur-sm border border-white/10">
                    <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium mb-4">
                      Pro
                    </div>
                    <h3 className="text-3xl font-medium text-white mb-2">od 25 000 PLN</h3>
                    <p className="text-gray-400 text-sm mb-4">netto • 6-10 tygodni</p>
                    <p className="text-gray-500 text-sm mb-8">Wszystko ze Standard, plus:</p>
                    
                    <ul className="space-y-3">
                      {proFeatures.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3 text-gray-300">
                          <CheckCircle2 size={18} className="text-purple-400 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TiltCard>
            </AnimatedSection>
          </div>
          
          <AnimatedSection delay={200} className="text-center">
            <Link 
              href="/cennik" 
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105"
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
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            
            <div className="relative bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-12 md:p-16">
              <h2 className="text-3xl md:text-5xl font-light tracking-wide text-white mb-6">
                Gotowy na sklep, który{' '}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  rośnie razem z Tobą?
                </span>
              </h2>
              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                Zamów bezpłatną wycenę — odpowiadamy w ciągu 24 godzin
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  href="/cennik" 
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105"
                >
                  <span>Wycena sklepu</span>
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
