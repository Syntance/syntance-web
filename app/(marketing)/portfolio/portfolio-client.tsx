'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, ExternalLink } from 'lucide-react'
import StickyCtaFloat from '@/components/StickyCtaFloat'
import SubpageScrollbar from '@/components/SubpageScrollbar'
import {
  getPortfolioTypeDotColor,
  type PortfolioCaseStudy,
} from '@/lib/portfolio-content'

const scrollbarSections = [
  { id: 'projects', label: 'Realizacje' },
  { id: 'portfolio-cta', label: 'Kontakt' },
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

function ProjectCard({
  project,
  delay = 0,
}: {
  project: PortfolioCaseStudy
  delay?: number
}) {
  const dotColor = getPortfolioTypeDotColor(project.type)

  return (
    <AnimatedSection delay={delay}>
      <article className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-white/20 hover:bg-white/[0.04]">
        <div
          className="relative flex min-h-[220px] items-end overflow-hidden border-b border-white/10 p-8"
          style={{
            background:
              project.type === 'ecommerce'
                ? 'radial-gradient(circle at top right, oklch(0.28 0.08 162 / 0.45), transparent 55%), linear-gradient(180deg, oklch(0.16 0.02 260), oklch(0.12 0.01 260))'
                : 'radial-gradient(circle at top right, oklch(0.32 0.1 280 / 0.4), transparent 55%), linear-gradient(180deg, oklch(0.16 0.02 280), oklch(0.12 0.01 260))',
          }}
        >
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl" />
          </div>

          <div className="relative z-10 w-full">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-medium tracking-wide text-gray-300">
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: dotColor }}
                  aria-hidden="true"
                />
                {project.typeLabel}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-gray-500">
                {project.domain}
              </span>
            </div>

            <h2 className="text-2xl font-light tracking-wide text-white md:text-3xl">
              {project.name}
            </h2>
          </div>
        </div>

        <div className="flex h-full flex-col p-8">
          <p className="mb-6 text-sm leading-relaxed text-gray-400 md:text-base">
            {project.description}
          </p>

          <ul className="mb-6 space-y-2">
            {project.highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-start gap-2 text-sm text-gray-300"
              >
                <span
                  className="mt-2 size-1 shrink-0 rounded-full bg-purple-400/80"
                  aria-hidden="true"
                />
                {highlight}
              </li>
            ))}
          </ul>

          <div className="mb-8 flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium tracking-wide text-gray-400"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-medium tracking-wide text-white transition hover:border-white/30 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              Otwórz {project.domain}
              <ExternalLink size={16} aria-hidden="true" />
            </a>
            <Link
              href="/porozmawiajmy"
              className="inline-flex min-h-11 items-center justify-center gap-2 text-sm text-gray-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full px-2"
            >
              Podobny projekt?
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </article>
    </AnimatedSection>
  )
}

export default function PortfolioPageClient({
  projects,
}: {
  projects: PortfolioCaseStudy[]
}) {
  return (
    <div className="min-h-screen w-full" style={{ overflowX: 'clip' }}>
      <SubpageScrollbar sections={scrollbarSections} />

      <section
        id="projects"
        aria-labelledby="portfolio-projects-heading"
        className="relative z-10 px-6 pb-20 pt-32 lg:px-12 lg:pb-28"
      >
        <div className="mx-auto max-w-6xl">
          <header className="mb-10 text-center md:mb-12">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-purple-300/70">
              Portfolio
            </p>
            <h1
              id="portfolio-projects-heading"
              className="glow-text text-3xl font-light tracking-wide text-white md:text-4xl lg:text-5xl"
            >
              Wybrane projekty
            </h1>
          </header>

          <ul className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {projects.map((project, index) => (
              <li key={project.id}>
                <ProjectCard project={project} delay={index * 120} />
              </li>
            ))}
          </ul>

          <div className="sr-only">
            <StickyCtaFloat heroId="projects" hideSectionId="portfolio-cta" />
          </div>
        </div>
      </section>

      <section
        id="portfolio-cta"
        className="relative z-10 border-t border-white/5 px-6 py-20 lg:px-12 lg:py-28"
      >
        <AnimatedSection>
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.02] px-8 py-12 text-center md:px-12">
            <h2 className="mb-4 text-3xl font-light tracking-wide text-white">
              Chcesz podobny efekt?
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-gray-400 md:text-base">
              Opowiedz o projekcie — w 24 godziny wrócimy z wyceną i planem
              wdrożenia dopasowanym do Twojego celu biznesowego.
            </p>
            <Link
              href="/porozmawiajmy"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-medium tracking-wider text-gray-900 transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              Porozmawiajmy o projekcie
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </AnimatedSection>
      </section>
    </div>
  )
}
