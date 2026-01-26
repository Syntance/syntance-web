'use client'

import { useEffect, useState, useRef } from 'react'
import { 
  Zap, 
  Shield, 
  TrendingUp, 
  DollarSign, 
  Wrench, 
  Rocket, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import GradientText from '@/components/GradientText'
import TiltCard from '@/components/tilt-card'
import SubpageScrollbar from '@/components/SubpageScrollbar'

// Sekcje dla scrollbar
const scrollbarSections = [
  { id: "hero-nextjs", label: "Start" },
  { id: "comparison", label: "Porównanie" },
  { id: "benefits", label: "Korzyści" },
  { id: "warning", label: "Uwaga" },
  { id: "cta", label: "Cennik" },
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

const techBenefits = [
  {
    icon: Zap,
    title: "Szybkość to nie luksus",
    subtitle: "PageSpeed 90+ zamiast 30-50",
    gradient: "from-yellow-500 to-orange-500",
    textColor: "text-yellow-400",
    description: "Strona ładująca się powyżej 3 sekund traci 53% użytkowników. WordPress z wtyczkami? Często przekracza 5 sekund. Next.js? Poniżej 1 sekundy.",
    bullets: [
      "Google karze wolne strony w rankingu (Core Web Vitals)",
      "Każda sekunda opóźnienia = -7% konwersji",
      "Next.js automatycznie generuje WebP/AVIF i lazy loaduje obrazy",
    ],
    realWorld: "Netflix używa Next.js właśnie dlatego — miliony użytkowników, zero kompromisów."
  },
  {
    icon: Shield,
    title: "Bezpieczeństwo: zero wtyczek = zero dziur",
    subtitle: "WordPress to 90% ataków na strony",
    gradient: "from-blue-500 to-cyan-500",
    textColor: "text-blue-400",
    description: "WordPress jest celem 90% ataków na CMS-y, głównie przez wtyczki. Każda wtyczka to potencjalna furtka. Next.js? Brak wtyczek, brak backdoorów.",
    bullets: [
      "WordPress wymaga aktualizacji wtyczek co tydzień",
      "Next.js: kod zamknięty, brak zewnętrznych zależności",
      "Hosting Vercel: built-in DDoS protection i WAF",
    ],
    realWorld: "TikTok zaufał Next.js — bezpieczeństwo na skalę miliardów użytkowników."
  },
  {
    icon: TrendingUp,
    title: "Konwersja: szybkość = więcej pieniędzy",
    subtitle: "Walmart zwiększył konwersję o 2% na każde 100ms",
    gradient: "from-green-500 to-emerald-500",
    textColor: "text-green-400",
    description: "To nie teoria. Walmart zarobił miliony dzięki zmniejszeniu czasu ładowania. Pinterest zwiększył rejestracje o 15%. Next.js daje Ci tę przewagę out-of-the-box.",
    bullets: [
      "Prefetching linków: użytkownik klika, strona już gotowa",
      "Hydratacja: użytkownik widzi treść natychmiast",
      "A/B testing bez obciążania przeglądarki",
    ],
    realWorld: "Notion zbudował całą aplikację na Next.js — miliony użytkowników daily."
  },
  {
    icon: DollarSign,
    title: "Google Ads: niższy CPC, wyższy ROI",
    subtitle: "Quality Score zależy od szybkości strony",
    gradient: "from-purple-500 to-pink-500",
    textColor: "text-purple-400",
    description: "Google liczy Quality Score m.in. na podstawie PageSpeed. Wyższy QS = niższy koszt kliknięcia (nawet o 50%). Wolna strona? Płacisz więcej za ten sam ruch.",
    bullets: [
      "PageSpeed 90+ = lepsze pozycje w reklamach",
      "Landing Page Experience: Google nagradza szybkie strony",
      "Realna oszczędność: 2-3 tys. PLN miesięcznie na kampaniach",
    ],
    realWorld: "Sklepy na Next.js widzą 20-30% redukcję CPC po migracji z WooCommerce."
  },
  {
    icon: Wrench,
    title: "Utrzymanie: 1h rocznie vs. 10h miesięcznie",
    subtitle: "WordPress = niekończąca się karuzela aktualizacji",
    gradient: "from-amber-500 to-yellow-500",
    textColor: "text-amber-400",
    description: "WordPress wymaga ciągłej uwagi: aktualizacje wtyczek, core, PHP. Jedna aktualizacja = ryzyko. Next.js? Raz wdrożony, działa latami.",
    bullets: [
      "WordPress: średnio 10-15h miesięcznie na utrzymanie",
      "Next.js: zero wtyczek = zero konfliktów",
      "Rollback w 1 klik, zero downtime przy deploymencie",
    ],
    realWorld: "Nasze strony na Next.js działają bez interwencji od lat."
  },
  {
    icon: Rocket,
    title: "Skalowanie: 100 czy 100 000 użytkowników?",
    subtitle: "WordPress pada przy 1000 równoczesnych użytkowników",
    gradient: "from-indigo-500 to-purple-500",
    textColor: "text-indigo-400",
    description: "WordPress + hosting współdzielony = katastrofa przy wzroście ruchu. Next.js + Vercel Edge = automatyczne skalowanie. Ruch wzrósł 100x? Strona działa tak samo.",
    bullets: [
      "WordPress: potrzebujesz VPS, CDN, cachingu, optymalizacji",
      "Next.js: Vercel Edge rozkłada ruch na 30+ lokalizacji",
      "Zero cold start, zero przestojów przy spike'ach ruchu",
    ],
    realWorld: "Nike obsługuje miliony użytkowników podczas premier — zero problemów."
  },
]

const comparisonTable = [
  { feature: "Szybkość (PageSpeed)", wordpress: "30-50/100", nextjs: "90-100/100" },
  { feature: "Bezpieczeństwo", wordpress: "Wtyczki = dziury", nextjs: "Zero wtyczek" },
  { feature: "Konwersja", wordpress: "-7% za każdą sekundę", nextjs: "Ładowanie <1 sek." },
  { feature: "Utrzymanie", wordpress: "10h/miesiąc", nextjs: "1h/rok" },
  { feature: "Skalowanie", wordpress: "Problemy przy ruchu", nextjs: "Automatyczne" },
]

export default function NextjsPage() {
  const [heroVisible, setHeroVisible] = useState(false)

  useEffect(() => {
    setHeroVisible(true)
  }, [])

  return (
    <div className="min-h-screen w-full" style={{ overflowX: 'clip' }}>
      <SubpageScrollbar sections={scrollbarSections} />
      
      {/* Hero Section */}
      <section id="hero-nextjs" className="relative z-10 min-h-screen flex items-center justify-center px-6 lg:px-12 pt-32 pb-20">
        <div className={`max-w-5xl mx-auto text-center transition-all duration-1000 ${
          heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-widest leading-tight mb-8 glow-text">
            Dlaczego{" "}
            <GradientText
              colors={["#3b82f6", "#06b6d4", "#10b981", "#06b6d4", "#3b82f6"]}
              animationSpeed={4}
              className="font-medium"
            >
              Next.js
            </GradientText>?
          </h1>
          <p className="text-xl md:text-2xl font-light tracking-wide text-gray-400 mb-6">
            To nie "tylko framework" — to przewaga konkurencyjna
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-12">
            Netflix, TikTok, Nike, Notion — nie wybrali Next.js przypadkowo. 
            Wybrali szybkość, bezpieczeństwo i skalowalność, których WordPress nigdy nie zapewni.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/cennik"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-medium tracking-wider hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              Sprawdź cennik
            </Link>
            <button 
              onClick={() => {
                document.getElementById('comparison')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-8 py-4 bg-white bg-opacity-10 border border-gray-700 text-white rounded-full font-medium tracking-wider hover:bg-opacity-20 transition-all"
            >
              Zobacz porównanie
            </button>
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

      {/* Quick Comparison Table */}
      <section id="comparison" className="relative z-10 py-32 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6">
              <span className="text-gray-400">WordPress vs. </span>
              <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Next.js</span>
            </h2>
            <p className="text-xl text-gray-400">
              Porównanie w liczbach
            </p>
          </AnimatedSection>
          
          <AnimatedSection delay={100}>
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Kryterium</th>
                    <th className="text-center py-4 px-6 text-gray-400 font-medium">WordPress</th>
                    <th className="text-center py-4 px-6 font-medium bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Next.js</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonTable.map((row, index) => (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 text-white font-medium">{row.feature}</td>
                      <td className="py-4 px-6 text-center text-gray-400">{row.wordpress}</td>
                      <td className="py-4 px-6 text-center text-green-400 font-medium">{row.nextjs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Tech Benefits - Timeline */}
      <section id="benefits" className="relative z-10 py-32 px-6 lg:px-12 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6 glow-text">
              6 powodów, dla których Next.js wygrywa
            </h2>
          </AnimatedSection>
          
          <div className="space-y-8">
            {techBenefits.map((benefit, index) => {
              const Icon = benefit.icon
              const isEven = index % 2 === 0
              
              return (
                <AnimatedSection key={index} delay={index * 100}>
                  <TiltCard className="w-full">
                    <div className="relative group">
                      <div className={`absolute -inset-0.5 bg-gradient-to-r ${benefit.gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500`} />
                      <div className="relative p-8 rounded-2xl bg-gray-900/80 backdrop-blur-sm border border-white/10">
                        <div className="flex flex-col lg:flex-row gap-8">
                          <div className="flex-shrink-0">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-4`}>
                              <Icon size={32} className="text-white" />
                            </div>
                            <div className={`text-5xl font-light ${benefit.textColor} opacity-30`}>
                              0{index + 1}
                            </div>
                          </div>

                          <div className="flex-1">
                            <h3 className="text-2xl font-medium text-white mb-2">
                              {benefit.title}
                            </h3>
                            <p className={`text-sm ${benefit.textColor} mb-4`}>
                              {benefit.subtitle}
                            </p>
                            <p className="text-gray-400 mb-6">
                              {benefit.description}
                            </p>
                            
                            <ul className="space-y-2 mb-6">
                              {benefit.bullets.map((bullet, i) => (
                                <li key={i} className="flex items-start gap-3">
                                  <CheckCircle2 size={18} className={`flex-shrink-0 mt-0.5 ${benefit.textColor}`} />
                                  <span className="text-gray-400 text-sm">{bullet}</span>
                                </li>
                              ))}
                            </ul>

                            <div className={`p-4 rounded-xl bg-gradient-to-r ${benefit.gradient} bg-opacity-5 border border-white/10`}>
                              <p className="text-sm text-gray-400">
                                <span className="font-medium text-white">Real world: </span>
                                {benefit.realWorld}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* Warning Section */}
      <section id="warning" className="relative z-10 py-32 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl opacity-30 blur-lg" />
              <div className="relative p-8 md:p-12 rounded-2xl bg-gray-900 border border-red-500/30">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={32} className="text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium text-white mb-4">
                      Kiedy WordPress NIE jest problemem?
                    </h3>
                    <p className="text-gray-400 leading-relaxed mb-4">
                      Tylko w jednym przypadku: <strong className="text-white">prosty blog, zero ambicji wzrostu, minimalna inwestycja</strong>. 
                      Jeśli potrzebujesz strony "bo trzeba mieć stronę" — WordPress wystarczy.
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                      Ale jeśli Twoja strona ma <strong className="text-white">generować leady, sprzedawać produkty, lub budować markę</strong> — 
                      WordPress to kula u nogi. Next.js to rakieta.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="relative z-10 py-32 px-6 lg:px-12">
        <AnimatedSection className="max-w-4xl mx-auto text-center">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            
            <div className="relative bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-12 md:p-16">
              <h2 className="text-3xl md:text-5xl font-light tracking-wide text-white mb-6">
                Przekonany? Sprawdź, ile kosztuje{' '}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  strona na Next.js
                </span>
              </h2>
              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                Transparentny konfigurator cenowy — zobacz orientacyjną wycenę w 2 minuty.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  href="/cennik" 
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105"
                >
                  <span>Sprawdź cennik</span>
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors font-medium">
              ← Powrót do strony głównej
            </Link>
            <div className="flex gap-6">
              <Link href="/cennik" className="text-gray-400 hover:text-white transition-colors">
                Cennik
              </Link>
              <Link href="/strategia" className="text-gray-400 hover:text-white transition-colors">
                Strategia
              </Link>
            </div>
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
