import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/sections/footer'
import { formatPrice, getPublicStudioData, type PublicPlan, type PublicStudioData } from '@/lib/studio/public-site'

const canonical = 'https://syntance.com/syntance-studio'

const SHOTS = {
  edit: { src: '/images/studio/studio-edytuj.webp', alt: 'Syntance Studio: edycja tekstu w dokumencie PDF z panelem opcji czcionki i koloru' },
  comment: { src: '/images/studio/studio-komentuj.webp', alt: 'Syntance Studio: komentowanie dokumentu PDF — zakreślenia, notatki i rysunki' },
  pages: { src: '/images/studio/studio-strony.webp', alt: 'Syntance Studio: siatka stron dokumentu do przestawiania, obracania i usuwania' },
  protect: { src: '/images/studio/studio-ochrona.webp', alt: 'Syntance Studio: panel ochrony — podpis cyfrowy, hasło, redakcja i usuwanie ukrytej zawartości' },
} as const

const FACTS = [
  { title: 'Pliki zostają u Ciebie', text: 'Dokumenty otwierasz i edytujesz lokalnie — nie wysyłamy ich na żaden serwer.' },
  { title: 'Działa offline', text: 'Internet potrzebny tylko do aktywacji licencji i rzadkiego odświeżenia.' },
  { title: 'Free bez limitu czasu', text: 'Czytanie, wyszukiwanie, druk i komentarze zawsze za darmo. Reszta — 14 dni na próbę.' },
]

const ROWS = [
  {
    shot: SHOTS.comment,
    kicker: 'Czytaj i komentuj',
    title: 'Szybki podgląd i komentarze jak na papierze',
    points: ['Zakreślenia, podkreślenia, notatki, pieczątki i podpis odręczny', 'Wyszukiwanie, zakładki, miniatury i tryb nocny', 'Druk z własnym podglądem arkusza — taki sam na każdej drukarce'],
  },
  {
    shot: SHOTS.pages,
    kicker: 'Strony',
    title: 'Układaj dokument, jak chcesz',
    points: ['Przeciągaj, obracaj, duplikuj i usuwaj strony', 'Scalaj wiele plików w jeden i dziel jeden na części', 'Wstawiaj strony z PDF, obrazów i dokumentów Office'],
  },
  {
    shot: SHOTS.protect,
    kicker: 'Ochrona',
    title: 'Podpisz, zabezpiecz, zredaguj',
    points: ['Podpis cyfrowy i ochrona hasłem', 'Prawdziwa redakcja: tekst pod zaczernieniem znika z pliku', 'Wyszukiwanie PESEL, NIP, IBAN i e-maili z podglądem trafień'],
  },
]

const CAPABILITIES = [
  { title: 'Edycja treści', text: 'Poprawianie tekstu i akapitów, obrazy, kształty i formularze.' },
  { title: 'OCR i konwersja', text: 'Tekst ze skanów oraz Office, obrazy i HTML do PDF.' },
  { title: 'Przetwarzanie wsadowe', text: 'Te same kroki na wielu plikach naraz.' },
  { title: 'Porównywanie', text: 'Różnice między wersjami dokumentu słowo po słowie.' },
  { title: 'Czytanie na głos', text: 'Lokalne głosy Windows, bez wysyłania tekstu w sieć.' },
  { title: 'Print, Wektor, Obraz', text: 'Moduły do druku, grafiki wektorowej i obrazów — dokupujesz, czego używasz.' },
]

const FAQ = [
  { q: 'Na jakim systemie działa Syntance Studio?', a: 'Na Windows. Pobierasz instalator i instalujesz jak zwykły program; nie potrzebujesz konta.' },
  { q: 'Czy trzeba być online?', a: 'Nie. Pliki otwierasz i edytujesz lokalnie. Internet jest potrzebny tylko do jednorazowej aktywacji klucza i rzadkiego odświeżenia licencji.' },
  { q: 'Co dostaję za darmo?', a: 'Plan Free: czytanie, wyszukiwanie, druk i komentarze — bez limitu czasu. Po instalacji masz też 14 dni na wypróbowanie wszystkich funkcji.' },
  { q: 'Na ilu komputerach działa licencja?', a: 'Zależy od planu — standardowo na dwóch. Urządzenie możesz przenieść: odbieramy aktywację ze starego, aktywujesz na nowym.' },
  { q: 'Jak aktywować klucz licencji?', a: 'W programie otwórz okno „Licencja”, wklej klucz z e-maila i zatwierdź. Klucz wystawiamy ręcznie po zakupie.' },
]

const mb = (n: number): string => `${(n / 1024 / 1024).toFixed(0)} MB`

function planLine(p: PublicPlan): string {
  const period = p.billing === 'perpetual' ? `licencja wieczysta, aktualizacje przez ${p.updateMonths} mies.` : `subskrypcja, okres ${p.updateMonths} mies.`
  return `${period} · ${p.maxDevices} ${p.maxDevices === 1 ? 'urządzenie' : 'urządzenia'}`
}

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600'

/** Zrzut prawdziwej aplikacji w ramce okna (bez generowanych obrazów). */
function AppShot({ shot, priority = false, sizes }: { shot: { src: string; alt: string }; priority?: boolean; sizes: string }) {
  return (
    <figure className="overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_-20px_rgba(60,30,120,0.35)] ring-1 ring-black/10">
      <Image src={shot.src} alt={shot.alt} width={1456} height={908} priority={priority} sizes={sizes} className="h-auto w-full" />
    </figure>
  )
}

function DownloadButton({ release, dark = false }: { release: PublicStudioData['release']; dark?: boolean }) {
  const base = `inline-flex min-h-[52px] items-center justify-center rounded-full px-8 text-base font-medium transition-colors ${FOCUS}`
  if (release) {
    return (
      <a href={release.url} download className={`${base} ${dark ? 'bg-white text-neutral-900 hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-neutral-700'}`}>
        Pobierz na Windows
      </a>
    )
  }
  return (
    <Link href="/kontakt" className={`${base} ${dark ? 'bg-white text-neutral-900 hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-neutral-700'}`}>
      Powiadom mnie o premierze
    </Link>
  )
}

export default async function SyntanceStudioPage() {
  const { release, freePlan, plans, featureLabels } = await getPublicStudioData()
  const label = (k: string): string => featureLabels[k] ?? k
  const releaseNote = release ? `Wersja ${release.version} · ${mb(release.size)} · Windows · bez konta i karty` : 'Pobieranie pojawi się tutaj zaraz po publikacji pierwszej wersji.'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Strona główna', item: 'https://syntance.com' },
          { '@type': 'ListItem', position: 2, name: 'Syntance Studio', item: canonical },
        ],
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Syntance Studio',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Windows',
        url: canonical,
        image: 'https://syntance.com/images/studio/studio-edytuj.webp',
        description: 'Program do pracy z PDF: czytanie, edycja, redakcja, OCR i przygotowanie do druku. Działa offline.',
        ...(release ? { softwareVersion: release.version, downloadUrl: release.url, fileSize: `${Math.round(release.size / 1024 / 1024)}MB` } : {}),
        offers: [
          { '@type': 'Offer', price: '0', priceCurrency: 'PLN', description: 'Plan Free' },
          ...plans.map((p) => ({ '@type': 'Offer', name: p.name, price: ((p.priceAmount ?? 0) / 100).toFixed(2), priceCurrency: p.priceCurrency })),
        ],
        provider: { '@type': 'Organization', name: 'Syntance', url: 'https://syntance.com' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="relative z-10 bg-[#f7f5f2] text-neutral-900">
        <main>
          {/* Hero */}
          <section className="mx-auto max-w-6xl px-5 pb-16 pt-32 text-center md:px-6 md:pt-40">
            <p className="inline-flex items-center rounded-full border border-purple-600/20 bg-purple-600/10 px-4 py-1.5 text-sm font-medium text-purple-800">Windows · działa offline</p>
            <h1 className="text-neutral-900 mx-auto mt-6 max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">Cały PDF pod ręką. Na Twoim komputerze.</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600">
              Czytaj, komentuj, edytuj, scalaj i redaguj dokumenty — także zeskanowane. Podstawy są za darmo, a Twoje pliki nigdy nie opuszczają komputera.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <DownloadButton release={release} />
              <a href="#plany" className={`inline-flex min-h-[52px] items-center justify-center rounded-full border border-neutral-900/20 px-8 text-base text-neutral-900 transition-colors hover:bg-neutral-900/5 ${FOCUS}`}>
                Zobacz plany
              </a>
            </div>
            <p className="mt-4 text-sm text-neutral-500">{releaseNote}</p>
            <div className="mx-auto mt-14 max-w-5xl">
              <AppShot shot={SHOTS.edit} priority sizes="(min-width: 1024px) 1024px, 100vw" />
            </div>
          </section>

          {/* Fakty */}
          <section className="mx-auto max-w-6xl px-5 pb-24 md:px-6" aria-label="Najważniejsze cechy">
            <ul className="grid gap-4 md:grid-cols-3">
              {FACTS.map((f) => (
                <li key={f.title} className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
                  <h2 className="text-neutral-900 text-lg font-semibold">{f.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{f.text}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Wiersze: zrzut + opis */}
          <div className="space-y-24 pb-24">
            {ROWS.map((row, i) => (
              <section key={row.kicker} className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:px-6 lg:grid-cols-2 lg:gap-16">
                <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                  <p className="text-sm font-medium uppercase tracking-widest text-purple-700">{row.kicker}</p>
                  <h2 className="text-neutral-900 mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{row.title}</h2>
                  <ul className="mt-6 space-y-3 text-neutral-700">
                    {row.points.map((p) => (
                      <li key={p} className="flex gap-3">
                        <span aria-hidden className="mt-1 text-purple-700">✓</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                  <AppShot shot={row.shot} sizes="(min-width: 1024px) 560px, 100vw" />
                </div>
              </section>
            ))}
          </div>

          {/* Możliwości */}
          <section className="mx-auto max-w-6xl px-5 pb-24 md:px-6" aria-labelledby="wiecej">
            <h2 id="wiecej" className="text-neutral-900 text-3xl font-semibold tracking-tight md:text-4xl">I jeszcze więcej</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CAPABILITIES.map((c) => (
                <li key={c.title} className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
                  <h3 className="text-neutral-900 text-base font-semibold">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{c.text}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Plany */}
          <section id="plany" className="mx-auto max-w-6xl scroll-mt-28 px-5 pb-24 md:px-6" aria-labelledby="plany-naglowek">
            <h2 id="plany-naglowek" className="text-neutral-900 text-3xl font-semibold tracking-tight md:text-4xl">Plany</h2>
            <p className="mt-3 max-w-2xl text-neutral-600">Zacznij od Free, a gdy zechcesz więcej — wybierz plan z modułami, których potrzebujesz.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <article className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
                <h3 className="text-neutral-900 text-xl font-semibold">Free</h3>
                <p className="mt-1 text-3xl font-light">0 zł</p>
                <p className="mt-1 text-sm text-neutral-500">bez limitu czasu</p>
                <ul className="mt-5 space-y-2 text-sm text-neutral-700">
                  {(freePlan?.features.length ? freePlan.features.map(label) : ['Przeglądanie, wyszukiwanie i druk', 'Komentarze i adnotacje']).map((f) => (
                    <li key={f}>✓ {f}</li>
                  ))}
                </ul>
              </article>
              {plans.map((p) => (
                <article key={p.slug} className="flex flex-col rounded-2xl bg-white p-6 ring-2 ring-purple-600/40">
                  <h3 className="text-neutral-900 text-xl font-semibold">{p.name}</h3>
                  <p className="mt-1 text-3xl font-light">{formatPrice(p.priceAmount ?? 0, p.priceCurrency ?? 'PLN')}</p>
                  <p className="mt-1 text-sm text-neutral-500">{planLine(p)}</p>
                  {p.description ? <p className="mt-3 text-sm text-neutral-600">{p.description}</p> : null}
                  <ul className="mt-5 flex-1 space-y-2 text-sm text-neutral-700">
                    {p.features.map((f) => (
                      <li key={f}>✓ {label(f)}</li>
                    ))}
                  </ul>
                  <Link href="/kontakt" className={`mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full border border-neutral-900/20 px-6 text-sm transition-colors hover:bg-neutral-900/5 ${FOCUS}`}>
                    Zapytaj o licencję
                  </Link>
                </article>
              ))}
            </div>
            <p className="mt-6 text-sm text-neutral-500">
              {plans.length === 0 ? 'Plany płatne ogłosimy wkrótce. Do tego czasu możesz korzystać z Free i 14-dniowego okresu próbnego.' : 'Zakup online uruchamiamy wkrótce — do tego czasu napisz do nas, a wystawimy licencję i wyślemy klucz e-mailem.'}
            </p>
          </section>

          {/* Pobieranie */}
          <section className="mx-auto max-w-6xl px-5 pb-24 md:px-6" aria-labelledby="pobierz">
            <div className="rounded-3xl bg-neutral-900 p-8 text-white md:p-12">
              <h2 id="pobierz" className="text-white text-3xl font-semibold tracking-tight md:text-4xl">Pobierz Syntance Studio</h2>
              <p className="mt-3 max-w-xl text-neutral-300">Zainstaluj w minutę. Bez konta, bez karty — plan Free działa od razu, a przez 14 dni masz dostęp do wszystkich funkcji.</p>
              {release ? (
                <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
                  <div><dt className="text-neutral-400">Wersja</dt><dd className="font-mono">{release.version}</dd></div>
                  <div><dt className="text-neutral-400">Rozmiar</dt><dd>{mb(release.size)}</dd></div>
                  <div><dt className="text-neutral-400">System</dt><dd>Windows</dd></div>
                </dl>
              ) : null}
              {release?.notesPl ? <p className="mt-4 text-sm text-neutral-300">Co nowego: {release.notesPl}</p> : null}
              <div className="mt-8">
                <DownloadButton release={release} dark />
              </div>
              {release ? <p className="mt-5 break-all font-mono text-xs text-neutral-500">SHA-256: {release.sha256}</p> : <p className="mt-5 text-sm text-neutral-400">Pobieranie pojawi się tutaj zaraz po publikacji pierwszej wersji.</p>}
            </div>
          </section>

          {/* FAQ */}
          <section className="mx-auto max-w-3xl px-5 pb-28 md:px-6" aria-labelledby="faq">
            <h2 id="faq" className="text-neutral-900 text-3xl font-semibold tracking-tight md:text-4xl">Najczęstsze pytania</h2>
            <div className="mt-8 divide-y divide-neutral-900/10 border-y border-neutral-900/10">
              {FAQ.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className={`flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 text-base font-medium ${FOCUS}`}>
                    {f.q}
                    <span aria-hidden className="text-neutral-500 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </>
  )
}
