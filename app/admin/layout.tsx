import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE_NAME, verifySession } from '@/lib/admin-auth'
import { LogoutButton } from './_components/logout-button'

export const metadata: Metadata = {
  title: 'Panel Syntance',
  robots: { index: false, follow: false, nocache: true },
}

export const dynamic = 'force-dynamic'

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/rezerwacje', label: 'Rezerwacje' },
  { href: '/admin/blokady', label: 'Blokady czasu' },
  { href: '/admin/regulamin', label: 'Reguły' },
  { href: '/admin/linki', label: 'Linki' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies()
  const session = await verifySession(jar.get(ADMIN_COOKIE_NAME)?.value)
  const isLoggedIn = Boolean(session)

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      {isLoggedIn && (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
            <Link href="/admin" className="font-medium tracking-wide text-white">
              Syntance · Panel
            </Link>
            <nav className="hidden gap-1 md:flex">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-xs text-neutral-500 md:inline">{session?.email}</span>
              <LogoutButton />
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-white/5 px-6 py-2 md:hidden">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
      )}
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  )
}
