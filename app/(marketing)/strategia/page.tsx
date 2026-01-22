import { Metadata } from 'next'
import NavbarStudio from '@/components/navbar-studio'
import { Target, Users, Zap, MessageSquare, Brain, GitBranch, Sparkles, Gauge, Bot, ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Strategia strony internetowej — Fundament, Mechanika, Design | Syntance',
  description: 'Dowiedz się, jak planujemy strony internetowe: od strategii biznesowej, przez psychologię konwersji, po technologię premium. Poznaj naszą metodologię.',
  openGraph: {
    title: 'Strategia strony internetowej | Syntance',
    description: 'Większość agencji zaczyna od grafiki. My zaczynamy od biznesu.',
    url: 'https://syntance.com/strategia',
  },
}

const strategyLevels = [
  {
    level: 1,
    title: "Fundament",
    subtitle: "Strategia",
    tagline: "Bez tego strona jest tylko ładnym obrazkiem.",
    gradient: "from-purple-500 to-blue-500",
    textColor: "text-purple-400",
    bgGradient: "from-purple-500/10 via-blue-500/10 to-transparent",
    sections: [
      {
        icon: Target,
        label: "Cel Biznesowy",
        title: "Co strona ma osiągnąć?",
        description: "Zanim zaczniemy projektować, zadajemy kluczowe pytanie: **po co ta strona?** Czy ma generować więcej leadów? Zwiększyć średnią wartość zamówienia? Zmniejszyć obciążenie działu obsługi klienta? Bez jasnego celu nie mamy miernika sukcesu.",
        bullets: [
          "Definiujemy konkretne KPI (np. +30% zgłoszeń kontaktowych)",
          "Ustalamy, jak strona wpisuje się w Twój model biznesowy",
          "Określamy, co odróżnia Cię od konkurencji na rynku",
        ]
      },
      {
        icon: Users,
        label: "Buyer Persony",
        title: "Do kogo mówimy?",
        description: "Strona \"dla wszystkich\" trafia do nikogo. Opisujemy Twojego idealnego klienta: kim jest, czego szuka, jakie ma obawy, gdzie się znajduje w procesie zakupowym. Dzięki temu komunikacja jest celna jak laser.",
        bullets: [
          "Tworzymy profile rzeczywistych klientów (demografia, psychografia)",
          "Identyfikujemy ich największe problemy i potrzeby",
          "Określamy, jak szukają rozwiązań i podejmują decyzje",
        ]
      },
      {
        icon: Zap,
        label: "Unikalna Wartość (UVP)",
        title: "Dlaczego Ty, nie konkurencja?",
        description: "To jedno zdanie, które mówi: \"Robimy X dla Y w sposób Z\". UVP to serce całej komunikacji — jeśli nie potrafisz powiedzieć, dlaczego klient ma wybrać Ciebie, on też tego nie zrozumie.",
        bullets: [
          "Analizujemy konkurencję i szukamy Twojej przewagi",
          "Formułujemy wartość w języku korzyści (nie cech)",
          "Testujemy UVP z rzeczywistymi klientami",
        ]
      },
    ]
  },
  {
    level: 2,
    title: "Mechanika",
    subtitle: "Konwersja",
    tagline: "To, co zmienia odwiedzającego w klienta.",
    gradient: "from-blue-500 to-cyan-500",
    textColor: "text-blue-400",
    bgGradient: "from-blue-500/10 via-cyan-500/10 to-transparent",
    sections: [
      {
        icon: MessageSquare,
        label: "Copywriting",
        title: "Tekst, który sprzedaje",
        description: "To nie są \"ładne słowa\". To komunikaty oparte na psychologii perswazji i głębokim zrozumieniu bólów klienta. Każde zdanie ma cel: zatrzymać uwagę, budować zaufanie, prowadzić do akcji.",
        bullets: [
          "Stosujemy framework PAS (Problem-Agitate-Solve)",
          "Piszemy nagłówki, które zatrzymują w 3 sekundy",
          "Używamy konkretów zamiast ogólników ('90+ PageSpeed' vs. 'szybka strona')",
        ]
      },
      {
        icon: Brain,
        label: "Psychologia sprzedaży",
        title: "Zaufanie i decyzja",
        description: "Ludzie kupują emocjami, potem racjonalizują. Stosujemy sprawdzone triggery: social proof (rekomendacje), scarcity (pilność), autoritet (certyfikaty), reciprocity (wartość za darmo). Ale nie manipulujemy — to musi być autentyczne.",
        bullets: [
          "Social proof: opinie, case study, ilość zrealizowanych projektów",
          "Redukcja ryzyka: gwarancje, wersje demo,透明ność procesu",
          "Anchoring: pokazujemy wartość przed ceną",
        ]
      },
      {
        icon: GitBranch,
        label: "User Flow (Lejek)",
        title: "Ścieżka do kontaktu",
        description: "Projektujemy każdą ścieżkę użytkownika: od landing page przez ofertę do formularza kontaktowego. Każdy klik ma cel. Zero ślepych zaułków. Użytkownik zawsze wie, co robić dalej.",
        bullets: [
          "Mapujemy ścieżki dla różnych segmentów (nowy vs. powracający)",
          "Minimalizujemy friction (formularz 3 pola zamiast 15)",
          "Testujemy CTA w różnych miejscach (heatmapy, A/B testy)",
        ]
      },
    ]
  },
  {
    level: 3,
    title: "Efekt końcowy",
    subtitle: "Tech & Design",
    tagline: "To, co buduje zaufanie i zachwyt.",
    gradient: "from-cyan-500 to-teal-500",
    textColor: "text-cyan-400",
    bgGradient: "from-cyan-500/10 via-teal-500/10 to-transparent",
    sections: [
      {
        icon: Sparkles,
        label: "Design premium",
        title: "Estetyka profesjonalisty",
        description: "Design to nie tylko \"żeby ładnie wyglądało\". To wizualna hierarchia, która prowadzi wzrok. Psychologia kolorów. Typografia, która buduje charakter marki. Każdy piksel ma znaczenie.",
        bullets: [
          "Projektujemy w Figmie z komponentowym podejściem (reusable)",
          "Stosujemy design system (kolory, fonty, spacing)",
          "Testujemy kontrast i czytelność (WCAG 2.1 AA)",
        ]
      },
      {
        icon: Gauge,
        label: "PageSpeed 90+",
        title: "Błyskawiczne ładowanie",
        description: "Użytkownik odchodzi po 3 sekundach oczekiwania. Google to karze w SEO. Osiągamy 90+ na PageSpeed Insights dzięki Next.js, optymalizacji obrazów (WebP), lazy loadingowi i CDN.",
        bullets: [
          "Next.js 15 z App Router (Server Components, streaming)",
          "Optymalizacja obrazów: WebP/AVIF, srcset, lazy loading",
          "Hosting: Vercel Edge Network (CDN w 30+ lokalizacjach)",
        ]
      },
      {
        icon: Bot,
        label: "AEO (AI Ready)",
        title: "Widoczność w ChatGPT",
        description: "Ludzie pytają AI, nie Google. Struktura strony musi być czytelna dla LLM-ów: semantic HTML, schema.org JSON-LD, plik `/llms.txt`. Twoja strona pojawia się w odpowiedziach Perplexity i ChatGPT.",
        bullets: [
          "Semantic HTML5 (header, nav, article, aside)",
          "Schema.org: Organization, LocalBusiness, FAQPage",
          "Metadata dla LLM: llms.txt, robots.txt, sitemap.xml",
        ]
      },
    ]
  },
]

export default function StrategiaPage() {
  return (
    <div className="min-h-screen bg-gray-950 w-full" style={{ overflowX: 'clip' }}>
      <NavbarStudio />
      
      {/* Hero */}
      <section className="relative z-10 pt-52 pb-24 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-light tracking-widest glow-text mb-6">
            Większość agencji zaczyna od grafiki.
          </h1>
          <p className="text-2xl md:text-3xl font-light tracking-wide text-gray-400 mb-12">
            My zaczynamy od biznesu.
          </p>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed">
            Dobra strona to wierzchołek góry lodowej. Pod spodem jest strategia, psychologia, technologia. 
            Poznaj naszą metodologię — 3 poziomy, które odróżniają stronę, która działa, od strony, która tylko wygląda.
          </p>
        </div>
      </section>

      {/* Strategy Levels */}
      {strategyLevels.map((level, levelIndex) => (
        <section 
          key={level.level} 
          className={`relative z-10 py-24 px-6 lg:px-12 ${levelIndex % 2 === 0 ? 'bg-gray-900/30' : ''}`}
        >
          <div className="max-w-6xl mx-auto">
            {/* Level Header */}
            <div className="text-center mb-20">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${level.gradient} bg-opacity-10 border border-white/10 mb-6`}>
                <span className={`text-sm font-medium ${level.textColor} tracking-wider uppercase`}>
                  Poziom {level.level}
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-light tracking-wide mb-4">
                <span className={`bg-gradient-to-r ${level.gradient} bg-clip-text text-transparent`}>
                  {level.title}
                </span>
                <span className="text-gray-400"> — {level.subtitle}</span>
              </h2>
              <p className="text-xl text-gray-500 italic">
                {level.tagline}
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-16">
              {level.sections.map((section, sectionIndex) => {
                const Icon = section.icon;
                const isEven = sectionIndex % 2 === 0;
                
                return (
                  <div 
                    key={sectionIndex} 
                    className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-12 items-start`}
                  >
                    {/* Icon + Label */}
                    <div className="flex-shrink-0 md:w-1/3">
                      <div className={`inline-flex items-center gap-4 mb-4`}>
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${level.gradient} bg-opacity-10 flex items-center justify-center`}>
                          <Icon size={28} className={level.textColor} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-medium text-white">{section.label}</h3>
                          <p className={`text-sm ${level.textColor} font-medium`}>{section.title}</p>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <p className="text-gray-400 leading-relaxed mb-6">
                        {section.description.split('**').map((part, i) => 
                          i % 2 === 1 ? <strong key={i} className="text-white font-medium">{part}</strong> : part
                        )}
                      </p>
                      <ul className="space-y-3">
                        {section.bullets.map((bullet, bulletIndex) => (
                          <li key={bulletIndex} className="flex items-start gap-3">
                            <CheckCircle2 size={20} className={`flex-shrink-0 mt-0.5 ${level.textColor}`} />
                            <span className="text-gray-400">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            
            <div className="relative bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
              <h2 className="text-3xl md:text-4xl font-light tracking-wide text-white mb-6">
                Gotowy na stronę, która <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">działa</span>?
              </h2>
              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                Rozpocznijmy od rozmowy o Twoim biznesie. Bezpłatna konsultacja, bez zobowiązań.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  href="/#contact" 
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105"
                >
                  <span>Umów konsultację</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                
                <Link 
                  href="/cennik" 
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 text-white font-medium transition-all duration-300 hover:bg-white/5"
                >
                  <span>Zobacz cennik</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-900 pt-16 pb-12 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors font-medium">
                ← Powrót do strony głównej
              </Link>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-900">
            <p className="text-center text-sm font-light tracking-wider text-gray-500">
              © Syntance — Strony i sklepy, które działają.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
