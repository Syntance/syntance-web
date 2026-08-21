/**
 * Treści i parametry handlowe strony partnerskiej `/dla-agencji`.
 *
 * Model: rabat zarabiany wolumenem (procent od cennika detalicznego z konfiguratora
 * na /cennik), nie osobny cennik pakietowy. Anonimowość (white-label) jest usługą
 * dodatkową z dopłatą, nie rabatem.
 */

export const PARTNER_FORM_SECTION_ID = 'kontakt-partner'
export const PARTNER_HERO_SECTION_ID = 'hero-partner'
export const PARTNER_PRICING_SECTION_ID = 'cena'

export const scrollbarSections = [
  { id: PARTNER_HERO_SECTION_ID, label: 'Start' },
  { id: 'dla-kogo', label: 'Dla kogo' },
  { id: 'tryby', label: 'Tryby' },
  { id: PARTNER_PRICING_SECTION_ID, label: 'Cena' },
  { id: 'moduly', label: 'Tempo' },
  { id: 'proces', label: 'Proces' },
  { id: 'gwarancje', label: 'Gwarancje' },
  { id: 'dowod', label: 'Dowód' },
  { id: 'faq-partner', label: 'FAQ' },
  { id: PARTNER_FORM_SECTION_ID, label: 'Kontakt' },
] as const

export const audienceProfiles = [
  {
    title: 'Agencja marketingowa bez dev-a in-house',
    body:
      'Sprzedajesz kampanie, content i strategię, a strona jest częścią zakresu. Utrzymywanie etatu pod coś, co wraca kilka razy w roku, się nie spina.',
  },
  {
    title: 'Studio brandingowe',
    body:
      'Masz gotowy projekt w Figmie i zależy Ci na wdrożeniu zgodnym z makietą, nie „na tyle, na ile pozwala szablon”. Wdrażamy 1:1 — typografia, siatka, animacje.',
  },
  {
    title: 'Freelancer designer',
    body:
      'Trafił Ci się klient większy niż Twój zakres. Bierzesz projekt i prowadzenie, wykonanie oddajesz nam, relacja z klientem zostaje przy Tobie.',
  },
] as const

export interface CooperationMode {
  id: 'jawny' | 'white-label'
  name: string
  price: (surchargePercent: number) => string
  recommended: boolean
  summary: string
  rows: readonly { label: string; value: string }[]
}

export const cooperationModes: readonly CooperationMode[] = [
  {
    id: 'jawny',
    name: 'Jawny',
    price: () => 'cena partnerska',
    recommended: true,
    summary: 'Współpraca widoczna w stopce. Tańszy o dopłatę za anonimowość.',
    rows: [
      { label: 'Ślad w projekcie', value: '„development: Syntance” w stopce' },
      { label: 'Case study', value: 'możliwe po 6 miesiącach, po Twojej akceptacji' },
      { label: 'Umowa', value: 'non-circumvention w obie strony' },
      { label: 'Kontakt z Twoim klientem', value: 'tylko za Twoją zgodą' },
    ],
  },
  {
    id: 'white-label',
    name: 'White-label',
    price: (surchargePercent: number) => `cena partnerska +${surchargePercent}%`,
    recommended: false,
    summary: 'Zero śladów po nas. Rezygnujemy z portfolio z tego projektu.',
    rows: [
      { label: 'Ślad w projekcie', value: 'brak — żadnych wzmianek o Syntance' },
      { label: 'Case study', value: 'nie publikujemy nic, bezterminowo' },
      { label: 'Umowa', value: 'pełne NDA + non-circumvention' },
      { label: 'Kontakt z Twoim klientem', value: 'brak, zawsze przez Ciebie' },
    ],
  },
] as const

export const moduleItems = [
  { name: 'commerce', desc: 'koszyk, checkout, listing i karta produktu, wyszukiwarka' },
  { name: 'payments', desc: 'bramki płatnicze, webhooki, automatyczne domykanie transakcji' },
  { name: 'magazyn', desc: 'panel administracyjny: zamówienia, produkty, stany' },
  { name: 'cms', desc: 'edycja treści przez klienta, bez udziału programisty' },
  { name: 'legal-consent', desc: 'zgody cookies, RODO, strony prawne' },
  { name: 'seo-geo', desc: 'metadane, JSON-LD, sitemap, llms.txt' },
  { name: 'analytics', desc: 'GA4 i PostHog, uruchamiane dopiero po zgodzie' },
  { name: 'client-panel', desc: 'konto klienta, zwroty i reklamacje' },
] as const

export const guarantees = [
  {
    name: 'Kara umowna za opóźnienie po naszej stronie',
    desc:
      'Termin dostawy trafia do umowy razem ze stawką kary za każdy dzień zwłoki. Jeśli opóźnienie wynika z braku materiałów po Twojej stronie, termin przesuwa się o ten czas — zasada działa w obie strony.',
    highlight: true,
  },
  {
    name: 'PageSpeed 90+ na mobile',
    desc:
      'Mierzone na produkcji po starcie: strona startowa i jedna podstrona do Twojego wyboru. Poniżej progu poprawiamy na nasz koszt.',
    highlight: false,
  },
  {
    name: 'Kod w Twoim repozytorium od dnia 1',
    desc:
      'Pracujemy w repozytorium Twoim albo Twojego klienta. Bez uzależnienia od nas i bez wykupywania kodu na końcu.',
    highlight: false,
  },
  {
    name: 'SLA odpowiedzi poniżej 4 h',
    desc: 'W dni robocze. Awaria krytyczna: reakcja tego samego dnia.',
    highlight: false,
  },
  {
    name: '30 dni wsparcia po starcie',
    desc: 'Poprawki i pytania w ramach projektu, bez osobnej faktury.',
    highlight: false,
  },
] as const

/**
 * Realne pomiary Google PageSpeed Insights z wdrożenia z portfolio,
 * podane bez nazwy klienta (zgoda na publikację obejmuje case study, nie tę stronę).
 * Źródło danych: `lib/portfolio-content.ts` → raport wydajności realizacji e-commerce.
 */
export const proofRows = [
  { label: 'Performance — mobile', before: '59', after: '95' },
  { label: 'Performance — desktop', before: '85', after: '99' },
  { label: 'LCP — mobile', before: '16,1 s', after: '2,5 s' },
  { label: 'Dostępność', before: '86', after: '100' },
  { label: 'SEO', before: '92', after: '100' },
] as const
