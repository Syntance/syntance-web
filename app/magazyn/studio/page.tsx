import Link from 'next/link'
import { hasDb } from '@/lib/db'
import { getStudioStats, listAudit, AuditListParams } from '@/lib/studio/admin-queries'
import { Card, StatCard, EmptyState } from '@/components/magazyn/kit'
import { fmtDateTime } from '@/components/magazyn/format'
import { PageHeader } from '@/components/magazyn/ui'

export const dynamic = 'force-dynamic'

const QUICK = [
  { href: '/magazyn/studio/licencje', title: 'Licencje', desc: 'Wystaw, zmień warunki, odbierz urządzenie, unieważnij.' },
  { href: '/magazyn/studio/klienci', title: 'Klienci', desc: 'Profile, blokady i dane RODO.' },
  { href: '/magazyn/studio/kody', title: 'Kody promocyjne', desc: 'Rabaty, darmowe licencje, wydłużone triale.' },
  { href: '/magazyn/studio/audyt', title: 'Dziennik audytu', desc: 'Kto, co i kiedy.' },
]

export default async function StudioDashboard() {
  if (!hasDb()) {
    return (
      <div className="space-y-5">
        <PageHeader title="Syntance Studio" />
        <EmptyState title="Brak połączenia z bazą" hint="Ustaw DATABASE_URL (Neon), aby zarządzać licencjami." />
      </div>
    )
  }
  const [stats, audit] = await Promise.all([getStudioStats('studio'), listAudit(AuditListParams.parse({ pageSize: 8 }))])
  return (
    <div className="space-y-6">
      <PageHeader title="Syntance Studio" description="Licencje, klienci i kody promocyjne aplikacji desktopowej." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Aktywne licencje" value={stats.activeLicenses} hint={`${stats.new30d} nowych w 30 dni`} href="/magazyn/studio/licencje?status=active" />
        <StatCard label="Klienci" value={stats.customers} hint={stats.blockedCustomers ? `${stats.blockedCustomers} zablokowanych` : 'brak blokad'} href="/magazyn/studio/klienci" />
        <StatCard label="Subskrypcje kończą się ≤ 14 dni" value={stats.expiring14d} tone={stats.expiring14d ? 'warn' : undefined} href="/magazyn/studio/licencje?plan=subscription&sort=expiresAt&dir=asc" />
        <StatCard label="Urządzenia aktywne (30 dni)" value={stats.activeDevices30d} hint={`${stats.activeCodes} aktywnych kodów`} href="/magazyn/studio/kody" />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Skróty">
        {QUICK.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-purple-400/40 hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
          >
            <h2 className="text-base font-medium">{q.title}</h2>
            <p className="mt-1 text-sm text-neutral-400">{q.desc}</p>
          </Link>
        ))}
      </section>

      <Card title="Ostatnia aktywność" actions={<Link href="/magazyn/studio/audyt" className="text-sm text-purple-300 underline-offset-2 hover:underline">Cały dziennik →</Link>}>
        {audit.rows.length === 0 ? (
          <EmptyState title="Brak zdarzeń" hint="Tu pojawią się aktywacje urządzeń, zmiany licencji i akcje z panelu." />
        ) : (
          <ul className="divide-y divide-white/5 text-sm">
            {audit.rows.map((a) => (
              <li key={a.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span>
                  <span className="font-mono text-xs">{a.action}</span> <span className="text-neutral-500">· {a.actor}</span>
                </span>
                <span className="text-neutral-400">{fmtDateTime(a.at.toISOString())}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
