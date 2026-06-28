'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import SubpageScrollbar from '@/components/SubpageScrollbar'
import type { PanelRealization } from '@/lib/panel-realizations-content'

const scrollbarSections = [
  { id: 'realizacje-hero', label: 'Start' },
  { id: 'realizacje-gallery', label: 'Realizacje' },
  { id: 'realizacje-cta', label: 'Kontakt' },
]

function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.12, rootMargin: '-40px' },
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${className}`}
    >
      {children}
    </div>
  )
}

function RealizationBlock({
  item,
  delay = 0,
}: {
  item: PanelRealization
  delay?: number
}) {
  return (
    <AnimatedSection delay={delay}>
      <article className="border-b border-white/[0.06] pb-16 last:border-b-0 md:pb-20">
        <header className="mb-8 md:mb-10">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <h2 className="text-2xl font-light tracking-tight text-white md:text-3xl">
              {item.clientName}
            </h2>
            {item.projectUrl && (
              <a
                href={item.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm"
              >
                Strona klienta
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            )}
          </div>
          {item.description && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-400 md:text-base">
              {item.description}
            </p>
          )}
        </header>

        <ul className="grid gap-6 md:gap-8">
          {item.screenshots.map((shot) => (
            <li key={shot.src}>
              <figure className="overflow-hidden rounded-2xl border border-white/10 bg-gray-900/40">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 960px"
                    className="object-cover object-top"
                  />
                </div>
                {shot.caption && (
                  <figcaption className="border-t border-white/[0.06] px-4 py-3 text-xs text-gray-500 md:px-5 md:text-sm">
                    {shot.caption}
                  </figcaption>
                )}
              </figure>
            </li>
          ))}
        </ul>
      </article>
    </AnimatedSection>
  )
}

export default function PanelRealizationsClient({
  realizations,
}: {
  realizations: PanelRealization[]
}) {
  const hasItems = realizations.length > 0

  return (
    <div className="min-h-screen">
      <SubpageScrollbar sections={scrollbarSections} />

      <section
        id="realizacje-hero"
        aria-labelledby="realizacje-heading"
        className="relative z-10 px-5 pb-12 pt-28 md:px-6 md:pb-16 md:pt-36 lg:px-12"
      >
        <div className="mx-auto max-w-4xl">
          <AnimatedSection>
            <Link
              href="/panel"
              className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Panel sklepu Syntance
            </Link>

            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-purple-300/70">
              Realizacje panelu
            </p>
            <h1
              id="realizacje-heading"
              className="mb-4 text-3xl font-light leading-[1.12] tracking-tight text-white md:text-5xl"
            >
              Panel u prawdziwych klientów
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-gray-400 md:text-lg">
              Zrzuty ekranu z produkcyjnych wdrożeń — tak wygląda zarządzanie sklepem i treściami
              w panelu Syntance na co dzień.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section
        id="realizacje-gallery"
        aria-label="Galeria realizacji panelu"
        className="relative z-10 px-5 pb-20 md:px-6 md:pb-28 lg:px-12"
      >
        <div className="mx-auto max-w-4xl">
          {hasItems ? (
            <div className="space-y-16 md:space-y-20">
              {realizations.map((item, index) => (
                <RealizationBlock key={item.id} item={item} delay={index * 80} />
              ))}
            </div>
          ) : (
            <AnimatedSection>
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center md:px-10 md:py-16">
                <p className="mb-2 text-lg font-light text-gray-300">
                  Galeria w przygotowaniu
                </p>
                <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-500">
                  Wkrótce dodamy zrzuty panelu z wdrożeń u klientów. Tymczasem zobacz interaktywny
                  podgląd na stronie panelu.
                </p>
                <Link
                  href="/panel"
                  className="mt-8 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-medium text-gray-200 transition-colors hover:border-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  Dowiedz się więcej o panelu
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>

      <section
        id="realizacje-cta"
        aria-labelledby="realizacje-cta-heading"
        className="relative z-10 border-t border-white/[0.06] px-5 py-20 md:px-6 md:py-24 lg:px-12"
      >
        <div className="mx-auto max-w-2xl text-center">
          <AnimatedSection>
            <h2 id="realizacje-cta-heading" className="mb-4 text-2xl font-light text-white md:text-3xl">
              Chcesz taki panel w swoim sklepie?
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-gray-400 md:text-base">
              Porozmawiajmy o wdrożeniu — pokażemy demo i dopasujemy panel do Twojego procesu.
            </p>
            <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                href="/cennik"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-gray-900 transition-all hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Sprawdź cenę
              </Link>
              <Link
                href="/kontakt"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-light text-gray-300 transition-colors hover:border-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Porozmawiajmy
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
