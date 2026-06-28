'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import PanelMock from '@/components/sections/panel/panel-mock'
import { SHOWCASE_STEPS, type PanelViewId } from '@/components/sections/panel/panel-content'

function RevealOnScroll({
  children,
  className = '',
  delay = 0,
  reducedMotion = false,
}: {
  children: ReactNode
  className?: string
  delay?: number
  reducedMotion?: boolean
}) {
  const [isVisible, setIsVisible] = useState(reducedMotion)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reducedMotion) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.12, rootMargin: '-60px' },
    )

    const node = ref.current
    if (node) observer.observe(node)
    return () => observer.disconnect()
  }, [delay, reducedMotion])

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${reducedMotion ? 'opacity-100 translate-y-0 transition-none' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export default function PanelShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [reducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const stepRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    if (reducedMotion) return

    const observers: IntersectionObserver[] = []

    stepRefs.current.forEach((element, index) => {
      if (!element) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveIndex(index)
          }
        },
        { threshold: 0.5, rootMargin: '-20% 0px -35% 0px' },
      )

      observer.observe(element)
      observers.push(observer)
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [reducedMotion])

  const activeView: PanelViewId = SHOWCASE_STEPS[activeIndex]?.id ?? 'overview'

  return (
    <section
      id="panel-showcase"
      aria-labelledby="panel-showcase-heading"
      className="relative z-10 scroll-mt-24 px-5 pb-20 pt-32 md:px-6 md:pb-28 md:pt-44 lg:px-12"
    >
      <RevealOnScroll reducedMotion={reducedMotion}>
        <div className="mx-auto max-w-6xl">
          <header className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
            <h2
              id="panel-showcase-heading"
              className="mb-4 text-3xl font-light tracking-tight text-white md:text-5xl md:tracking-widest"
            >
              Zobacz panel w akcji
            </h2>
            <p className="text-sm leading-relaxed text-gray-400 md:text-lg">
              Przewijaj — pokażemy każdą część panelu po kolei.
            </p>
          </header>

        {!reducedMotion && (
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-12 xl:gap-16">
            <div className="relative">
              <div className="sticky top-28">
                <PanelMock view={activeView} animate />
              </div>
            </div>

            <div className="space-y-[55vh] pb-[30vh]">
              {SHOWCASE_STEPS.map((step, index) => (
                <article
                  key={step.id}
                  ref={(el) => {
                    stepRefs.current[index] = el
                  }}
                  className={`max-w-md transition-opacity duration-300 ease-out ${
                    activeIndex === index ? 'opacity-100' : 'opacity-40'
                  }`}
                  aria-current={activeIndex === index ? 'step' : undefined}
                >
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-purple-300/70 mb-2">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="text-2xl font-light text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        )}

        <div className={`space-y-10 ${reducedMotion ? '' : 'lg:hidden'}`}>
          {SHOWCASE_STEPS.map((step, index) => (
            <article key={step.id} className="max-w-xl mx-auto">
              <PanelMock view={step.id} compact className="mb-5" animate={false} />
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-purple-300/70 mb-2">
                {String(index + 1).padStart(2, '0')} · {step.title}
              </p>
              <p className="text-gray-400 leading-relaxed">{step.description}</p>
            </article>
          ))}
        </div>
        </div>
      </RevealOnScroll>
    </section>
  )
}
