'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { MAGAZYN_SECTIONS, isNavActive, sectionForPath, type MagazynSection } from '@/components/magazyn/nav-config'
import { LogoutButton } from '@/components/magazyn/logout-button'

/** Główne zakładki: wybór sekcji. Menu szczegółowe dotyczy tylko aktywnej sekcji. */
function SectionTabs({ active }: { active: MagazynSection['id'] }) {
  return (
    <nav aria-label="Sekcje Magazynu">
      <ul className="flex gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
        {MAGAZYN_SECTIONS.map((s) => {
          const on = s.id === active
          return (
            <li key={s.id} className="flex-1">
              <Link
                href={s.href}
                aria-current={on ? 'page' : undefined}
                className={`block rounded-full px-4 py-2 text-center text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400 ${
                  on ? 'bg-white text-black' : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {s.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function NavList({ section, pathname, onNavigate }: { section: MagazynSection; pathname: string; onNavigate?: () => void }) {
  return (
    <nav aria-label={`Menu: ${section.label}`}>
      <ul className="flex flex-col gap-0.5">
        {section.items.map((item) => {
          const active = isNavActive(pathname, item)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={`block rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-purple-400 ${
                  active ? 'bg-white/10 font-medium text-white' : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function MagazynShell({ email, children }: { email?: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const section = sectionForPath(pathname)
  const [open, setOpen] = useState(false)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="min-h-[calc(100dvh-100px)]">
      <a
        href="#magazyn-main"
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Przejdź do treści
      </a>
      <div className="mx-auto flex max-w-[90rem]">
        <aside className="hidden w-64 shrink-0 border-r border-white/10 lg:block">
          <div className="sticky top-[100px] flex h-[calc(100dvh-100px)] flex-col overflow-y-auto p-4">
            <Link href="/magazyn" className="mb-4 px-3 text-sm font-semibold tracking-wide text-white">
              Syntance · Magazyn
            </Link>
            <div className="mb-5">
              <SectionTabs active={section.id} />
            </div>
            <div className="flex-1">
              <NavList section={section} pathname={pathname} />
            </div>
            <div className="mt-6 space-y-2 border-t border-white/10 pt-4">
              {email ? <p className="truncate px-3 text-xs text-neutral-400">{email}</p> : null}
              <div className="px-3">
                <LogoutButton />
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-[100px] z-20 border-b border-white/10 bg-neutral-950/95 backdrop-blur lg:hidden">
            <div className="space-y-3 p-3">
              <SectionTabs active={section.id} />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 px-4 text-sm"
                  aria-expanded={open}
                  aria-controls={menuId}
                  onClick={() => setOpen((v) => !v)}
                >
                  {open ? <X className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
                  Menu: {section.label}
                </button>
                <LogoutButton />
              </div>
            </div>
            {open ? (
              <div id={menuId} className="max-h-[60dvh] overflow-y-auto border-t border-white/10 p-3">
                <NavList section={section} pathname={pathname} onNavigate={() => setOpen(false)} />
              </div>
            ) : null}
          </header>
          <main id="magazyn-main" tabIndex={-1} className="p-4 outline-none sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
