import type { Metadata } from 'next'
import { getAdminSession } from '@/lib/admin-auth'
import { MagazynShell } from '@/components/magazyn/shell'

export const metadata: Metadata = {
  title: 'Syntance Shop',
  robots: { index: false, follow: false, nocache: true },
}

export const dynamic = 'force-dynamic'

export default async function MagazynLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()

  return (
    <div className="min-h-dvh bg-neutral-950 pt-[100px] text-neutral-100">
      {session ? <MagazynShell email={session.email}>{children}</MagazynShell> : children}
    </div>
  )
}
