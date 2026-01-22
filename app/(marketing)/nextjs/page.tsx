import { Metadata } from 'next'
import NavbarStudio from '@/components/navbar-studio'
import { Zap, Shield, TrendingUp, DollarSign, Wrench, Rocket, Code, Server, Globe, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Dlaczego Next.js? Framework, który zmienia zasady gry | Syntance',
  description: 'Next.js to nie tylko szybkość. To bezpieczeństwo, skalowalność i realna przewaga nad konkurencją. Sprawdź, dlaczego WordPress to przeszłość.',
  openGraph: {
    title: 'Dlaczego Next.js? | Syntance',
    description: 'Framework używany przez Netflix, TikTok i Nike. Poznaj technologię, która daje realną przewagę biznesową.',
    url: 'https://syntance.com/nextjs',
  },
}

const techDetails = [
  {
    icon: Zap,
    title: "Szybkość to nie luksus, to konieczność",
    subtitle: "PageSpeed 90+ zamiast 30-50",
    gradient: "from-yellow-500 to-orange-500",
    textColor: "text-yellow-400",
    description: "Strona ładująca się powyżej 3 sekund traci **53% użytkowników**. WordPress z wtyczkami? Często przekracza 5 sekund. Next.js? **Poniżej 1 sekundy**, dzięki Server-Side Rendering i automatycznej optymalizacji obrazów.",
    bullets: [
      "Google karze wolne strony w rankingu (Core Web Vitals)",
      "Każda sekunda opóźnienia = -7% konwersji (badanie Amazon)",
      "Next.js automatycznie generuje WebP/AVIF i lazy loaduje obrazy",
      "Static Site Generation (SSG): strony budowane raz, serwowane z CDN",
    ],
    realWorld: "Netflix używa Next.js właśnie dlatego — miliony użytkowników, zero kompromisów w szybkości."
  },
  {
    icon: Shield,
    title: "Bezpieczeństwo: zero wtyczek = zero dziur",
    subtitle: "WordPress to 90% ataków na strony",
    gradient: "from-blue-500 to-cyan-500",
    textColor: "text-blue-400",
    description: "WordPress jest celem **90% ataków na CMS-y**, głównie przez wtyczki. Każda wtyczka to potencjalna furtka. Next.js? **Brak wtyczek, brak backdoorów**. Kod aplikacji jest kompilowany i statyczny — nie ma co hakować.",
    bullets: [
      "WordPress wymaga aktualizacji wtyczek co tydzień (lub ryzykujesz atak)",
      "Next.js: kod zamknięty, brak zewnętrznych zależności w runtime",
      "Automatyczne HTTPS, CSP headers, i środowiskowe sekrety",
      "Hosting Vercel: built-in DDoS protection i WAF",
    ],
    realWorld: "TikTok zaufał Next.js w swoim ekosystemie — bezpieczeństwo na skalę miliardów użytkowników."
  },
  {
    icon: TrendingUp,
    title: "Konwersja: szybkość = więcej pieniędzy",
    subtitle: "Walmart zwiększył konwersję o 2% na każde 100ms przyspieszenia",
    gradient: "from-green-500 to-emerald-500",
    textColor: "text-green-400",
    description: "To nie teoria. **Walmart** zarobił miliony dzięki zmniejszeniu czasu ładowania. **Pinterest** zwiększył rejestracje o 15% po przyspieszeniu strony. Next.js daje Ci tę przewagę out-of-the-box.",
    bullets: [
      "Prefetching linków: użytkownik klika, strona już gotowa",
      "Hydratacja przerywa opóźnienia — użytkownik widzi treść natychmiast",
      "Optimistic UI: formularze reagują przed odpowiedzią serwera",
      "A/B testing i analytics bez obciążania przeglądarki",
    ],
    realWorld: "Notion zbudował całą aplikację na Next.js — miliony użytkowników daily, płynne doświadczenie."
  },
  {
    icon: DollarSign,
    title: "Google Ads: niższy CPC, wyższy ROI",
    subtitle: "Quality Score zależy od szybkości strony",
    gradient: "from-purple-500 to-pink-500",
    textColor: "text-purple-400",
    description: "Google liczy **Quality Score** m.in. na podstawie PageSpeed. Wyższy QS = **niższy koszt kliknięcia** (nawet o 50%). Wolna strona na WordPressie? Płacisz więcej za ten sam ruch.",
    bullets: [
      "PageSpeed 90+ = lepsze pozycje w reklamach przy tym samym budżecie",
      "Landing Page Experience: Google nagradza szybkie strony",
      "Next.js: automatyczna optymalizacja pod metryki Google",
      "Realna oszczędność: 2-3 tys. PLN miesięcznie na kampaniach",
    ],
    realWorld: "Sklepy e-commerce na Next.js widzą 20-30% redukcję CPC po migracji z WooCommerce."
  },
  {
    icon: Wrench,
    title: "Utrzymanie: 1h rocznie vs. 10h miesięcznie",
    subtitle: "WordPress = niekończąca się karuzela aktualizacji",
    gradient: "from-amber-500 to-yellow-500",
    textColor: "text-amber-400",
    description: "WordPress wymaga **ciągłej uwagi**: aktualizacje wtyczek, core, PHP, testy zgodności. Jedna aktualizacja = ryzyko, że strona przestanie działać. Next.js? **Raz wdrożony, działa latami**.",
    bullets: [
      "WordPress: średnio 10-15h miesięcznie na utrzymanie",
      "Next.js: zero wtyczek = zero konfliktów, zero aktualizacji awaryjnych",
      "Vercel automatycznie aktualizuje runtime i infrastrukturę",
      "Rollback w 1 klik, zero downtime przy deploymencie",
    ],
    realWorld: "Nasze strony na Next.js działają bez interwencji od lat. WordPress? Co miesiąc coś wymaga patcha."
  },
  {
    icon: Rocket,
    title: "Skalowanie: 100 czy 100 000 użytkowników? Bez różnicy",
    subtitle: "WordPress pada przy 1000 równoczesnych użytkowników",
    gradient: "from-indigo-500 to-purple-500",
    textColor: "text-indigo-400",
    description: "WordPress + hosting współdzielony = **katastrofa przy wzroście ruchu**. Next.js + Vercel Edge = **automatyczne skalowanie**. Ruch wzrósł 100x? Strona działa tak samo szybko.",
    bullets: [
      "WordPress: potrzebujesz VPS, CDN, cachingu, optymalizacji bazy danych",
      "Next.js: Vercel Edge rozkłada ruch na 30+ lokalizacji globalnie",
      "Static + ISR (Incremental Static Regeneration): najlepsze z dwóch światów",
      "Zero cold start, zero przestojów przy spike'ach ruchu",
    ],
    realWorld: "Nike obsługuje miliony użytkowników podczas premier butów — zero problemów dzięki Next.js."
  },
]

const comparisonTable = [
  { feature: "Szybkość (PageSpeed)", wordpress: "30-50/100", nextjs: "90-100/100", winner: "nextjs" },
  { feature: "Bezpieczeństwo", wordpress: "Wtyczki = dziury", nextjs: "Zero wtyczek = zero dziur", winner: "nextjs" },
  { feature: "Konwersja", wordpress: "-7% za każdą sekundę", nextjs: "Ładowanie <1 sek.", winner: "nextjs" },
  { feature: "Skalowanie", wordpress: "Problemy przy ruchu", nextjs: "100 lub 100k użytkowników — działa", winner: "nextjs" },
]

export default function NextjsPage() {
  return (
    <div className="min-h-screen bg-gray-900 w-full" style={{ overflowX: 'clip' }}>
      <NavbarStudio />
      
      {/* Hero */}
      <section className="relative z-10 pt-52 pb-24 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-light tracking-widest glow-text mb-6">
            Next.js nie jest &ldquo;tylko frameworkiem&rdquo;
          </h1>
          <p className="text-2xl md:text-3xl font-light tracking-wide text-gray-400 mb-12">
            To przewaga konkurencyjna, która przynosi realne pieniądze
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Netflix, TikTok, Nike, Notion — nie wybrali Next.js przypadkowo. Wybrali szybkość, bezpieczeństwo i skalowalność, 
            których WordPress nigdy nie zapewni. Poznaj technologię, która zmienia zasady gry.
          </p>
        </div>
      </section>

      {/* Quick Comparison Table */}
      <section className="relative z-10 py-16 px-6 lg:px-12 bg-gray-900/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light tracking-wide text-center mb-12">
            <span className="text-gray-400">WordPress vs. </span>
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Next.js</span>
            <span className="text-gray-400"> w liczbach</span>
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Kryterium</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">WordPress</th>
                  <th className="text-center py-4 px-4 font-medium bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Next.js</th>
                </tr>
              </thead>
              <tbody>
                {comparisonTable.map((row, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 text-white font-medium">{row.feature}</td>
                    <td className={`py-4 px-4 text-center ${row.winner === 'wordpress' ? 'text-green-400' : 'text-gray-400'}`}>
                      {row.wordpress}
                    </td>
                    <td className={`py-4 px-4 text-center font-medium ${row.winner === 'nextjs' ? 'text-green-400' : 'text-gray-400'}`}>
                      {row.nextjs}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Tech Details */}
      {techDetails.map((tech, index) => {
        const Icon = tech.icon;
        const isEven = index % 2 === 0;
        
        return (
          <section 
            key={index} 
            className={`relative z-10 py-24 px-6 lg:px-12 ${isEven ? '' : 'bg-gray-900/30'}`}
          >
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Icon & Title */}
                <div className="flex-shrink-0 md:w-1/3">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tech.gradient} bg-opacity-10 flex items-center justify-center mb-4`}>
                    <Icon size={32} className={tech.textColor} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-light tracking-wide text-white mb-2">
                    {tech.title}
                  </h2>
                  <p className={`text-sm ${tech.textColor} font-medium mb-4`}>
                    {tech.subtitle}
                  </p>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className="text-gray-400 leading-relaxed mb-6">
                    {tech.description.split('**').map((part, i) => 
                      i % 2 === 1 ? <strong key={i} className="text-white font-medium">{part}</strong> : part
                    )}
                  </p>
                  
                  <ul className="space-y-3 mb-6">
                    {tech.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="flex items-start gap-3">
                        <CheckCircle2 size={20} className={`flex-shrink-0 mt-0.5 ${tech.textColor}`} />
                        <span className="text-gray-400">{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Real World Example */}
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${tech.gradient} bg-opacity-5 border border-white/10`}>
                    <p className="text-sm text-gray-400">
                      <span className="font-medium text-white">Real world: </span>
                      {tech.realWorld}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Warning Section */}
      <section className="relative z-10 py-16 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl opacity-20 blur-lg" />
            <div className="relative p-8 rounded-2xl bg-gray-900 border border-red-500/30">
              <AlertCircle size={32} className="text-red-500/50 mb-4" />
              <h3 className="text-2xl font-light text-white mb-4">
                Kiedy WordPress NIE jest problemem?
              </h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Tylko w jednym przypadku: **prosty blog, zero ambicji wzrostu, minimalna inwestycja**. 
                Jeśli potrzebujesz strony &ldquo;bo trzeba mieć stronę&rdquo; — WordPress wystarczy.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Ale jeśli Twoja strona ma **generować leady, sprzedawać produkty, lub budować markę** — 
                WordPress to kula u nogi. Next.js to rakieta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            
            <div className="relative bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
              <h2 className="text-3xl md:text-4xl font-light tracking-wide text-white mb-6">
                Przekonany? Sprawdźmy, ile kosztuje strona na <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Next.js</span>
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
