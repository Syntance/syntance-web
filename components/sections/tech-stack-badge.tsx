'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { StackBadgeRecord } from '@/lib/data/stack-badges'

type TechStackBadgeListProps = {
  badges: StackBadgeRecord[]
  className?: string
  ariaLabel?: string
}

export function TechStackBadgeList({
  badges,
  className = '',
  ariaLabel = 'Technologie, z których korzystamy',
}: TechStackBadgeListProps) {
  return (
    <ul className={`flex flex-wrap justify-center gap-2 ${className}`} aria-label={ariaLabel}>
      {badges.map((badge) => (
        <TechStackBadge key={badge.id} badge={badge} />
      ))}
    </ul>
  )
}

function TechStackBadge({ badge }: { badge: StackBadgeRecord }) {
  const [open, setOpen] = useState(false)
  const popupId = useId()
  const rootRef = useRef<HTMLLIElement>(null)
  const definition = badge.definition.trim()
  const hasDefinition = definition.length > 0

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }

    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        close()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open, close])

  return (
    <li ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => hasDefinition && setOpen((value) => !value)}
        disabled={!hasDefinition}
        aria-expanded={hasDefinition ? open : undefined}
        aria-controls={hasDefinition ? popupId : undefined}
        className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-gray-900/60 px-3.5 py-1.5 text-[11px] font-medium tracking-wide text-gray-200 md:text-xs ${
          hasDefinition
            ? 'cursor-pointer transition-colors hover:border-white/20 hover:bg-gray-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black'
            : 'cursor-default'
        }`}
      >
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: badge.dotColor }}
          aria-hidden="true"
        />
        {badge.name}
      </button>

      {open && hasDefinition ? (
        <div
          id={popupId}
          role="dialog"
          aria-label={`Definicja: ${badge.name}`}
          className="absolute left-1/2 top-[calc(100%+0.5rem)] z-50 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-white/10 bg-gray-950/95 p-3 text-left shadow-xl backdrop-blur-md sm:w-72"
        >
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-purple-300/80">
            {badge.name}
          </p>
          <p className="text-xs leading-relaxed text-gray-300">{definition}</p>
        </div>
      ) : null}
    </li>
  )
}
