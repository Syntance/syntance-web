import { groq } from 'next-sanity'

export const pricingDataQuery = groq`{
  "categories": *[_type == "pricingCategory" && coalesce(showInConfigurator, true) == true] | order(order asc) {
    "id": id.current,
    name,
    description,
    icon,
    disabled
  },
  "projectTypes": *[_type == "projectType"] | order(order asc) {
    "id": id.current,
    name,
    description,
    basePrice,
    icon,
    disabled
  },
  "items": *[_type == "pricingItem" && coalesce(category->showInConfigurator, true) == true && count((projectTypes[]->id.current)[@ in ["website", "ecommerce", "webapp"]]) > 0] | order(orderRank asc, order asc) {
    "id": id.current,
    name,
    description,
    price,
    hours,
    rateType,
    "category": category->id.current,
    "projectTypes": projectTypes[]->id.current,
    required,
    defaultSelected,
    includedInBase,
    maxQuantity,
    percentageAdd,
    orderRank,
    order,
    projectTypeOrder[] {
      "projectType": projectType->id.current,
      order
    },
    "dependencies": dependencies[]->id.current,
    "bundledWith": bundledWith[]->id.current,
    popular,
    new,
    disabled,
    hidePrice,
    // Notyfikacje
    notificationOnAdd,
    notificationAddTitle,
    notificationAddText,
    notificationAddConfirmText,
    notificationAddCancelText,
    notificationOnRemove,
    notificationRemoveTitle,
    notificationRemoveText,
    notificationRemoveConfirmText,
    notificationRemoveCancelText
  },
  "config": *[_type == "pricingConfig"][0] {
    vatRate,
    depositPercent,
    depositFixed,
    calendlyUrl,
    ctaTexts,
    baseProjectCategoryId,
    "projectTypeBundles": projectTypeBundles[] {
      "projectTypeId": projectType->id.current,
      baseCategorySlug,
      bundlePriceNet,
      bundleBaseHours
    },
    baseProjectBundlePriceWebsite,
    baseProjectBundlePriceEcommerce,
    baseProjectBundlePriceWebapp,
    baseProjectCategoryIdWebsite,
    baseProjectCategoryIdEcommerce,
    baseProjectCategoryIdWebapp,
    // Ceny startowe
    discoveryWorkshopPrice,
    websiteStartPrice,
    websiteAdvancedStartPrice,
    ecommerceStandardStartPrice,
    ecommerceProStartPrice,
    webappStartPrice,
    // Stawki
    hourlyRateDev,
    hourlyRateConsulting,
    workHoursPerDay
  }
}`

// Typy TypeScript
export interface PricingCategory {
  id: string
  name: string
  description?: string
  icon?: string
  disabled?: boolean
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
  order?: number
  projectTypeOrder?: Array<{
    projectType: string
    order: number
  }>
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
  discoveryWorkshopPrice: 4500,
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
    { id: 'base', name: 'Baza projektu', icon: 'Layout' },
    { id: 'pages', name: 'Podstrony', icon: 'FileText' },
    { id: 'sections', name: 'Sekcje', icon: 'Layers' },
    { id: 'features', name: 'Funkcje', icon: 'Zap' },
    { id: 'integrations', name: 'Integracje', icon: 'Plug' },
    { id: 'payments', name: 'Płatności', icon: 'CreditCard' },
    { id: 'shipping', name: 'Dostawa', icon: 'Truck' },
  ],
  projectTypes: [
    { id: 'website', name: 'Strona WWW', basePrice: 5000, icon: 'Globe' },
    { id: 'ecommerce', name: 'Sklep e-commerce', basePrice: 20000, icon: 'ShoppingCart' },
    { id: 'webapp', name: 'Aplikacja webowa', basePrice: 30000, icon: 'Smartphone' },
  ],
  items: [
    // BAZA - WEBSITE
    { id: 'web-setup', name: 'Setup projektu', description: 'Next.js, Vercel, DNS, SSL', price: 1600, hours: 8, category: 'base', projectTypes: ['website'], required: true, order: 0 },
    { id: 'web-design-system', name: 'Design System', description: 'Style, typografia, komponenty', price: 600, hours: 3, category: 'base', projectTypes: ['website'], required: true, order: 1 },
    { id: 'web-homepage', name: 'Strona główna', description: 'Do 5 sekcji, responsywność', price: 2200, hours: 11, category: 'base', projectTypes: ['website'], required: true, order: 2 },
    
    // PODSTRONY
    { id: 'page-standard', name: 'Podstrona standardowa', description: 'O nas, Kontakt', price: 400, hours: 2, category: 'pages', projectTypes: ['website', 'ecommerce'], maxQuantity: 10, order: 0, projectTypeOrder: [{ projectType: 'website', order: 0 }, { projectType: 'ecommerce', order: 1 }] },
    { id: 'page-cms', name: 'Podstrona CMS', description: 'Edytowalna w Sanity', price: 800, hours: 4, category: 'pages', projectTypes: ['website', 'ecommerce'], maxQuantity: 10, popular: true, order: 1, projectTypeOrder: [{ projectType: 'website', order: 1 }, { projectType: 'ecommerce', order: 0 }] },
    
    // SEKCJE
    { id: 'section-faq', name: 'FAQ', price: 200, hours: 1, category: 'sections', projectTypes: ['website', 'ecommerce'], order: 0 },
    { id: 'section-portfolio', name: 'Portfolio / Case Studies', price: 500, hours: 4, category: 'sections', projectTypes: ['website'], order: 1 },
    { id: 'section-testimonials', name: 'Opinie / Referencje', price: 300, hours: 2, category: 'sections', projectTypes: ['website', 'ecommerce'], order: 2 },
    { id: 'section-pricing', name: 'Cennik', price: 400, hours: 3, category: 'sections', projectTypes: ['website'], order: 3 },
    { id: 'section-blog', name: 'Blog (lista + artykuł)', price: 1200, hours: 8, category: 'sections', projectTypes: ['website'], popular: true, order: 4 },
    
    // INTEGRACJE
    { id: 'int-cms', name: 'CMS Sanity', description: 'Panel do edycji + szkolenie', price: 1000, hours: 5, category: 'integrations', projectTypes: ['website', 'ecommerce'], popular: true, order: 0 },
    { id: 'int-analytics', name: 'Analytics (GA4 + GTM)', price: 400, hours: 2, category: 'integrations', projectTypes: ['website', 'ecommerce'], order: 1 },
    { id: 'int-i18n', name: 'Wielojęzyczność', description: 'Dodatkowy język (bez tłumaczeń)', price: 0, hours: 0, percentageAdd: 20, category: 'integrations', projectTypes: ['website', 'ecommerce'], order: 2 },
    { id: 'int-calendly', name: 'Calendly / rezerwacje', price: 300, hours: 2, category: 'integrations', projectTypes: ['website'], order: 3 },
    { id: 'int-crm', name: 'Integracja CRM', description: 'Pipedrive, HubSpot, itp.', price: 600, hours: 4, category: 'integrations', projectTypes: ['website', 'ecommerce'], order: 4 },
    
    // E-COMMERCE BASE
    { id: 'ecom-setup', name: 'Setup sklepu', description: 'Next.js, Medusa/Shopify, Vercel', price: 4000, hours: 20, category: 'base', projectTypes: ['ecommerce'], required: true, order: 0 },
    { id: 'ecom-design', name: 'Design System sklepu', price: 2000, hours: 10, category: 'base', projectTypes: ['ecommerce'], required: true, order: 1 },
    { id: 'ecom-homepage', name: 'Strona główna sklepu', price: 3000, hours: 15, category: 'base', projectTypes: ['ecommerce'], required: true, order: 2 },
    { id: 'ecom-pdp', name: 'Karta produktu (PDP)', price: 2500, hours: 12, category: 'base', projectTypes: ['ecommerce'], required: true, order: 3 },
    { id: 'ecom-plp', name: 'Lista produktów (PLP)', price: 2000, hours: 10, category: 'base', projectTypes: ['ecommerce'], required: true, order: 4 },
    { id: 'ecom-cart', name: 'Koszyk + Checkout', price: 3000, hours: 15, category: 'base', projectTypes: ['ecommerce'], required: true, order: 5 },
    
    // PŁATNOŚCI
    { id: 'pay-stripe', name: 'Stripe', price: 800, hours: 4, category: 'payments', projectTypes: ['ecommerce'], popular: true, order: 0 },
    { id: 'pay-przelewy24', name: 'Przelewy24', price: 800, hours: 4, category: 'payments', projectTypes: ['ecommerce'], order: 1 },
    { id: 'pay-blik', name: 'BLIK', price: 400, hours: 2, category: 'payments', projectTypes: ['ecommerce'], order: 2 },
    
    // DOSTAWA
    { id: 'ship-inpost', name: 'InPost Paczkomaty', price: 600, hours: 4, category: 'shipping', projectTypes: ['ecommerce'], popular: true, order: 0 },
    { id: 'ship-dpd', name: 'DPD / DHL', price: 400, hours: 2, category: 'shipping', projectTypes: ['ecommerce'], order: 1 },
    
    // WEBAPP BASE
    { id: 'webapp-setup', name: 'Setup aplikacji', description: 'Next.js, Auth, Database', price: 8000, hours: 40, category: 'base', projectTypes: ['webapp'], required: true, order: 0 },
    { id: 'webapp-design', name: 'Design System aplikacji', price: 4000, hours: 20, category: 'base', projectTypes: ['webapp'], required: true, order: 1 },
    { id: 'webapp-dashboard', name: 'Dashboard użytkownika', price: 6000, hours: 30, category: 'base', projectTypes: ['webapp'], required: true, order: 2 },
    { id: 'webapp-auth', name: 'System autentykacji', description: 'Logowanie, rejestracja, role', price: 4000, hours: 20, category: 'base', projectTypes: ['webapp'], required: true, order: 3 },
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
    discoveryWorkshopPrice: 4500,
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
