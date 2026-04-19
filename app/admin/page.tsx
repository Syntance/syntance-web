import Link from 'next/link'
import { listBookings, listBlocks, countBookingsSince } from '@/lib/sanity/booking'
import { Calendar, Clock, ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pl-PL', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminDashboard() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [upcoming, blocks, count30d, count7d] = await Promise.all([
    listBookings({ from: now.toISOString(), limit: 5, status: 'confirmed' }),
    listBlocks(5),
    countBookingsSince(thirtyDaysAgo.toISOString()),
    countBookingsSince(sevenDaysAgo.toISOString()),
  ])

  const stats = [
    { label: 'Rezerwacje · 7 dni', value: count7d },
    { label: 'Rezerwacje · 30 dni', value: count30d },
    { label: 'Nadchodzące', value: upcoming.length },
    { label: 'Aktywne blokady', value: blocks.filter((b) => new Date(b.endAt) > now).length },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-medium">Witaj, Kamil 👋</h1>
        <p className="mt-1 text-neutral-400">Przegląd tego, co dzieje się na stronie.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="text-xs uppercase tracking-wider text-neutral-500">{s.label}</div>
            <div className="mt-2 text-3xl font-medium">{s.value}</div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Najbliższe rezerwacje</h2>
          <Link href="/admin/rezerwacje" className="text-sm text-purple-300 hover:text-purple-200">
            Zobacz wszystkie →
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-neutral-500">Brak nadchodzących rezerwacji.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {upcoming.map((b) => (
              <li key={b._id} className="flex flex-col gap-1 py-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-purple-400" />
                    <span className="font-medium">{formatDateTime(b.startAt)}</span>
                    <Clock className="ml-2 h-4 w-4 text-purple-400" />
                    <span>
                      {new Date(b.startAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                      –
                      {new Date(b.endAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-neutral-300">
                    {b.name} · <a href={`mailto:${b.email}`} className="text-purple-300 hover:underline">{b.email}</a>
                    {b.company ? <span className="text-neutral-500"> · {b.company}</span> : null}
                  </div>
                  {b.topic && <div className="mt-1 text-xs text-neutral-500 line-clamp-1">{b.topic}</div>}
                </div>
                {b.meetLink && (
                  <a
                    href={b.meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-200 hover:bg-white/10"
                  >
                    Meet <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="mb-3 text-lg font-medium">Szybkie akcje</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/blokady"
              className="rounded-full border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
            >
              Zablokuj czas
            </Link>
            <Link
              href="/admin/regulamin"
              className="rounded-full border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
            >
              Zmień reguły
            </Link>
            <Link
              href="/porozmawiajmy"
              target="_blank"
              className="rounded-full border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
            >
              Podgląd /porozmawiajmy ↗
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="mb-3 text-lg font-medium">Status integracji</h2>
          <ul className="space-y-1 text-sm text-neutral-300">
            <li>
              <span className="text-neutral-500">Google Calendar:</span>{' '}
              {process.env.GOOGLE_CLIENT_EMAIL ? '✅ skonfigurowany' : '⚠ brak credentiali'}
            </li>
            <li>
              <span className="text-neutral-500">Impersonation (Workspace):</span>{' '}
              {process.env.GOOGLE_CALENDAR_USER ? `✅ ${process.env.GOOGLE_CALENDAR_USER}` : '⚠ brak GOOGLE_CALENDAR_USER'}
            </li>
            <li>
              <span className="text-neutral-500">Resend (maile):</span>{' '}
              {process.env.RESEND_API_KEY ? '✅' : '⚠ brak'}
            </li>
            <li>
              <span className="text-neutral-500">Sanity (zapis):</span>{' '}
              {process.env.SANITY_API_WRITE_TOKEN ? '✅' : '⚠ brak tokena zapisu'}
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}
