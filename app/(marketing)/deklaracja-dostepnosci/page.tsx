import type { Metadata } from 'next'
import NavbarSimple from '@/components/navbar-simple'
import Footer from '@/components/sections/footer'
import Container from '@/components/container'
import VantaBackground from '@/components/vanta-background'
import {
  accessibilityCoordinatorEmail,
  accessibilityStatementLastUpdated,
  legalAdministratorName,
  legalContactEmail,
  legalContactPhone,
  legalEntityLabel,
  legalTradeName,
} from '@/lib/data/legal-entity'

export const metadata: Metadata = {
  title: 'Deklaracja dostępności | Syntance',
  description:
    'Deklaracja dostępności serwisu syntance.com. Status zgodności z WCAG 2.2, sposób zgłaszania problemów i procedura skarg.',
  alternates: {
    canonical: 'https://syntance.com/deklaracja-dostepnosci',
  },
  openGraph: {
    title: 'Deklaracja dostępności | Syntance',
    description: 'Informacje o dostępności cyfrowej serwisu syntance.com',
    type: 'website',
  },
}

export default function AccessibilityStatementPage() {
  return (
    <>
      <VantaBackground />
      <NavbarSimple />
      <section className="relative z-10 pt-40 pb-20 min-h-screen">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h1 className="mb-4 text-white glow-text">Deklaracja dostępności</h1>
            <p className="text-lg text-gray-400 mb-8">
              Ostatnia aktualizacja:{' '}
              <strong className="font-medium text-gray-300">{accessibilityStatementLastUpdated}</strong>
            </p>

            <div className="prose prose-lg prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">1. Status zgodności</h2>
                <p className="text-gray-400 leading-relaxed">
                  Serwis <strong>syntance.com</strong> dąży do zgodności z{' '}
                  <strong>Web Content Accessibility Guidelines (WCAG) 2.2 na poziomie AA</strong> oraz
                  wymaganiami Europejskiego Aktu o Dostępności (EAA). Obecnie oceniamy zgodność jako{' '}
                  <strong>częściową</strong> — większość treści i formularzy spełnia wymagania, a
                  bieżące prace obejmują audyt pozostałych komponentów interfejsu.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">2. Zakres deklaracji</h2>
                <p className="text-gray-400 leading-relaxed">
                  Deklaracja dotyczy serwisu publicznego dostępnego pod adresem syntance.com wraz ze
                  wszystkimi podstronami marketingowymi, formularzami kontaktowymi i banerem zgody na
                  cookies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">3. Metoda oceny</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  Ocena dostępności opiera się na:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>automatycznych testach (axe-core, Lighthouse Accessibility),</li>
                  <li>przeglądzie ręcznym interfejsu (klawiatura, kontrast, czytelność),</li>
                  <li>testach responsywności na urządzeniach mobilnych.</li>
                </ul>
                <p className="text-gray-400 leading-relaxed mt-3">
                  Ostatni przegląd: <strong>{accessibilityStatementLastUpdated}</strong>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">4. Znane ograniczenia</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>
                    część animacji tła i efektów wizualnych może być ograniczona przez ustawienie{' '}
                    <code className="text-purple-300">prefers-reduced-motion</code> w systemie
                    użytkownika,
                  </li>
                  <li>
                    elementy osadzone od podmiotów trzecich (np. analityka po wyrażeniu zgody) mogą
                    nie spełniać w pełni wymagań WCAG — uruchamiane są wyłącznie po zgodzie,
                  </li>
                  <li>ciągłe ulepszanie opisów alternatywnych i fokusu klawiaturowego w komponentach
                    interaktywnych.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">
                  5. Zgłaszanie problemów z dostępnością
                </h2>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Jeśli napotkasz barierę dostępności, daj nam znać — odpowiadamy bez zbędnej zwłoki,
                  zwykle w ciągu <strong>14 dni roboczych</strong>.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={`mailto:${accessibilityCoordinatorEmail}?subject=Zg%C5%82oszenie%20problemu%20z%20dost%C4%99pno%C5%9Bci%C4%85`}
                    className="inline-flex items-center justify-center px-6 py-3 min-h-[48px] rounded-xl bg-white text-gray-900 font-medium tracking-wide hover:bg-white/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    Zgłoś problem z dostępnością
                  </a>
                  <a
                    href={`mailto:${legalContactEmail}`}
                    className="inline-flex items-center justify-center px-6 py-3 min-h-[48px] rounded-xl border border-white/15 text-white font-light tracking-wide hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    {legalContactEmail}
                  </a>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">6. Koordynator dostępności</h2>
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                  <p className="text-gray-400 leading-relaxed">
                    <strong>{legalAdministratorName}</strong>
                    <br />
                    {legalTradeName}
                    <br />
                    E-mail:{' '}
                    <a href={`mailto:${accessibilityCoordinatorEmail}`} className="text-brand hover:underline">
                      {accessibilityCoordinatorEmail}
                    </a>
                    <br />
                    Telefon:{' '}
                    <a href="tel:+48537110170" className="text-brand hover:underline">
                      {legalContactPhone}
                    </a>
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">7. Procedura odwoławcza</h2>
                <p className="text-gray-400 leading-relaxed">
                  Po wyczerpaniu drogi zgłoszenia u nas możesz skierować skargę do{' '}
                  <strong>Rzecznika Praw Obywatelskich</strong> (rpo.gov.pl) lub właściwego organu
                  nadzorującego dostępność usług cyfrowych, zgodnie z obowiązującymi przepisami.
                </p>
              </section>
            </div>
          </div>
        </Container>
      </section>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Deklaracja dostępności',
            description: 'Deklaracja dostępności serwisu syntance.com',
            url: 'https://syntance.com/deklaracja-dostepnosci',
            inLanguage: 'pl-PL',
            publisher: {
              '@type': 'Organization',
              name: legalEntityLabel,
              email: legalContactEmail,
            },
            dateModified: '2026-07-02',
          }),
        }}
      />
    </>
  )
}
