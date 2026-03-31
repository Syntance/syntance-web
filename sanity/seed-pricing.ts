import { createClient } from '@sanity/client'

// Uruchom: npx ts-node --esm sanity/seed-pricing.ts
// lub: pnpm exec ts-node --esm sanity/seed-pricing.ts

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

interface Category {
  id: string
  name: string
  icon: string
  order: number
  description?: string
}

interface ProjectType {
  id: string
  name: string
  basePrice: number
  order: number
  icon?: string
  description?: string
}

interface Item {
  id: string
  name: string
  description?: string
  price: number
  hours: number
  category: string
  projectTypes: string[]
  required?: boolean
  maxQuantity?: number
  percentageAdd?: number
  order?: number
  popular?: boolean
  new?: boolean
}

const categories: Category[] = [
  { id: 'base', name: 'Baza projektu', icon: 'Layout', order: 1, description: 'Podstawowe elementy każdego projektu' },
  { id: 'pages', name: 'Podstrony', icon: 'FileText', order: 2, description: 'Dodatkowe podstrony' },
  { id: 'sections', name: 'Sekcje', icon: 'Layers', order: 3, description: 'Sekcje i komponenty' },
  { id: 'features', name: 'Funkcje', icon: 'Zap', order: 4, description: 'Zaawansowane funkcjonalności' },
  { id: 'integrations', name: 'Integracje', icon: 'Plug', order: 5, description: 'Integracje z zewnętrznymi usługami' },
  { id: 'payments', name: 'Płatności', icon: 'CreditCard', order: 6, description: 'Bramki płatności' },
  { id: 'shipping', name: 'Dostawa', icon: 'Truck', order: 7, description: 'Integracje z kurierami' },
]

const projectTypes: ProjectType[] = [
  { id: 'website', name: 'Strona WWW', basePrice: 5000, order: 1, icon: 'Globe', description: 'Strona firmowa, landing page, portfolio' },
  { id: 'ecommerce', name: 'Sklep e-commerce', basePrice: 20000, order: 2, icon: 'ShoppingCart', description: 'Sklep internetowy z pełną funkcjonalnością' },
  { id: 'webapp', name: 'Aplikacja webowa', basePrice: 30000, order: 3, icon: 'Smartphone', description: 'Aplikacja SaaS, dashboard, system' },
]

const items: Item[] = [
  // BAZA - WEBSITE
  { id: 'web-setup', name: 'Setup projektu', description: 'Next.js, Vercel, DNS, SSL', price: 1600, hours: 8, category: 'base', projectTypes: ['website'], required: true, order: 1 },
  { id: 'web-design-system', name: 'Design System', description: 'Style, typografia, komponenty', price: 600, hours: 3, category: 'base', projectTypes: ['website'], required: true, order: 2 },
  { id: 'web-homepage', name: 'Strona główna', description: 'Do 5 sekcji, responsywność', price: 2200, hours: 11, category: 'base', projectTypes: ['website'], required: true, order: 3 },
  
  // PODSTRONY
  { id: 'page-standard', name: 'Podstrona standardowa', description: 'O nas, Kontakt, Usługi', price: 400, hours: 2, category: 'pages', projectTypes: ['website', 'ecommerce'], maxQuantity: 10, order: 1 },
  { id: 'page-cms', name: 'Podstrona CMS', description: 'Edytowalna treść w Sanity', price: 800, hours: 4, category: 'pages', projectTypes: ['website', 'ecommerce'], maxQuantity: 10, order: 2, popular: true },
  { id: 'page-landing', name: 'Landing Page', description: 'Strona promocyjna / kampania', price: 1200, hours: 6, category: 'pages', projectTypes: ['website'], maxQuantity: 5, order: 3 },
  
  // SEKCJE
  { id: 'section-faq', name: 'FAQ', description: 'Pytania i odpowiedzi', price: 200, hours: 1, category: 'sections', projectTypes: ['website', 'ecommerce'], order: 1 },
  { id: 'section-portfolio', name: 'Portfolio / Case Studies', description: 'Prezentacja realizacji', price: 500, hours: 4, category: 'sections', projectTypes: ['website'], order: 2 },
  { id: 'section-testimonials', name: 'Opinie / Referencje', description: 'Karuzela opinii klientów', price: 300, hours: 2, category: 'sections', projectTypes: ['website', 'ecommerce'], order: 3 },
  { id: 'section-pricing', name: 'Cennik', description: 'Tabela cenowa z CTA', price: 400, hours: 3, category: 'sections', projectTypes: ['website'], order: 4 },
  { id: 'section-blog', name: 'Blog (lista + artykuł)', description: 'System blogowy z CMS', price: 1200, hours: 8, category: 'sections', projectTypes: ['website'], order: 5, popular: true },
  { id: 'section-team', name: 'Zespół', description: 'Prezentacja członków zespołu', price: 300, hours: 2, category: 'sections', projectTypes: ['website'], order: 6 },
  { id: 'section-contact', name: 'Formularz kontaktowy', description: 'Z walidacją i wysyłką email', price: 400, hours: 3, category: 'sections', projectTypes: ['website', 'ecommerce'], order: 7 },
  
  // INTEGRACJE
  { id: 'int-cms', name: 'CMS Sanity', description: 'Panel do edycji treści + szkolenie', price: 1000, hours: 5, category: 'integrations', projectTypes: ['website', 'ecommerce'], order: 1, popular: true },
  { id: 'int-analytics', name: 'Analytics (GA4 + GTM)', description: 'Śledzenie konwersji i zdarzeń', price: 400, hours: 2, category: 'integrations', projectTypes: ['website', 'ecommerce'], order: 2 },
  { id: 'int-i18n', name: 'Wielojęzyczność', description: 'Dodatkowy język (bez tłumaczeń)', price: 0, hours: 0, percentageAdd: 20, category: 'integrations', projectTypes: ['website', 'ecommerce'], order: 3 },
  { id: 'int-calendly', name: 'Calendly / rezerwacje', description: 'System umawiania spotkań', price: 300, hours: 2, category: 'integrations', projectTypes: ['website'], order: 4 },
  { id: 'int-crm', name: 'Integracja CRM', description: 'Pipedrive, HubSpot, Salesforce', price: 600, hours: 4, category: 'integrations', projectTypes: ['website', 'ecommerce'], order: 5 },
  { id: 'int-newsletter', name: 'Newsletter', description: 'Mailchimp, ConvertKit, MailerLite', price: 400, hours: 3, category: 'integrations', projectTypes: ['website', 'ecommerce'], order: 6 },
  { id: 'int-chat', name: 'Live Chat', description: 'Intercom, Crisp, Tidio', price: 300, hours: 2, category: 'integrations', projectTypes: ['website', 'ecommerce'], order: 7 },
  
  // E-COMMERCE BASE
  { id: 'ecom-setup', name: 'Setup sklepu', description: 'Next.js, Medusa/Shopify, Vercel', price: 4000, hours: 20, category: 'base', projectTypes: ['ecommerce'], required: true, order: 1 },
  { id: 'ecom-design', name: 'Design System sklepu', description: 'UI kit dla e-commerce', price: 2000, hours: 10, category: 'base', projectTypes: ['ecommerce'], required: true, order: 2 },
  { id: 'ecom-homepage', name: 'Strona główna sklepu', description: 'Slider, kategorie, produkty', price: 3000, hours: 15, category: 'base', projectTypes: ['ecommerce'], required: true, order: 3 },
  { id: 'ecom-pdp', name: 'Karta produktu (PDP)', description: 'Galeria, warianty, opinie', price: 2500, hours: 12, category: 'base', projectTypes: ['ecommerce'], required: true, order: 4 },
  { id: 'ecom-plp', name: 'Lista produktów (PLP)', description: 'Filtry, sortowanie, paginacja', price: 2000, hours: 10, category: 'base', projectTypes: ['ecommerce'], required: true, order: 5 },
  { id: 'ecom-cart', name: 'Koszyk + Checkout', description: 'Wieloetapowy checkout', price: 3000, hours: 15, category: 'base', projectTypes: ['ecommerce'], required: true, order: 6 },
  
  // E-COMMERCE FEATURES
  { id: 'ecom-search', name: 'Wyszukiwarka', description: 'Algolia / ElasticSearch', price: 800, hours: 5, category: 'features', projectTypes: ['ecommerce'], order: 1, new: true },
  { id: 'ecom-wishlist', name: 'Lista życzeń', description: 'Zapisywanie ulubionych', price: 400, hours: 3, category: 'features', projectTypes: ['ecommerce'], order: 2 },
  { id: 'ecom-reviews', name: 'System opinii', description: 'Oceny i recenzje produktów', price: 600, hours: 4, category: 'features', projectTypes: ['ecommerce'], order: 3 },
  { id: 'ecom-coupons', name: 'Kody rabatowe', description: 'Kupony i promocje', price: 500, hours: 3, category: 'features', projectTypes: ['ecommerce'], order: 4 },
  
  // PŁATNOŚCI
  { id: 'pay-stripe', name: 'Stripe', description: 'Karty, Apple Pay, Google Pay', price: 800, hours: 4, category: 'payments', projectTypes: ['ecommerce'], order: 1, popular: true },
  { id: 'pay-przelewy24', name: 'Przelewy24', description: 'Przelewy, BLIK, karty', price: 800, hours: 4, category: 'payments', projectTypes: ['ecommerce'], order: 2 },
  { id: 'pay-payu', name: 'PayU', description: 'Raty, płatność odroczona', price: 800, hours: 4, category: 'payments', projectTypes: ['ecommerce'], order: 3 },
  { id: 'pay-blik', name: 'BLIK One-click', description: 'Szybkie płatności BLIK', price: 400, hours: 2, category: 'payments', projectTypes: ['ecommerce'], order: 4 },
  
  // DOSTAWA
  { id: 'ship-inpost', name: 'InPost Paczkomaty', description: 'Mapa paczkomatów + API', price: 600, hours: 4, category: 'shipping', projectTypes: ['ecommerce'], order: 1, popular: true },
  { id: 'ship-dpd', name: 'DPD', description: 'Kurier DPD + punkty', price: 400, hours: 2, category: 'shipping', projectTypes: ['ecommerce'], order: 2 },
  { id: 'ship-dhl', name: 'DHL', description: 'Kurier DHL + punkty', price: 400, hours: 2, category: 'shipping', projectTypes: ['ecommerce'], order: 3 },
  { id: 'ship-ups', name: 'UPS', description: 'Kurier UPS', price: 400, hours: 2, category: 'shipping', projectTypes: ['ecommerce'], order: 4 },
  { id: 'ship-poczta', name: 'Poczta Polska', description: 'Kurier + punkty', price: 400, hours: 2, category: 'shipping', projectTypes: ['ecommerce'], order: 5 },
  
  // WEBAPP BASE
  { id: 'webapp-setup', name: 'Setup aplikacji', description: 'Next.js, Auth, Database', price: 8000, hours: 40, category: 'base', projectTypes: ['webapp'], required: true, order: 1 },
  { id: 'webapp-design', name: 'Design System aplikacji', description: 'UI kit, komponenty, dark mode', price: 4000, hours: 20, category: 'base', projectTypes: ['webapp'], required: true, order: 2 },
  { id: 'webapp-dashboard', name: 'Dashboard użytkownika', description: 'Panel główny z widżetami', price: 6000, hours: 30, category: 'base', projectTypes: ['webapp'], required: true, order: 3 },
  { id: 'webapp-auth', name: 'System autentykacji', description: 'Logowanie, rejestracja, role', price: 4000, hours: 20, category: 'base', projectTypes: ['webapp'], required: true, order: 4 },
  
  // WEBAPP FEATURES
  { id: 'webapp-notifications', name: 'Powiadomienia', description: 'Push, email, in-app', price: 1500, hours: 8, category: 'features', projectTypes: ['webapp'], order: 1 },
  { id: 'webapp-api', name: 'REST API', description: 'Dokumentacja Swagger', price: 2000, hours: 12, category: 'features', projectTypes: ['webapp'], order: 2 },
  { id: 'webapp-reports', name: 'Raporty / Eksport', description: 'PDF, Excel, CSV', price: 1200, hours: 8, category: 'features', projectTypes: ['webapp'], order: 3 },
  { id: 'webapp-admin', name: 'Panel administracyjny', description: 'Zarządzanie użytkownikami', price: 3000, hours: 16, category: 'features', projectTypes: ['webapp'], order: 4 },
]

const config = {
  _type: 'pricingConfig',
  _id: 'pricingConfig',
  vatRate: 23,
  depositPercent: 20,
  depositFixed: 500,
  discoveryWorkshopPrice: 4500,
  websiteStartPrice: 5400,
  websiteAdvancedStartPrice: 12000,
  ecommerceStandardStartPrice: 12000,
  ecommerceProStartPrice: 25000,
  webappStartPrice: 30000,
  hourlyRateDev: 200,
  hourlyRateConsulting: 300,
  workHoursPerDay: 6,
  calendlyUrl: 'https://calendly.com/syntance/discovery',
  ctaTexts: {
    reserve: 'Zarezerwuj termin w tej cenie',
    workshop: 'Zamów Strategię przedwdrożeniową',
    pdf: 'Pobierz wycenę PDF',
  },
}

async function seed() {
  console.log('🌱 Rozpoczynam seedowanie danych cennika...\n')

  console.log('📁 Tworzę kategorie...')
  for (const cat of categories) {
    await client.createOrReplace({
      _type: 'pricingCategory',
      _id: `pricingCategory-${cat.id}`,
      id: { _type: 'slug', current: cat.id },
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      order: cat.order,
    })
    console.log(`   ✓ ${cat.name}`)
  }

  console.log('\n📦 Tworzę typy projektów...')
  for (const pt of projectTypes) {
    await client.createOrReplace({
      _type: 'projectType',
      _id: `projectType-${pt.id}`,
      id: { _type: 'slug', current: pt.id },
      name: pt.name,
      description: pt.description,
      basePrice: pt.basePrice,
      icon: pt.icon,
      order: pt.order,
    })
    console.log(`   ✓ ${pt.name}`)
  }

  console.log('\n💰 Tworzę elementy cennika...')
  for (const item of items) {
    await client.createOrReplace({
      _type: 'pricingItem',
      _id: `pricingItem-${item.id}`,
      id: { _type: 'slug', current: item.id },
      name: item.name,
      description: item.description,
      price: item.price,
      hours: item.hours,
      category: { _type: 'reference', _ref: `pricingCategory-${item.category}` },
      projectTypes: item.projectTypes.map((pt, index) => ({ 
        _type: 'reference', 
        _ref: `projectType-${pt}`,
        _key: `${pt}-${index}`,
      })),
      required: item.required || false,
      maxQuantity: item.maxQuantity,
      percentageAdd: item.percentageAdd,
      order: item.order || 0,
      popular: item.popular || false,
      new: item.new || false,
    })
    console.log(`   ✓ ${item.name}`)
  }

  console.log('\n⚙️  Tworzę konfigurację...')
  await client.createOrReplace(config)
  console.log('   ✓ Ustawienia cennika')

  console.log('\n✅ Seedowanie zakończone pomyślnie!')
  console.log(`   - ${categories.length} kategorii`)
  console.log(`   - ${projectTypes.length} typów projektów`)
  console.log(`   - ${items.length} elementów cennika`)
}

seed().catch((error) => {
  console.error('❌ Błąd podczas seedowania:', error)
  process.exit(1)
})
