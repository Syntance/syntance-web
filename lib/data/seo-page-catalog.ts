import { defaultSeo } from '@/lib/data/seo-defaults'
import type { PageSeo } from '@/lib/data/seo-types'

export type SeoPageCatalogEntry = Omit<PageSeo, 'id' | 'lastUpdated'> & {
  /** Kolejność w menu Magazyn → SEO */
  order: number
}

const SITE = 'https://syntance.com'

export const SEO_PAGE_CATALOG: SeoPageCatalogEntry[] = [
  {
    order: 1,
    pageName: 'Strona główna',
    slug: '/',
    isActive: true,
    metaTitle: defaultSeo.metaTitle,
    metaDescription: defaultSeo.metaDescription,
    canonicalUrl: SITE,
    focusKeyword: 'strony Next.js',
    keywords: defaultSeo.keywords,
    ogTitle: defaultSeo.ogTitle,
    ogDescription: defaultSeo.ogDescription,
    ogImageUrl: defaultSeo.ogImageUrl,
    twitterTitle: defaultSeo.twitterTitle,
    twitterDescription: defaultSeo.twitterDescription,
  },
  {
    order: 2,
    pageName: 'Cennik',
    slug: '/cennik',
    isActive: true,
    metaTitle: 'Ile kosztuje strona internetowa? Cennik 2026 | Syntance',
    metaDescription:
      'Strona firmowa i sklep e-commerce — sprawdź cenę w konfiguratorze. Wycena w kilka minut, bez zobowiązań.',
    canonicalUrl: `${SITE}/cennik`,
    focusKeyword: 'cennik stron Next.js',
    keywords: ['cennik stron internetowych', 'ile kosztuje strona Next.js', 'wycena strony www'],
    ogTitle: 'Ile kosztuje strona internetowa? | Syntance',
    ogDescription:
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
  },
  {
    order: 4,
    pageName: 'Sklepy internetowe',
    slug: '/sklepy-internetowe',
    isActive: true,
    metaTitle: 'Sklepy internetowe headless | Medusa & Next.js | Syntance',
    metaDescription:
      'Budujemy sklepy internetowe w architekturze headless. Medusa, Next.js, zero prowizji. Wycena w 24h.',
    canonicalUrl: `${SITE}/sklepy-internetowe`,
    focusKeyword: 'sklep internetowy headless',
    keywords: [
      'ile kosztuje sklep internetowy',
      'sklep internetowy dla firmy',
      'headless ecommerce',
      'sklep next.js',
      'medusajs sklep',
      'alternatywa dla Shopify',
    ],
    ogTitle: 'Sklepy internetowe headless | Syntance',
    ogDescription: 'Sklepy e-commerce na Medusa i Next.js — szybkie, skalowalne, bez prowizji platformy.',
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
  },
  {
    order: 6,
    pageName: 'Panel',
    slug: '/panel',
    isActive: true,
    metaTitle: 'Panel sklepu Syntance — sklep, CMS, SEO i analityka w jednym miejscu',
    metaDescription:
      'Zarządzaj stroną, produktami, zamówieniami, treściami i analityką GA4 + PostHog z jednego panelu. PageSpeed 90+, pełna własność kodu, RODO w standardzie.',
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
      'Autorski panel Syntance: strona, sklep, CMS, SEO i analityka GA4 + PostHog w jednym miejscu.',
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
  },
  {
    order: 9,
    pageName: 'Realizacje',
    slug: '/realizacje',
    isActive: true,
    metaTitle: 'Realizacje i case studies — Syntance',
    metaDescription:
      'Wybrane projekty Syntance: strony Next.js i sklepy Next.js z naciskiem na strategię, performance i konwersję.',
    canonicalUrl: `${SITE}/realizacje`,
    focusKeyword: 'realizacje stron Next.js',
    ogTitle: 'Realizacje i case studies — Syntance',
    ogDescription: 'Case studies z polskimi firmami — skuteczne strony i sklepy w Next.js.',
  },
  {
    order: 10,
    pageName: 'Dlaczego Next.js',
    slug: '/nextjs',
    isActive: true,
    metaTitle: 'Dlaczego Next.js? Framework, który zmienia zasady gry | Syntance',
    metaDescription:
      'Next.js to nie tylko szybkość. To bezpieczeństwo, skalowalność i realna przewaga nad konkurencją. Sprawdź, dlaczego WordPress to przeszłość.',
    canonicalUrl: `${SITE}/nextjs`,
    focusKeyword: 'Next.js',
    keywords: [
      'Next.js',
      'WordPress vs Next.js',
      'szybka strona internetowa',
      'bezpieczna strona',
      'PageSpeed',
      'React framework',
    ],
    ogTitle: 'Dlaczego Next.js? | Syntance',
    ogDescription:
      'Framework używany przez Netflix, TikTok i Nike. Poznaj technologię, która daje realną przewagę biznesową.',
  },
  {
    order: 11,
    pageName: 'O nas',
    slug: '/o-nas',
    isActive: true,
    metaTitle: 'O nas — Syntance | Agencja interaktywna i software house Next.js',
    metaDescription:
      'Syntance to agencja interaktywna i software house z Polski. Specjalizujemy się w tworzeniu stron internetowych i sklepów e-commerce w Next.js.',
    canonicalUrl: `${SITE}/o-nas`,
    focusKeyword: 'studio Next.js Polska',
    ogTitle: 'O nas | Syntance — Agencja interaktywna',
    ogDescription:
      'Syntance to agencja interaktywna i software house z Polski. Specjalizujemy się w tworzeniu stron internetowych i sklepów e-commerce w Next.js.',
  },
  {
    order: 12,
    pageName: 'Kontakt',
    slug: '/kontakt',
    isActive: true,
    metaTitle: 'Kontakt — Syntance | Strony i sklepy Next.js',
    metaDescription:
      'Skontaktuj się z software house Next.js — Syntance. Email: kontakt@syntance.com, tel +48 537 110 170. Bezpłatna konsultacja o projekcie.',
    canonicalUrl: `${SITE}/kontakt`,
    focusKeyword: 'kontakt Syntance',
    ogTitle: 'Kontakt | Syntance',
    ogDescription:
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
    ogTitle: 'Porozmawiajmy o projekcie — Syntance',
    ogDescription: 'Strony i sklepy oparte o strategię, lejek i KPI. Napisz do nas — odpowiadamy w 24h.',
    seoNotes: 'Strona z robots: noindex — edytuj meta, ale indeksowanie kontroluje layout.',
  },
  {
    order: 14,
    pageName: 'Agencje marketingowe',
    slug: '/agencje-marketingowe',
    isActive: true,
    metaTitle: 'White-Label Next.js | Strony pod marką Twojej agencji | Syntance',
    metaDescription:
      'Dostarczamy strony Next.js pod Twoją marką. PageSpeed 96+, NDA, SLA. Marża 40-60% dla agencji. Cennik partnerski od 2 900 PLN.',
    canonicalUrl: `${SITE}/agencje-marketingowe`,
    focusKeyword: 'white label strony internetowe',
    keywords: [
      'white label strony internetowe',
      'partner dev dla agencji',
      'outsourcing stron Next.js',
      'white label web development Polska',
      'strony pod marką agencji',
    ],
    ogTitle: 'White-Label Next.js | Strony pod marką Twojej agencji | Syntance',
    ogDescription:
      'Dostarczamy strony Next.js pod Twoją marką. PageSpeed 96+, NDA, SLA. Marża 40-60% dla agencji.',
  },
  {
    order: 15,
    pageName: 'Polityka prywatności',
    slug: '/polityka-prywatnosci',
    isActive: true,
    metaTitle: 'Polityka Prywatności | Syntance - Ochrona Danych Osobowych',
    metaDescription:
      'Polityka prywatności Syntance. Dowiedz się, jak przetwarzamy i chronimy Twoje dane osobowe zgodnie z RODO.',
    canonicalUrl: `${SITE}/polityka-prywatnosci`,
    focusKeyword: 'polityka prywatności',
    keywords: ['polityka prywatności', 'RODO', 'ochrona danych osobowych', 'prywatność'],
    ogTitle: 'Polityka Prywatności | Syntance',
    ogDescription: 'Transparentna ochrona prywatności użytkowników zgodnie z RODO.',
  },
  {
    order: 16,
    pageName: 'Regulamin',
    slug: '/regulamin',
    isActive: true,
    metaTitle: 'Regulamin Świadczenia Usług Drogą Elektroniczną | Syntance',
    metaDescription:
      'Regulamin świadczenia usług drogą elektroniczną przez Syntance. Zasady korzystania z serwisu, warunki umów, prawa i obowiązki użytkowników.',
    canonicalUrl: `${SITE}/regulamin`,
    focusKeyword: 'regulamin',
    keywords: ['regulamin', 'warunki korzystania', 'usługi elektroniczne', 'Syntance'],
    ogTitle: 'Regulamin Świadczenia Usług Drogą Elektroniczną | Syntance',
    ogDescription: 'Regulamin korzystania z usług elektronicznych Syntance.',
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
    ogTitle: 'Deklaracja dostępności | Syntance',
    ogDescription: 'Informacje o dostępności cyfrowej serwisu syntance.com.',
  },
]

const catalogOrder = new Map(SEO_PAGE_CATALOG.map((entry) => [entry.slug, entry.order]))

export function sortSeoPagesByCatalog(pages: PageSeo[]): PageSeo[] {
  return [...pages].sort((a, b) => {
    const orderA = catalogOrder.get(a.slug) ?? 999
    const orderB = catalogOrder.get(b.slug) ?? 999
    if (orderA !== orderB) return orderA - orderB
    return a.pageName.localeCompare(b.pageName, 'pl')
  })
}
