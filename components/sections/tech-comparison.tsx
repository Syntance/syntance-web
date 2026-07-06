'use client'

import { Zap, Shield, Activity, Rocket } from 'lucide-react'
import GradientText from '@/components/GradientText'
import AnimatedSection from '@/components/AnimatedSection'

const benefits = [
  {
    icon: Zap,
    title: 'Szybszy',
    description: 'PageSpeed 90+ i ładowanie poniżej sekundy.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Bezpieczniejszy',
    description: 'Bez wtyczek i typowych luk CMS.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Activity,
    title: 'Stabilniejszy',
    description: 'Przewidywalny stack — mniej awarii po wdrożeniu.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Rocket,
    title: 'Skalowalny',
    description: 'Od startu do dużego ruchu — bez przebudowy strony.',
    color: 'from-indigo-500 to-purple-500',
  },
]

export default function TechComparison() {
  return (
    <section
      id="tech-comparison"
      aria-labelledby="tech-heading"
      className="relative z-10 py-20 md:py-24 px-5 md:px-6 lg:px-12"
    >
      <div className="max-w-4xl mx-auto">
        <AnimatedSection>
          <header className="text-center mb-10 md:mb-14">
            <p className="text-[11px] md:text-xs font-medium uppercase tracking-[0.2em] text-purple-300/70 mb-3">
              Technologia
            </p>
            <h2
              id="tech-heading"
              className="text-3xl md:text-5xl font-light tracking-tight md:tracking-widest text-white mb-4 md:mb-6"
            >
              Dlaczego <GradientText className="font-medium">Next.js</GradientText>?
            </h2>
            <p className="text-sm md:text-xl font-light tracking-wide text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Standard używany przez{' '}
              <span className="text-white">Netflix, TikTok, Nike i Notion</span>.
            </p>
          </header>
        </AnimatedSection>

        <AnimatedSection>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-10 md:mb-12">
            {benefits.map((item, index) => {
              const Icon = item.icon
              return (
                <li
                  key={index}
                  className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 md:p-6"
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}
                    >
                      <Icon size={20} className="text-white" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-base md:text-lg font-medium text-white mb-1.5">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </AnimatedSection>

        <AnimatedSection>
          <div className="text-center">
            <a
              href="/nextjs"
              className="group inline-flex items-center justify-center gap-3 w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-4 min-h-[48px] rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm md:text-base font-medium tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:opacity-90"
            >
              <span>Sprawdź, dlaczego Next.js zmienia zasady gry</span>
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
