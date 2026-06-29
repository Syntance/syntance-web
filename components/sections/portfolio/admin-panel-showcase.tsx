'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { AdminPanelScreenshot, PortfolioAdminGallery } from '@/lib/portfolio-admin-gallery'

function AdminPanelPlaceholder({
  brand,
  caption,
}: {
  brand: string
  caption?: string
}) {
  return (
    <div className="flex aspect-[16/10] w-full flex-col bg-[oklch(0.14_0.012_260)]">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <span className="size-2 rounded-full bg-[oklch(0.72_0.14_250)]" aria-hidden="true" />
        <span className="text-xs font-medium tracking-wide text-neutral-300">{brand}</span>
        {caption ? (
          <span className="ml-auto text-[11px] text-neutral-500">{caption}</span>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-44 shrink-0 border-r border-white/10 bg-black/20 p-4 sm:block">
          <div className="space-y-2">
            {['Produkty', 'Zamówienia', 'Treści', 'Ustawienia'].map((item, index) => (
              <div
                key={item}
                className={`h-2 rounded-full ${index === 0 ? 'w-24 bg-white/20' : 'w-20 bg-white/[0.08]'}`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="grid w-full max-w-md grid-cols-2 gap-2 opacity-40" aria-hidden="true">
            <div className="h-16 rounded-xl border border-dashed border-white/15 bg-white/[0.02]" />
            <div className="h-16 rounded-xl border border-dashed border-white/15 bg-white/[0.02]" />
            <div className="col-span-2 h-24 rounded-xl border border-dashed border-white/15 bg-white/[0.02]" />
          </div>
          <p className="text-sm text-neutral-400">Zrzut panelu Lumine Concept wkrótce</p>
        </div>
      </div>
    </div>
  )
}

function AdminPanelImage({ shot }: { shot: AdminPanelScreenshot }) {
  if (shot.placeholder || !shot.src) {
    return <AdminPanelPlaceholder brand="Lumine Concept" caption={shot.caption} />
  }

  return (
    <Image
      src={shot.src}
      alt={shot.alt}
      fill
      sizes="(max-width: 1024px) 100vw, 960px"
      className="object-cover object-top"
    />
  )
}

export function AdminPanelShowcase({ gallery }: { gallery: PortfolioAdminGallery }) {
  const [activeGroupId, setActiveGroupId] = useState(gallery.groups[0]?.id ?? '')
  const activeGroup = gallery.groups.find((g) => g.id === activeGroupId) ?? gallery.groups[0]
  const [activeShotIndex, setActiveShotIndex] = useState(0)

  if (!activeGroup || activeGroup.screenshots.length === 0) return null

  const activeShot =
    activeGroup.screenshots[activeShotIndex] ?? activeGroup.screenshots[0]

  function selectGroup(groupId: string) {
    setActiveGroupId(groupId)
    setActiveShotIndex(0)
  }

  return (
    <section aria-labelledby="admin-panel-heading" className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-purple-300/70">
            Panel administracyjny
          </p>
          <h2 id="admin-panel-heading" className="text-2xl font-light tracking-wide text-white md:text-3xl">
            Panel administracyjny Lumine
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">{gallery.intro}</p>
        </div>

        {gallery.groups.length > 1 ? (
          <div
            className="inline-flex gap-1 rounded-full border border-white/10 bg-white/[0.02] p-1"
            role="tablist"
            aria-label="Moduł panelu"
          >
            {gallery.groups.map((group) => (
              <button
                key={group.id}
                type="button"
                role="tab"
                aria-selected={activeGroupId === group.id}
                onClick={() => selectGroup(group.id)}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                  activeGroupId === group.id ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <p className="max-w-2xl text-sm leading-relaxed text-neutral-500">{activeGroup.description}</p>

      {gallery.highlights && gallery.highlights.length > 0 ? (
        <ul className="grid gap-2 sm:grid-cols-2">
          {gallery.highlights.map((item) => (
            <li key={item} className="flex gap-2 text-sm leading-relaxed text-neutral-400">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-purple-400/80" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      <figure className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        {activeShot.caption ? (
          <div className="border-b border-white/10 px-4 py-2 text-xs text-neutral-500">{activeShot.caption}</div>
        ) : null}
        <div className="relative aspect-[16/10] w-full bg-neutral-950">
          <AdminPanelImage shot={activeShot} />
        </div>
        <figcaption className="sr-only">{activeShot.alt}</figcaption>
      </figure>

      {activeGroup.screenshots.length > 1 ? (
        <ul
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label={`Zrzuty — ${activeGroup.label}`}
        >
          {activeGroup.screenshots.map((shot, index) => (
            <li key={shot.caption ?? shot.alt}>
              <button
                type="button"
                role="tab"
                aria-selected={activeShotIndex === index}
                onClick={() => setActiveShotIndex(index)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  activeShotIndex === index
                    ? 'border-white/25 bg-white/10 text-white'
                    : 'border-white/10 text-neutral-500 hover:border-white/20 hover:text-neutral-300'
                }`}
              >
                {shot.caption ?? `Widok ${index + 1}`}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
