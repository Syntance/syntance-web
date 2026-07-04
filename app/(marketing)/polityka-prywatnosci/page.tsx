import type { Metadata } from "next";
import NavbarSimple from "@/components/navbar-simple";
import Footer from "@/components/sections/footer";
import Container from "@/components/container";
import VantaBackground from "@/components/vanta-background";
import {
  legalFormLabel,
  legalContactEmail,
  legalContactPhone,
  legalEntityLabel,
  legalNip,
  legalRegon,
  legalTradeName,
  privacyPolicyLastUpdated,
} from "@/lib/data/legal-entity";

export const metadata: Metadata = {
  title: "Polityka Prywatności | Syntance - Ochrona Danych Osobowych",
  description:
    "Polityka prywatności Syntance. Dowiedz się, jak przetwarzamy i chronimy Twoje dane osobowe zgodnie z RODO. Transparentna ochrona prywatności użytkowników.",
  keywords: [
    "polityka prywatności",
    "RODO",
    "ochrona danych osobowych",
    "prywatność",
    "Syntance",
    "przetwarzanie danych",
  ],
  openGraph: {
    title: "Polityka Prywatności | Syntance",
    description: "Polityka prywatności i ochrony danych osobowych zgodna z RODO",
    type: "website",
  },
  alternates: {
    canonical: "https://syntance.com/polityka-prywatnosci",
  },
};

const processingPurposes = [
  {
    purpose:
      "Odpowiedź na zapytanie z formularza, e-maila lub telefonu; przygotowanie oferty; umówiona rozmowa",
    legalBasis:
      "art. 6 ust. 1 lit. b (działania przed zawarciem umowy na Twoje żądanie) oraz lit. f (komunikacja biznesowa)",
    retention: "do 24 miesięcy od ostatniego kontaktu",
  },
  {
    purpose: "Zawarcie i wykonanie umowy o świadczenie usług",
    legalBasis: "art. 6 ust. 1 lit. b",
    retention: "czas trwania umowy + okres przedawnienia roszczeń",
  },
  {
    purpose: "Wystawianie faktur, rozliczenia, archiwizacja dokumentów księgowych",
    legalBasis: "art. 6 ust. 1 lit. c (obowiązek prawny)",
    retention: "5 lat od końca roku podatkowego",
  },
  {
    purpose: "Marketing bezpośredni własnych usług",
    legalBasis:
      "art. 6 ust. 1 lit. f (prawnie uzasadniony interes); wysyłka informacji handlowych drogą elektroniczną — po odrębnej zgodzie",
    retention: "do zgłoszenia sprzeciwu lub cofnięcia zgody",
  },
  {
    purpose:
      "Statystyka i analityka serwisu (Google Analytics 4, PostHog, Microsoft Clarity)",
    legalBasis:
      "art. 6 ust. 1 lit. a (zgoda wyrażona w banerze cookies) w zw. z przepisami Prawa komunikacji elektronicznej",
    retention: "do cofnięcia zgody; dane w GA4 maks. 14 miesięcy",
  },
  {
    purpose:
      "Bezpieczeństwo serwisu — logi, ochrona formularzy (honeypot, rate limiting), wykrywanie nadużyć",
    legalBasis: "art. 6 ust. 1 lit. f",
    retention: "do 12 miesięcy",
  },
  {
    purpose: "Ustalenie, dochodzenie lub obrona roszczeń",
    legalBasis: "art. 6 ust. 1 lit. f",
    retention: "okres przedawnienia roszczeń",
  },
] as const;

export default function PrivacyPolicyPage() {
  return (
    <>
      <VantaBackground />
      <NavbarSimple />
      <section className="relative z-10 pt-40 pb-20 min-h-screen">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h1 className="mb-4 text-white glow-text">Polityka Prywatności</h1>
            <p className="text-lg text-gray-400 mb-8">
              Ostatnia aktualizacja: <strong className="font-medium text-gray-300">{privacyPolicyLastUpdated}</strong>
            </p>

            <div className="prose prose-lg prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">1. Administrator danych osobowych</h2>
                <p className="text-gray-400 leading-relaxed">
                  Administratorem Twoich danych osobowych jest <strong>{legalFormLabel}</strong>, prowadzący
                  jednoosobową działalność gospodarczą pod firmą <strong>{legalTradeName}</strong>, Czerniec 72,
                  33-390 Łącko, NIP: {legalNip}, REGON: {legalRegon} (dalej „Administrator”, „my”).
                </p>
                <p className="text-gray-400 leading-relaxed mt-4">
                  <strong>Kontakt w sprawach danych osobowych:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-400 mt-2">
                  <li>
                    E-mail:{" "}
                    <a href={`mailto:${legalContactEmail}`} className="text-brand hover:underline">
                      {legalContactEmail}
                    </a>
                  </li>
                  <li>
                    Telefon:{" "}
                    <a href="tel:+48537110170" className="text-brand hover:underline">
                      {legalContactPhone}
                    </a>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">2. Czego dotyczy ta polityka</h2>
                <p className="text-gray-400 leading-relaxed">
                  Polityka dotyczy serwisu <strong>syntance.com</strong> wraz ze wszystkimi podstronami i subdomenami,
                  formularzy dostępnych w serwisie (formularz kontaktowy, rezerwacja rozmowy, konfigurator wyceny) oraz
                  komunikacji prowadzonej e-mailem i telefonicznie. Dane pozyskujemy bezpośrednio od Ciebie — nie
                  kupujemy baz danych.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">
                  3. Cele, podstawy prawne i okresy przetwarzania
                </h2>
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full min-w-[640px] text-sm text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="py-3 pr-4 font-semibold text-gray-300 align-top">Cel przetwarzania</th>
                        <th className="py-3 pr-4 font-semibold text-gray-300 align-top">Podstawa prawna (RODO)</th>
                        <th className="py-3 font-semibold text-gray-300 align-top">Okres przechowywania</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-400">
                      {processingPurposes.map((row) => (
                        <tr key={row.purpose} className="border-b border-white/5 align-top">
                          <td className="py-3 pr-4 leading-relaxed">{row.purpose}</td>
                          <td className="py-3 pr-4 leading-relaxed">{row.legalBasis}</td>
                          <td className="py-3 leading-relaxed">{row.retention}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">
                  4. Jakie dane przetwarzamy i czy musisz je podać
                </h2>
                <p className="text-gray-400 leading-relaxed mb-3">W zależności od celu przetwarzamy:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>
                    <strong>Dane identyfikacyjne:</strong> imię, nazwisko
                  </li>
                  <li>
                    <strong>Dane kontaktowe:</strong> adres e-mail, numer telefonu
                  </li>
                  <li>
                    <strong>Dane firmowe:</strong> nazwa firmy, NIP, adres siedziby (przy współpracy B2B)
                  </li>
                  <li>
                    <strong>Dane techniczne:</strong> adres IP, typ przeglądarki, system operacyjny, identyfikatory
                    cookies
                  </li>
                  <li>
                    <strong>Dane o korzystaniu z serwisu:</strong> odwiedzone podstrony, kliknięcia, interakcje z
                    formularzami (wyłącznie po zgodzie na cookies analityczne)
                  </li>
                  <li>
                    <strong>Treść komunikacji:</strong> wiadomości przesłane przez formularze lub e-mail
                  </li>
                </ul>
                <p className="text-gray-400 leading-relaxed mt-4">
                  Podanie danych jest <strong>dobrowolne</strong>, ale bez danych kontaktowych nie będziemy w stanie
                  odpowiedzieć na zapytanie ani zawrzeć umowy. Formularze zbierają wyłącznie dane niezbędne do obsługi
                  sprawy (zasada minimalizacji).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">
                  5. Narzędzia analityczne — co dokładnie działa w serwisie
                </h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>
                    <strong>Google Analytics 4 (Google)</strong> — zbiorcze statystyki ruchu, źródła wejść,
                    konwersje.
                  </li>
                  <li>
                    <strong>PostHog (region EU)</strong> — analiza ścieżek użytkowników i skuteczności podstron; dane
                    przetwarzane na serwerach w Europejskim Obszarze Gospodarczym.
                  </li>
                  <li>
                    <strong>Microsoft Clarity (Microsoft)</strong> — mapy cieplne i analiza użyteczności serwisu.
                  </li>
                </ul>
                <p className="text-gray-400 leading-relaxed mt-4">
                  Narzędzia analityczne uruchamiane są <strong>wyłącznie po wyrażeniu zgody</strong> w banerze cookies
                  (mechanizm Google Consent Mode v2 — domyślnie wszystkie zgody są wyłączone). W parametrach zdarzeń
                  analitycznych nie przekazujemy danych osobowych.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">6. Odbiorcy danych</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  Twoje dane mogą być przekazywane następującym kategoriom odbiorców — na podstawie umów powierzenia
                  przetwarzania (art. 28 RODO) albo jako odrębnym administratorom:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>
                    <strong>Vercel Inc.</strong> (USA) — hosting serwisu
                  </li>
                  <li>
                    <strong>Google LLC / Google Ireland Ltd.</strong> — Google Analytics 4, Google Workspace (poczta
                    e-mail)
                  </li>
                  <li>
                    <strong>Microsoft Corporation</strong> (USA) — Microsoft Clarity
                  </li>
                  <li>
                    <strong>PostHog</strong> — analityka; dane przetwarzane w EOG (region EU)
                  </li>
                  <li>
                    <strong>Resend</strong> (USA) — techniczna obsługa wysyłki wiadomości z formularzy
                  </li>
                  <li>
                    <strong>Biuro rachunkowe</strong> — faktury i dokumenty księgowe
                  </li>
                  <li>
                    <strong>Kancelarie prawne</strong> — w razie sporów lub roszczeń
                  </li>
                  <li>
                    <strong>Organy publiczne</strong> — wyłącznie na żądanie uprawnionych organów (sądy, organy
                    podatkowe)
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">7. Przekazywanie danych poza EOG</h2>
                <p className="text-gray-400 leading-relaxed">
                  Część dostawców (Vercel, Google, Microsoft, Resend) może przetwarzać dane w USA. Przekazanie odbywa
                  się na podstawie decyzji Komisji Europejskiej stwierdzającej odpowiedni stopień ochrony dla podmiotów
                  certyfikowanych w programie <strong>EU-U.S. Data Privacy Framework</strong>, a uzupełniająco —{" "}
                  <strong>standardowych klauzul umownych (SCC)</strong>. Dane w PostHog pozostają w EOG. Kopię
                  informacji o stosowanych zabezpieczeniach możesz uzyskać, kontaktując się z nami.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">8. Cookies i zarządzanie zgodą</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  Serwis wykorzystuje pliki cookies i podobne technologie w podziale na kategorie:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>
                    <strong>Niezbędne</strong> (zawsze aktywne) — prawidłowe działanie serwisu, zapamiętanie Twojej
                    decyzji o zgodzie
                  </li>
                  <li>
                    <strong>Analityczne</strong> (tylko po zgodzie) — Google Analytics 4, PostHog, Microsoft Clarity
                  </li>
                  <li>
                    <strong>Marketingowe</strong> — obecnie <strong>nie używamy</strong> cookies marketingowych ani
                    reklamowych; w razie ich wdrożenia zostaną uruchomione wyłącznie po odrębnej zgodzie, a polityka
                    zostanie zaktualizowana
                  </li>
                </ul>
                <p className="text-gray-400 leading-relaxed mt-4">
                  Przy pierwszej wizycie wyświetlamy baner zgody — do czasu Twojej decyzji cookies niezbędne są
                  jedynymi aktywnymi (Consent Mode v2, ustawienie domyślne: odmowa). Zgodę możesz w każdej chwili
                  zmienić lub cofnąć przez link <strong>„Ustawienia cookies”</strong> w stopce serwisu oraz w
                  ustawieniach przeglądarki. Podstawą przechowywania informacji na Twoim urządzeniu jest zgoda wymagana
                  przepisami ustawy — Prawo komunikacji elektronicznej.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">9. Twoje prawa</h2>
                <p className="text-gray-400 leading-relaxed mb-3">Zgodnie z RODO przysługują Ci:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>
                    <strong>Prawo dostępu</strong> (art. 15) — informacja, jakie dane przetwarzamy, i kopia danych
                  </li>
                  <li>
                    <strong>Prawo do sprostowania</strong> (art. 16) — korekta nieprawidłowych danych
                  </li>
                  <li>
                    <strong>Prawo do usunięcia</strong> (art. 17) — „prawo do bycia zapomnianym”
                  </li>
                  <li>
                    <strong>Prawo do ograniczenia przetwarzania</strong> (art. 18)
                  </li>
                  <li>
                    <strong>Prawo do przenoszenia danych</strong> (art. 20)
                  </li>
                  <li>
                    <strong>Prawo sprzeciwu</strong> (art. 21) — wobec przetwarzania opartego na prawnie uzasadnionym
                    interesie, w tym marketingu bezpośredniego
                  </li>
                  <li>
                    <strong>Prawo do cofnięcia zgody</strong> — w każdej chwili, bez wpływu na zgodność z prawem
                    przetwarzania sprzed cofnięcia
                  </li>
                </ul>
                <p className="text-gray-400 leading-relaxed mt-4">
                  Wnioski realizujemy <strong>bez zbędnej zwłoki, najpóźniej w ciągu miesiąca</strong>. Napisz na{" "}
                  <a href={`mailto:${legalContactEmail}`} className="text-brand hover:underline">
                    {legalContactEmail}
                  </a>
                  . Masz również prawo złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193
                  Warszawa, uodo.gov.pl).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">
                  10. Profilowanie i zautomatyzowane decyzje
                </h2>
                <p className="text-gray-400 leading-relaxed">
                  Nie podejmujemy wobec Ciebie decyzji opartych wyłącznie na zautomatyzowanym przetwarzaniu, które
                  wywoływałyby skutki prawne lub istotnie na Ciebie wpływały. Analityka serwisu służy wyłącznie
                  zbiorczym statystykom i poprawie użyteczności.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">11. Bezpieczeństwo danych</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  Stosujemy środki techniczne i organizacyjne adekwatne do ryzyka:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>szyfrowanie połączeń (HTTPS/TLS)</li>
                  <li>zabezpieczenia infrastruktury i monitoring</li>
                  <li>dostęp do danych ograniczony do osób upoważnionych</li>
                  <li>ochrona formularzy przed botami i atakami (honeypot, rate limiting)</li>
                  <li>kopie zapasowe i procedury odzyskiwania danych</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">12. Zmiany polityki prywatności</h2>
                <p className="text-gray-400 leading-relaxed">
                  Polityka może być aktualizowana — np. przy zmianie narzędzi lub przepisów. O istotnych zmianach
                  poinformujemy w serwisie. Data ostatniej aktualizacji znajduje się na górze dokumentu.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">13. Kontakt</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  W sprawach związanych z ochroną danych osobowych:
                </p>
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                  <p className="text-gray-400 leading-relaxed">
                    <strong>{legalFormLabel}</strong>
                    <br />
                    {legalTradeName}
                    <br />
                    Czerniec 72, 33-390 Łącko
                    <br />
                    E-mail:{" "}
                    <a href={`mailto:${legalContactEmail}`} className="text-brand hover:underline">
                      {legalContactEmail}
                    </a>
                    <br />
                    Telefon:{" "}
                    <a href="tel:+48537110170" className="text-brand hover:underline">
                      {legalContactPhone}
                    </a>
                  </p>
                </div>
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
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Polityka Prywatności",
            description: "Polityka prywatności i ochrony danych osobowych Syntance zgodna z RODO",
            url: "https://syntance.com/polityka-prywatnosci",
            inLanguage: "pl-PL",
            isPartOf: {
              "@type": "WebSite",
              name: "Syntance",
              url: "https://syntance.com",
            },
            publisher: {
              "@type": "Organization",
              name: legalEntityLabel,
              address: {
                "@type": "PostalAddress",
                streetAddress: "Czerniec 72",
                addressLocality: "Łącko",
                postalCode: "33-390",
                addressCountry: "PL",
              },
              email: legalContactEmail,
              telephone: "+48537110170",
              taxID: legalNip,
            },
            dateModified: "2026-07-02",
            mainEntity: {
              "@type": "PrivacyPolicy",
              description:
                "Szczegółowa polityka prywatności opisująca sposób przetwarzania danych osobowych zgodnie z RODO",
            },
          }),
        }}
      />
    </>
  );
}
