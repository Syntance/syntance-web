export type PanelViewId =
  | 'overview'
  | 'products'
  | 'orders'
  | 'cms'
  | 'seo'
  | 'stats'
  | 'returns'

export const PANEL_NAV: { id: PanelViewId; label: string }[] = [
  { id: 'overview', label: 'Przegląd' },
  { id: 'products', label: 'Produkty' },
  { id: 'orders', label: 'Zamówienia' },
  { id: 'cms', label: 'CMS' },
  { id: 'seo', label: 'SEO' },
  { id: 'stats', label: 'Statystyki' },
  { id: 'returns', label: 'Zwroty' },
]

export const PROOF_BAR = [
  'PageSpeed 90+',
  'GA4 + PostHog w środku',
  'RODO i Consent Mode v2',
  '100% Twoje dane i kod',
]

export const PROBLEM_CARDS = [
  {
    emoji: '💸',
    title: 'Pięć subskrypcji miesięcznie zamiast jednego rozwiązania.',
  },
  {
    emoji: '🔑',
    title: 'Pięć logowań i pięć paneli do nauczenia.',
  },
  {
    emoji: '🧩',
    title: 'Dane rozbite — nie wiesz, co realnie sprzedaje.',
  },
]

export const SHOWCASE_STEPS: {
  id: PanelViewId
  title: string
  description: string
}[] = [
  {
    id: 'overview',
    title: 'Przegląd',
    description:
      'Wszystko, co ważne, na jednym ekranie. Przychód, zamówienia, klienci i ruch po zalogowaniu.',
  },
  {
    id: 'products',
    title: 'Produkty',
    description:
      'Dodajesz i edytujesz produkty w minutę. Ceny, warianty, zdjęcia, dostępność — bez dewelopera.',
  },
  {
    id: 'orders',
    title: 'Zamówienia',
    description: 'Od kliknięcia po wysyłkę. Statusy, płatności i dane klienta w jednym widoku.',
  },
  {
    id: 'cms',
    title: 'CMS',
    description: 'Zmieniasz teksty na żywo, w kilka sekund. Nagłówki, FAQ, ceny, sekcje strony.',
  },
  {
    id: 'seo',
    title: 'SEO',
    description: 'Tytuły i opisy per podstrona, publikowane od razu. Bez wtyczek.',
  },
  {
    id: 'stats',
    title: 'Statystyki',
    description:
      'GA4 i PostHog w jednym widoku. Sprzedaż i pełny lejek bez przeskakiwania między narzędziami.',
  },
  {
    id: 'returns',
    title: 'Zwroty i reklamacje',
    description: 'Obsługa po sprzedaży bez chaosu w mailach.',
  },
]

export const ANALYTICS_BULLETS = [
  'Pełny lejek: wyświetlenie produktu → koszyk → checkout → zakup.',
  'Przychód, zamówienia, konwersja, top produkty i kanały — na żywo.',
  'Te same nazwy zdarzeń w każdym projekcie — dane porównywalne między sklepami.',
]

export const SECURITY_PILLARS = [
  {
    emoji: '🔓',
    title: 'Własność',
    description:
      'Pełna własność kodu i treści, eksport w każdej chwili. Możesz zmienić wykonawcę.',
  },
  {
    emoji: '🛡️',
    title: 'Bezpieczeństwo',
    description: 'Next.js, zero wtyczek = zero typowych dziur WordPressa.',
  },
  {
    emoji: '🇪🇺',
    title: 'Prywatność',
    description: 'RODO, Consent Mode v2, dane w EU, brak PII w analityce.',
  },
]

export const STACK_BADGES = [
  { name: 'Next.js', description: 'Fundament każdego projektu (wydajność, SEO).' },
  { name: 'MedusaJS', description: 'Headless commerce dla sklepów.' },
  { name: 'Sanity', description: 'Opcjonalny CMS, jeśli wolisz znany standard.' },
  { name: 'PostHog', description: 'Analityka produktowa i lejek (EU).' },
  { name: 'GA4', description: 'Ruch i atrybucja.' },
  { name: 'Vercel', description: 'Hosting i deploy.' },
  { name: 'Cloudflare R2', description: 'Szybki magazyn na pliki i zdjęcia.' },
  { name: 'Stripe / Przelewy24 / BLIK', description: 'Płatności.' },
]

export const PANEL_FAQ = [
  {
    question: 'Czy będę zależny od Was przy każdej zmianie?',
    answer:
      'Nie. Teksty, ceny, SEO i FAQ zmieniasz sam, na żywo. Nasza pomoc jest potrzebna tylko przy wymianie zdjęć (optymalizacja + redeploy).',
  },
  {
    question: 'Jak dodaję nowe zdjęcia produktów?',
    answer:
      'Przesyłasz je, my optymalizujemy i wkompilowujemy w build (zwykle 2–3 min). To cena za ładowanie poniżej 1 s.',
  },
  {
    question: 'Czy mogę zostać przy Sanity / znanym CMS?',
    answer:
      'Tak — wdrożymy projekt na Sanity jako opcję. Wtedy sam edytujesz też grafiki, ale dochodzi osobna subskrypcja.',
  },
  {
    question: 'Czyje są dane i kod?',
    answer: 'Twoje. Eksport w każdej chwili, bez vendor lock-in.',
  },
  {
    question: 'Czy panel jest trudny?',
    answer: 'Pokazuje tylko to, czego używasz. Krzywa uczenia liczona w minutach, nie szkoleniach.',
  },
]

export const SCROLLBAR_SECTIONS = [
  { id: 'panel-hero', label: 'Start' },
  { id: 'panel-problem', label: 'Problem' },
  { id: 'panel-showcase', label: 'Panel' },
  { id: 'pagespeed', label: 'CMS' },
  { id: 'panel-analytics', label: 'Analityka' },
  { id: 'panel-security', label: 'Bezpieczeństwo' },
  { id: 'panel-stack', label: 'Stack' },
  { id: 'panel-faq', label: 'FAQ' },
  { id: 'panel-cta', label: 'Cennik' },
]
