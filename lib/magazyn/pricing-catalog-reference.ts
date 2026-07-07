import type { PricingCategoryAdmin } from '@/lib/db/queries/pricing'
import type { PricingItem } from '@/lib/data/pricing'
import { defaultPricingData } from '@/lib/data/pricing'

/** Kanoniczny katalog — tylko do wykrywania braków w bazie (`pricingCatalogNeedsMerge`), nie do nadpisywania edytora. */
export const referencePricingCategories: PricingCategoryAdmin[] = [
  {
    id: 'base',
    name: 'Baza projektu',
    description: 'Podstawowe elementy każdego projektu',
    icon: 'Layout',
    sortOrder: 0,
    showInConfigurator: true,
    disabled: false,
  },
  {
    id: 'strategia',
    name: 'Strategia',
    description: 'Strategia marketingu i sprzedaży przed wdrożeniem',
    icon: 'Target',
    sortOrder: 1,
    showInConfigurator: true,
    disabled: false,
  },
  {
    id: 'pages',
    name: 'Podstrony',
    description: 'Dodatkowe podstrony',
    icon: 'FileText',
    sortOrder: 2,
    showInConfigurator: true,
    disabled: false,
  },
  {
    id: 'sections',
    name: 'Sekcje',
    description: 'Sekcje i komponenty',
    icon: 'Layers',
    sortOrder: 3,
    showInConfigurator: true,
    disabled: false,
  },
  {
    id: 'features',
    name: 'Funkcje',
    description: 'Zaawansowane funkcjonalności',
    icon: 'Zap',
    sortOrder: 4,
    showInConfigurator: true,
    disabled: false,
  },
  {
    id: 'integrations',
    name: 'Integracje',
    description: 'Integracje z zewnętrznymi usługami',
    icon: 'Plug',
    sortOrder: 5,
    showInConfigurator: true,
    disabled: false,
  },
  {
    id: 'payments',
    name: 'Płatności',
    description: 'Bramki płatności',
    icon: 'CreditCard',
    sortOrder: 6,
    showInConfigurator: true,
    disabled: false,
  },
  {
    id: 'shipping',
    name: 'Dostawa',
    description: 'Integracje z kurierami',
    icon: 'Truck',
    sortOrder: 7,
    showInConfigurator: true,
    disabled: false,
  },
]

const strategyRanks = { website: '0001', ecommerce: '0001', webapp: '0001' } as const

/** Pozycje z przypisanymi typami projektu — uzupełniają układ w Magazynie i konfiguratorze. */
export const referencePricingItems: PricingItem[] = [
  {
    id: 'strategia-marketing',
    name: 'Strategia marketingu i sprzedaży',
    description:
      'Cel biznesowy, buyer persony, UVP, user flows, SEO i architektura informacji. Zaliczana na poczet projektu.',
    price: defaultPricingData.config.discoveryWorkshopPrice,
    hours: 15,
    rateType: 'consulting',
    category: 'strategia',
    projectTypes: ['website', 'ecommerce', 'webapp'],
    popular: true,
    configuratorOrderRanks: { ...strategyRanks },
  },
  // BAZA — WEBSITE
  {
    id: 'web-setup',
    name: 'Setup projektu',
    description: 'Next.js, Vercel, DNS, SSL',
    price: 1600,
    hours: 8,
    category: 'base',
    projectTypes: ['website'],
    required: true,
    configuratorOrderRanks: { website: '0001' },
  },
  {
    id: 'web-design-system',
    name: 'Design System',
    description: 'Style, typografia, komponenty',
    price: 600,
    hours: 3,
    category: 'base',
    projectTypes: ['website'],
    required: true,
    configuratorOrderRanks: { website: '0002' },
  },
  {
    id: 'web-homepage',
    name: 'Strona główna',
    description: 'Do 5 sekcji, responsywność',
    price: 2200,
    hours: 11,
    category: 'base',
    projectTypes: ['website'],
    required: true,
    configuratorOrderRanks: { website: '0003' },
  },
  // PODSTRONY
  {
    id: 'page-standard',
    name: 'Podstrona standardowa',
    description: 'O nas, Kontakt, Usługi',
    price: 400,
    hours: 2,
    category: 'pages',
    projectTypes: ['website', 'ecommerce'],
    maxQuantity: 10,
    configuratorOrderRanks: { website: '0001', ecommerce: '0001' },
  },
  {
    id: 'page-cms',
    name: 'Podstrona CMS',
    description: 'Edytowalna treść w panelu CMS',
    price: 800,
    hours: 4,
    category: 'pages',
    projectTypes: ['website', 'ecommerce'],
    maxQuantity: 10,
    popular: true,
    configuratorOrderRanks: { website: '0002', ecommerce: '0002' },
  },
  {
    id: 'page-landing',
    name: 'Landing Page',
    description: 'Strona promocyjna / kampania',
    price: 1200,
    hours: 6,
    category: 'pages',
    projectTypes: ['website'],
    maxQuantity: 5,
    configuratorOrderRanks: { website: '0003' },
  },
  // SEKCJE
  {
    id: 'section-faq',
    name: 'FAQ',
    description: 'Pytania i odpowiedzi',
    price: 200,
    hours: 1,
    category: 'sections',
    projectTypes: ['website', 'ecommerce'],
    configuratorOrderRanks: { website: '0001', ecommerce: '0001' },
  },
  {
    id: 'section-portfolio',
    name: 'Portfolio / Case Studies',
    description: 'Prezentacja realizacji',
    price: 500,
    hours: 4,
    category: 'sections',
    projectTypes: ['website'],
    configuratorOrderRanks: { website: '0002' },
  },
  {
    id: 'section-testimonials',
    name: 'Opinie / Referencje',
    description: 'Karuzela opinii klientów',
    price: 300,
    hours: 2,
    category: 'sections',
    projectTypes: ['website', 'ecommerce'],
    configuratorOrderRanks: { website: '0003', ecommerce: '0002' },
  },
  {
    id: 'section-pricing',
    name: 'Cennik',
    description: 'Tabela cenowa z CTA',
    price: 400,
    hours: 3,
    category: 'sections',
    projectTypes: ['website'],
    configuratorOrderRanks: { website: '0004' },
  },
  {
    id: 'section-blog',
    name: 'Blog (lista + artykuł)',
    description: 'System blogowy z CMS',
    price: 1200,
    hours: 8,
    category: 'sections',
    projectTypes: ['website'],
    popular: true,
    configuratorOrderRanks: { website: '0005' },
  },
  {
    id: 'section-team',
    name: 'Zespół',
    description: 'Prezentacja członków zespołu',
    price: 300,
    hours: 2,
    category: 'sections',
    projectTypes: ['website'],
    configuratorOrderRanks: { website: '0006' },
  },
  {
    id: 'section-contact',
    name: 'Formularz kontaktowy',
    description: 'Z walidacją i wysyłką e-mail',
    price: 400,
    hours: 3,
    category: 'sections',
    projectTypes: ['website', 'ecommerce'],
    configuratorOrderRanks: { website: '0007', ecommerce: '0003' },
  },
  // INTEGRACJE
  {
    id: 'int-cms',
    name: 'CMS (panel treści)',
    description: 'Panel do edycji treści + szkolenie',
    price: 1000,
    hours: 5,
    category: 'integrations',
    projectTypes: ['website', 'ecommerce'],
    popular: true,
    configuratorOrderRanks: { website: '0001', ecommerce: '0001' },
  },
  {
    id: 'int-analytics',
    name: 'Analytics (GA4 + GTM)',
    description: 'Śledzenie konwersji i zdarzeń',
    price: 400,
    hours: 2,
    category: 'integrations',
    projectTypes: ['website', 'ecommerce'],
    configuratorOrderRanks: { website: '0002', ecommerce: '0002' },
  },
  {
    id: 'int-i18n',
    name: 'Wielojęzyczność',
    description: 'Dodatkowy język (bez tłumaczeń)',
    price: 0,
    hours: 0,
    percentageAdd: 20,
    category: 'integrations',
    projectTypes: ['website', 'ecommerce'],
    configuratorOrderRanks: { website: '0003', ecommerce: '0003' },
  },
  {
    id: 'int-calendly',
    name: 'Calendly / rezerwacje',
    description: 'System umawiania spotkań',
    price: 300,
    hours: 2,
    category: 'integrations',
    projectTypes: ['website'],
    configuratorOrderRanks: { website: '0004' },
  },
  {
    id: 'int-crm',
    name: 'Integracja CRM',
    description: 'Pipedrive, HubSpot, Salesforce',
    price: 600,
    hours: 4,
    category: 'integrations',
    projectTypes: ['website', 'ecommerce'],
    configuratorOrderRanks: { website: '0005', ecommerce: '0004' },
  },
  {
    id: 'int-newsletter',
    name: 'Newsletter',
    description: 'Mailchimp, ConvertKit, MailerLite',
    price: 400,
    hours: 3,
    category: 'integrations',
    projectTypes: ['website', 'ecommerce'],
    configuratorOrderRanks: { website: '0006', ecommerce: '0005' },
  },
  {
    id: 'int-chat',
    name: 'Live Chat',
    description: 'Intercom, Crisp, Tidio',
    price: 300,
    hours: 2,
    category: 'integrations',
    projectTypes: ['website', 'ecommerce'],
    configuratorOrderRanks: { website: '0007', ecommerce: '0006' },
  },
  // E-COMMERCE BASE
  {
    id: 'ecom-setup',
    name: 'Setup sklepu',
    description: 'Next.js, Medusa, Vercel',
    price: 4000,
    hours: 20,
    category: 'base',
    projectTypes: ['ecommerce'],
    required: true,
    configuratorOrderRanks: { ecommerce: '0001' },
  },
  {
    id: 'ecom-design',
    name: 'Design System sklepu',
    description: 'UI kit dla e-commerce',
    price: 2000,
    hours: 10,
    category: 'base',
    projectTypes: ['ecommerce'],
    required: true,
    configuratorOrderRanks: { ecommerce: '0002' },
  },
  {
    id: 'ecom-homepage',
    name: 'Strona główna sklepu',
    description: 'Slider, kategorie, produkty',
    price: 3000,
    hours: 15,
    category: 'base',
    projectTypes: ['ecommerce'],
    required: true,
    configuratorOrderRanks: { ecommerce: '0003' },
  },
  {
    id: 'ecom-pdp',
    name: 'Karta produktu (PDP)',
    description: 'Galeria, warianty, opinie',
    price: 2500,
    hours: 12,
    category: 'base',
    projectTypes: ['ecommerce'],
    required: true,
    configuratorOrderRanks: { ecommerce: '0004' },
  },
  {
    id: 'ecom-plp',
    name: 'Lista produktów (PLP)',
    description: 'Filtry, sortowanie, paginacja',
    price: 2000,
    hours: 10,
    category: 'base',
    projectTypes: ['ecommerce'],
    required: true,
    configuratorOrderRanks: { ecommerce: '0005' },
  },
  {
    id: 'ecom-cart',
    name: 'Koszyk + Checkout',
    description: 'Wieloetapowy checkout',
    price: 3000,
    hours: 15,
    category: 'base',
    projectTypes: ['ecommerce'],
    required: true,
    configuratorOrderRanks: { ecommerce: '0006' },
  },
  // E-COMMERCE FEATURES
  {
    id: 'ecom-search',
    name: 'Wyszukiwarka',
    description: 'Algolia / ElasticSearch',
    price: 800,
    hours: 5,
    category: 'features',
    projectTypes: ['ecommerce'],
    new: true,
    configuratorOrderRanks: { ecommerce: '0001' },
  },
  {
    id: 'ecom-wishlist',
    name: 'Lista życzeń',
    description: 'Zapisywanie ulubionych',
    price: 400,
    hours: 3,
    category: 'features',
    projectTypes: ['ecommerce'],
    configuratorOrderRanks: { ecommerce: '0002' },
  },
  {
    id: 'ecom-reviews',
    name: 'System opinii',
    description: 'Oceny i recenzje produktów',
    price: 600,
    hours: 4,
    category: 'features',
    projectTypes: ['ecommerce'],
    configuratorOrderRanks: { ecommerce: '0003' },
  },
  {
    id: 'ecom-coupons',
    name: 'Kody rabatowe',
    description: 'Kupony i promocje',
    price: 500,
    hours: 3,
    category: 'features',
    projectTypes: ['ecommerce'],
    configuratorOrderRanks: { ecommerce: '0004' },
  },
  // PŁATNOŚCI
  {
    id: 'pay-stripe',
    name: 'Stripe',
    description: 'Karty, Apple Pay, Google Pay',
    price: 800,
    hours: 4,
    category: 'payments',
    projectTypes: ['ecommerce'],
    popular: true,
    configuratorOrderRanks: { ecommerce: '0001' },
  },
  {
    id: 'pay-przelewy24',
    name: 'Przelewy24',
    description: 'Przelewy, BLIK, karty',
    price: 800,
    hours: 4,
    category: 'payments',
    projectTypes: ['ecommerce'],
    configuratorOrderRanks: { ecommerce: '0002' },
  },
  {
    id: 'pay-payu',
    name: 'PayU',
    description: 'Raty, płatność odroczona',
    price: 800,
    hours: 4,
    category: 'payments',
    projectTypes: ['ecommerce'],
    configuratorOrderRanks: { ecommerce: '0003' },
  },
  {
    id: 'pay-blik',
    name: 'BLIK One-click',
    description: 'Szybkie płatności BLIK',
    price: 400,
    hours: 2,
    category: 'payments',
    projectTypes: ['ecommerce'],
    configuratorOrderRanks: { ecommerce: '0004' },
  },
  // DOSTAWA
  {
    id: 'ship-inpost',
    name: 'InPost Paczkomaty',
    description: 'Mapa paczkomatów + API',
    price: 600,
    hours: 4,
    category: 'shipping',
    projectTypes: ['ecommerce'],
    popular: true,
    configuratorOrderRanks: { ecommerce: '0001' },
  },
  {
    id: 'ship-dpd',
    name: 'DPD',
    description: 'Kurier DPD + punkty',
    price: 400,
    hours: 2,
    category: 'shipping',
    projectTypes: ['ecommerce'],
    configuratorOrderRanks: { ecommerce: '0002' },
  },
  {
    id: 'ship-dhl',
    name: 'DHL',
    description: 'Kurier DHL + punkty',
    price: 400,
    hours: 2,
    category: 'shipping',
    projectTypes: ['ecommerce'],
    configuratorOrderRanks: { ecommerce: '0003' },
  },
  {
    id: 'ship-ups',
    name: 'UPS',
    description: 'Kurier UPS',
    price: 400,
    hours: 2,
    category: 'shipping',
    projectTypes: ['ecommerce'],
    configuratorOrderRanks: { ecommerce: '0004' },
  },
  {
    id: 'ship-poczta',
    name: 'Poczta Polska',
    description: 'Kurier + punkty',
    price: 400,
    hours: 2,
    category: 'shipping',
    projectTypes: ['ecommerce'],
    configuratorOrderRanks: { ecommerce: '0005' },
  },
  // WEBAPP BASE
  {
    id: 'webapp-setup',
    name: 'Setup aplikacji',
    description: 'Next.js, Auth, Database',
    price: 8000,
    hours: 40,
    category: 'base',
    projectTypes: ['webapp'],
    required: true,
    configuratorOrderRanks: { webapp: '0001' },
  },
  {
    id: 'webapp-design',
    name: 'Design System aplikacji',
    description: 'UI kit, komponenty, dark mode',
    price: 4000,
    hours: 20,
    category: 'base',
    projectTypes: ['webapp'],
    required: true,
    configuratorOrderRanks: { webapp: '0002' },
  },
  {
    id: 'webapp-dashboard',
    name: 'Dashboard użytkownika',
    description: 'Panel główny z widżetami',
    price: 6000,
    hours: 30,
    category: 'base',
    projectTypes: ['webapp'],
    required: true,
    configuratorOrderRanks: { webapp: '0003' },
  },
  {
    id: 'webapp-auth',
    name: 'System autentykacji',
    description: 'Logowanie, rejestracja, role',
    price: 4000,
    hours: 20,
    category: 'base',
    projectTypes: ['webapp'],
    required: true,
    configuratorOrderRanks: { webapp: '0004' },
  },
  // WEBAPP FEATURES
  {
    id: 'webapp-notifications',
    name: 'Powiadomienia',
    description: 'Push, e-mail, in-app',
    price: 1500,
    hours: 8,
    category: 'features',
    projectTypes: ['webapp'],
    configuratorOrderRanks: { webapp: '0001' },
  },
  {
    id: 'webapp-api',
    name: 'REST API',
    description: 'Dokumentacja Swagger',
    price: 2000,
    hours: 12,
    category: 'features',
    projectTypes: ['webapp'],
    configuratorOrderRanks: { webapp: '0002' },
  },
  {
    id: 'webapp-reports',
    name: 'Raporty / Eksport',
    description: 'PDF, Excel, CSV',
    price: 1200,
    hours: 8,
    category: 'features',
    projectTypes: ['webapp'],
    configuratorOrderRanks: { webapp: '0003' },
  },
  {
    id: 'webapp-admin',
    name: 'Panel administracyjny',
    description: 'Zarządzanie użytkownikami',
    price: 3000,
    hours: 16,
    category: 'features',
    projectTypes: ['webapp'],
    configuratorOrderRanks: { webapp: '0004' },
  },
]

function mergeProjectTypes(current: string[], reference: string[]): string[] {
  return [...new Set([...current, ...reference])]
}

function mergeConfiguratorOrderRanks(
  current: PricingItem['configuratorOrderRanks'],
  reference: PricingItem['configuratorOrderRanks'],
): PricingItem['configuratorOrderRanks'] {
  if (!reference) return current
  return { ...reference, ...current }
}

export function mergePricingCategoriesForAdmin(
  dbCategories: PricingCategoryAdmin[],
): PricingCategoryAdmin[] {
  const byId = new Map(dbCategories.map((category) => [category.id, category]))
  const merged: PricingCategoryAdmin[] = [...dbCategories]

  for (const reference of referencePricingCategories) {
    const existing = byId.get(reference.id)
    if (!existing) {
      merged.push(reference)
      byId.set(reference.id, reference)
      continue
    }

    const patch: Partial<PricingCategoryAdmin> = {}
    if (reference.id === 'strategia' && existing.showInConfigurator === false) {
      patch.showInConfigurator = true
    }
    if (!existing.icon && reference.icon) patch.icon = reference.icon
    if (!existing.description && reference.description) patch.description = reference.description

    if (Object.keys(patch).length === 0) continue

    const index = merged.findIndex((category) => category.id === reference.id)
    merged[index] = { ...existing, ...patch }
  }

  return merged.sort((a, b) => a.sortOrder - b.sortOrder)
}

export function mergePricingItemsForAdmin(dbItems: PricingItem[]): PricingItem[] {
  const byId = new Map(dbItems.map((item) => [item.id, item]))
  const merged: PricingItem[] = [...dbItems]

  for (const reference of referencePricingItems) {
    const existing = byId.get(reference.id)
    if (!existing) {
      merged.push(reference)
      byId.set(reference.id, reference)
      continue
    }

    const projectTypes = mergeProjectTypes(existing.projectTypes, reference.projectTypes)
    const configuratorOrderRanks = mergeConfiguratorOrderRanks(
      existing.configuratorOrderRanks,
      reference.configuratorOrderRanks,
    )

    const projectTypesChanged =
      projectTypes.length !== existing.projectTypes.length ||
      projectTypes.some((typeId) => !existing.projectTypes.includes(typeId))
    const ranksChanged =
      JSON.stringify(configuratorOrderRanks ?? {}) !==
      JSON.stringify(existing.configuratorOrderRanks ?? {})

    if (!projectTypesChanged && !ranksChanged) continue

    const index = merged.findIndex((item) => item.id === reference.id)
    merged[index] = {
      ...existing,
      projectTypes,
      configuratorOrderRanks,
    }
  }

  return merged
}

export function pricingCatalogNeedsMerge(
  dbCategories: PricingCategoryAdmin[],
  dbItems: PricingItem[],
): boolean {
  const mergedCategories = mergePricingCategoriesForAdmin(dbCategories)
  const mergedItems = mergePricingItemsForAdmin(dbItems)

  if (mergedCategories.length !== dbCategories.length) return true
  if (mergedItems.length !== dbItems.length) return true

  for (const reference of referencePricingCategories) {
    const existing = dbCategories.find((category) => category.id === reference.id)
    if (!existing) return true
    if (reference.id === 'strategia' && existing.showInConfigurator === false) return true
  }

  for (const reference of referencePricingItems) {
    const existing = dbItems.find((item) => item.id === reference.id)
    if (!existing) return true
    const missingProjectType = reference.projectTypes.some(
      (typeId) => !existing.projectTypes.includes(typeId),
    )
    if (missingProjectType) return true
  }

  return false
}
