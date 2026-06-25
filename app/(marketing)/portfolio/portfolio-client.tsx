'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, ExternalLink } from 'lucide-react'
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
      <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-white/20 hover:bg-white/[0.04]">
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block aspect-[1200/630] overflow-hidden border-b border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple-400"
          aria-label={`Podgląd strony ${project.name} — otwórz ${project.domain}`}
        >
          <Image
            src={project.previewImage}
            alt={project.previewImageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.01_260/0.85)] via-[oklch(0.12_0.01_260/0.15)] to-transparent"
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] font-medium tracking-wide text-gray-200 backdrop-blur-sm">
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: dotColor }}
                  aria-hidden="true"
                />
                {project.typeLabel}
              </span>
              <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] text-gray-400 backdrop-blur-sm">
                {project.domain}
              </span>
            </div>
            <h2 className="text-2xl font-light tracking-wide text-white md:text-3xl">
              {project.name}
            </h2>
          </div>
        </a>

        <div className="flex flex-1 flex-col p-6 md:p-8">
          <p className="mb-6 text-sm leading-relaxed text-gray-400 md:text-base">
            {project.description}
          </p>

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

          <div className="mt-auto">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-medium tracking-wide text-white transition hover:border-white/30 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              Otwórz {project.domain}
              <ExternalLink size={16} aria-hidden="true" />
            </a>
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
              href="/kontakt"
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
