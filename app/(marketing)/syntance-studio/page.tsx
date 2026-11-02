import Link from 'next/link'
import Footer from '@/components/sections/footer'
import { formatPrice, getPublicStudioData, type PublicPlan } from '@/lib/studio/public-site'

const canonical = 'https://syntance.com/syntance-studio'

const CAPABILITIES = [
  { title: 'Czytanie i komentarze', text: 'Szybki podgląd, wyszukiwanie, zakładki, zakreślenia, notatki, pieczątki i podpis odręczny. Druk z własnym podglądem arkusza.' },
  { title: 'Edycja treści', text: 'Poprawianie tekstu i akapitów, wstawianie obrazów i kształtów, formularze, strony: obracanie, przestawianie, scalanie i dzielenie dokumentów.' },
  { title: 'Redakcja danych wrażliwych', text: 'Prawdziwe usuwanie tekstu i obrazów pod zaczernieniem. Wyszukiwanie PESEL, NIP, IBAN, kart i e-maili z podglądem trafień.' },
  { title: 'OCR i konwersja', text: 'Rozpoznawanie tekstu ze skanów, zamiana dokumentów Office i obrazów na PDF, przetwarzanie wielu plików naraz.' },
  { title: 'Porównywanie i czytanie na głos', text: 'Różnice między wersjami dokumentu słowo po słowie oraz lokalne głosy systemu Windows — bez wysyłania tekstu w sieć.' },
  { title: 'Print, Wektor, Obraz', text: 'Dodatkowe moduły: przygotowanie do druku, praca z grafiką wektorową i edycja obrazów — dokupujesz tylko to, czego używasz.' },
]

const FAQ = [
  { q: 'Na jakim systemie działa Syntance Studio?', a: 'Na Windows. Pobierasz instalator i instalujesz jak zwykły program; nie potrzebujesz konta.' },
  { q: 'Czy trzeba być online?', a: 'Nie. Pliki otwierasz i edytujesz lokalnie. Internet jest potrzebny tylko do jednorazowej aktywacji klucza i rzadkiego odświeżenia licencji.' },
  { q: 'Co dostaję za darmo?', a: 'Plan Free: czytanie, wyszukiwanie, druk i komentarze — bez limitu czasu. Po instalacji masz też 14 dni na wypróbowanie wszystkich funkcji.' },
  { q: 'Na ilu komputerach działa licencja?', a: 'Zależy od planu — standardowo na dwóch. Urządzenie możesz przenieść: odbieramy aktywację ze starego, aktywujesz na nowym.' },
  { q: 'Jak aktywować klucz licencji?', a: 'W programie otwórz okno „Licencja”, wklej klucz z e-maila i zatwierdź. Klucz wystawiamy ręcznie po zakupie.' },
]

function planLine(p: PublicPlan): string {
  const period = p.billing === 'perpetual' ? `licencja wieczysta, aktualizacje przez ${p.updateMonths} mies.` : `subskrypcja, okres ${p.updateMonths} mies.`
  return `${period} · ${p.maxDevices} ${p.maxDevices === 1 ? 'urządzenie' : 'urządzenia'}`
}

const mb = (n: number): string => `${(n / 1024 / 1024).toFixed(0)} MB`

export default async function SyntanceStudioPage() {
  const { release, freePlan, plans, featureLabels } = await getPublicStudioData()
  const label = (k: string): string => featureLabels[k] ?? k

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
      <main className="relative z-10 pt-32 text-white">
        <section className="mx-auto max-w-5xl px-5 pb-20 text-center md:px-6">
          <p className="text-sm font-medium uppercase tracking-widest text-purple-300">Syntance Studio</p>
          <h1 className="mt-4 text-4xl font-light tracking-tight md:text-6xl">PDF na Twoim komputerze. Bez chmury, bez abonamentu na start.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
            Czytaj, komentuj, edytuj, scalaj i redaguj dokumenty — także zeskanowane. Wszystko działa lokalnie, a podstawy są za darmo.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {release ? (
              <a
                href={release.url}
                download
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-white px-8 text-base font-medium text-black transition-colors hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
              >
                Pobierz na Windows
              </a>
            ) : (
              <Link
                href="/kontakt"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-white px-8 text-base font-medium text-black transition-colors hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
              >
                Powiadom mnie o premierze
              </Link>
            )}
            <a href="#plany" className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/25 px-8 text-base text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400">
              Zobacz plany
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            {release ? `Wersja ${release.version} · ${mb(release.size)} · Windows · bez konta, bez karty` : 'Pobieranie pojawi się tutaj zaraz po publikacji pierwszej wersji.'}
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-5 pb-24 md:px-6" aria-labelledby="co-potrafi">
          <h2 id="co-potrafi" className="text-2xl font-light md:text-4xl">Co potrafi</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((c) => (
              <li key={c.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-lg font-medium">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-300">{c.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="plany" className="mx-auto max-w-5xl scroll-mt-28 px-5 pb-24 md:px-6" aria-labelledby="plany-naglowek">
          <h2 id="plany-naglowek" className="text-2xl font-light md:text-4xl">Plany</h2>
          <p className="mt-3 max-w-2xl text-gray-300">Zacznij od Free, a gdy zechcesz więcej — wybierz plan z modułami, których potrzebujesz.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-xl font-medium">Free</h3>
              <p className="mt-1 text-3xl font-light">0 zł</p>
              <p className="mt-1 text-sm text-gray-400">bez limitu czasu</p>
              <ul className="mt-5 space-y-2 text-sm text-gray-200">
                {(freePlan?.features.length ? freePlan.features.map(label) : ['Przeglądanie, wyszukiwanie i druk', 'Komentarze i adnotacje']).map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
            </article>
            {plans.map((p) => (
              <article key={p.slug} className="flex flex-col rounded-2xl border border-purple-400/30 bg-purple-500/[0.06] p-6">
                <h3 className="text-xl font-medium">{p.name}</h3>
                <p className="mt-1 text-3xl font-light">{formatPrice(p.priceAmount ?? 0, p.priceCurrency ?? 'PLN')}</p>
                <p className="mt-1 text-sm text-gray-400">{planLine(p)}</p>
                {p.description ? <p className="mt-3 text-sm text-gray-300">{p.description}</p> : null}
                <ul className="mt-5 flex-1 space-y-2 text-sm text-gray-200">
                  {p.features.map((f) => (
                    <li key={f}>✓ {label(f)}</li>
                  ))}
                </ul>
                <Link href="/kontakt" className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/25 px-6 text-sm transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400">
                  Zapytaj o licencję
                </Link>
              </article>
            ))}
          </div>
          {plans.length === 0 ? <p className="mt-6 text-sm text-gray-400">Plany płatne ogłosimy wkrótce. Do tego czasu możesz korzystać z Free i 14-dniowego okresu próbnego.</p> : <p className="mt-6 text-sm text-gray-400">Zakup online uruchamiamy wkrótce — do tego czasu napisz do nas, a wystawimy licencję i wyślemy klucz e-mailem.</p>}
        </section>

        {release ? (
          <section className="mx-auto max-w-5xl px-5 pb-24 md:px-6" aria-labelledby="pobierz">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
              <h2 id="pobierz" className="text-2xl font-light md:text-3xl">Pobierz Syntance Studio</h2>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                <div><dt className="text-gray-400">Wersja</dt><dd className="font-mono">{release.version}</dd></div>
                <div><dt className="text-gray-400">Rozmiar</dt><dd>{mb(release.size)}</dd></div>
                <div><dt className="text-gray-400">System</dt><dd>Windows</dd></div>
              </dl>
              {release.notesPl ? <p className="mt-4 text-sm text-gray-300">Co nowego: {release.notesPl}</p> : null}
              <a href={release.url} download className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-white px-7 text-base font-medium text-black transition-colors hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400">
                Pobierz {release.filename}
              </a>
              <p className="mt-4 break-all font-mono text-xs text-gray-500">SHA-256: {release.sha256}</p>
            </div>
          </section>
        ) : null}

        <section className="mx-auto max-w-3xl px-5 pb-28 md:px-6" aria-labelledby="faq">
          <h2 id="faq" className="text-2xl font-light md:text-4xl">Najczęstsze pytania</h2>
          <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 text-base font-medium focus-visible:outline-2 focus-visible:outline-purple-400">
                  {f.q}
                  <span aria-hidden className="text-gray-400 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-gray-300">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
