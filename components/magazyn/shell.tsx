'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MAGAZYN_NAV } from '@/components/magazyn/nav-config'
import { LogoutButton } from '@/components/magazyn/logout-button'

export function MagazynShell({
  email,
  children,
}: {
  email?: string
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden w-56 shrink-0 border-r border-white/10 md:block">
          <div className="sticky top-0 flex h-dvh flex-col p-4">
            <Link href="/magazyn" className="mb-6 px-2 text-sm font-semibold tracking-wide text-white">
              Syntance · Magazyn
            </Link>
            <nav className="flex flex-1 flex-col gap-1">
              {MAGAZYN_NAV.map((item) => {
                const active = pathname === item.href || (item.href !== '/magazyn' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                      active ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
              {email ? <p className="truncate px-2 text-xs text-neutral-500">{email}</p> : null}
              <LogoutButton />
            </div>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="border-b border-white/10 p-4 md:hidden">
            <div className="mb-3 flex items-center justify-between">
              <Link href="/magazyn" className="font-medium">
                Magazyn
              </Link>
              <LogoutButton />
            </div>
            <nav className="flex gap-2 overflow-x-auto pb-1 text-xs">
              {MAGAZYN_NAV.map((item) => (
                <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-full border border-white/10 px-3 py-1">
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
