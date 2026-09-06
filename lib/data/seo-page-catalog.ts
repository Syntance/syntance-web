import type { PageSeo } from '@/lib/data/seo-types'
import { DISCOVERED_ROUTES } from '@/lib/data/routes.generated'

export type SeoPageCatalogEntry = Omit<PageSeo, 'id' | 'lastUpdated'> & {
  /** Kolejność w menu Magazyn → SEO */
  order: number
}

const SITE = 'https://syntance.com'

/**
 * Treść startowa dla znanych tras. NIE jest już źródłem listy podstron —
 * lista pochodzi z `DISCOVERED_ROUTES` (skan plikow page.tsx w app/, w prebuild).
 * Wpis tutaj tylko podpowiada ładniejszą nazwę i domyślne meta przy pierwszym
 * zasianiu wiersza; późniejsza edycja żyje w bazie.
 */
const CURATED_ENTRIES: SeoPageCatalogEntry[] = [
  {
    order: 1,
    pageName: 'Strona główna',
    slug: '/',
    isActive: true,
    metaTitle: 'Syntance — Strony i sklepy Next.js | PageSpeed 90+ | Polska',
    metaDescription:
      'Szybkie strony i sklepy internetowe z gwarancją PageSpeed 90+. Strategia przed kodem. Strony od 5k PLN, sklepy od 20k PLN. Realizacja w 2-4 tygodnie.',
    canonicalUrl: `${SITE}`,
    focusKeyword: 'strony Next.js',
    keywords: [
      'strony Next.js',
      'tworzenie stron',
      'strony internetowe Next.js',
      'sklepy internetowe Next.js',
      'headless ecommerce',
      'MedusaJS sklep',
      'sklep next.js',
      'strona next.js',
    ],
    ogTitle: 'Syntance — Strony i sklepy Next.js | PageSpeed 90+',
    ogDescription:
      'Szybkie strony i sklepy internetowe z gwarancją PageSpeed 90+. Strategia przed kodem. Strony od 10k PLN. Realizacja w 2-8 tygodni.',
    ogImageUrl: `${SITE}/og/og-home-1200x630.png`,
    twitterTitle: 'Syntance — Strony i sklepy Next.js | PageSpeed 90+',
    twitterDescription:
      'Szybkie strony i sklepy internetowe z gwarancją PageSpeed 90+. Strategia przed kodem. Strony od 10k PLN. Realizacja w 2-8 tygodni.',
  },
  {
    order: 2,
    pageName: 'Cennik',
    slug: '/cennik',
    isActive: true,
    metaTitle: 'Cennik stron i sklepów Next.js | Od 5000 PLN | Syntance',
    metaDescription:
      'Transparentny cennik: Strony WWW od 5000 PLN, sklepy e-commerce od 20000 PLN. Warsztat Discovery 4500 PLN. Pełna własność kodu. Sprawdź kalkulator ceny!',
    canonicalUrl: `${SITE}/cennik`,
    focusKeyword: 'cennik stron Next.js',
    keywords: [
      'cennik stron Next.js',
      'ile kosztuje strona Next.js',
      'cennik sklepu e-commerce',
      'ile kosztuje sklep internetowy',
      'ile kosztuje zrobienie strony internetowej',
      'wycena strony internetowej',
      'koszt strony internetowej',
      'cena strony internetowej',
      'cennik stron internetowych',
    ],
    ogTitle: 'Ile kosztuje strona internetowa? | Syntance',
    ogDescription:
      'Cena strony internetowej zależy od funkcjonalności. Sprawdź ile kosztuje zrobienie strony internetowej lub sklepu e-commerce.',
    ogImageUrl: `${SITE}/og/og-home-1200x630.png`,
    twitterTitle: 'Ile kosztuje strona internetowa? | Syntance',
    twitterDescription:
      'Cena strony internetowej zależy od funkcjonalności. Sprawdź ile kosztuje zrobienie strony internetowej lub sklepu e-commerce.',
  },
  {
    order: 3,
    pageName: 'Strony WWW',
    slug: '/strony-www',
    isActive: true,
    metaTitle: 'Strony internetowe dla firm | Profesjonalne strony www Next.js | Syntance',
    metaDescription:
      'Tworzymy profesjonalne strony internetowe dla firm B2B. Next.js, PageSpeed 90+, strategia marketingu i sprzedaży (faza przedwdrożeniowa).',
    canonicalUrl: `${SITE}/strony-www`,
    focusKeyword: 'strony internetowe dla firm',
    keywords: [
      'tworzenie stron internetowych',
      'strona internetowa dla firmy',
      'profesjonalna strona internetowa',
      'strony dla firm',
      'strona www dla firmy',
      'strona internetowa Next.js',
    ],
    ogTitle: 'Strony internetowe dla firm | Syntance',
    ogDescription:
      'Profesjonalne strony www w Next.js z PageSpeed 90+ i strategią marketingu i sprzedaży w standardzie.',
    ogImageUrl: `${SITE}/og/og-home-1200x630.png`,
    twitterTitle: 'Strony internetowe dla firm | Syntance',
    twitterDescription:
      'Profesjonalne strony www w Next.js z PageSpeed 90+ i strategią marketingu i sprzedaży w standardzie.',
  },
  {
    order: 4,
    pageName: 'Sklepy internetowe',
    slug: '/sklepy-internetowe',
    isActive: true,
    metaTitle: 'Sklepy internetowe dla firm | Headless e-commerce MedusaJS &amp; Next.js',
    metaDescription:
      'Budujemy sklepy internetowe w architekturze headless. MedusaJS, Next.js, zero prowizji. Sklepy od 12 000 PLN.',
    canonicalUrl: `${SITE}/sklepy-internetowe`,
    focusKeyword: 'sklep internetowy headless',
    keywords: [
      'sklep internetowy headless',
      'sklep next.js',
      'medusa.js sklep',
      'headless ecommerce',
      'własny sklep internetowy',
    ],
    ogTitle: 'Sklepy internetowe headless | Medusa &amp; Next.js | Syntance',
    ogDescription:
      'Budujemy sklepy e-commerce w architekturze headless. Zero prowizji, pełna kontrola. Sklepy od 20 000 PLN netto.',
    ogImageUrl: `${SITE}/og/og-home-1200x630.png`,
    twitterTitle: 'Sklepy internetowe headless | Medusa &amp; Next.js | Syntance',
    twitterDescription:
      'Budujemy sklepy e-commerce w architekturze headless. Zero prowizji, pełna kontrola. Sklepy od 20 000 PLN netto.',
  },
  {
    order: 5,
    pageName: 'Strategia',
    slug: '/strategia-marketingu-i-sprzedazy',
    isActive: true,
    metaTitle: 'Strategia marketingu i sprzedaży (faza przedwdrożeniowa) | Syntance',
    metaDescription:
      'Strategia marketingu i sprzedaży — fundament pod skuteczną stronę. Zakończona gotowym dokumentem strategicznym.',
    canonicalUrl: `${SITE}/strategia-marketingu-i-sprzedazy`,
    focusKeyword: 'strategia marketingu i sprzedaży',
    keywords: [
      'strategia marketingu i sprzedaży',
      'strategia strony internetowej',
      'faza przedwdrożeniowa',
      'buyer persona',
      'UVP',
    ],
    ogTitle: 'Strategia marketingu i sprzedaży | Syntance',
    ogDescription:
      'Faza przedwdrożeniowa: segmentacja, pozycjonowanie, lejek i plan SEO przed kodem.',
    ogImageUrl: `${SITE}/og/og-home-1200x630.png`,
    twitterTitle: 'Strategia marketingu i sprzedaży | Syntance',
    twitterDescription:
      'Faza przedwdrożeniowa: segmentacja, pozycjonowanie, lejek i plan SEO przed kodem.',
  },
  {
    order: 6,
    pageName: 'Panel',
    slug: '/panel',
    isActive: true,
    metaTitle: 'Panel do zarządzania sklepem i stroną — Syntance CMS + Shop | Syntance',
    metaDescription:
      'Zarządzaj stroną, produktami, zamówieniami i treściami z jednego panelu. Podgląd statystyk GA4 i PostHog, 0 zł miesięcznie, pełna własność kodu.',
    canonicalUrl: `${SITE}/panel`,
    focusKeyword: 'panel do zarządzania sklepem internetowym',
    keywords: [
      'panel do zarządzania sklepem internetowym',
      'autorski CMS bez Sanity',
      'sklep internetowy z analityką GA4 PostHog',
      'headless e-commerce panel Next.js',
    ],
    ogTitle: 'Panel sklepu Syntance — jeden panel zamiast pięciu narzędzi',
    ogDescription:
      'Autorski panel Syntance: sklep, treści strony, SEO i statystyki w jednym miejscu. Zero abonamentów.',
    ogImageUrl: `${SITE}/og/og-home-1200x630.png`,
    twitterTitle: 'Panel sklepu Syntance — jeden panel zamiast pięciu narzędzi',
    twitterDescription:
      'Autorski panel Syntance: sklep, treści strony, SEO i statystyki w jednym miejscu. Zero abonamentów.',
  },
  {
    order: 7,
    pageName: 'Panel — realizacje',
    slug: '/panel/realizacje',
    isActive: true,
    metaTitle: 'Realizacje panelu sklepu — Syntance',
    metaDescription:
      'Zrzuty ekranu panelu Syntance u klientów produkcyjnych. Zarządzanie sklepem, treściami i analityką w praktyce.',
    canonicalUrl: `${SITE}/panel/realizacje`,
    focusKeyword: 'panel sklepu realizacje',
    keywords: [
      'panel sklepu realizacje',
      'case study panel e-commerce',
      'autorski CMS sklep',
      'panel Syntance wdrożenia',
    ],
    ogTitle: 'Realizacje panelu sklepu — Syntance',
    ogDescription:
      'Zobacz, jak panel Syntance wygląda u prawdziwych klientów — zrzuty z produkcyjnych wdrożeń.',
    ogImageUrl: `${SITE}/og/og-home-1200x630.png`,
    twitterTitle: 'Realizacje panelu sklepu — Syntance',
    twitterDescription:
      'Zobacz, jak panel Syntance wygląda u prawdziwych klientów — zrzuty z produkcyjnych wdrożeń.',
  },
  {
    order: 8,
    pageName: 'Portfolio',
    slug: '/portfolio',
    isActive: true,
    metaTitle: 'Portfolio stron Next.js i sklepów — Syntance',
    metaDescription:
      'Wybrane realizacje Syntance: strony firmowe i sklepy internetowe w Next.js. Case studies z naciskiem na performance i konwersję.',
    canonicalUrl: `${SITE}/portfolio`,
    focusKeyword: 'portfolio stron Next.js',
    keywords: [
      'portfolio stron next.js',
      'realizacje sklepów internetowych',
      'case studies next.js',
      'portfolio agencji interaktywnej',
    ],
    ogTitle: 'Portfolio stron Next.js i sklepów — Syntance',
    ogDescription:
      'Realizacje Syntance: strony firmowe i sklepy headless z naciskiem na szybkość, SEO i konwersję.',
    ogImageUrl: `${SITE}/og/og-home-1200x630.png`,
    twitterTitle: 'Portfolio stron Next.js i sklepów — Syntance',
    twitterDescription:
      'Realizacje Syntance: strony firmowe i sklepy headless z naciskiem na szybkość, SEO i konwersję.',
  },
  {
    order: 10,
    pageName: 'Dlaczego Next.js',
    slug: '/nextjs',
    isActive: true,
    metaTitle: 'Dlaczego Next.js? Technologia stron Syntance',
    metaDescription:
      'laczego wybieramy Next.js? PageSpeed 90+, SEO-first, bezpieczeństwo, skalowalność. Poznaj technologię za naszymi stronami i sklepami.',
    canonicalUrl: `${SITE}/nextjs`,
    focusKeyword: 'Next.js',
    keywords: [
      'Next.js vs WordPress',
      'strony Next.js',
      'React framework',
      'headless CMS',
      'SSR SSG Next.js',
    ],
    ogTitle: 'Dlaczego Next.js? | Syntance',
    ogDescription:
      'Framework używany przez Netflix, TikTok i Nike. Poznaj technologię, która daje realną przewagę biznesową.',
    ogImageUrl: `${SITE}/og/og-home-1200x630.png`,
    twitterTitle: 'Dlaczego Next.js? | Syntance',
    twitterDescription:
      'Framework używany przez Netflix, TikTok i Nike. Poznaj technologię, która daje realną przewagę biznesową.',
  },
  {
    order: 11,
    pageName: 'O nas',
    slug: '/o-nas',
    isActive: true,
    metaTitle: 'O nas — Syntance Studio | Next.js, PageSpeed 90+',
    metaDescription:
      'Studio oferujące strony i sklepy Next.js. Specjalizujemy się w headless CMS, MedusaJS i nowoczesnym e-commerce. Strategia przed kodem. Małopolska, Polska.',
    canonicalUrl: `${SITE}/o-nas`,
    focusKeyword: 'studio Next.js Polska',
    keywords: [
      'studio Next.js Polska',
      'agencja Next.js',
      'tworzenie stron Małopolska',
    ],
    ogTitle: 'O nas | Syntance — Agencja interaktywna',
    ogDescription:
      'Syntance to agencja interaktywna i software house z Polski. Specjalizujemy się w tworzeniu stron internetowych i sklepów e-commerce w Next.js.',
    ogImageUrl: `${SITE}/og/og-home-1200x630.png`,
    twitterTitle: 'O nas | Syntance — Agencja interaktywna',
    twitterDescription:
      'Syntance to agencja interaktywna i software house z Polski. Specjalizujemy się w tworzeniu stron internetowych i sklepów e-commerce w Next.js.',
  },
  {
    order: 12,
    pageName: 'Kontakt',
    slug: '/kontakt',
    isActive: true,
    metaTitle: 'Kontakt — Syntance | Strony i sklepy Next.js',
    metaDescription:
      'Skontaktuj się z Syntance. Email: kontakt@syntance.com, tel: +48 662 519 544. Bezpłatna rozmowa o Twoim projekcie.',
    canonicalUrl: `${SITE}/kontakt`,
    focusKeyword: 'kontakt Syntance',
    keywords: [
      'kontakt Syntance',
      'wycena strony internetowej',
      'kontakt agencja webowa',
    ],
    ogTitle: 'Kontakt | Syntance',
    ogDescription:
      'Skontaktuj się z software house Next.js — Syntance. Email: kontakt@syntance.com, tel +48 537 110 170.',
    ogImageUrl: `${SITE}/og/og-home-1200x630.png`,
    twitterTitle: 'Kontakt | Syntance',
    twitterDescription:
      'Skontaktuj się z software house Next.js — Syntance. Email: kontakt@syntance.com, tel +48 537 110 170.',
  },
  {
    order: 13,
    pageName: 'Porozmawiajmy',
    slug: '/porozmawiajmy',
    isActive: true,
    metaTitle: 'Porozmawiajmy o projekcie — Syntance',
    metaDescription:
      'Strony i sklepy oparte o strategię, lejek i KPI — nie o szablon. Skontaktuj się z Syntance i opisz swój projekt.',
    canonicalUrl: `${SITE}/porozmawiajmy`,
    focusKeyword: 'kontakt projekt strony',
    keywords: [
      'strony Next.js',
      'sklepy Next.js',
      'strony internetowe Next.js',
      'sklep e-commerce Next.js',
      'MedusaJS sklep',
      'Headless CMS',
      'Sanity CMS',
      'PageSpeed 90+',
      'strony dla firm',
      'Next.js Polska',
      'tworzenie stron Next.js',
      'szybkie strony internetowe',
      'sklep next.js',
      'strona next.js',
      'sklep internetowy',
    ],
    ogTitle: 'Porozmawiajmy o projekcie — Syntance',
    ogDescription:
      'Strony i sklepy oparte o strategię, lejek i KPI. Napisz do nas — odpowiadamy w 24h.',
    ogImageUrl: `${SITE}/og/og-home-1200x630.png`,
    twitterTitle: 'Porozmawiajmy o projekcie — Syntance',
    twitterDescription:
      'Strony i sklepy oparte o strategię, lejek i KPI. Napisz do nas — odpowiadamy w 24h.',
    seoNotes: 'Strona z robots: noindex — edytuj meta, ale indeksowanie kontroluje layout.',
  },
  {
    order: 14,
    pageName: 'Dla agencji',
    slug: '/dla-agencji',
    isActive: true,
    metaTitle: 'Współpraca partnerska dla agencji — strony Next.js | Syntance',
    metaDescription:
      'Realizujemy strony i sklepy Next.js dla agencji, studiów i freelancerów. Cena to procent od cennika detalicznego, termin objęty karą umowną, kod w Twoim repozytorium. Tryb jawny albo white-label.',
    canonicalUrl: `${SITE}/dla-agencji`,
    focusKeyword: 'partner deweloperski dla agencji',
    keywords: [
      'partner deweloperski dla agencji',
      'podwykonawca Next.js',
      'white label strony internetowe',
      'wdrożenie projektu z Figmy',
      'outsourcing web development Polska',
    ],
    ogTitle: 'Współpraca partnerska dla agencji — strony Next.js',
    ogDescription:
      'Realizujemy strony i sklepy Next.js dla agencji, studiów i freelancerów. Cena to procent od cennika detalicznego, termin objęty karą umowną, kod w Twoim repozytorium. Tryb jawny albo white-label.',
    ogImageUrl: `${SITE}/og/og-home-1200x630.png`,
    twitterTitle: 'Współpraca partnerska dla agencji — strony Next.js',
    twitterDescription:
      'Realizujemy strony i sklepy Next.js dla agencji, studiów i freelancerów. Cena to procent od cennika detalicznego, termin objęty karą umowną, kod w Twoim repozytorium. Tryb jawny albo white-label.',
  },
  {
    order: 15,
    pageName: 'Polityka prywatności',
    slug: '/polityka-prywatnosci',
    isActive: true,
    metaTitle: 'Polityka prywatności | Syntance',
    metaDescription:
      'Polityka prywatności Syntance. Dowiedz się jak przetwarzamy Twoje dane osobowe.',
    canonicalUrl: `${SITE}/polityka-prywatnosci`,
    focusKeyword: 'polityka prywatności',
    keywords: [
      'polityka prywatności',
      'RODO',
      'ochrona danych',
    ],
    ogTitle: 'Polityka Prywatności | Syntance',
    ogDescription:
      'Polityka prywatności i ochrony danych osobowych zgodna z RODO',
    ogImageUrl: `${SITE}/og/og-home-1200x630.png`,
    twitterTitle: 'Polityka Prywatności | Syntance',
    twitterDescription:
      'Polityka prywatności i ochrony danych osobowych zgodna z RODO',
  },
  {
    order: 16,
    pageName: 'Regulamin',
    slug: '/regulamin',
    isActive: true,
    metaTitle: 'Regulamin świadczenia usług | Syntance',
    metaDescription:
      'Regulamin świadczenia usług przez Syntance. Warunki współpracy, realizacji projektów i reklamacji.',
    canonicalUrl: `${SITE}/regulamin`,
    focusKeyword: 'regulamin',
    keywords: [
      'regulamin',
      'warunki współpracy',
    ],
    ogTitle: 'Regulamin Świadczenia Usług Drogą Elektroniczną | Syntance',
    ogDescription:
      'Regulamin korzystania z usług elektronicznych Syntance',
    ogImageUrl: `${SITE}/og/og-home-1200x630.png`,
    twitterTitle: 'Regulamin Świadczenia Usług Drogą Elektroniczną | Syntance',
    twitterDescription:
      'Regulamin korzystania z usług elektronicznych Syntance',
  },
  {
    order: 17,
    pageName: 'Deklaracja dostępności',
    slug: '/deklaracja-dostepnosci',
    isActive: true,
    metaTitle: 'Deklaracja dostępności | Syntance',
    metaDescription:
      'Deklaracja dostępności serwisu syntance.com. Status zgodności z WCAG 2.2, sposób zgłaszania problemów i procedura skarg.',
    canonicalUrl: `${SITE}/deklaracja-dostepnosci`,
    focusKeyword: 'deklaracja dostępności',
    keywords: [
      'strony Next.js',
      'sklepy Next.js',
      'strony internetowe Next.js',
      'sklep e-commerce Next.js',
      'MedusaJS sklep',
      'Headless CMS',
      'Sanity CMS',
      'PageSpeed 90+',
      'strony dla firm',
      'Next.js Polska',
      'tworzenie stron Next.js',
      'szybkie strony internetowe',
      'sklep next.js',
      'strona next.js',
      'sklep internetowy',
    ],
    ogTitle: 'Deklaracja dostępności | Syntance',
    ogDescription:
      'Informacje o dostępności cyfrowej serwisu syntance.com.',
    ogImageUrl: `${SITE}/og/og-home-1200x630.png`,
    twitterTitle: 'Deklaracja dostępności | Syntance',
    twitterDescription:
      'Informacje o dostępności cyfrowej serwisu syntance.com.',
  },
]


/** „/strony-www" → „Strony www"; „/panel/realizacje" → „Panel — realizacje". */
function derivePageName(slug: string): string {
  if (slug === '/') return 'Strona główna'
  const parts = slug.replace(/^\//, '').split('/')
  const pretty = parts.map((part) => {
    const words = part.replace(/-/g, ' ')
    return words.charAt(0).toUpperCase() + words.slice(1)
  })
  return pretty.join(' — ')
}

const CURATED_BY_SLUG = new Map(CURATED_ENTRIES.map((entry) => [entry.slug, entry]))

/**
 * Lista podstron widoczna w Magazyn → SEO.
 *
 * Wynika z tras faktycznie obecnych w `app/`, nie z ręcznej listy — dodanie
 * nowego `page.tsx` albo zmiana nazwy folderu pojawia się w panelu sama,
 * przy najbliższym buildzie. Trasy z curated dostają dopracowane meta startowe,
 * pozostałe — sensowne wartości domyślne do uzupełnienia w panelu.
 */
export const SEO_PAGE_CATALOG: SeoPageCatalogEntry[] = DISCOVERED_ROUTES.map(
  (slug, index): SeoPageCatalogEntry => {
    const curated = CURATED_BY_SLUG.get(slug)
    if (curated) return { ...curated, order: index + 1 }
    return {
      order: index + 1,
      pageName: derivePageName(slug),
      slug,
      isActive: true,
      canonicalUrl: slug === '/' ? SITE : `${SITE}${slug}`,
    }
  },
)

/** Trasy istniejące w aplikacji — do oznaczania osieroconych wierszy w panelu. */
export const KNOWN_ROUTES: readonly string[] = DISCOVERED_ROUTES

const catalogOrder = new Map(SEO_PAGE_CATALOG.map((entry) => [entry.slug, entry.order]))

export function sortSeoPagesByCatalog(pages: PageSeo[]): PageSeo[] {
  return [...pages].sort((a, b) => {
    const orderA = catalogOrder.get(a.slug) ?? 999
    const orderB = catalogOrder.get(b.slug) ?? 999
    if (orderA !== orderB) return orderA - orderB
    return a.pageName.localeCompare(b.pageName, 'pl')
  })
}
