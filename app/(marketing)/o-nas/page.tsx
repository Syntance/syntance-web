import { Metadata } from 'next'
import { Code, Zap, Target, Users, Award, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'O nas — Studio Web Development | Syntance',
  description: 'Syntance to studio webowe specjalizujące się w Next.js, headless CMS i nowoczesnym e-commerce. Każdy projekt zaczynamy od strategii, nie od kodu.',
  openGraph: {
    title: 'O nas | Syntance',
    description: 'Studio webowe specjalizujące się w Next.js, headless CMS i nowoczesnym e-commerce.',
    url: 'https://syntance.com/o-nas',
  },
}

const values = [
  {
    icon: Target,
    title: "Strategia przed kodem",
    description: "Każdy projekt zaczynamy od zrozumienia Twojego biznesu. Najpierw cel, potem realizacja."
  },
  {
    icon: Zap,
    title: "Wydajność",
    description: "Strony z PageSpeed 90+, które ładują się błyskawicznie i konwertują."
  },
  {
    icon: Code,
    title: "Nowoczesny stack",
    description: "Next.js, React, TypeScript, Tailwind CSS. Technologie, które skalują się z Twoim biznesem."
  },
  {
    icon: Users,
    title: "Partnerstwo",
    description: "Nie jesteśmy tylko wykonawcą. Doradzamy, edukujemy i wspieramy na każdym etapie."
  }
]

const technologies = [
  { name: "Next.js", color: "bg-white" },
  { name: "React", color: "bg-cyan-400" },
  { name: "TypeScript", color: "bg-blue-500" },
  { name: "Tailwind CSS", color: "bg-teal-400" },
  { name: "Sanity CMS", color: "bg-red-500" },
  { name: "Vercel", color: "bg-white" },
  { name: "MedusaJS", color: "bg-purple-500" },
  { name: "Stripe", color: "bg-indigo-500" },
]

export default function ONasPage() {
  return (
    <div className="min-h-screen bg-gray-950 w-full" style={{ overflowX: 'clip' }}>
      {/* Hero Section */}
      <section className="relative z-10 pt-52 pb-24 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wide text-white mb-6 leading-tight">
            Studio, które buduje strony<br />
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              generujące wyniki
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Syntance to studio webowe specjalizujące się w Next.js, headless CMS i nowoczesnym e-commerce. Każdy projekt zaczynamy od strategii, nie od kodu.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative z-10 py-24 px-6 lg:px-12 bg-gray-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 rounded-3xl p-8 md:p-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-medium text-white mb-4">
                  Nasza misja
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Wierzymy, że strona internetowa to nie wizytówka — to strategiczne narzędzie biznesowe. Dlatego każdy projekt zaczynamy od pytania: <strong className="text-white">&ldquo;Co ta strona ma osiągnąć?&rdquo;</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
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
                  className="bg-gray-900/50 border border-white/10 rounded-2xl p-8 hover:border-purple-500/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-white mb-2">
                        {value.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="relative z-10 py-24 px-6 lg:px-12 bg-gray-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light tracking-wide text-white mb-4">
              Technologie, które znamy
            </h2>
            <p className="text-xl text-gray-400">
              Pracujemy z najlepszymi narzędziami na rynku
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {technologies.map((tech, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-white/10 rounded-full"
              >
                <div className={`w-2 h-2 rounded-full ${tech.color}`} />
                <span className="text-sm text-gray-300">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-light text-white mb-2">90+</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">PageSpeed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-light text-white mb-2">100%</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">Responsywne</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-light text-white mb-2">24h</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">Czas odpowiedzi</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-light text-white mb-2">30d</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">Gwarancja</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors font-medium">
              ← Powrót do strony głównej
            </Link>
            <div className="flex gap-6">
              <Link href="/strategia" className="text-gray-400 hover:text-white transition-colors">
                Strategia
              </Link>
              <Link href="/nextjs" className="text-gray-400 hover:text-white transition-colors">
                Technologia
              </Link>
              <Link href="/cennik" className="text-gray-400 hover:text-white transition-colors">
                Cennik
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
