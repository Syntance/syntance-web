'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, ExternalLink } from 'lucide-react'
import SubpageScrollbar from '@/components/SubpageScrollbar'
import Footer from '@/components/sections/footer'
import { AdminPanelShowcase } from '@/components/sections/portfolio/admin-panel-showcase'
import {
  PerformanceBeforeAfter,
} from '@/components/sections/portfolio/performance-before-after'
import {
  getPortfolioTypeDotColor,
  type PortfolioCaseStudy,
} from '@/lib/portfolio-content'

export default function CaseStudyClient({ project }: { project: PortfolioCaseStudy }) {
  const dotColor = getPortfolioTypeDotColor(project.type)

  const sections = useMemo(() => {
    const items = [{ id: 'case-hero', label: 'Projekt' }]
    if (project.problemStatement) {
      items.push({ id: 'case-challenge', label: 'Wyzwanie' })
    }
    if (project.performance) {
      items.push({ id: 'case-performance', label: 'PageSpeed' })
    }
    if (project.adminGallery) {
      items.push({ id: 'case-admin', label: 'Panel' })
    }
    items.push({ id: 'case-details', label: 'Szczegóły' })
    items.push({ id: 'case-cta', label: 'Kontakt' })
    return items
  }, [project.adminGallery, project.performance, project.problemStatement])

  return (
    <div className="min-h-screen w-full" style={{ overflowX: 'clip' }}>
      <SubpageScrollbar sections={sections} />

      <section
        id="case-hero"
        aria-labelledby="case-heading"
        className="relative z-10 px-6 pb-16 pt-32 lg:px-12 lg:pb-20"
      >
        <div className="mx-auto max-w-6xl">
          <Link
            href="/portfolio"
            className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Wszystkie realizacje
          </Link>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-[11px] font-medium tracking-wide text-gray-200">
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: dotColor }} aria-hidden="true" />
                  {project.typeLabel}
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-neutral-500">
                  {project.domain}
                </span>
              </div>

              <h1 id="case-heading" className="glow-text text-3xl font-light tracking-wide text-white md:text-4xl lg:text-5xl">
                {project.name}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-400 md:text-lg">
                {project.description}
              </p>

              {project.rebuildContext ? (
                <p className="mt-4 max-w-2xl rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm leading-relaxed text-neutral-300">
                  {project.rebuildContext}
                </p>
              ) : null}

              {project.performance ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[oklch(0.78_0.16_145/0.35)] bg-[oklch(0.78_0.16_145/0.08)] px-3 py-1.5 text-sm font-medium text-[oklch(0.82_0.12_145)]">
                    Mobile {project.performance.after.mobile.metrics.performance}
                  </span>
                  <span className="rounded-full border border-[oklch(0.78_0.16_145/0.35)] bg-[oklch(0.78_0.16_145/0.08)] px-3 py-1.5 text-sm font-medium text-[oklch(0.82_0.12_145)]">
                    Desktop {project.performance.after.desktop.metrics.performance}
                  </span>
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                >
                  Otwórz {project.domain}
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
                <Link
                  href="/cennik"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                >
                  Wycena podobnego projektu
                </Link>
              </div>
            </div>

            <div className="relative aspect-[1200/630] overflow-hidden rounded-2xl border border-white/10">
              <Image
                src={project.previewImage}
                alt={project.previewImageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      {project.problemStatement ? (
        <section id="case-challenge" className="relative z-10 border-t border-white/5 px-6 py-14 lg:px-12">
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-purple-300/70">
              Wyzwanie
            </p>
            <p className="text-lg font-light leading-relaxed text-neutral-300 md:text-xl">
              {project.problemStatement}
            </p>
          </div>
        </section>
      ) : null}

      {project.performance ? (
        <section
          id="case-performance"
          className="relative z-10 border-t border-white/5 px-6 py-16 lg:px-12 lg:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <PerformanceBeforeAfter report={project.performance} />
          </div>
        </section>
      ) : null}

      {project.adminGallery ? (
        <section
          id="case-admin"
          className="relative z-10 border-t border-white/5 px-6 py-16 lg:px-12 lg:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <AdminPanelShowcase gallery={project.adminGallery} />
          </div>
        </section>
      ) : null}

      <section
        id="case-details"
        className="relative z-10 border-t border-white/5 px-6 py-16 lg:px-12 lg:py-20"
      >
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div>
            <h2 className="mb-5 text-xl font-light tracking-wide text-white md:text-2xl">Co wyszło</h2>
            <ul className="space-y-3">
              {project.highlights.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-neutral-400 md:text-base">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-purple-400/80" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-5 text-xl font-light tracking-wide text-white md:text-2xl">Stack</h2>
            <div className="flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium tracking-wide text-neutral-400"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="case-cta"
        className="relative z-10 border-t border-white/5 px-6 py-20 lg:px-12 lg:py-28"
      >
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.02] px-8 py-12 text-center md:px-12">
          <h2 className="mb-4 text-3xl font-light tracking-wide text-white">Chcesz podobny wynik?</h2>
          <p className="mb-8 text-sm leading-relaxed text-gray-400 md:text-base">
            PageSpeed 90+ to u nas standard, nie upsell. Opowiedz o projekcie — wrócimy z planem i wyceną w 24 h.
          </p>
          <Link
            href="/kontakt"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-medium tracking-wider text-gray-900 transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          >
            Porozmawiajmy o projekcie
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  )
}
