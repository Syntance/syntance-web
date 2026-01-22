import type { Metadata } from "next";
import NavbarSimple from "@/components/navbar-simple";
import Footer from "@/components/sections/footer";
import Container from "@/components/container";
import dynamic from "next/dynamic";

const VantaBackground = dynamic(() => import("@/components/vanta-background"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "Regulamin Świadczenia Usług Drogą Elektroniczną | Syntance",
  description: "Regulamin świadczenia usług drogą elektroniczną przez Syntance P.S.A. Zasady korzystania z serwisu, warunki umów, prawa i obowiązki użytkowników.",
  keywords: ["regulamin", "warunki korzystania", "usługi elektroniczne", "Syntance", "terms of service"],
  openGraph: {
    title: "Regulamin Świadczenia Usług Drogą Elektroniczną | Syntance",
    description: "Regulamin korzystania z usług elektronicznych Syntance",
    type: "website",
  },
  alternates: {
    canonical: "https://syntance.com/regulamin",
  },
};

export default function TermsOfServicePage() {
  return (
    <>
      <VantaBackground />
      <NavbarSimple />
      <section className="relative z-10 pt-40 pb-20 min-h-screen">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4 text-white glow-text">Regulamin Świadczenia Usług Drogą Elektroniczną</h1>
            <p className="text-lg text-gray-400 mb-8">
              Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}
            </p>

            <div className="prose prose-lg prose-invert max-w-none space-y-8">
              {/* Sekcja 1 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 1. Postanowienia ogólne i definicje</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>1.1.</strong> Niniejszy Regulamin określa zasady korzystania z serwisu internetowego dostępnego pod adresem <strong>syntance.com</strong> oraz świadczenia usług drogą elektroniczną przez Syntance P.S.A.
                </p>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>1.2.</strong> Definicje:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li><strong>Usługodawca</strong> – Syntance P.S.A. (Prosta Spółka Akcyjna), z siedzibą w Czerniec 72, 33-390 Łącko, Polska</li>
                  <li><strong>Serwis</strong> – strona internetowa syntance.com wraz ze wszystkimi podstronami</li>
                  <li><strong>Użytkownik</strong> – osoba fizyczna, osoba prawna lub jednostka organizacyjna nieposiadająca osobowości prawnej, korzystająca z Serwisu</li>
                  <li><strong>Usługi Elektroniczne</strong> – usługi świadczone drogą elektroniczną za pośrednictwem Serwisu, w tym formularz kontaktowy, newsletter, prezentacja oferty</li>
                  <li><strong>Treści</strong> – materiały publikowane w Serwisie (teksty, grafiki, zdjęcia, animacje, kod źródłowy)</li>
                  <li><strong>Konto</strong> – indywidualny profil użytkownika w systemie (jeśli dotyczy)</li>
                </ul>
              </section>

              {/* Sekcja 2 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 2. Informacje o Usługodawcy</h2>
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                  <p className="text-gray-400">
                    <strong>Syntance P.S.A.</strong>
                    <br />
                    Czerniec 72, 33-390 Łącko, Polska
                    <br />
                    E-mail: <a href="mailto:biuro@syntance.com" className="text-brand hover:underline">biuro@syntance.com</a>
                    <br />
                    Telefon: <a href="tel:+48662519544" className="text-brand hover:underline">+48 662 519 544</a>
                    <br />
                    Strona: <a href="https://syntance.com" className="text-brand hover:underline">syntance.com</a>
                  </p>
                </div>
              </section>

              {/* Sekcja 3 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 3. Rodzaje świadczonych usług elektronicznych</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>3.1.</strong> Usługodawca świadczy nieodpłatnie następujące Usługi Elektroniczne:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li><strong>Przeglądanie zawartości Serwisu</strong> – prezentacja informacji o produktach, usługach i działalności Usługodawcy</li>
                  <li><strong>Formularz kontaktowy</strong> – możliwość przesłania zapytania lub wiadomości do Usługodawcy</li>
                  <li><strong>Newsletter</strong> – subskrypcja wiadomości e-mail z aktualnościami, ofertami i treściami edukacyjnymi</li>
                  <li><strong>Prezentacja oferty</strong> – szczegółowy opis usług Syntance Studio, OZE Asystent i innych produktów</li>
                </ul>
                <p className="text-gray-400 leading-relaxed mt-3">
                  <strong>3.2.</strong> Niektóre usługi (np. realizacja projektów, wdrożenia IT) wymagają zawarcia odrębnej umowy na warunkach ustalonych indywidualnie.
                </p>
              </section>

              {/* Sekcja 4 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 4. Warunki korzystania z Serwisu</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>4.1. Wymagania techniczne:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>Urządzenie z dostępem do Internetu (komputer, tablet, smartfon)</li>
                  <li>Przeglądarka internetowa obsługująca JavaScript, Cookies, HTML5, CSS3 (zalecane najnowsze wersje: Chrome, Firefox, Safari, Edge)</li>
                  <li>Aktywne połączenie internetowe o minimalnej przepustowości 1 Mb/s</li>
                  <li>Włączona obsługa Cookies (wymagana do pełnej funkcjonalności)</li>
                  <li>Aktywny adres e-mail (do korzystania z formularzy kontaktowych i newslettera)</li>
                </ul>
                <p className="text-gray-400 leading-relaxed mt-3">
                  <strong>4.2.</strong> Korzystanie z Serwisu jest dobrowolne i nieodpłatne.
                </p>
                <p className="text-gray-400 leading-relaxed mt-3">
                  <strong>4.3.</strong> Zabrania się wykorzystywania Serwisu w sposób sprzeczny z prawem, dobrymi obyczajami lub naruszający prawa osób trzecich.
                </p>
              </section>

              {/* Sekcja 5 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 5. Zasady korzystania z formularzy kontaktowych</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>5.1.</strong> Formularz kontaktowy umożliwia przesłanie zapytania do Usługodawcy.
                </p>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>5.2.</strong> Wysłanie formularza wymaga:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>Podania imienia i nazwiska</li>
                  <li>Podania adresu e-mail</li>
                  <li>Wpisania treści wiadomości</li>
                  <li>Zaznaczenia zgody na przetwarzanie danych osobowych (zgodnie z RODO)</li>
                  <li>Akceptacji Polityki Prywatności</li>
                </ul>
                <p className="text-gray-400 leading-relaxed mt-3">
                  <strong>5.3.</strong> Usługodawca odpowiada na zapytania w terminie do <strong>48 godzin roboczych</strong> od otrzymania wiadomości.
                </p>
                <p className="text-gray-400 leading-relaxed mt-3">
                  <strong>5.4.</strong> Formularz jest chroniony mechanizmami antyspamowymi (honeypot, rate limiting).
                </p>
              </section>

              {/* Sekcja 6 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 6. Newsletter</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>6.1.</strong> Użytkownik może zapisać się do newslettera, podając adres e-mail i wyrażając zgodę na otrzymywanie wiadomości marketingowych.
                </p>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>6.2.</strong> Newsletter zawiera informacje o nowościach, promocjach, artykułach blogowych oraz ofertach Usługodawcy.
                </p>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>6.3.</strong> Użytkownik może w każdej chwili zrezygnować z newslettera, klikając link &quot;Wypisz się&quot; w stopce wiadomości e-mail lub kontaktując się z Usługodawcą.
                </p>
                <p className="text-gray-400 leading-relaxed mt-3">
                  <strong>6.4.</strong> Rezygnacja z newslettera jest skuteczna natychmiast i nie wymaga podania przyczyny.
                </p>
              </section>

              {/* Sekcja 7 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 7. Prawa własności intelektualnej</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>7.1.</strong> Wszystkie Treści publikowane w Serwisie (teksty, grafiki, logo, kod źródłowy, animacje, fotografie) podlegają ochronie prawnej i są własnością Usługodawcy lub podmiotów trzecich, które udzieliły licencji.
                </p>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>7.2.</strong> Zabronione jest kopiowanie, modyfikowanie, rozpowszechnianie lub wykorzystywanie Treści bez pisemnej zgody Usługodawcy.
                </p>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>7.3.</strong> Marka &quot;Syntance&quot;, logo oraz inne oznaczenia są zastrzeżonymi znakami towarowymi.
                </p>
                <p className="text-gray-400 leading-relaxed mt-3">
                  <strong>7.4.</strong> Użytkownik może korzystać z Treści wyłącznie w celach informacyjnych i osobistych, zgodnie z przepisami prawa autorskiego.
                </p>
              </section>

              {/* Sekcja 8 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 8. Odpowiedzialność Usługodawcy</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>8.1.</strong> Usługodawca dokłada wszelkich starań, aby Serwis działał nieprzerwanie i prawidłowo, jednak nie gwarantuje ciągłości dostępu ze względu na:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>Konieczność przeprowadzenia konserwacji technicznej</li>
                  <li>Aktualizacje i modernizacje systemu</li>
                  <li>Działanie siły wyższej (awarie sprzętu, atak hakerski, problemy z łączem internetowym)</li>
                </ul>
                <p className="text-gray-400 leading-relaxed mt-3">
                  <strong>8.2.</strong> Usługodawca nie ponosi odpowiedzialności za:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>Szkody wynikające z korzystania lub niemożności korzystania z Serwisu</li>
                  <li>Treści publikowane przez osoby trzecie (jeśli dotyczy)</li>
                  <li>Działania Użytkowników niezgodne z Regulaminem</li>
                  <li>Problemy techniczne po stronie Użytkownika (np. brak połączenia internetowego, przestarzała przeglądarka)</li>
                </ul>
                <p className="text-gray-400 leading-relaxed mt-3">
                  <strong>8.3.</strong> Odpowiedzialność Usługodawcy jest ograniczona do wysokości rzeczywistej szkody poniesionej przez Użytkownika, z wyłączeniem szkód pośrednich i utraconych korzyści.
                </p>
              </section>

              {/* Sekcja 9 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 9. Reklamacje</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>9.1.</strong> Użytkownik może składać reklamacje dotyczące funkcjonowania Serwisu lub jakości świadczonych Usług Elektronicznych.
                </p>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>9.2.</strong> Reklamację należy przesłać na adres e-mail: <a href="mailto:biuro@syntance.com" className="text-brand hover:underline">biuro@syntance.com</a> z tematem &quot;REKLAMACJA&quot;.
                </p>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>9.3.</strong> Reklamacja powinna zawierać:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>Dane kontaktowe Użytkownika (imię, nazwisko, e-mail)</li>
                  <li>Dokładny opis problemu lub nieprawidłowości</li>
                  <li>Datę wystąpienia problemu</li>
                  <li>Żądanie lub oczekiwania wobec Usługodawcy</li>
                </ul>
                <p className="text-gray-400 leading-relaxed mt-3">
                  <strong>9.4.</strong> Usługodawca rozpatruje reklamację w terminie do <strong>14 dni roboczych</strong> od daty jej otrzymania i przesyła odpowiedź na podany adres e-mail.
                </p>
                <p className="text-gray-400 leading-relaxed mt-3">
                  <strong>9.5.</strong> Jeśli reklamacja wymaga dodatkowych informacji, Usługodawca może poprosić o uzupełnienie danych, a termin rozpatrzenia biegnie od momentu otrzymania pełnych informacji.
                </p>
              </section>

              {/* Sekcja 10 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 10. Ochrona danych osobowych</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>10.1.</strong> Administratorem danych osobowych przetwarzanych w związku z korzystaniem z Serwisu jest Syntance P.S.A.
                </p>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>10.2.</strong> Szczegółowe informacje o przetwarzaniu danych osobowych, w tym podstawie prawnej, celach, okresie przechowywania oraz prawach Użytkowników, znajdują się w <a href="/polityka-prywatnosci" className="text-brand hover:underline font-medium">Polityce Prywatności</a>.
                </p>
                <p className="text-gray-400 leading-relaxed mt-3">
                  <strong>10.3.</strong> Korzystanie z Serwisu wymaga akceptacji Polityki Prywatności oraz wyrażenia zgód określonych w formularzach.
                </p>
              </section>

              {/* Sekcja 11 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 11. Cookies i technologie śledzące</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>11.1.</strong> Serwis wykorzystuje pliki cookies oraz podobne technologie (Local Storage, Session Storage) w celu:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>Zapewnienia prawidłowego działania Serwisu (cookies niezbędne)</li>
                  <li>Analizy ruchu i optymalizacji UX (Google Analytics, Microsoft Clarity)</li>
                  <li>Personalizacji treści i dostosowania reklam</li>
                  <li>Integracji z mediami społecznościowymi</li>
                </ul>
                <p className="text-gray-400 leading-relaxed mt-3">
                  <strong>11.2.</strong> Użytkownik może zarządzać cookies w ustawieniach przeglądarki. Wyłączenie cookies może ograniczyć funkcjonalność Serwisu.
                </p>
                <p className="text-gray-400 leading-relaxed mt-3">
                  <strong>11.3.</strong> Szczegółowe informacje o cookies znajdują się w Polityce Prywatności.
                </p>
              </section>

              {/* Sekcja 12 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 12. Postanowienia końcowe</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>12.1.</strong> Regulamin wchodzi w życie z dniem publikacji w Serwisie.
                </p>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>12.2.</strong> Usługodawca zastrzega sobie prawo do zmiany Regulaminu. O zmianach Użytkownicy zostaną poinformowani poprzez komunikat w Serwisie. Zmiany wchodzą w życie po upływie 7 dni od publikacji.
                </p>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>12.3.</strong> W sprawach nieuregulowanych w Regulaminie zastosowanie mają przepisy prawa polskiego, w szczególności:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>Ustawa z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną</li>
                  <li>Ustawa z dnia 23 kwietnia 1964 r. Kodeks cywilny</li>
                  <li>Rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO)</li>
                </ul>
                <p className="text-gray-400 leading-relaxed mt-3">
                  <strong>12.4.</strong> Ewentualne spory wynikające z korzystania z Serwisu będą rozstrzygane przez sąd właściwy według siedziby Usługodawcy.
                </p>
                <p className="text-gray-400 leading-relaxed mt-3">
                  <strong>12.5.</strong> Jeśli którekolwiek z postanowień Regulaminu zostanie uznane za nieważne lub nieskuteczne, pozostałe postanowienia zachowują pełną moc.
                </p>
              </section>

              {/* Sekcja 13 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 13. Kontakt</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  W sprawach związanych z Regulaminem, funkcjonowaniem Serwisu lub świadczeniem Usług Elektronicznych prosimy o kontakt:
                </p>
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                  <p className="text-gray-400">
                    <strong>Syntance P.S.A.</strong>
                    <br />
                    Czerniec 72, 33-390 Łącko, Polska
                    <br />
                    E-mail: <a href="mailto:biuro@syntance.com" className="text-brand hover:underline">biuro@syntance.com</a>
                    <br />
                    Telefon: <a href="tel:+48662519544" className="text-brand hover:underline">+48 662 519 544</a>
                    <br />
                    Strona: <a href="https://syntance.com" className="text-brand hover:underline">syntance.com</a>
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
            "name": "Regulamin Świadczenia Usług Drogą Elektroniczną",
            "description": "Regulamin świadczenia usług drogą elektroniczną przez Syntance P.S.A. - warunki korzystania z serwisu",
            "url": "https://syntance.com/regulamin",
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
              "@type": "TermsOfService",
              "description": "Regulamin określający zasady świadczenia usług drogą elektroniczną oraz korzystania z serwisu syntance.com"
            }
          })
        }}
      />
    </>
  );
}

