import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE_NAME, verifySession } from '@/lib/admin-auth'
import { MagazynShell } from '@/components/magazyn/shell'

export const metadata: Metadata = {
  title: 'Magazyn — Syntance',
  robots: { index: false, follow: false, nocache: true },
}

export const dynamic = 'force-dynamic'

export default async function MagazynLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies()
  const session = await verifySession(jar.get(ADMIN_COOKIE_NAME)?.value)

  if (!session) {
    return <>{children}</>
  }

  return <MagazynShell email={session.email}>{children}</MagazynShell>
}
