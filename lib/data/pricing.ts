// Typy TypeScript
export interface PricingCategory {
  id: string
  name: string
  description?: string
  icon?: string
  disabled?: boolean
  /** Kolejność sekcji w konfiguratorze /cennik (niższa = wyżej, po bloku „W cenie bazowej”). */
  sortOrder?: number
}

export interface ProjectType {
  id: string
  name: string
  description?: string
  basePrice?: number
  icon?: string
  disabled?: boolean
}

export interface PricingItem {
  id: string
  name: string
  description?: string
  price: number
  hours: number
  rateType?: 'dev' | 'consulting'
  category: string
  projectTypes: string[]
  required?: boolean
  defaultSelected?: boolean
  includedInBase?: boolean
  maxQuantity?: number
  percentageAdd?: number
  orderRank?: string
  configuratorOrderRanks?: Partial<
    Record<'website' | 'ecommerce' | 'webapp', string>
  >
  dependencies?: string[]
  bundledWith?: string[]
  popular?: boolean
  new?: boolean
  disabled?: boolean
  hidePrice?: boolean
  // Notyfikacje
  notificationOnAdd?: boolean
  notificationAddTitle?: string
  notificationAddText?: string
  notificationAddConfirmText?: string
  notificationAddCancelText?: string
  notificationOnRemove?: boolean
  notificationRemoveTitle?: string
  notificationRemoveText?: string
  notificationRemoveConfirmText?: string
  notificationRemoveCancelText?: string
}

export type PricingPackageProjectType = 'website' | 'ecommerce' | 'webapp'

export type PricingPackageCustomLine = {
  id: string
  name: string
  description?: string
}

export type PricingPackage = {
  id: string
  name: string
  description?: string
  projectType: PricingPackageProjectType
  priceNet: number
  hours: number
  /** Tekst na karcie pakietu, np. „14–21 dni roboczych”. */
  deliveryTime?: string
  /** ID pozycji z katalogu cennika w pakiecie. */
  itemIds: string[]
  /** Własne pozycje spoza katalogu (np. SLA, copy). */
  customLines: PricingPackageCustomLine[]
  sortOrder: number
  popular?: boolean
  disabled?: boolean
  /** Cena „od X PLN” na podstronach marketingowych dla tego typu projektu. */
  useAsStartPrice?: boolean
}

export type ProjectTypeBundleRow = {
  projectTypeId: string
  baseCategorySlug?: string
  bundlePriceNet?: number
  /** Gdy > 0: jedna liczba roboczogodzin na całą bazę zamiast sumy godzin pozycji w pakiecie. */
  bundleBaseHours?: number
}

export interface PricingConfig {
  vatRate: number
  depositPercent: number
  depositFixed: number
  calendlyUrl?: string
  ctaTexts: {
    reserve: string
    workshop: string
    pdf: string
  }
  /** Gdy w `projectTypeBundles` brak sluga dla wiersza — ten slug (np. „base”). */
  baseProjectCategoryId?: string
  /** Ustawienia pakietu netto + kategorii bazy per typ projektu (referencje → id slug). */
  projectTypeBundles?: ProjectTypeBundleRow[]
  /** @deprecated Stare pole — używane gdy brak wiersza w `projectTypeBundles`. */
  baseProjectCategoryIdWebsite?: string
  baseProjectCategoryIdEcommerce?: string
  baseProjectCategoryIdWebapp?: string
  /** @deprecated Stare pole — używane gdy brak wiersza w `projectTypeBundles`. */
  baseProjectBundlePriceWebsite?: number
  baseProjectBundlePriceEcommerce?: number
  baseProjectBundlePriceWebapp?: number
  // Ceny startowe
  discoveryWorkshopPrice: number
  websiteStartPrice: number
  websiteAdvancedStartPrice: number
  ecommerceStandardStartPrice: number
  ecommerceProStartPrice: number
  webappStartPrice: number
  // Stawki
  hourlyRateDev: number
  hourlyRateConsulting: number
  workHoursPerDay: number
  /** Gotowe pakiety stron / sklepów (cena, czas, pozycje). */
  packages?: PricingPackage[]
}

// Wartości pomocnicze / fallback (np. SEO) — pełny config w `pricingDataQuery`
export interface StartingPrices {
  discoveryWorkshopPrice: number
  websiteStartPrice: number
  websiteAdvancedStartPrice: number
  ecommerceStandardStartPrice: number
  ecommerceProStartPrice: number
  webappStartPrice: number
}

// Domyślne ceny startowe (fallback)
export const defaultStartingPrices: StartingPrices = {
  discoveryWorkshopPrice: 8000,
  websiteStartPrice: 5400,
  websiteAdvancedStartPrice: 12000,
  ecommerceStandardStartPrice: 12000,
  ecommerceProStartPrice: 25000,
  webappStartPrice: 30000,
}

export interface PricingData {
  categories: PricingCategory[]
  projectTypes: ProjectType[]
  items: PricingItem[]
  config: PricingConfig
}

// Domyślne dane (fallback gdy Sanity nie jest skonfigurowane)
export const defaultPricingData: PricingData = {
  categories: [
    { id: 'base', name: 'Baza projektu', icon: 'Layout', sortOrder: 0 },
    { id: 'strategia', name: 'Strategia', icon: 'Target', description: 'Strategia marketingu i sprzedaży przed wdrożeniem', sortOrder: 1 },
    { id: 'pages', name: 'Podstrony', icon: 'FileText', sortOrder: 2 },
    { id: 'sections', name: 'Sekcje', icon: 'Layers', sortOrder: 3 },
    { id: 'features', name: 'Funkcje', icon: 'Zap', sortOrder: 4 },
    { id: 'integrations', name: 'Integracje', icon: 'Plug', sortOrder: 5 },
    { id: 'payments', name: 'Płatności', icon: 'CreditCard', sortOrder: 6 },
    { id: 'shipping', name: 'Dostawa', icon: 'Truck', sortOrder: 7 },
  ],
  projectTypes: [
    { id: 'website', name: 'Strona WWW', basePrice: 5000, icon: 'Globe' },
    { id: 'ecommerce', name: 'Sklep e-commerce', basePrice: 20000, icon: 'ShoppingCart' },
    { id: 'webapp', name: 'Aplikacja webowa', basePrice: 30000, icon: 'Smartphone' },
  ],
  items: [
    {
      id: 'strategia-marketing',
      name: 'Strategia marketingu i sprzedaży',
      description:
        'Cel biznesowy, buyer persony, UVP, user flows, SEO i architektura informacji. Zaliczana na poczet projektu.',
      price: 8000,
      hours: 15,
      rateType: 'consulting',
      category: 'strategia',
      projectTypes: ['website', 'ecommerce', 'webapp'],
      popular: true,
    },
    // BAZA - WEBSITE
    { id: 'web-setup', name: 'Setup projektu', description: 'Next.js, Vercel, DNS, SSL', price: 1600, hours: 8, category: 'base', projectTypes: ['website'], required: true },
    { id: 'web-design-system', name: 'Design System', description: 'Style, typografia, komponenty', price: 600, hours: 3, category: 'base', projectTypes: ['website'], required: true },
    { id: 'web-homepage', name: 'Strona główna', description: 'Do 5 sekcji, responsywność', price: 2200, hours: 11, category: 'base', projectTypes: ['website'], required: true },
    
    // PODSTRONY
    { id: 'page-standard', name: 'Podstrona standardowa', description: 'O nas, Kontakt', price: 400, hours: 2, category: 'pages', projectTypes: ['website', 'ecommerce'], maxQuantity: 10 },
    { id: 'page-cms', name: 'Podstrona CMS', description: 'Edytowalna w Sanity', price: 800, hours: 4, category: 'pages', projectTypes: ['website', 'ecommerce'], maxQuantity: 10, popular: true },
    
    // SEKCJE
    { id: 'section-faq', name: 'FAQ', price: 200, hours: 1, category: 'sections', projectTypes: ['website', 'ecommerce'] },
    { id: 'section-portfolio', name: 'Portfolio / Case Studies', price: 500, hours: 4, category: 'sections', projectTypes: ['website'] },
    { id: 'section-testimonials', name: 'Opinie / Referencje', price: 300, hours: 2, category: 'sections', projectTypes: ['website', 'ecommerce'] },
    { id: 'section-pricing', name: 'Cennik', price: 400, hours: 3, category: 'sections', projectTypes: ['website'] },
    { id: 'section-blog', name: 'Blog (lista + artykuł)', price: 1200, hours: 8, category: 'sections', projectTypes: ['website'], popular: true },
    
    // INTEGRACJE
    { id: 'int-cms', name: 'CMS Sanity', description: 'Panel do edycji + szkolenie', price: 1000, hours: 5, category: 'integrations', projectTypes: ['website', 'ecommerce'], popular: true },
    { id: 'int-analytics', name: 'Analytics (GA4 + GTM)', price: 400, hours: 2, category: 'integrations', projectTypes: ['website', 'ecommerce'] },
    { id: 'int-i18n', name: 'Wielojęzyczność', description: 'Dodatkowy język (bez tłumaczeń)', price: 0, hours: 0, percentageAdd: 20, category: 'integrations', projectTypes: ['website', 'ecommerce'] },
    { id: 'int-calendly', name: 'Calendly / rezerwacje', price: 300, hours: 2, category: 'integrations', projectTypes: ['website'] },
    { id: 'int-crm', name: 'Integracja CRM', description: 'Pipedrive, HubSpot, itp.', price: 600, hours: 4, category: 'integrations', projectTypes: ['website', 'ecommerce'] },
    
    // E-COMMERCE BASE
    { id: 'ecom-setup', name: 'Setup sklepu', description: 'Next.js, Medusa/Shopify, Vercel', price: 4000, hours: 20, category: 'base', projectTypes: ['ecommerce'], required: true },
    { id: 'ecom-design', name: 'Design System sklepu', price: 2000, hours: 10, category: 'base', projectTypes: ['ecommerce'], required: true },
    { id: 'ecom-homepage', name: 'Strona główna sklepu', price: 3000, hours: 15, category: 'base', projectTypes: ['ecommerce'], required: true },
    { id: 'ecom-pdp', name: 'Karta produktu (PDP)', price: 2500, hours: 12, category: 'base', projectTypes: ['ecommerce'], required: true },
    { id: 'ecom-plp', name: 'Lista produktów (PLP)', price: 2000, hours: 10, category: 'base', projectTypes: ['ecommerce'], required: true },
    { id: 'ecom-cart', name: 'Koszyk + Checkout', price: 3000, hours: 15, category: 'base', projectTypes: ['ecommerce'], required: true },
    
    // PŁATNOŚCI
    { id: 'pay-stripe', name: 'Stripe', price: 800, hours: 4, category: 'payments', projectTypes: ['ecommerce'], popular: true },
    { id: 'pay-przelewy24', name: 'Przelewy24', price: 800, hours: 4, category: 'payments', projectTypes: ['ecommerce'] },
    { id: 'pay-blik', name: 'BLIK', price: 400, hours: 2, category: 'payments', projectTypes: ['ecommerce'] },
    
    // DOSTAWA
    { id: 'ship-inpost', name: 'InPost Paczkomaty', price: 600, hours: 4, category: 'shipping', projectTypes: ['ecommerce'], popular: true },
    { id: 'ship-dpd', name: 'DPD / DHL', price: 400, hours: 2, category: 'shipping', projectTypes: ['ecommerce'] },
    
    // WEBAPP BASE
    { id: 'webapp-setup', name: 'Setup aplikacji', description: 'Next.js, Auth, Database', price: 8000, hours: 40, category: 'base', projectTypes: ['webapp'], required: true },
    { id: 'webapp-design', name: 'Design System aplikacji', price: 4000, hours: 20, category: 'base', projectTypes: ['webapp'], required: true },
    { id: 'webapp-dashboard', name: 'Dashboard użytkownika', price: 6000, hours: 30, category: 'base', projectTypes: ['webapp'], required: true },
    { id: 'webapp-auth', name: 'System autentykacji', description: 'Logowanie, rejestracja, role', price: 4000, hours: 20, category: 'base', projectTypes: ['webapp'], required: true },
  ],
  config: {
    vatRate: 23,
    depositPercent: 20,
    depositFixed: 500,
    calendlyUrl: 'https://calendly.com/syntance/discovery',
    ctaTexts: {
      reserve: 'Wyślij formularz',
      workshop: 'Zamów Strategię marketingu i sprzedaży',
      pdf: 'Pobierz wycenę PDF',
    },
    baseProjectCategoryId: 'base',
    projectTypeBundles: [
      { projectTypeId: 'website', baseCategorySlug: 'base', bundlePriceNet: 0, bundleBaseHours: 0 },
      { projectTypeId: 'ecommerce', baseCategorySlug: 'base', bundlePriceNet: 0, bundleBaseHours: 0 },
      { projectTypeId: 'webapp', baseCategorySlug: 'base', bundlePriceNet: 0, bundleBaseHours: 0 },
    ],
    // Ceny startowe
    discoveryWorkshopPrice: 8000,
    websiteStartPrice: 5400,
    websiteAdvancedStartPrice: 12000,
    ecommerceStandardStartPrice: 12000,
    ecommerceProStartPrice: 25000,
    webappStartPrice: 30000,
    // Stawki
    hourlyRateDev: 200,
    hourlyRateConsulting: 300,
    workHoursPerDay: 6,
  },
}
