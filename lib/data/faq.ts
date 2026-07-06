export type FaqPricingCategory = 'pricing' | 'time' | 'trust' | 'comparison'

/** Wpis FAQ z kategoriami (accordion na /cennik). */
export interface FaqPricingEntrySanity {
  _key?: string
  question: string
  answer: string
  category: FaqPricingCategory
  order?: number
  isActive?: boolean
}

/** Prosty wpis FAQ (accordion na pozostałych landingach). */
export interface FaqSimpleEntrySanity {
  _key?: string
  question: string
  answer: string
  order?: number
  isActive?: boolean
}

export interface FaqSettingsDocument {
  faqCennik?: FaqPricingEntrySanity[] | null
  faqStronyWww?: FaqSimpleEntrySanity[] | null
  faqSklepy?: FaqSimpleEntrySanity[] | null
  faqStrategia?: FaqSimpleEntrySanity[] | null
  faqONas?: FaqSimpleEntrySanity[] | null
  faqKontakt?: FaqSimpleEntrySanity[] | null
  faqAgencje?: FaqSimpleEntrySanity[] | null
  faqHome?: FaqSimpleEntrySanity[] | null
}

export interface PricingFaqItem {
  _id: string
  question: string
  answer: string
  category: FaqPricingCategory
  order: number
}

export interface SimpleFaqQA {
  question: string
  answer: string
}

export function normalizePricingFaqItems(entries: FaqPricingEntrySanity[] | null | undefined): PricingFaqItem[] {
  const list = (entries ?? []).filter((e) => e?.isActive !== false)
  list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return list.map((e, index) => ({
    _id: typeof e._key === 'string' && e._key.length > 0 ? e._key : `faq-cennik-${index}`,
    question: e.question,
    answer: e.answer,
    category: e.category,
    order: e.order ?? 0,
  }))
}

export function normalizeSimpleFaq(entries: FaqSimpleEntrySanity[] | null | undefined): SimpleFaqQA[] {
  const list = (entries ?? []).filter((e) => e?.isActive !== false)
  list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return list.map((e) => ({
    question: e.question,
    answer: e.answer,
  }))
}

/** Konwersja domyślnych wpisów FAQ → format edytora CMS (Magazyn). */
export function simpleFaqToCmsEntries(
  items: SimpleFaqQA[],
  keyPrefix: string,
): FaqSimpleEntrySanity[] {
  return items.map((item, index) => ({
    _key: `${keyPrefix}-${index + 1}`,
    question: item.question,
    answer: item.answer,
    order: index,
    isActive: true,
  }))
}

/** Fallback /cennik — tokeny cenowe jak w interpolate. */
export const defaultFaqItems: PricingFaqItem[] = [
  {
    _id: 'default-1',
    category: 'pricing',
    question: 'Ile kosztuje strona internetowa?',
    answer:
      'Strona firmowa zaczyna się od {{WEBSITE_NET}} PLN netto (baza projektu w konfiguratorze — bez dodatkowych elementów). Cena zależy od liczby podstron, funkcjonalności i integracji. Skorzystaj z konfiguratora powyżej, żeby poznać dokładną wycenę dla Twojego projektu.',
    order: 1,
  },
  {
    _id: 'default-2',
    category: 'pricing',
    question: 'Ile kosztuje sklep internetowy?',
    answer:
      'Sklep e-commerce zaczyna się od {{ECOMMERCE_NET}} PLN netto (baza w konfiguratorze — sama baza produktu). Pełnofunkcyjny sklep z płatnościami, filtrowaniem i kontami użytkowników to wyższy zakres — dopasuj elementy w konfiguratorze. Aplikacje typu marketplace — zwykle od około 50 000 PLN w górę.',
    order: 2,
  },
  {
    _id: 'default-3',
    category: 'pricing',
    question: 'Dlaczego ceny zaczynają się od {{WEBSITE_NET}} PLN, a nie 500 zł?',
    answer:
      'Jako software house budujemy w Next.js — tej samej technologii, z której korzystają m.in. Nike, Netflix i Notion. To nie jest szablon WordPressa. Dostajesz kod pisany pod Twój projekt, bardzo krótki czas ładowania (Core Web Vitals ok. 95+) i witrynę, która przetrwa lata bez „aktualizacji wtyczek”.',
    order: 3,
  },
  {
    _id: 'default-4',
    category: 'pricing',
    question: 'Od czego zależy cena strony?',
    answer:
      'Główne czynniki: liczba podstron, rodzaj funkcjonalności (formularz, blog, galeria), integracje (CMS, płatności, newsletter) oraz poziom animacji. Konfigurator powyżej pokaże Ci dokładny rozkład kosztów.',
    order: 4,
  },
  {
    _id: 'default-5',
    category: 'time',
    question: 'Ile trwa realizacja strony?',
    answer:
      'Strona firmowa: 2-4 tygodnie. Sklep e-commerce: 4-8 tygodni. Widzisz postęp na żywo (preview link) — nie czekasz 3 miesiące na "efekt końcowy".',
    order: 5,
  },
  {
    _id: 'default-6',
    category: 'time',
    question: 'Co to jest Strategia marketingu i sprzedaży?',
    answer:
      '2–3 godzinne spotkanie strategiczne (faza przedwdrożeniowa), na którym ustalamy m.in. segmentację, pozycjonowanie, UVP, buyer persony, lejek marketingowy, user flows, plan SEO i analityki. Wynikiem jest gotowy dokument strategiczny. Pełna usługa kosztuje {{DISCOVERY_NET}} PLN i jest zaliczana na poczet projektu.',
    order: 6,
  },
  {
    _id: 'default-7',
    category: 'trust',
    question: 'A co jeśli efekt mi się nie spodoba?',
    answer:
      'Widzisz postęp co tydzień na podglądzie (preview link). Poprawki wdrażamy na bieżąco — nie po 3 miesiącach. Jeśli coś nie pasuje, zmieniamy od razu.',
    order: 7,
  },
  {
    _id: 'default-8',
    category: 'trust',
    question: 'Czy mogę rozłożyć płatność?',
    answer:
      'Tak. Standardowy model: 50% na start, 50% przy odbiorze. Przy większych projektach możliwe płatności w 3 ratach.',
    order: 8,
  },
  {
    _id: 'default-9',
    category: 'trust',
    question: 'Co jeśli potrzebuję zmian po wdrożeniu?',
    answer:
      'Oferujemy pakiety opieki od 500 PLN/msc — poprawki, aktualizacje, wsparcie. Możesz też zlecać zmiany jednorazowo.',
    order: 9,
  },
  {
    _id: 'default-10',
    category: 'comparison',
    question: 'Dlaczego Syntance, a nie tańszy freelancer?',
    answer:
      'Freelancer za 2k PLN często oddaje szablon WordPress, który po roku wymaga lawinowych aktualizacji wtyczek. My, jako software house, dostarczamy kod pod Twój projekt — Twój, szybki i pod kontrolą. To inwestycja w jakość wdrożenia, nie koszt jednorazowy.',
    order: 10,
  },
]

export const defaultFaqStronyWww: SimpleFaqQA[] = [
  {
    question: 'Ile kosztuje profesjonalna strona internetowa?',
    answer:
      'Strony zaczynają się od {{WEBSITE_NET}} PLN netto (baza w konfiguratorze). Cena zależy od zakresu — liczby podstron, integracji, funkcjonalności. Użyj naszego konfiguratora cennika, aby poznać orientacyjną wycenę.',
  },
  {
    question: 'Jak długo trwa tworzenie strony internetowej?',
    answer:
      'Standardowa strona firmowa to 2-4 tygodnie. Projekty enterprise z rozbudowaną funkcjonalnością — 4-8 tygodni. Dokładny timeline ustalamy po fazie strategicznej.',
  },
  {
    question: 'Czy mogę sam edytować stronę?',
    answer:
      'Tak! Każda strona ma panel Sanity CMS — intuicyjny edytor, w którym samodzielnie zmieniasz teksty, zdjęcia i dodajesz podstrony. Bez programisty, bez dodatkowych kosztów.',
  },
  {
    question: 'Dlaczego Next.js zamiast WordPress?',
    answer:
      'Next.js = szybkość (PageSpeed 90+ vs 30-50 na WP), bezpieczeństwo (zero wtyczek = zero dziur), lepsze SEO. WordPress to 60% zhakowanych stron w sieci.',
  },
  {
    question: 'Czy oferujecie strony internetowe w Krakowie?',
    answer:
      'Tak — obsługujemy klientów z całej Polski, ze szczególnym uwzględnieniem Krakowa i Małopolski. Spotkanie możemy prowadzić zdalnie albo ustalić termin na miejscu.',
  },
]

export const defaultFaqSklepy: SimpleFaqQA[] = [
  {
    question: 'Ile kosztuje sklep internetowy headless?',
    answer:
      'Sklepy zaczynają się od {{ECOMMERCE_NET}} PLN netto (baza w konfiguratorze). Cena zależy od liczby funkcji, integracji i stopnia customizacji. Skorzystaj z konfiguratora cennika, żeby poznać orientacyjną wycenę.',
  },
  {
    question: 'Czym różni się headless od Shopify?',
    answer:
      'Headless = pełna własność kodu, zero prowizji od sprzedaży, nieograniczona customizacja. Shopify = wynajem platformy, prowizje 0.5-2%, ograniczenia szablonu.',
  },
  {
    question: 'Jak długo trwa budowa sklepu?',
    answer: 'Sklep standard (katalog, koszyk, płatności): 4-8 tygodni. Sklep pro z integracjami: 8-12 tygodni.',
  },
  {
    question: 'Czy Medusa to sprawdzona technologia?',
    answer:
      'Tak! Medusa to open-source backed by $9M VC funding. Używany przez firmy jak Tekla, Summer Health i setki innych.',
  },
  {
    question: 'Czy mogę migrować z WooCommerce/Shopify?',
    answer: 'Tak, przeprowadzamy pełną migrację — produkty, warianty, klienci, historia zamówień.',
  },
]

export const defaultFaqStrategia: SimpleFaqQA[] = [
  {
    question: 'Czy mogę pominąć strategię i od razu zacząć od projektu?',
    answer:
      'Możesz, ale ryzykujesz, że strona będzie ładna, ale nieskuteczna. 80% naszych klientów, którzy przyszli "tylko po stronę", po strategii marketingu i sprzedaży zmienili całą koncepcję.',
  },
  {
    question: 'Ile trwa Strategia marketingu i sprzedaży?',
    answer: 'Spotkanie to 2-3 godziny. Dokument strategiczny otrzymujesz w ciągu 3-5 dni roboczych.',
  },
  {
    question: 'Co jeśli już mam strategię?',
    answer:
      'Świetnie! Wtedy możemy od razu przejść do projektu. Podczas briefu zweryfikujemy, czy masz wszystkie elementy.',
  },
  {
    question: 'Czy strategia jest wliczona w cenę strony?',
    answer:
      'Tak. Każdy projekt strony lub sklepu zawiera uproszczoną wersję strategii w cenie. Pełna Strategia marketingu i sprzedaży ({{DISCOVERY_NET}} PLN) to opcja dla firm, które chcą głębszej analizy.',
  },
  {
    question: 'Dla jakiej wielkości firm jest Strategia marketingu i sprzedaży?',
    answer:
      'Dla firm, które traktują stronę jako narzędzie biznesowe, nie wizytówkę. Typowo: 1-50 pracowników, B2B lub usługi premium B2C.',
  },
]

export const defaultFaqONas: SimpleFaqQA[] = [
  {
    question: 'Czym jest Syntance — agencja interaktywna czy software house?',
    answer:
      'Syntance łączy rolę software house z agencją interaktywną: dostarczamy architekturę, kod Next.js oraz headless commerce, a przy tym dopasowujemy UX, komunikację i cele biznesowe.',
  },
  {
    question: 'Czym różni się Syntance od innych agencji webowych?',
    answer:
      'Jako agencja webowa stawiamy na strategię przed designem. Nie zaczynamy od grafiki — zaczynamy od pytania "co ta strona ma osiągnąć?". Używamy nowoczesnych technologii (Next.js, headless CMS) zamiast przestarzałych rozwiązań.',
  },
  {
    question: 'Szukam firmy od stron internetowych — czy Syntance to dobry wybór?',
    answer:
      'Jeśli szukasz firmy od stron internetowych, która stawia na jakość, wydajność i strategiczne podejście — tak. Specjalizujemy się w stronach dla firm B2B, e-commerce i usług profesjonalnych.',
  },
  {
    question: 'Ile kosztuje tworzenie stron internetowych w firmie Syntance?',
    answer:
      'Tworzenie stron internetowych w naszej firmie zaczyna się od {{WEBSITE_NET}} PLN netto przy samej bazie w konfiguratorze (bez dodatków). Sklepy e-commerce od {{ECOMMERCE_NET}} PLN netto w tej samej logice. Dokładna wycena zależy od zakresu projektu.',
  },
  {
    question: 'Gdzie znajduje się Syntance?',
    answer: 'Syntance to software house z Polski działający zdalnie. Współpracujemy z klientami z całej Polski i Europy.',
  },
  {
    question: 'Jak długo trwa realizacja projektu?',
    answer: 'Strona internetowa: 2-4 tygodnie. Sklep e-commerce: 4-8 tygodni.',
  },
  {
    question: 'Czy oferujecie wsparcie po wdrożeniu?',
    answer:
      'Tak. Każdy projekt objęty jest 30-dniową gwarancją. Oferujemy również pakiety opieki technicznej.',
  },
]

export const defaultFaqKontakt: SimpleFaqQA[] = [
  {
    question: 'Jak szybko odpowiadamy?',
    answer:
      'Zwykle odpowiadamy w ciągu 24 godzin roboczych. Na pilne sprawy — zadzwoń bezpośrednio pod numer kontaktowy Syntance.',
  },
  {
    question: 'Czy pierwsza rozmowa jest płatna?',
    answer: 'Nie. 30-minutowa rozmowa wstępna jest bezpłatna i bez zobowiązań.',
  },
  {
    question: 'Czy pracujemy z klientami spoza Polski?',
    answer:
      'Tak. Pracujemy zdalnie z klientami z całej Europy. Komunikacja po polsku lub angielsku.',
  },
  {
    question: 'Jaki jest minimalny budżet na projekt?',
    answer:
      'Strony od {{WEBSITE_NET}} PLN netto (pakiet startowy), sklepy od {{ECOMMERCE_NET}} PLN netto. Dokładna wycena po rozmowie o zakresie.',
  },
]

export const defaultFaqHome: SimpleFaqQA[] = [
  {
    question: 'Ile kosztuje strona lub sklep internetowy?',
    answer:
      'Strony zaczynają się od {{WEBSITE_NET}} PLN netto, sklepy e-commerce od {{ECOMMERCE_NET}} PLN netto (baza projektu w konfiguratorze). Dokładną wycenę pod Twój zakres poznasz w interaktywnym konfiguratorze cennika.',
  },
  {
    question: 'Czym jest Syntance Panel?',
    answer:
      'To nasz autorski panel administracyjny — jeden interfejs do zarządzania stroną, treściami (Syntance CMS), sklepem i analityką GA4 + PostHog. W standardzie, bez dodatkowej subskrypcji. Wolisz Sanity? Wdrożymy je jako opcję.',
  },
  {
    question: 'Ile trwa realizacja projektu?',
    answer: 'Strona internetowa: 2-4 tygodnie. Sklep e-commerce: 4-8 tygodni. Postęp widzisz na bieżąco na podglądzie (preview link).',
  },
  {
    question: 'Czy dostanę pełną własność kodu?',
    answer:
      'Tak. Kod jest w 100% Twój — bez vendor lock-inu. Możesz zmienić wykonawcę w dowolnym momencie, bez utraty danych ani konieczności migracji.',
  },
  {
    question: 'Czy mogę sam edytować treści bez programisty?',
    answer:
      'Tak. W Syntance CMS (część Syntance Panel) edytujesz teksty, zdjęcia i produkty samodzielnie, na żywo — bez znajomości kodu i bez czekania na programistę.',
  },
  {
    question: 'A co jeśli efekt mi się nie spodoba?',
    answer:
      'Widzisz postęp co tydzień na podglądzie (preview link) i zgłaszasz poprawki na bieżąco. Każdy projekt objęty jest też 30-dniową gwarancją po wdrożeniu.',
  },
]

export const defaultFaqAgencje: SimpleFaqQA[] = [
  {
    question: 'Mam freelancera na WP, po co mi to?',
    answer:
      'Twój freelancer często kończy na niskim wyniku w PageSpeed. Z nami w modelu WL: kupujesz np. od 2,9 tys., sprzedajesz np. za 8 tys. — zostaje Ci marża w tysiącach złotych przy wyższej jakości dostarczenia.',
  },
  {
    question: 'Za drogo — freelancer WP bierze 3 tys.',
    answer:
      'Freelancer za 3 tys. to często słaba wydajność, bez porządnego CMS i bez gwarancji. W pakiecie partnerskim od 2 900 PLN masz m.in. PageSpeed 96+, CMS pod treści, SLA i NDA.',
  },
  {
    question: 'Klient nie zna headless, chce WP.',
    answer:
      'Klient nie kupuje technologii — kupuje wynik. Panel treści jest prosty w obsłudze; dla klienta wygląda jak „normalna” strona do edycji.',
  },
  {
    question: 'A co jeśli klient chce zmiany?',
    answer:
      'Treści edytuje sam w CMS. Zmiany w zakresie rozwoju obsługujemy w kanale partnerskim — SLA odpowiedzi poniżej 4 godzin.',
  },
  {
    question: 'Nie chcę NDA.',
    answer:
      'NDA chroni Ciebie: gwarantuje, że nigdy nie skontaktujemy się z Twoim klientem i nie ujawnimy współpracy.',
  },
  {
    question: 'Jak wygląda komunikacja?',
    answer: 'Jeden kanał Slack lub Teams. Brief od Ciebie → my realizujemy → Ty akceptujesz.',
  },
]
