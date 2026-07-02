import type { Metadata } from "next";
import Link from "next/link";
import NavbarSimple from "@/components/navbar-simple";
import Footer from "@/components/sections/footer";
import Container from "@/components/container";
import VantaBackground from "@/components/vanta-background";
import {
  legalContactEmail,
  legalContactPhone,
  legalEntityLabel,
  legalNip,
  legalRegon,
  legalTradeName,
  termsOfServiceLastUpdated,
} from "@/lib/data/legal-entity";

export const metadata: Metadata = {
  title: "Regulamin Świadczenia Usług Drogą Elektroniczną | Syntance",
  description:
    "Regulamin świadczenia usług drogą elektroniczną przez Syntance. Zasady korzystania z serwisu, warunki umów, prawa i obowiązki użytkowników.",
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
            <h1 className="mb-4 text-white glow-text">Regulamin Świadczenia Usług Drogą Elektroniczną</h1>
            <p className="text-lg text-gray-400 mb-8">
              Ostatnia aktualizacja:{" "}
              <strong className="font-medium text-gray-300">{termsOfServiceLastUpdated}</strong>
            </p>

            <div className="prose prose-lg prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 1. Postanowienia ogólne i definicje</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>1.</strong> Niniejszy Regulamin określa zasady korzystania z serwisu internetowego
                  dostępnego pod adresem <strong>syntance.com</strong> oraz zasady świadczenia usług drogą
                  elektroniczną przez Usługodawcę, zgodnie z ustawą z dnia 18 lipca 2002 r. o świadczeniu usług
                  drogą elektroniczną.
                </p>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>2.</strong> Definicje:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>
                    <strong>Usługodawca</strong> – {legalEntityLabel}, Czerniec 72, 33-390 Łącko, NIP{" "}
                    {legalNip}, REGON {legalRegon}
                  </li>
                  <li>
                    <strong>Serwis</strong> – strona internetowa syntance.com wraz ze wszystkimi podstronami
                  </li>
                  <li>
                    <strong>Użytkownik</strong> – osoba fizyczna, osoba prawna lub jednostka organizacyjna
                    nieposiadająca osobowości prawnej, korzystająca z Serwisu
                  </li>
                  <li>
                    <strong>Konsument</strong> – Użytkownik będący osobą fizyczną, korzystający z Serwisu w
                    celach niezwiązanych bezpośrednio z działalnością gospodarczą lub zawodową, a także osoba
                    fizyczna prowadząca działalność gospodarczą, dla której korzystanie z Serwisu nie ma
                    charakteru zawodowego
                  </li>
                  <li>
                    <strong>Usługi Elektroniczne</strong> – usługi świadczone drogą elektroniczną za
                    pośrednictwem Serwisu, wskazane w § 3
                  </li>
                  <li>
                    <strong>Treści</strong> – materiały publikowane w Serwisie (teksty, grafiki, zdjęcia,
                    animacje, kod źródłowy)
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 2. Informacje o Usługodawcy</h2>
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                  <p className="text-gray-400 leading-relaxed">
                    <strong>{legalTradeName}</strong>
                    <br />
                    Czerniec 72, 33-390 Łącko, Polska
                    <br />
                    NIP: {legalNip}, REGON: {legalRegon}
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
                    <br />
                    Strona:{" "}
                    <a href="https://syntance.com" className="text-brand hover:underline">
                      syntance.com
                    </a>
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 3. Rodzaje i zakres usług elektronicznych</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>1.</strong> Usługodawca świadczy nieodpłatnie następujące Usługi Elektroniczne:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400 mb-3">
                  <li>
                    <strong>Przeglądanie zawartości Serwisu</strong> – prezentacja informacji o usługach,
                    produktach i działalności Usługodawcy
                  </li>
                  <li>
                    <strong>Formularz kontaktowy</strong> – możliwość przesłania zapytania lub wiadomości do
                    Usługodawcy
                  </li>
                  <li>
                    <strong>Rezerwacja rozmowy</strong> – możliwość umówienia bezpłatnej rozmowy
                    konsultacyjnej w wybranym terminie za pośrednictwem formularza rezerwacji
                  </li>
                </ul>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>2.</strong> Umowa o świadczenie Usługi Elektronicznej zostaje zawarta z chwilą
                  rozpoczęcia korzystania z danej usługi (wyświetlenia strony, wysłania formularza, dokonania
                  rezerwacji) i ulega rozwiązaniu z chwilą zakończenia korzystania z niej. Użytkownik może w
                  każdej chwili zaprzestać korzystania z Usług Elektronicznych bez ponoszenia kosztów.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  <strong>3.</strong> Usługi profesjonalne (np. projektowanie i wdrażanie stron oraz aplikacji
                  internetowych, utrzymanie i wsparcie) świadczone są na podstawie odrębnych umów zawieranych
                  indywidualnie i nie podlegają niniejszemu Regulaminowi.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 4. Warunki techniczne korzystania z Serwisu</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>1.</strong> Do korzystania z Serwisu niezbędne są:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400 mb-3">
                  <li>urządzenie z dostępem do Internetu</li>
                  <li>
                    aktualna przeglądarka internetowa obsługująca JavaScript, cookies, HTML5 i CSS (zalecane
                    najnowsze wersje Chrome, Firefox, Safari lub Edge)
                  </li>
                  <li>
                    aktywny adres e-mail (do korzystania z formularza kontaktowego i rezerwacji rozmowy)
                  </li>
                </ul>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>2.</strong> Korzystanie z Serwisu jest dobrowolne i nieodpłatne.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  <strong>3.</strong> Zabrania się dostarczania przez Użytkownika treści o charakterze
                  bezprawnym oraz wykorzystywania Serwisu w sposób sprzeczny z prawem, dobrymi obyczajami lub
                  naruszający prawa osób trzecich, w tym podejmowania działań mogących zakłócić funkcjonowanie
                  Serwisu (np. rozsyłanie spamu, próby obejścia zabezpieczeń, automatyczne odpytywanie
                  formularzy).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">
                  § 5. Formularz kontaktowy i rezerwacja rozmowy
                </h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>1.</strong> Formularz kontaktowy umożliwia przesłanie zapytania do Usługodawcy.
                  Skorzystanie z formularza wymaga podania danych oznaczonych jako wymagane (m.in. imię, adres
                  e-mail, treść wiadomości) oraz zapoznania się z{" "}
                  <Link href="/polityka-prywatnosci" className="text-brand hover:underline">
                    Polityką prywatności
                  </Link>
                  .
                </p>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>2.</strong> Formularz rezerwacji umożliwia umówienie rozmowy konsultacyjnej w
                  wybranym, dostępnym terminie. Rezerwacja nie stanowi zawarcia umowy o świadczenie usług
                  profesjonalnych.
                </p>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>3.</strong> Dane osobowe podane w formularzach przetwarzane są na zasadach opisanych w{" "}
                  <Link href="/polityka-prywatnosci" className="text-brand hover:underline">
                    Polityce prywatności
                  </Link>{" "}
                  — w celu odpowiedzi na zapytanie lub obsługi rezerwacji (art. 6 ust. 1 lit. b RODO).
                </p>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>4.</strong> Usługodawca dokłada starań, aby odpowiadać na zapytania w terminie do{" "}
                  <strong>2 dni roboczych</strong> od otrzymania wiadomości.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  <strong>5.</strong> Formularze są chronione mechanizmami antyspamowymi (honeypot, ograniczanie
                  liczby żądań), które nie wymagają przetwarzania dodatkowych danych Użytkownika.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 6. Prawa własności intelektualnej</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>1.</strong> Wszystkie Treści publikowane w Serwisie podlegają ochronie prawnej i
                  przysługują Usługodawcy lub podmiotom trzecim, które udzieliły stosownych licencji.
                </p>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>2.</strong> Zabronione jest kopiowanie, modyfikowanie, rozpowszechnianie lub
                  wykorzystywanie Treści w celach komercyjnych bez zgody Usługodawcy wyrażonej co najmniej w
                  formie dokumentowej.
                </p>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>3.</strong> Oznaczenie „Syntance” oraz logo Serwisu stanowią oznaczenia
                  odróżniające Usługodawcę i podlegają ochronie na podstawie przepisów o zwalczaniu
                  nieuczciwej konkurencji oraz prawa autorskiego.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  <strong>4.</strong> Użytkownik może korzystać z Treści wyłącznie w ramach dozwolonego użytku
                  przewidzianego przepisami prawa autorskiego.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 7. Odpowiedzialność Usługodawcy</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>1.</strong> Usługodawca dokłada należytej staranności, aby Serwis działał nieprzerwanie
                  i prawidłowo, jednak zastrzega możliwość czasowej niedostępności Serwisu z powodu konserwacji
                  technicznej, aktualizacji lub zdarzeń o charakterze siły wyższej.
                </p>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>2.</strong> Usługodawca nie ponosi odpowiedzialności za problemy techniczne leżące po
                  stronie Użytkownika (np. brak połączenia internetowego, nieaktualna przeglądarka) ani za
                  skutki działań Użytkowników niezgodnych z Regulaminem.
                </p>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>3.</strong> Wobec Użytkowników niebędących Konsumentami odpowiedzialność Usługodawcy z
                  tytułu korzystania z Serwisu jest ograniczona do szkody rzeczywistej i nie obejmuje utraconych
                  korzyści.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  <strong>4.</strong> Ograniczenia odpowiedzialności, o których mowa w niniejszym paragrafie, nie
                  mają zastosowania wobec Konsumentów w zakresie, w jakim byłyby sprzeczne z bezwzględnie
                  obowiązującymi przepisami prawa, oraz nie dotyczą szkód wyrządzonych umyślnie.
                </p>
              </section>

              <section id="reklamacje">
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 8. Reklamacje</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>1.</strong> Użytkownik może składać reklamacje dotyczące funkcjonowania Serwisu lub
                  Usług Elektronicznych.
                </p>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>2.</strong> Reklamację należy przesłać na adres e-mail:{" "}
                  <a href={`mailto:${legalContactEmail}`} className="text-brand hover:underline">
                    {legalContactEmail}
                  </a>{" "}
                  (zalecany temat: „REKLAMACJA”) lub pisemnie na adres siedziby Usługodawcy.
                </p>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>3.</strong> Szczegółowa procedura reklamacyjna, w tym wymagana treść zgłoszenia i
                  terminy, opisana jest{" "}
                  <a href="#reklamacje-procedura" className="text-brand hover:underline font-medium">
                    poniżej
                  </a>
                  .
                </p>
                <p className="text-gray-400 leading-relaxed mb-6">
                  <strong>4.</strong> Usługodawca udziela odpowiedzi na reklamację w terminie{" "}
                  <strong>14 dni</strong> od dnia jej otrzymania.
                </p>
                <div id="reklamacje-procedura" className="rounded-lg border border-white/10 bg-white/5 p-5">
                  <h3 className="text-lg font-medium text-white mb-3">Procedura reklamacyjna</h3>
                  <p className="text-gray-400 leading-relaxed mb-3">Reklamacja powinna zawierać:</p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-400 mb-3">
                    <li>dane kontaktowe Użytkownika (imię, nazwisko, e-mail)</li>
                    <li>dokładny opis problemu lub nieprawidłowości</li>
                    <li>datę wystąpienia problemu</li>
                    <li>żądanie lub oczekiwania wobec Usługodawcy</li>
                  </ul>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    Jeśli reklamacja wymaga dodatkowych informacji, Usługodawca może poprosić o uzupełnienie
                    danych — termin rozpatrzenia biegnie od momentu otrzymania pełnych informacji.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 9. Ochrona danych osobowych</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>1.</strong> Administratorem danych osobowych przetwarzanych w związku z korzystaniem z
                  Serwisu jest Usługodawca.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  <strong>2.</strong> Szczegółowe informacje o przetwarzaniu danych osobowych — w tym cele,
                  podstawy prawne, okresy przechowywania, odbiorcy danych oraz prawa Użytkowników — znajdują
                  się w{" "}
                  <Link href="/polityka-prywatnosci" className="text-brand hover:underline font-medium">
                    Polityce prywatności
                  </Link>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 10. Cookies i narzędzia analityczne</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>1.</strong> Serwis wykorzystuje pliki cookies oraz podobne technologie w celu
                  zapewnienia prawidłowego działania Serwisu (cookies niezbędne) oraz — wyłącznie za zgodą
                  Użytkownika — w celach analitycznych i statystycznych (Google Analytics 4, PostHog, Microsoft
                  Clarity).
                </p>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>2.</strong> Zgoda na cookies inne niż niezbędne wyrażana jest za pośrednictwem banera
                  zgody przy pierwszej wizycie w Serwisie i może być w każdej chwili zmieniona lub wycofana.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  <strong>3.</strong> Szczegółowe informacje o cookies, w tym kategorie, okresy przechowywania i
                  sposób zarządzania zgodą, znajdują się w{" "}
                  <Link href="/polityka-prywatnosci" className="text-brand hover:underline font-medium">
                    Polityce prywatności
                  </Link>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 11. Pozasądowe rozwiązywanie sporów</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>1.</strong> Konsument może skorzystać z pozasądowych sposobów rozpatrywania
                  reklamacji i dochodzenia roszczeń, w tym z pomocy miejskiego lub powiatowego rzecznika
                  konsumentów, wojewódzkich inspektoratów Inspekcji Handlowej lub organizacji społecznych, do
                  których zadań statutowych należy ochrona konsumentów.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  <strong>2.</strong> Szczegółowe informacje dostępne są na stronie internetowej Urzędu Ochrony
                  Konkurencji i Konsumentów (
                  <a
                    href="https://uokik.gov.pl"
                    className="text-brand hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    uokik.gov.pl
                  </a>
                  ).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 12. Postanowienia końcowe</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>1.</strong> Regulamin wchodzi w życie z dniem publikacji w Serwisie.
                </p>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>2.</strong> Usługodawca zastrzega sobie prawo do zmiany Regulaminu z ważnych
                  przyczyn (m.in. zmiana przepisów prawa, zmiana zakresu Usług Elektronicznych). O zmianach
                  Użytkownicy zostaną poinformowani poprzez komunikat w Serwisie, a zmiany wchodzą w życie po
                  upływie 7 dni od publikacji.
                </p>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>3.</strong> W sprawach nieuregulowanych w Regulaminie zastosowanie mają przepisy prawa
                  polskiego, w szczególności:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400 mb-3">
                  <li>ustawa z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną</li>
                  <li>ustawa z dnia 23 kwietnia 1964 r. — Kodeks cywilny</li>
                  <li>ustawa z dnia 12 lipca 2024 r. — Prawo komunikacji elektronicznej</li>
                  <li>rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO)</li>
                </ul>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong>4.</strong> Spory z Użytkownikami niebędącymi Konsumentami rozstrzygane będą przez sąd
                  właściwy dla siedziby Usługodawcy. Spory z Konsumentami rozstrzygane będą przez sąd właściwy
                  według przepisów ogólnych.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  <strong>5.</strong> Jeżeli którekolwiek z postanowień Regulaminu okaże się nieważne lub
                  bezskuteczne, pozostałe postanowienia zachowują pełną moc.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">§ 13. Kontakt</h2>
                <p className="text-gray-400 leading-relaxed mb-3">
                  W sprawach związanych z Regulaminem lub funkcjonowaniem Serwisu:
                </p>
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                  <p className="text-gray-400 leading-relaxed">
                    <strong>{legalTradeName}</strong>
                    <br />
                    Czerniec 72, 33-390 Łącko, Polska
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
            name: "Regulamin Świadczenia Usług Drogą Elektroniczną",
            description:
              "Regulamin świadczenia usług drogą elektroniczną przez Syntance — warunki korzystania z serwisu",
            url: "https://syntance.com/regulamin",
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
              "@type": "TermsOfService",
              description:
                "Regulamin określający zasady świadczenia usług drogą elektroniczną oraz korzystania z serwisu syntance.com",
            },
          }),
        }}
      />
    </>
  );
}
