'use client'

import { Zap, Shield, TrendingUp, DollarSign, Wrench, Rocket, Quote } from 'lucide-react'
import GradientText from '@/components/GradientText'

const comparisonData = [
  {
    icon: Zap,
    label: 'Szybkość',
    wordpress: 'PageSpeed 30-50 (wolny)',
    nextjs: 'PageSpeed 90+',
    nextjsSuffix: ' (błyskawiczny)',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Shield,
    label: 'Bezpieczeństwo',
    wordpress: 'Wtyczki = dziury w zabezpieczeniach',
    nextjs: 'Zero wtyczek = zero dziur',
    nextjsSuffix: '',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: TrendingUp,
    label: 'Konwersja',
    wordpress: 'Każda sekunda opóźnienia = -7% konwersji',
    nextjs: 'Strona ładuje się w <1 sek.',
    nextjsSuffix: '',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: DollarSign,
    label: 'Google Ads',
    wordpress: 'Wysoki CPC (słaby Quality Score)',
    nextjs: 'Niższy CPC',
    nextjsSuffix: ' (lepszy PageSpeed)',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Wrench,
    label: 'Utrzymanie',
    wordpress: 'Ciągłe aktualizacje wtyczek',
    nextjs: 'Stabilny, minimalny serwis',
    nextjsSuffix: '',
    color: 'from-amber-500 to-yellow-500',
  },
  {
    icon: Rocket,
    label: 'Skalowanie',
    wordpress: 'Problemy przy dużym ruchu',
    nextjs: '100 lub 100k użytkowników',
    nextjsSuffix: ' — działa',
    color: 'from-indigo-500 to-purple-500',
  },
]

const benefits = [
  '+7% konwersji za każdą sekundę szybciej',
  'Lepsze pozycje w Google (PageSpeed to ranking factor)',
  'Tańsze reklamy (wyższy Quality Score = niższy CPC)',
  '99.99% uptime (hosting Vercel z globalnym CDN)',
  'Gotowość na przyszłość (AI-ready, Edge Network)',
]

export default function TechComparison() {
  return (
    <section id="tech-comparison" className="relative z-10 py-24 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light tracking-widest glow-text mb-6">
            Technologia, która pracuje <br className="hidden sm:block" />
            <GradientText>na Twój wynik</GradientText>
          </h2>
          <p className="text-xl font-light tracking-wide text-gray-400 max-w-3xl mx-auto mb-4">
            Większość stron działa na WordPressie. My budujemy na Next.js — i oto dlaczego.
          </p>
          
          {/* Czym jest Next.js */}
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 max-w-3xl mx-auto">
            <p className="text-gray-300 leading-relaxed">
              <span className="font-medium text-white">Next.js</span> to nowoczesny framework do tworzenia stron i aplikacji webowych, 
              używany przez <GradientText className="font-medium">Netflix, TikTok, Nike i Notion</GradientText>. 
              To standard wśród firm, które traktują web poważnie.
            </p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <h3 className="text-2xl font-light tracking-wide text-white mb-8 text-center">
            Porównanie z WordPress
          </h3>
          
          <div className="space-y-4">
            {comparisonData.map((item, index) => {
              const Icon = item.icon
              return (
                <div 
                  key={index}
                  className="grid md:grid-cols-[180px_1fr_1fr] gap-4 p-5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
                >
                  {/* Kryterium */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} opacity-20 group-hover:opacity-30 transition-opacity flex items-center justify-center`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <span className="font-medium text-white">{item.label}</span>
                  </div>
                  
                  {/* WordPress */}
                  <div className="flex items-center gap-2 md:border-l md:border-white/10 md:pl-4">
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider md:hidden">WordPress:</span>
                    <span className="text-sm text-gray-400">{item.wordpress}</span>
                  </div>
                  
                  {/* Next.js */}
                  <div className="flex items-center gap-2 md:border-l md:border-teal-500/20 md:pl-4">
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider md:hidden">Next.js:</span>
                    <span className="text-sm font-medium">
                      <GradientText>{item.nextjs}</GradientText>
                      {item.nextjsSuffix && <span className="text-gray-400">{item.nextjsSuffix}</span>}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Key Benefits */}
        <div className="mb-12">
          <h3 className="text-2xl font-light tracking-wide text-white mb-8 text-center">
            Kluczowe korzyści biznesowe
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-300 text-sm leading-relaxed">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quote - Kiedy WordPress ma sens */}
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl opacity-20 blur-lg" />
          <div className="relative p-8 rounded-2xl bg-gray-900 border border-amber-500/30">
            <Quote size={32} className="text-amber-500/30 mb-4" />
            <p className="text-lg text-gray-300 leading-relaxed mb-3">
              <span className="font-medium text-white">Kiedy WordPress ma sens?</span>
            </p>
            <p className="text-gray-400 leading-relaxed">
              Prosty blog, niski budżet, zero ambicji wzrostu. We wszystkich innych przypadkach — Next.js.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
