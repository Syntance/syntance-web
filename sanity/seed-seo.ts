/**
 * Skrypt do inicjalizacji domyślnych ustawień SEO w Sanity
 * Uruchom: npx tsx sanity/seed-seo.ts
 */

import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'sqgw0wlq',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const defaultSeoSettings = {
  _id: 'seoSettings',
  _type: 'seoSettings',
  
  // Meta tagi
  metaTitle: 'Syntance — Strony i sklepy Next.js | PageSpeed 90+ | Polska',
  metaTitleTemplate: '%s | Syntance',
  metaDescription: 'Szybkie strony i sklepy internetowe z gwarancją PageSpeed 90+. Strategia przed kodem. Strony od 5k PLN, sklepy od 20k PLN. Pełna własność kodu. Realizacja w 2-4 tygodnie.',
  canonicalUrl: 'https://syntance.com',
  
  // Słowa kluczowe
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
  ],
  
  // Open Graph
  ogTitle: 'Syntance — Strony i sklepy Next.js | PageSpeed 90+',
  ogDescription: 'Szybkie strony i sklepy internetowe z gwarancją PageSpeed 90+. Strategia przed kodem. Strony od 5k PLN. Realizacja w 2-4 tygodnie.',
  ogImageUrl: 'https://syntance.com/og/og-home-1200x630.png',
  
  // Twitter
  twitterTitle: 'Syntance — Strony i sklepy Next.js | PageSpeed 90+',
  twitterDescription: 'Szybkie strony i sklepy internetowe z gwarancją PageSpeed 90+. Strategia przed kodem. Strony od 5k PLN. Realizacja w 2-4 tygodnie.',
  twitterImageAlt: 'Syntance - Studio tworzące szybkie strony i sklepy internetowe Next.js',
  
  // Schema.org
  organizationName: 'Syntance',
  organizationDescription: 'Studio oferujące strony, sklepy i aplikacje SaaS na Next.js. PageSpeed 90+ gwarantowany.',
  foundingDate: '2024',
  founderName: 'Kamil Podobiński',
  contactEmail: 'kontakt@syntance.com',
  contactPhone: '+48662519544',
  
  address: {
    street: 'Czerniec 72',
    city: 'Łącko',
    postalCode: '33-390',
    region: 'Małopolskie',
    country: 'PL',
  },
  
  geo: {
    latitude: 49.5733,
    longitude: 20.3894,
  },
  
  socialLinks: [
    'https://github.com/Syntance',
    'https://linkedin.com/company/syntance',
  ],
  
  openingHours: {
    opens: '09:00',
    closes: '17:00',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  
  services: [
    {
      _key: 'service-1',
      name: 'Strony WWW Next.js',
      description: 'Ultra-szybkie strony internetowe na Next.js z PageSpeed 90+ gwarantowanym. Strategia przed kodem, pełna własność kodu.',
      serviceType: 'Web Development',
      priceRange: '5000-15000 PLN',
    },
    {
      _key: 'service-2',
      name: 'Sklepy E-commerce Next.js',
      description: 'Headless e-commerce na MedusaJS i Next.js. Szybkie, skalowalne sklepy bez prowizji.',
      serviceType: 'E-commerce Development',
      priceRange: 'od 20000 PLN',
    },
    {
      _key: 'service-3',
      name: 'Strategia przedwdrożeniowa',
      description: 'Cel biznesowy strony przed kodem - analiza biznesu, buyer persony, UVP, user flows, SEO, architektura informacji.',
      serviceType: 'Business Consulting',
      price: 4500,
    },
    {
      _key: 'service-4',
      name: 'Aplikacje Webowe',
      description: 'Dedykowane systemy, panele administracyjne i aplikacje SaaS.',
      serviceType: 'Software Development',
      priceRange: 'od 50000 PLN',
    },
  ],
}

async function seedSeoSettings() {
  console.log('🔍 Inicjalizacja ustawień SEO w Sanity...')
  
  try {
    // Sprawdź czy dokument już istnieje
    const existing = await client.getDocument('seoSettings')
    
    if (existing) {
      console.log('⚠️  Dokument seoSettings już istnieje. Pomijam tworzenie.')
      console.log('   Jeśli chcesz nadpisać, usuń go najpierw w Sanity Studio.')
      return
    }
    
    // Utwórz dokument
    const result = await client.createOrReplace(defaultSeoSettings)
    console.log('✅ Ustawienia SEO zostały utworzone!')
    console.log('   ID:', result._id)
    console.log('')
    console.log('📝 Możesz teraz edytować SEO w Sanity Studio:')
    console.log('   https://syntance-studio.sanity.studio/')
    
  } catch (error) {
    console.error('❌ Błąd podczas tworzenia ustawień SEO:', error)
  }
}

seedSeoSettings()
