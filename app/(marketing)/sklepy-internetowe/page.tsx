import { Metadata } from 'next'
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
  ShoppingCart,
  CreditCard,
  Package,
  Globe,
  Smartphone,
  Search,
  ChevronDown,
  Server,
  Layout,
  Database
} from 'lucide-react'
import Link from 'next/link'
import { HeroTransition } from '@/components/page-transition'
import { sanityFetch } from '@/sanity/lib/fetch'
import { startingPricesQuery, defaultStartingPrices, type StartingPrices } from '@/sanity/queries/pricing'

// Pobierz ceny startowe z Sanity
async function getStartingPrices(): Promise<StartingPrices> {
  try {
    const prices = await sanityFetch<StartingPrices>({ query: startingPricesQuery })
    if (!prices?.ecommerceStandardStartPrice) {
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
    title: 'Sklepy internetowe headless | MedusaJS & Next.js | Syntance',
    description: `Budujemy sklepy internetowe w architekturze headless. MedusaJS, Next.js, zero prowizji. Sklepy od ${formatPrice(prices.ecommerceStandardStartPrice)} PLN. Wycena w 24h →`,
    keywords: [
      'ile kosztuje sklep internetowy',
      'sklep internetowy dla firmy',
      'sklep internetowy headless',
      'headless ecommerce',
      'sklep next.js',
      'medusajs sklep',
      'własny sklep internetowy',
      'sklep dla producenta',
      'alternatywa dla Shopify',
      'własny sklep zamiast Allegro',
      'sklep internetowy Kraków',
      'tworzenie sklepów internetowych Polska',
      'agencja e-commerce Małopolska',
    ],
    openGraph: {
      title: 'Sklepy internetowe headless | MedusaJS & Next.js | Syntance',
      description: `Budujemy sklepy e-commerce w architekturze headless. Zero prowizji, pełna kontrola. Sklepy od ${formatPrice(prices.ecommerceStandardStartPrice)} PLN.`,
      url: 'https://syntance.com/sklepy-internetowe',
    },
    alternates: {
      canonical: 'https://syntance.com/sklepy-internetowe',
    },
  }
}


const problems = [
  { icon: XCircle, text: "Prowizje — Shopify pobiera do 2% od każdej transakcji", highlight: "Prowizje" },
  { icon: XCircle, text: "Limity — WooCommerce pada przy 1000+ produktów", highlight: "Limity" },
  { icon: XCircle, text: "Szablonowość — Twój sklep wygląda jak tysiące innych", highlight: "Szablonowość" },
  { icon: XCircle, text: "Vendor lock-in — migracja = budowanie od zera", highlight: "Vendor lock-in" },
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

export default async function SklepyInternetowePage() {
  const prices = await getStartingPrices()
  
  // FAQ items z dynamicznymi cenami
  const faqItems = [
    {
      question: "Ile kosztuje sklep internetowy headless?",
      answer: `Sklepy zaczynają się od ${formatPrice(prices.ecommerceStandardStartPrice)} PLN (standard) do ${formatPrice(prices.ecommerceProStartPrice)}+ PLN (pro). Cena zależy od liczby funkcji, integracji i stopnia customizacji. Użyj naszego konfiguratora cennika, aby poznać orientacyjną wycenę.`,
    },
    {
      question: "Czym różni się headless od Shopify?",
      answer: "Headless = pełna własność kodu, zero prowizji od sprzedaży, nieograniczona customizacja. Shopify = wynajem platformy, prowizje 0.5-2% od transakcji, ograniczenia szablonu. Z headless płacisz raz za development, nie co miesiąc za dostęp.",
    },
    {
      question: "Jak długo trwa budowa sklepu internetowego?",
      answer: "Sklep standard (katalog, koszyk, płatności): 4-6 tygodni. Sklep pro z integracjami ERP, kurierami i subskrypcjami: 6-10 tygodni. Dokładny timeline ustalamy po warsztacie discovery.",
    },
    {
      question: "Czy MedusaJS to sprawdzona technologia?",
      answer: "Tak! MedusaJS to open-source e-commerce platform backed by $9M VC funding. Używany przez firmy jak Tekla, Summer Health i setki innych. Aktywna społeczność, regularne aktualizacje, enterprise-grade security.",
    },
    {
      question: "Czy mogę migrować z WooCommerce/Shopify?",
      answer: "Tak, przeprowadzamy pełną migrację — produkty, warianty, klienci, historia zamówień. Proces jest bezpieczny i nie wpływa na działanie obecnego sklepu do momentu przełączenia.",
    },
    {
      question: "Czy oferujecie sklepy internetowe w Krakowie?",
      answer: "Tak! Obsługujemy klientów z całej Polski, ze szczególnym uwzględnieniem Krakowa i Małopolski. Pracujemy zdalnie lub spotykamy się na żywo — elastycznie dopasowujemy się do Twoich potrzeb.",
    },
  ]
  
  // Schema.org JSON-LD z dynamiczną ceną
  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Sklepy internetowe headless",
    "provider": {
      "@type": "Organization",
      "name": "Syntance",
      "url": "https://syntance.com"
    },
    "description": "Sklepy e-commerce w architekturze headless — MedusaJS, Next.js",
    "areaServed": ["PL", "EU"],
    "serviceType": "E-commerce Development",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "PLN",
      "price": prices.ecommerceStandardStartPrice.toString(),
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
              Sklepy internetowe headless — Next.js i MedusaJS
            </h1>
            <p className="text-xl md:text-2xl font-light tracking-wide text-gray-400 mb-8">
              Własny sklep internetowy bez limitów SaaS i prowizji od sprzedaży
            </p>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed mb-12">
              Budujemy szybkie sklepy e-commerce w architekturze headless. 
              Zero prowizji, pełna kontrola nad kodem, nieograniczona skalowalność. 
              Twój sklep, Twoje zasady.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/cennik" 
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105"
              >
                <span>Wycena sklepu</span>
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
            <span className="text-gray-400">Dlaczego SaaS-owe platformy</span>{' '}
            <span className="text-red-400">Cię ograniczają?</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {problems.map((problem, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-red-500/20"
              >
                <problem.icon className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 leading-relaxed">
                  <strong className="text-white">{problem.highlight}</strong> — {problem.text.split(' — ')[1]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section - What is Headless */}
      <section className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light tracking-wide text-center mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Headless e-commerce</span>{' '}
            <span className="text-white">— sklep bez limitów</span>
          </h2>
          
          {/* What is headless explanation */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-8">
              <h3 className="text-xl font-medium text-white mb-4">Co to headless?</h3>
              <p className="text-gray-400 leading-relaxed">
                Frontend (to, co widzi klient) jest <strong className="text-white">oddzielony od backendu</strong> (logika, baza, płatności). 
                Dzięki temu możesz mieć ultra-szybki frontend w Next.js połączony z potężnym silnikiem e-commerce MedusaJS.
              </p>
            </div>
          </div>
          
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
            Sklepy dla firm, które chcą kontroli
          </h2>
          <p className="text-lg text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Headless e-commerce to rozwiązanie dla firm, które wyrosły z platform SaaS
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

      {/* Technology Stack Section */}
      <section className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light tracking-wide text-center mb-6 glow-text">
            Stack technologiczny — MedusaJS + Next.js
          </h2>
          <p className="text-lg text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Enterprise-grade technologie, zero vendor lock-in
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {techStack.map((tech, index) => {
              const Icon = tech.icon
              return (
                <div 
                  key={index}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                >
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
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 px-6 lg:px-12 bg-gray-900/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light tracking-wide text-center mb-6 glow-text">
            Co zawiera sklep headless od Syntance?
          </h2>
          <p className="text-lg text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Wybierz pakiet dopasowany do Twoich potrzeb
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Standard Package */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-20 blur-lg group-hover:opacity-30 transition-opacity" />
              <div className="relative p-8 rounded-2xl bg-gray-900 border border-white/10 h-full">
                <div className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium mb-4">
                  Standard
                </div>
                <h3 className="text-2xl font-medium text-white mb-2">od {formatPrice(prices.ecommerceStandardStartPrice)} PLN</h3>
                <p className="text-gray-400 text-sm mb-6">netto • 4-6 tygodni</p>
                
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
            
            {/* Pro Package */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-20 blur-lg group-hover:opacity-30 transition-opacity" />
              <div className="relative p-8 rounded-2xl bg-gray-900 border border-white/10 h-full">
                <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium mb-4">
                  Pro
                </div>
                <h3 className="text-2xl font-medium text-white mb-2">od {formatPrice(prices.ecommerceProStartPrice)} PLN</h3>
                <p className="text-gray-400 text-sm mb-6">netto • 6-10 tygodni</p>
                
                <p className="text-gray-400 text-sm mb-4">Wszystko ze Standard, plus:</p>
                
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
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/cennik" 
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105"
            >
              <span>Sprawdź konfigurator cennika</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison with Shopify */}
      <section className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light tracking-wide text-center mb-12">
            <span className="text-gray-400">Headless vs.</span>{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Shopify/WooCommerce</span>
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Kryterium</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Shopify/WooCommerce</th>
                  <th className="text-center py-4 px-4 font-medium bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Headless</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4 text-white font-medium">Prowizje</td>
                  <td className="py-4 px-4 text-center text-gray-400">0.5-2% od transakcji</td>
                  <td className="py-4 px-4 text-center text-green-400 font-medium">0% — zero prowizji</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4 text-white font-medium">PageSpeed</td>
                  <td className="py-4 px-4 text-center text-gray-400">40-60/100</td>
                  <td className="py-4 px-4 text-center text-green-400 font-medium">90+/100</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4 text-white font-medium">Własność kodu</td>
                  <td className="py-4 px-4 text-center text-gray-400">Wynajem platformy</td>
                  <td className="py-4 px-4 text-center text-green-400 font-medium">100% Twój kod</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4 text-white font-medium">Customizacja</td>
                  <td className="py-4 px-4 text-center text-gray-400">Limity szablonu</td>
                  <td className="py-4 px-4 text-center text-green-400 font-medium">Bez ograniczeń</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4 text-white font-medium">Skalowalność</td>
                  <td className="py-4 px-4 text-center text-gray-400">Problemy przy wzroście</td>
                  <td className="py-4 px-4 text-center text-green-400 font-medium">Nieograniczona</td>
                </tr>
              </tbody>
            </table>
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
            Wszystko, co powinieneś wiedzieć o sklepach headless
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
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            
            <div className="relative bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
              <h2 className="text-3xl md:text-4xl font-light tracking-wide text-white mb-6">
                Gotowy na sklep, który{' '}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  rośnie razem z Tobą?
                </span>
              </h2>
              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                Zamów bezpłatną wycenę sklepu — odpowiadamy w ciągu 24 godzin
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  href="/cennik" 
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105"
                >
                  <span>Wycena sklepu</span>
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
