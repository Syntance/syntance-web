import type { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/sections/footer'
import { getLatestAnyRelease } from '@/lib/studio/releases'

/** Ukryta strona testowa: najnowsze wgrane wydanie (także nieopublikowane). Poza sitemapą i robots, noindex. */
export const metadata: Metadata = {
  title: 'Pobieranie (wersja testowa) — Syntance Studio',
  robots: { index: false, follow: false, nocache: true },
}

export const dynamic = 'force-dynamic'

const mb = (n: number): string => `${(n / 1024 / 1024).toFixed(0)} MB`
const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600'

export default async function TestDownloadPage() {
  const release = await getLatestAnyRelease().catch(() => null)
  return (
    <>
      <div className="relative z-10 bg-[#f7f5f2] text-neutral-900">
        <main className="mx-auto max-w-2xl px-5 pb-28 pt-36 md:px-6">
          <p className="inline-flex rounded-full border border-amber-600/30 bg-amber-500/15 px-4 py-1.5 text-sm font-medium text-amber-900">Wersja testowa</p>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-neutral-900 md:text-5xl">Pobierz Syntance Studio</h1>
          <p className="mt-4 text-neutral-600">Ta strona jest dla testerów. To najnowsza wgrana wersja programu — może zawierać błędy i nie jest jeszcze ogłoszona publicznie.</p>

          {release ? (
            <div className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-black/5">
              <dl className="grid gap-3 text-sm sm:grid-cols-3">
                <div><dt className="text-neutral-500">Wersja</dt><dd className="font-mono">{release.version}</dd></div>
                <div><dt className="text-neutral-500">Rozmiar</dt><dd>{mb(release.size)}</dd></div>
                <div><dt className="text-neutral-500">Kanał</dt><dd>{release.channel}{release.published ? '' : ' · nieopublikowana'}</dd></div>
              </dl>
              {release.notesPl ? <p className="mt-4 text-sm text-neutral-600">Co nowego: {release.notesPl}</p> : null}
              <a href={release.url} download className={`mt-6 inline-flex min-h-[52px] items-center justify-center rounded-full bg-neutral-900 px-8 text-base font-medium text-white transition-colors hover:bg-neutral-700 ${FOCUS}`}>
                Pobierz na Windows
              </a>
              <p className="mt-4 break-all font-mono text-xs text-neutral-500">SHA-256: {release.sha256}</p>
            </div>
          ) : (
            <p className="mt-8 rounded-2xl bg-white p-6 text-neutral-700 ring-1 ring-black/5">Nie wgrano jeszcze żadnej wersji. Wgraj instalator w panelu (Magazyn → Syntance Studio → Wydania), a pojawi się tu od razu — bez publikowania.</p>
          )}

          <section className="mt-10" aria-labelledby="instalacja">
            <h2 id="instalacja" className="text-xl font-semibold text-neutral-900">Instalacja</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-neutral-700">
              <li>Uruchom pobrany plik. Windows może ostrzec o nieznanym wydawcy (wersja testowa jest niepodpisana) — wybierz „Więcej informacji” → „Uruchom mimo to”.</li>
              <li>Po instalacji program działa od razu w planie Free, a przez 14 dni ma wszystkie funkcje.</li>
              <li>Klucz licencji (jeśli go masz) wpiszesz w oknie „Licencja”.</li>
            </ol>
            <p className="mt-6 text-sm text-neutral-600">Problem lub uwaga? <Link href="/kontakt" className="underline underline-offset-2">Napisz do nas</Link>.</p>
          </section>
        </main>
      </div>
      <Footer />
    </>
  )
}
