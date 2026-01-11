'use client'

import { useEffect, useRef } from 'react'
import { PricingConfigurator } from '@/components/PricingConfigurator'
import { PricingData } from '@/sanity/queries/pricing'

interface Props {
  data: PricingData
}

export default function PricingConfiguratorSection({ data }: Props) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            section.classList.add('section-visible')
            observer.unobserve(section)
          }
        })
      },
      { threshold: 0.05, rootMargin: '50px' }
    )

    observer.observe(section)

    return () => {
      observer.unobserve(section)
    }
  }, [])

  return (
    <section 
      id="pricing-configurator"
      ref={sectionRef}
      className="relative z-10 py-24 px-6 lg:px-12 overflow-hidden opacity-0 translate-y-8 transition-all duration-1000"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light tracking-widest glow-text mb-6">
            Konfigurator wyceny
          </h2>
          <p className="text-lg font-light tracking-wide text-gray-400 max-w-2xl mx-auto">
            Wybierz elementy projektu i zobacz orientacyjną wycenę w czasie rzeczywistym.
            <br />
            <span className="text-gray-500">Finalna cena po szczegółowej rozmowie.</span>
          </p>
        </div>

        {/* Configurator */}
        <PricingConfigurator data={data} />
      </div>

      <style jsx>{`
        .section-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  )
}
