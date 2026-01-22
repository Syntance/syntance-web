import type { Metadata } from "next";
import NavbarSimple from "@/components/navbar-simple";
import Footer from "@/components/sections/footer";
import Container from "@/components/container";
import dynamic from "next/dynamic";

const VantaBackground = dynamic(() => import("@/components/vanta-background"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "Polityka Prywatności | Syntance - Ochrona Danych Osobowych",
  description: "Polityka prywatności Syntance P.S.A. Dowiedz się, jak przetwarzamy i chronimy Twoje dane osobowe zgodnie z RODO. Transparentna ochrona prywatności użytkowników.",
  keywords: ["polityka prywatności", "RODO", "ochrona danych osobowych", "prywatność", "Syntance", "przetwarzanie danych"],
  openGraph: {
    title: "Polityka Prywatności | Syntance",
    description: "Polityka prywatności i ochrony danych osobowych zgodna z RODO",
    type: "website",
  },
  alternates: {
    canonical: "https://syntance.com/polityka-prywatnosci",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <VantaBackground />
      <NavbarSimple />
      <section className="relative z-10 pt-40 pb-20 min-h-screen">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4 text-white glow-text">Polityka Prywatności</h1>
            <p className="text-lg text-gray-400 mb-8">
              Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}
            </p>

            <div className="prose prose-lg prose-invert max-w-none space-y-8">
              {/* Sekcja 1 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">1. Administrator danych osobowych</h2>
                <p className="text-gray-400 leading-relaxed">
                  Administratorem Twoich danych osobowych jest <strong>Syntance P.S.A.</strong> (Prosta Spółka Akcyjna), 
                  z siedzibą w Czerniec 72, 33-390 Łącko, Polska.
                </p>
                <p className="text-gray-400 leading-relaxed mt-2">
                  <strong>Kontakt:</strong>
                  <br />
                  E-mail: <a href="mailto:biuro@syntance.com" className="text-brand hover:underline">biuro@syntance.com</a>
                  <br />
                  Telefon: <a href="tel:+48662519544" className="text-brand hover:underline">+48 662 519 544</a>
                </p>
              </section>

              {/* Sekcja 2 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Podstawa prawna przetwarzania danych</h2>
                <p className="text-gray-400 leading-relaxed">
                  Przetwarzamy Twoje dane osobowe na podstawie:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li><strong>Art. 6 ust. 1 lit. a RODO</strong> – zgoda osoby, której dane dotyczą (np. formularz kontaktowy, newsletter)</li>
                  <li><strong>Art. 6 ust. 1 lit. b RODO</strong> – niezbędność do wykonania umowy (realizacja zamówień, świadczenie usług)</li>
                  <li><strong>Art. 6 ust. 1 lit. c RODO</strong> – obowiązek prawny (np. wystawianie faktur, archiwizacja dokumentów księgowych)</li>
                  <li><strong>Art. 6 ust. 1 lit. f RODO</strong> – prawnie uzasadniony interes administratora (np. marketing własnych usług, analityka, bezpieczeństwo IT)</li>
                </ul>
              </section>

              {/* Sekcja 3 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Cele przetwarzania danych</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  Dane osobowe przetwarzamy w następujących celach:
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-medium mb-2">3.1. Kontakt i obsługa zapytań</h3>
                    <p className="text-gray-400">
                      Przetwarzamy dane podane w formularzach kontaktowych w celu udzielenia odpowiedzi na zapytania, 
                      przygotowania oferty oraz komunikacji z klientami.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2">3.2. Realizacja umów i świadczenie usług</h3>
                    <p className="text-gray-400">
                      Dane są niezbędne do wykonania umowy, dostarczenia zamówionych usług, wystawiania faktur oraz archiwizacji dokumentów zgodnie z przepisami prawa.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2">3.3. Marketing i komunikacja</h3>
                    <p className="text-gray-400">
                      Na podstawie zgody lub prawnie uzasadnionego interesu wysyłamy informacje marketingowe, 
                      newsletter oraz prezentujemy dopasowane treści reklamowe.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2">3.4. Analityka i optymalizacja</h3>
                    <p className="text-gray-400">
                      Wykorzystujemy dane do analizy ruchu na stronie (Google Analytics, Microsoft Clarity), 
                      poprawy UX, testowania funkcjonalności oraz optymalizacji wydajności serwisu.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2">3.5. Bezpieczeństwo i ochrona przed nadużyciami</h3>
                    <p className="text-gray-400">
                      Przetwarzamy dane w celu ochrony przed atakami (honeypot, rate limiting), 
                      wykrywania nadużyć oraz zapewnienia bezpieczeństwa infrastruktury IT.
                    </p>
                  </div>
                </div>
              </section>

              {/* Sekcja 4 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Zakres przetwarzanych danych</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  W zależności od celu przetwarzamy następujące dane:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li><strong>Dane identyfikacyjne:</strong> imię, nazwisko</li>
                  <li><strong>Dane kontaktowe:</strong> adres e-mail, numer telefonu</li>
                  <li><strong>Dane firmowe:</strong> nazwa firmy, NIP, adres siedziby (w przypadku umów B2B)</li>
                  <li><strong>Dane techniczne:</strong> adres IP, typ przeglądarki, system operacyjny, cookies</li>
                  <li><strong>Dane behawioralne:</strong> historia przeglądania, kliknięcia, interakcje z formularzami</li>
                  <li><strong>Treść komunikacji:</strong> wiadomości wysłane przez formularze kontaktowe</li>
                </ul>
              </section>

              {/* Sekcja 5 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Udostępnianie danych podmiotom trzecim</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  Twoje dane mogą być udostępniane następującym kategoriom odbiorców:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li><strong>Vercel Inc.</strong> (USA) – hosting strony internetowej (zgodnie z Standard Contractual Clauses)</li>
                  <li><strong>Google LLC</strong> (USA) – Google Analytics, Google Workspace (e-mail)</li>
                  <li><strong>Microsoft Corporation</strong> (USA) – Microsoft Clarity (analityka UX)</li>
                  <li><strong>Resend Inc.</strong> – wysyłka wiadomości e-mail z formularzy</li>
                  <li><strong>Biura rachunkowe</strong> – przetwarzanie faktur i dokumentów księgowych</li>
                  <li><strong>Kancelarie prawne</strong> – w przypadku sporów lub roszczeń prawnych</li>
                  <li><strong>Organy publiczne</strong> – na żądanie uprawnionych organów (np. sądy, organy podatkowe)</li>
                </ul>
                <p className="text-gray-400 leading-relaxed mt-3">
                  Wszystkie podmioty przetwarzają dane zgodnie z RODO i stosują odpowiednie zabezpieczenia.
                </p>
              </section>

              {/* Sekcja 6 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Okres przechowywania danych</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  Przechowujemy dane przez następujące okresy:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li><strong>Dane z formularzy kontaktowych:</strong> do 24 miesięcy od ostatniego kontaktu lub do cofnięcia zgody</li>
                  <li><strong>Dane związane z umowami:</strong> przez okres obowiązywania umowy + okresy wymagane przepisami (np. 5 lat dla dokumentów księgowych)</li>
                  <li><strong>Dane marketingowe:</strong> do momentu cofnięcia zgody lub wyrażenia sprzeciwu</li>
                  <li><strong>Dane analityczne:</strong> do 26 miesięcy (Google Analytics), zgodnie z ustawieniami narzędzi</li>
                  <li><strong>Logi systemowe:</strong> do 12 miesięcy (dla celów bezpieczeństwa)</li>
                </ul>
              </section>

              {/* Sekcja 7 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Twoje prawa</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  Zgodnie z RODO przysługują Ci następujące prawa:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li><strong>Prawo dostępu</strong> – możesz uzyskać informację, jakie dane o Tobie przetwarzamy</li>
                  <li><strong>Prawo do sprostowania</strong> – możesz poprosić o korektę nieprawidłowych danych</li>
                  <li><strong>Prawo do usunięcia</strong> (&quot;prawo do bycia zapomnianym&quot;) – możesz żądać usunięcia danych</li>
                  <li><strong>Prawo do ograniczenia przetwarzania</strong> – możesz zażądać tymczasowego wstrzymania przetwarzania</li>
                  <li><strong>Prawo do przenoszenia danych</strong> – możesz otrzymać dane w formacie umożliwiającym transfer do innego administratora</li>
                  <li><strong>Prawo sprzeciwu</strong> – możesz wnieść sprzeciw wobec przetwarzania danych na podstawie prawnie uzasadnionego interesu</li>
                  <li><strong>Prawo do cofnięcia zgody</strong> – w każdej chwili możesz wycofać zgodę (nie wpływa to na legalność przetwarzania przed cofnięciem)</li>
                  <li><strong>Prawo do skargi</strong> – możesz złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych (PUODO)</li>
                </ul>
                <p className="text-gray-400 leading-relaxed mt-4">
                  Aby skorzystać z powyższych praw, skontaktuj się z nami: <a href="mailto:biuro@syntance.com" className="text-brand hover:underline">biuro@syntance.com</a>
                </p>
              </section>

              {/* Sekcja 8 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Cookies i technologie śledzące</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  Nasza strona wykorzystuje pliki cookies i podobne technologie w celu:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>Zapewnienia prawidłowego działania serwisu (cookies techniczne)</li>
                  <li>Analizy ruchu i optymalizacji UX (Google Analytics, Microsoft Clarity)</li>
                  <li>Personalizacji treści i reklam</li>
                  <li>Integracji z mediami społecznościowymi</li>
                </ul>
                <p className="text-gray-400 leading-relaxed mt-3">
                  Możesz zarządzać cookies w ustawieniach przeglądarki. Wyłączenie cookies może wpłynąć na funkcjonalność strony.
                </p>
              </section>

              {/* Sekcja 9 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Bezpieczeństwo danych</h2>
                <p className="text-gray-400 leading-relaxed">
                  Stosujemy zaawansowane środki techniczne i organizacyjne w celu ochrony danych:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400 mt-2">
                  <li>Szyfrowanie połączeń (HTTPS/TLS)</li>
                  <li>Zabezpieczenia serwerów i infrastruktury (firewall, monitoring)</li>
                  <li>Ograniczony dostęp do danych (tylko autoryzowany personel)</li>
                  <li>Regularne audyty bezpieczeństwa</li>
                  <li>Honeypot i rate limiting chroniące formularze przed botami i atakami</li>
                  <li>Kopie zapasowe i procedury odzyskiwania danych</li>
                </ul>
              </section>

              {/* Sekcja 10 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Zmiany w Polityce Prywatności</h2>
                <p className="text-gray-400 leading-relaxed">
                  Zastrzegamy sobie prawo do aktualizacji niniejszej Polityki Prywatności. 
                  O istotnych zmianach poinformujemy na stronie oraz (jeśli to możliwe) drogą mailową. 
                  Data ostatniej aktualizacji zawsze znajduje się na górze dokumentu.
                </p>
              </section>

              {/* Sekcja 11 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Kontakt</h2>
                <p className="text-gray-400 leading-relaxed">
                  W sprawach związanych z ochroną danych osobowych prosimy o kontakt:
                </p>
                <div className="mt-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                  <p className="text-gray-400">
                    <strong>Syntance P.S.A.</strong>
                    <br />
                    Czerniec 72, 33-390 Łącko
                    <br />
                    E-mail: <a href="mailto:biuro@syntance.com" className="text-brand hover:underline">biuro@syntance.com</a>
                    <br />
                    Telefon: <a href="tel:+48662519544" className="text-brand hover:underline">+48 662 519 544</a>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </Container>
      </section>
      <Footer />

      {/* Structured Data dla SEO i AI */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Polityka Prywatności",
            "description": "Polityka prywatności i ochrony danych osobowych Syntance P.S.A. zgodna z RODO",
            "url": "https://syntance.com/polityka-prywatnosci",
            "inLanguage": "pl-PL",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Syntance",
              "url": "https://syntance.com"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Syntance P.S.A.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Czerniec 72",
                "addressLocality": "Łącko",
                "postalCode": "33-390",
                "addressCountry": "PL"
              },
              "email": "biuro@syntance.com",
              "telephone": "+48662519544"
            },
            "dateModified": new Date().toISOString(),
            "mainEntity": {
              "@type": "PrivacyPolicy",
              "description": "Szczegółowa polityka prywatności opisująca sposób przetwarzania danych osobowych zgodnie z RODO"
            }
          })
        }}
      />
    </>
  );
}

