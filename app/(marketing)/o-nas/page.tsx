import { Metadata } from 'next'
import { Target, Zap, Code, Users, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { HeroTransition } from '@/components/page-transition'
import GradientText from '@/components/GradientText'
import { fetchPricingData } from '@/lib/pricing-data'
import { discoveryPriceNetFromConfig } from '@/lib/pricing-calculator'
import { getConfiguratorMinimumPricesNet } from '@/lib/pricing-configurator-minimum'
import { fetchFaqSettings, resolveONasFaq } from '@/lib/faq-data'
import Footer from '@/components/sections/footer'

export const metadata: Metadata = {
  title: 'O nas — Syntance | Agencja interaktywna i software house Next.js',
  description:
    'Syntance to agencja interaktywna i software house z Polski. Specjalizujemy się w tworzeniu stron internetowych i sklepów e-commerce w Next.js. Strategia marketingu i sprzedaży (faza przedwdrożeniowa).',
  openGraph: {
    title: 'O nas | Syntance — Agencja interaktywna',
    description: 'Syntance to agencja interaktywna i software house z Polski. Specjalizujemy się w tworzeniu stron internetowych i sklepów e-commerce w Next.js.',
    url: 'https://syntance.com/o-nas',
  },
}

const values = [
  {
    icon: Target,
    title: "Strategia marketingu i sprzedaży",
    description: "Każdy projekt zaczynamy od zrozumienia Twojego biznesu. Najpierw cel, potem realizacja.",
    note: "Strategia marketingu i sprzedaży (faza przedwdrożeniowa) w cenie każdego projektu."
  },
  {
    icon: Zap,
    title: "Wydajność",
    description: "Strony z PageSpeed 90+, które ładują się błyskawicznie i konwertują.",
    note: "Core Web Vitals to dla nas standard."
  },
  {
    icon: Code,
    title: "Nowoczesny stack",
    description: "Next.js, React, TypeScript, Tailwind CSS. Technologie, które skalują się z Twoim biznesem.",
    note: "Żadnego długu technicznego."
  },
  {
    icon: Users,
    title: "Partnerstwo",
    description: "Nie jesteśmy tylko wykonawcą. Doradzamy, edukujemy i wspieramy na każdym etapie.",
    note: "30 dni gwarancji po każdym projekcie."
  }
]

const technologies = [
  { name: "Next.js", color: "bg-white" },
  { name: "React", color: "bg-cyan-400" },
  { name: "TypeScript", color: "bg-blue-500" },
  { name: "Tailwind CSS", color: "bg-teal-400" },
  { name: "Sanity CMS", color: "bg-red-500" },
  { name: "Vercel", color: "bg-white" },
  { name: "Medusa", color: "bg-purple-500" },
  { name: "Stripe", color: "bg-indigo-500" },
]

const stats = [
  { value: "90+", label: "PageSpeed Score" },
  { value: "100%", label: "Projektów na czas" },
  { value: "24h", label: "Czas odpowiedzi" },
  { value: "30 dni", label: "Gwarancja" },
]

export default async function ONasPage() {
  const [pricingData, faqDoc] = await Promise.all([fetchPricingData(), fetchFaqSettings()])
  const mins = getConfiguratorMinimumPricesNet(pricingData)
  const discoveryNet = discoveryPriceNetFromConfig(pricingData.config)
  const faqs = resolveONasFaq(faqDoc, mins, discoveryNet)
  
  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Syntance",
            "alternateName": ["Syntance", "JDG Kamil Podobiński", "Syntance Kamil Podobiński", "Agencja Syntance"],
            "legalName": "JDG Kamil Podobiński, prowadzący jednoosobową działalność gospodarczą pod firmą Syntance Kamil Podobiński",
            "description": "Agencja interaktywna i software house z Polski specjalizujący się w Next.js, headless CMS i e-commerce.",
            "url": "https://syntance.com",
            "foundingDate": "2024",
            "areaServed": ["PL", "EU"],
            "knowsAbout": ["Next.js", "React", "TypeScript", "Syntance CMS", "Medusa", "E-commerce", "Web Development"],
            "slogan": "Strategia marketingu i sprzedaży",
            "email": "kontakt@syntance.com",
            "telephone": "+48537110170"
          })
        }}
      />

      <div className="min-h-screen bg-[#05030C] w-full" style={{ overflowX: 'clip' }}>
        {/* Hero Section */}
        <HeroTransition>
        <section className="relative z-10 pt-52 pb-24 px-6 lg:px-12">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-white mb-6">
              Czym jest Syntance?
            </h1>
            <h2 className="text-xl md:text-2xl font-medium mb-8">
              <GradientText
                colors={['#ffaa40', '#9c40ff', '#ffaa40']}
                animationSpeed={4}
              >
                Agencja interaktywna i software house z Polski specjalizujący się w Next.js
              </GradientText>
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
              Jesteśmy software house: budujemy szybkie witryny i sklepy w Next.js na cele biznesowe. Każdy projekt zaczynamy od strategii wdrożeniowej — nie od szablonu.
            </p>
          </div>
        </section>
        </HeroTransition>

        {/* Kim jesteśmy */}
        <section className="relative z-10 py-24 px-6 lg:px-12 bg-white/[0.02]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-light tracking-wide text-white mb-8 text-center">
              Firma od tworzenia stron internetowych, która stawia na jakość
            </h2>
            
            <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
              <p>
                <strong className="text-white">Syntance</strong> to <strong className="text-white">software house i agencja interaktywna</strong>: projektujemy i wdrażamy strony oraz headless commerce w Next.js — z naciskiem na architekturę, wydajność i cele biznesowe. Nie jesteśmy korporacją ze stałą rotacją zespołów: zatrudniamy doświadczonych specjalistów, którzy od briefu po release prowadzą projekt przy Tobie jak jeden warsztat.
              </p>
              <p>
                Jako <strong className="text-white">software house z Polski</strong> specjalizujemy się w technologiach Next.js, React i headless CMS. <strong className="text-white">Tworzenie stron internetowych</strong> to nasza główna działalność, ale podchodzimy do tego inaczej niż większość.
              </p>
            </div>

            {/* Mission box */}
            <div className="mt-12 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 rounded-3xl p-8 md:p-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white mb-3">
                    Nasza misja
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Wierzymy, że strona internetowa to nie wizytówka — to strategiczne narzędzie biznesowe. Dlatego każdy projekt zaczynamy od pytania: <strong className="text-white">&ldquo;Co ta strona ma dla Ciebie zrobić?&rdquo;</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Jak pracujemy */}
        <section className="relative z-10 py-24 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light tracking-wide text-white mb-4">
                Jak pracujemy
              </h2>
              <p className="text-xl text-gray-400">
                Wartości, które definiują każdy nasz projekt
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div 
                    key={index}
                    className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 hover:border-purple-500/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-medium text-white mb-2">
                          {value.title}
                        </h3>
                        <p className="text-gray-400 leading-relaxed mb-3">
                          {value.description}
                        </p>
                        <p className="text-sm text-purple-400/80 italic">
                          {value.note}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Technologie */}
        <section className="relative z-10 py-24 px-6 lg:px-12 bg-white/[0.02]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-light tracking-wide text-white mb-4">
                Technologie, które znamy
              </h2>
              <p className="text-xl text-gray-400">
                Pracujemy z najlepszymi narzędziami na rynku
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {technologies.map((tech, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full"
                >
                  <div className={`w-2 h-2 rounded-full ${tech.color}`} />
                  <span className="text-sm text-gray-300">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Liczby */}
        <section className="relative z-10 py-24 px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-light text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative z-10 py-24 px-6 lg:px-12 bg-white/[0.02]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-light tracking-wide text-white mb-4">
                Często zadawane pytania
              </h2>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details 
                  key={index}
                  className="group bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <h3 className="text-lg font-medium text-white pr-4">
                      {faq.question}
                    </h3>
                    <ChevronDown className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180 flex-shrink-0" />
                  </summary>
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - zachowana */}
        <section className="relative z-10 py-32 px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
              
              <div className="relative bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
                <h2 className="text-3xl md:text-4xl font-light tracking-wide text-white mb-6">
                  Chcesz porozmawiać o projekcie?
                </h2>
                <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                  Umów bezpłatną konsultację i dowiedz się, jak możemy pomóc Twojemu biznesowi.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link 
                    href="/kontakt" 
                    className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105"
                  >
                    <span>Umów konsultację</span>
                    <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
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

        <Footer />
      </div>
    </>
  )
}
