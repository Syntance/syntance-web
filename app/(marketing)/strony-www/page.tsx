import { Metadata } from 'next'
import { 
  Zap, 
  Shield, 
  Code2, 
  Users, 
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
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import { HeroTransition } from '@/components/page-transition'
import { sanityFetch } from '@/sanity/lib/fetch'
import { startingPricesQuery, defaultStartingPrices, type StartingPrices } from '@/sanity/queries/pricing'

// Pobierz ceny startowe z Sanity
async function getStartingPrices(): Promise<StartingPrices> {
  try {
    const prices = await sanityFetch<StartingPrices>({ query: startingPricesQuery })
    if (!prices?.websiteStartPrice) {
      return defaultStartingPrices
    }
    return prices
  } catch {
    return defaultStartingPrices
  }
}

// Funkcja do formatowania ceny
function formatPrice(price: number): string {
  return price.toLocaleString('pl-PL')
}

// Dynamiczne metadata z cenami z Sanity
export async function generateMetadata(): Promise<Metadata> {
  const prices = await getStartingPrices()
  
  return {
    title: 'Strony internetowe dla firm | Profesjonalne strony www Next.js | Syntance',
    description: `Tworzymy profesjonalne strony internetowe dla firm B2B. Next.js, PageSpeed 90+, strategia przed kodem. Strony od ${formatPrice(prices.websiteStartPrice)} PLN. Bezpłatna wycena →`,
    keywords: [
      'tworzenie stron internetowych',
      'strona internetowa dla firmy',
      'profesjonalna strona internetowa',
      'strony dla firm',
      'strona www dla firmy',
      'strona internetowa Next.js',
      'strona B2B',
      'szybka strona internetowa',
      'tworzenie stron internetowych Kraków',
      'strony internetowe Małopolska',
      'agencja webowa Polska',
    ],
    openGraph: {
      title: 'Strony internetowe dla firm | Syntance',
      description: `Profesjonalne strony www w Next.js z gwarancją PageSpeed 90+. Strategia przed kodem. Strony od ${formatPrice(prices.websiteStartPrice)} PLN.`,
      url: 'https://syntance.com/strony-www',
    },
    alternates: {
      canonical: 'https://syntance.com/strony-www',
    },
  }
}


const problems = [
  { icon: XCircle, text: "Wolna — użytkownicy uciekają po 3 sekundach" },
  { icon: XCircle, text: "Niewidoczna w Google — brak ruchu organicznego" },
  { icon: XCircle, text: "Przestarzała technologia — WordPress z 50 wtyczkami" },
  { icon: XCircle, text: "Brak strategii — \"ładna\" strona bez celu biznesowego" },
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
    description: "Warsztat strategiczny, brief, buyer persona — poznajemy Twój biznes i klientów.",
    icon: Search,
    gradient: "from-blue-400 to-cyan-400",
  },
  {
    number: "02",
    title: "Design",
    description: "UX/UI, prototyp w Figma — projektujemy doświadczenie, które konwertuje.",
    icon: Palette,
    gradient: "from-purple-400 to-pink-400",
  },
  {
    number: "03",
    title: "Development",
    description: "Next.js, Sanity CMS — budujemy szybką, bezpieczną stronę z panelem administracyjnym.",
    icon: Code,
    gradient: "from-amber-400 to-orange-400",
  },
  {
    number: "04",
    title: "Launch",
    description: "Wdrożenie, szkolenie z CMS, 30 dni wsparcia technicznego w cenie.",
    icon: Rocket,
    gradient: "from-green-400 to-emerald-400",
  },
]

export default async function StronyWWWPage() {
  const prices = await getStartingPrices()
  
  // FAQ items z dynamicznymi cenami
  const faqItems = [
    {
      question: "Ile kosztuje profesjonalna strona internetowa?",
      answer: `Strony zaczynają się od ${formatPrice(prices.websiteStartPrice)} PLN netto. Cena zależy od zakresu — liczby podstron, integracji, funkcjonalności. Użyj naszego konfiguratora cennika, aby poznać orientacyjną wycenę.`,
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
      answer: "Next.js = szybkość (PageSpeed 90+ vs 30-50 na WP), bezpieczeństwo (zero wtyczek = zero dziur), lepsze SEO. WordPress to 60% zhakowanych stron w sieci i ciągłe aktualizacje. Next.js działa latami bez interwencji.",
    },
    {
      question: "Czy oferujecie strony internetowe w Krakowie i okolicach?",
      answer: "Tak! Obsługujemy klientów z całej Polski, ze szczególnym uwzględnieniem Krakowa i Małopolski. Pracujemy zdalnie lub spotkajmy się na żywo — elastycznie dopasowujemy się do Twoich potrzeb.",
    },
    {
      question: "Co obejmuje gwarancja i wsparcie?",
      answer: "30 dni wsparcia technicznego w cenie. Poprawiamy błędy, pomagamy z CMS, odpowiadamy na pytania. Po tym okresie oferujemy opcjonalny abonament opieki technicznej.",
    },
  ]
  
  // Schema.org JSON-LD z dynamiczną ceną
  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Tworzenie stron internetowych",
    "provider": {
      "@type": "Organization",
      "name": "Syntance",
      "url": "https://syntance.com"
    },
    "description": "Profesjonalne strony internetowe dla firm B2B w Next.js",
    "areaServed": ["PL", "EU"],
    "serviceType": "Web Development",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "PLN",
      "price": prices.websiteStartPrice.toString(),
      "priceValidUntil": "2026-12-31"
    }
  }
  
  return (
    <div className="min-h-screen w-full" style={{ overflowX: 'clip' }}>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />

      {/* Hero Section */}
      <HeroTransition>
        <section className="relative z-10 pt-52 pb-24 px-6 lg:px-12">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-widest glow-text mb-6">
              Strony internetowe dla firm, które generują leady
            </h1>
            <p className="text-xl md:text-2xl font-light tracking-wide text-gray-400 mb-8">
              Profesjonalne strony www w Next.js z gwarancją PageSpeed 90+
            </p>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed mb-12">
              Tworzymy szybkie, nowoczesne strony internetowe dla firm B2B. 
              Każdy projekt zaczynamy od strategii — nie od kodu. 
              Rezultat? Strona, która pracuje na Twój biznes 24/7.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/cennik" 
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105"
              >
                <span>Bezpłatna wycena</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              
              <Link 
                href="/#contact" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 text-white font-medium transition-all duration-300 hover:bg-white/5"
              >
                <span>Porozmawiajmy</span>
              </Link>
            </div>
          </div>
        </section>
      </HeroTransition>

      {/* Problem Section */}
      <section className="relative z-10 py-20 px-6 lg:px-12 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light tracking-wide text-center mb-12">
            <span className="text-gray-400">Dlaczego Twoja obecna strona</span>{' '}
            <span className="text-red-400">nie przynosi klientów?</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {problems.map((problem, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-red-500/20"
              >
                <problem.icon className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 leading-relaxed">{problem.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light tracking-wide text-center mb-6">
            <span className="text-white">Profesjonalna strona internetowa,</span>{' '}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">która działa</span>
          </h2>
          <p className="text-lg text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Nasze strony to nie tylko design — to przemyślane narzędzie sprzedażowe
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {solutions.map((solution, index) => {
              const Icon = solution.icon
              return (
                <div 
                  key={index}
                  className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${solution.gradient} bg-opacity-10 flex items-center justify-center mb-4`}>
                    <Icon size={24} className={solution.textColor} />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={16} className="text-green-400" />
                    <h3 className="text-lg font-medium text-white">{solution.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm">{solution.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="relative z-10 py-24 px-6 lg:px-12 bg-gray-900/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light tracking-wide text-center mb-6 glow-text">
            Strony dla firm, które chcą więcej
          </h2>
          <p className="text-lg text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Specjalizujemy się w stronach B2B — rozumiemy, że Twoja strona musi generować wyniki
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {targetAudiences.map((audience, index) => {
              const Icon = audience.icon
              return (
                <div 
                  key={index}
                  className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-8 hover:border-white/20 transition-all duration-300"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${audience.gradient} opacity-5 blur-2xl`} />
                  
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${audience.gradient} bg-opacity-10 flex items-center justify-center mb-6`}>
                    <Icon size={28} className="text-white" />
                  </div>
                  
                  <h3 className="text-xl font-medium text-white mb-3">{audience.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{audience.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light tracking-wide text-center mb-6 glow-text">
            Jak tworzymy strony internetowe?
          </h2>
          <p className="text-lg text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Sprawdzony proces, który gwarantuje rezultaty
          </p>
          
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-purple-400 to-green-400 opacity-20 hidden md:block" />
            
            <div className="space-y-12">
              {processSteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={index} className="flex items-start gap-6">
                    {/* Icon */}
                    <div className="relative flex-shrink-0">
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.gradient} blur-xl opacity-30`} />
                      <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${step.gradient} bg-opacity-10 border-2 border-white/10 flex items-center justify-center`}>
                        <Icon className="text-white" size={24} />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-sm font-mono font-medium bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent`}>
                          {step.number}
                        </span>
                        <div className={`h-px flex-1 bg-gradient-to-r ${step.gradient} opacity-20`} />
                      </div>
                      <h3 className="text-xl font-medium text-white mb-2">{step.title}</h3>
                      <p className="text-gray-400 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="relative z-10 py-24 px-6 lg:px-12 bg-gray-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-light tracking-wide mb-6">
            <span className="text-gray-400">Technologia, która</span>{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">daje przewagę</span>
          </h2>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Next.js, Sanity CMS, Vercel — stack używany przez Netflix, TikTok i Nike
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-3xl font-light text-white mb-2">90+</div>
              <div className="text-gray-400">PageSpeed Score</div>
              <div className="text-sm text-gray-500 mt-1">gwarantowany</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-3xl font-light text-white mb-2">&lt;1s</div>
              <div className="text-gray-400">Czas ładowania</div>
              <div className="text-sm text-gray-500 mt-1">vs 3-5s na WordPress</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-3xl font-light text-white mb-2">0</div>
              <div className="text-gray-400">Wtyczek do aktualizacji</div>
              <div className="text-sm text-gray-500 mt-1">zero dziur bezpieczeństwa</div>
            </div>
          </div>
          
          <Link 
            href="/nextjs" 
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Dowiedz się więcej o Next.js</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light tracking-wide text-center mb-6 glow-text">
            Ile kosztuje strona internetowa?
          </h2>
          <p className="text-lg text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Transparentne ceny — bez ukrytych kosztów
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Strona firmowa */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-20 blur-lg group-hover:opacity-30 transition-opacity" />
              <div className="relative p-8 rounded-2xl bg-gray-900 border border-white/10">
                <h3 className="text-xl font-medium text-white mb-2">Strona firmowa</h3>
                <p className="text-gray-400 text-sm mb-6">Landing page, wizytówka, strona usługowa</p>
                
                <div className="text-3xl font-light text-white mb-1">od {formatPrice(prices.websiteStartPrice)} PLN</div>
                <div className="text-sm text-gray-400 mb-6">netto • 2-4 tygodnie</div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-gray-400 text-sm">
                    <CheckCircle2 size={16} className="text-green-400" />
                    Do 5 podstron
                  </li>
                  <li className="flex items-center gap-2 text-gray-400 text-sm">
                    <CheckCircle2 size={16} className="text-green-400" />
                    Panel CMS Sanity
                  </li>
                  <li className="flex items-center gap-2 text-gray-400 text-sm">
                    <CheckCircle2 size={16} className="text-green-400" />
                    Optymalizacja SEO
                  </li>
                  <li className="flex items-center gap-2 text-gray-400 text-sm">
                    <CheckCircle2 size={16} className="text-green-400" />
                    30 dni wsparcia
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Strona rozbudowana */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-20 blur-lg group-hover:opacity-30 transition-opacity" />
              <div className="relative p-8 rounded-2xl bg-gray-900 border border-white/10">
                <h3 className="text-xl font-medium text-white mb-2">Strona rozbudowana</h3>
                <p className="text-gray-400 text-sm mb-6">Katalog produktów, portal, integracje</p>
                
                <div className="text-3xl font-light text-white mb-1">od {formatPrice(prices.websiteAdvancedStartPrice)} PLN</div>
                <div className="text-sm text-gray-400 mb-6">netto • 4-8 tygodni</div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-gray-400 text-sm">
                    <CheckCircle2 size={16} className="text-green-400" />
                    Nieograniczone podstrony
                  </li>
                  <li className="flex items-center gap-2 text-gray-400 text-sm">
                    <CheckCircle2 size={16} className="text-green-400" />
                    Zaawansowane funkcjonalności
                  </li>
                  <li className="flex items-center gap-2 text-gray-400 text-sm">
                    <CheckCircle2 size={16} className="text-green-400" />
                    Integracje (CRM, mailing)
                  </li>
                  <li className="flex items-center gap-2 text-gray-400 text-sm">
                    <CheckCircle2 size={16} className="text-green-400" />
                    Warsztat discovery w cenie
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Link 
              href="/cennik" 
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105"
            >
              <span>Sprawdź konfigurator cennika</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-24 px-6 lg:px-12 bg-gray-900/30" id="faq">
        {/* FAQ Schema.org */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqItems.map(item => ({
                "@type": "Question",
                "name": item.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": item.answer,
                },
              })),
            }),
          }}
        />
        
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light tracking-wide text-center mb-6 glow-text">
            Często zadawane pytania
          </h2>
          <p className="text-lg text-gray-400 text-center mb-12">
            Wszystko, co powinieneś wiedzieć o tworzeniu stron internetowych
          </p>
          
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <details 
                key={index}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-medium text-white pr-4">{item.question}</span>
                  <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-300 group-open:rotate-180 flex-shrink-0" />
                </summary>
                <div className="px-6 pb-6 pt-0">
                  <p className="text-gray-400 leading-relaxed">{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-32 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            
            <div className="relative bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
              <h2 className="text-3xl md:text-4xl font-light tracking-wide text-white mb-6">
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
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
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
            <p className="text-center text-sm font-light tracking-wider text-gray-400">
              © Syntance — Strony i sklepy, które działają.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
