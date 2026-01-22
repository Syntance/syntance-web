'use client'

import { Zap, Shield, TrendingUp, Rocket, Quote } from 'lucide-react'
import GradientText from '@/components/GradientText'
import { useIsMobile } from '@/hooks/useIsMobile'

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
    icon: Rocket,
    label: 'Skalowanie',
    wordpress: 'Problemy przy dużym ruchu',
    nextjs: '100 lub 100k użytkowników',
    nextjsSuffix: ' — działa',
    color: 'from-indigo-500 to-purple-500',
  },
]

export default function TechComparison() {
  const isMobile = useIsMobile();
  
  return (
    <section id="tech-comparison" aria-labelledby="tech-heading" className="relative z-10 py-24 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16">
          <h2 id="tech-heading" className="text-4xl md:text-5xl font-light tracking-widest glow-text mb-6">
            Dlaczego <GradientText>NEXT.JS</GradientText>?
          </h2>
          <p className="text-xl font-light tracking-wide text-gray-400 max-w-3xl mx-auto mb-4">
            Większość stron działa na WordPressie. My budujemy na Next.js — i oto dlaczego.
          </p>
          
          {/* Czym jest Next.js */}
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 max-w-3xl mx-auto">
            <p className="text-gray-400 leading-relaxed">
              <span className="font-medium text-white">Next.js</span> to nowoczesny framework do tworzenia stron i aplikacji webowych, 
              używany przez <GradientText className="font-medium">Netflix, TikTok, Nike i Notion</GradientText>. 
              To standard wśród firm, które traktują web poważnie.
            </p>
          </div>
        </header>

        {/* Comparison Table */}
        <div className="mb-16">
          <h3 className="text-2xl font-light tracking-wide text-white mb-8 text-center">
            Porównanie z WordPress
          </h3>
          
          {/* Jedna duża karta z tabelą */}
          <div className="relative group">
            {/* Glow effect */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 rounded-2xl transition-opacity blur-sm ${
              isMobile ? 'opacity-30' : 'opacity-20 group-hover:opacity-30'
            }`} />
            
            <div className="relative bg-black border border-white/10 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-2 md:grid-cols-[180px_1fr_1fr] gap-4 px-3 md:px-5 pt-4 md:pt-5 pb-3 md:pb-4 bg-black">
                <div className="hidden md:block"></div>
                <div className="text-center">
                  <span className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">WordPress</span>
                </div>
                <div className="text-center">
                  <span className="text-xs md:text-sm font-medium uppercase tracking-wider">
                    <GradientText>Next.js</GradientText>
                  </span>
                </div>
              </div>
              
              {/* Separator po header */}
              <div className="h-px bg-white/10 mx-3 md:mx-5" />
              
              {/* Rows */}
              {comparisonData.map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index}>
                    <div className="grid grid-cols-2 md:grid-cols-[180px_1fr_1fr] gap-4 p-3 md:p-5 hover:bg-white/[0.02] transition-all group/row">
                    {/* Kryterium - ukryte na mobile */}
                    <div className="hidden md:flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center transition-transform group-hover/row:scale-110`}>
                        <Icon size={20} className="text-white" />
                      </div>
                      <span className="font-medium text-white group-hover/row:text-gray-100 transition-colors">{item.label}</span>
                    </div>
                    
                    {/* WordPress */}
                    <div className="flex items-center justify-center">
                      <span className="text-xs md:text-sm text-gray-400 text-center">{item.wordpress}</span>
                    </div>
                    
                    {/* Next.js */}
                    <div className="flex items-center justify-center">
                      <span className="text-xs md:text-sm font-medium text-center">
                        <GradientText>{item.nextjs}</GradientText>
                        {item.nextjsSuffix && <span className="text-gray-400">{item.nextjsSuffix}</span>}
                      </span>
                    </div>
                  </div>
                  
                  {/* Separator - nie dotyka krawędzi */}
                  {index < comparisonData.length - 1 && (
                    <div className="h-px bg-white/5 mx-3 md:mx-5" />
                  )}
                </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Quote - Kiedy WordPress ma sens */}
        <div className="relative max-w-3xl mx-auto mb-12">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl opacity-20 blur-lg" />
          <div className="relative p-8 rounded-2xl bg-gray-900 border border-amber-500/30">
            <Quote size={32} className="text-amber-500/30 mb-4" />
            <p className="text-lg text-gray-400 leading-relaxed mb-3">
              <span className="font-medium text-white">Kiedy WordPress ma sens?</span>
            </p>
            <p className="text-gray-400 leading-relaxed">
              Prosty blog, niski budżet, zero ambicji wzrostu. We wszystkich innych przypadkach — Next.js.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <a 
            href="/nextjs" 
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105"
          >
            <span>Sprawdź, dlaczego Next.js zmienia zasady gry</span>
            <svg 
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
