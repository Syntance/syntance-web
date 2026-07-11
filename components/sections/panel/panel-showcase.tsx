'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import PanelMock from '@/components/sections/panel/panel-mock'
import { SHOWCASE_STEPS, type PanelViewId } from '@/components/sections/panel/panel-content'

export default function PanelShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [detailsVisible, setDetailsVisible] = useState(false)
  const [reducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const desktopSequenceRef = useRef<HTMLDivElement>(null)
  const stepRefs = useRef<(HTMLElement | null)[]>([])
  const { scrollYProgress } = useScroll({
    target: desktopSequenceRef,
    offset: ['start start', 'end end'],
  })
  const panelX = useTransform(scrollYProgress, [0.04, 0.18], ['0%', '-40%'])
  const panelScale = useTransform(scrollYProgress, [0.04, 0.18], [1.28, 1])
  const panelY = useTransform(scrollYProgress, [0.04, 0.18], ['8%', '0%'])

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    setDetailsVisible(progress >= 0.14)
  })

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
      aria-label="Zobacz panel w akcji"
      className="relative z-10 scroll-mt-24 px-5 pb-20 pt-20 md:px-6 md:pb-28 md:pt-28 lg:px-12 lg:pt-0"
    >
      <div className="mx-auto max-w-6xl">
          <header
            className={`mx-auto mb-12 max-w-3xl text-center md:mb-16 ${
              reducedMotion ? '' : 'lg:hidden'
            }`}
          >
            <h2
              id="panel-showcase-heading-mobile"
              className="mb-4 text-3xl font-light tracking-tight text-white md:text-5xl md:tracking-widest"
            >
              Zobacz panel w akcji
            </h2>
            <p className="text-sm leading-relaxed text-gray-400 md:text-lg">
              Przewijaj — pokażemy każdą część panelu po kolei.
            </p>
          </header>

        {!reducedMotion && (
          <div
            ref={desktopSequenceRef}
            className="relative hidden min-h-[700vh] lg:block"
          >
            <div className="sticky top-0 h-screen overflow-hidden">
              <header
                className={`pointer-events-none absolute inset-x-0 top-[11vh] z-20 mx-auto max-w-3xl text-center transition-all duration-700 ${
                  detailsVisible ? '-translate-y-20 opacity-0' : 'translate-y-0 opacity-100'
                }`}
              >
                <h2
                  id="panel-showcase-heading"
                  className="mb-4 text-5xl font-light tracking-widest text-white"
                >
                  Zobacz panel w akcji
                </h2>
                <p className="text-lg leading-relaxed text-gray-400">
                  Przewijaj — pokażemy każdą część panelu po kolei.
                </p>
              </header>

              <div className="absolute left-1/2 top-1/2 w-[46%] -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  style={{ x: panelX, y: panelY, scale: panelScale }}
                  className="origin-center will-change-transform"
                >
                  <PanelMock view={activeView} animate />
                </motion.div>
              </div>

            </div>

            <div className="absolute inset-x-0 top-[120vh]">
              {SHOWCASE_STEPS.map((step, index) => (
                <article
                  key={step.id}
                  ref={(el) => {
                    stepRefs.current[index] = el
                  }}
                  className="ml-[62%] flex h-[70vh] w-[34%] items-center"
                  aria-current={activeIndex === index ? 'step' : undefined}
                >
                  <div
                    className={`max-w-md transition-opacity duration-500 ${
                      detailsVisible && activeIndex === index
                        ? 'opacity-100'
                        : 'opacity-35'
                    }`}
                  >
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-purple-300/70">
                      {String(index + 1).padStart(2, '0')}
                    </p>
                    <h3 className="mb-3 text-2xl font-light text-white">{step.title}</h3>
                    <p className="leading-relaxed text-gray-400">{step.description}</p>
                  </div>
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
    </section>
  )
}
