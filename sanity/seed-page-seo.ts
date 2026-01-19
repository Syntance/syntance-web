/**
 * Skrypt do inicjalizacji domyślnych SEO dla podstron w Sanity
 * Uruchom: pnpm seed:pages
 */

import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'sqgw0wlq',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const defaultPages: any[] = [
  {
    _id: 'page-seo-home',
    _type: 'pageSeo',
    pageName: 'Strona główna',
    slug: { _type: 'slug', current: '/' },
    isActive: true,
    focusKeyword: 'strony Next.js',
    metaTitle: 'Syntance — Strony i sklepy Next.js | PageSpeed 90+ | Polska',
    metaDescription: 'Szybkie strony i sklepy internetowe z gwarancją PageSpeed 90+. Strategia przed kodem. Strony od 5k PLN, sklepy od 20k PLN. Realizacja w 2-4 tygodnie.',
    keywords: [
      'strony Next.js',
      'sklepy Next.js',
      'PageSpeed 90+',
      'tworzenie stron',
    ],
  },
  {
    _id: 'page-seo-cennik',
    _type: 'pageSeo',
    pageName: 'Cennik',
    slug: { _type: 'slug', current: '/cennik' },
    isActive: true,
    focusKeyword: 'ile kosztuje strona internetowa',
    metaTitle: 'Ile kosztuje strona internetowa? Cennik 2026 | Syntance',
    metaDescription: 'Strona firmowa od 5 400 PLN, sklep e-commerce od 12 000 PLN. Sprawdź cenę swojego projektu w konfiguratorze — wycena w 2 minuty, bez zobowiązań.',
    keywords: [
      'ile kosztuje strona internetowa',
      'cena strony internetowej',
      'ile kosztuje zrobienie strony',
      'cennik stron www',
      'koszt strony internetowej',
      'cennik sklepu internetowego',
    ],
    seoNotes: 'Główne słowo kluczowe: "ile kosztuje strona internetowa" (1000 wyszukiwań/msc). Focus na FAQ Schema i H1 z keyword.',
  },
  {
    _id: 'page-seo-o-nas',
    _type: 'pageSeo',
    pageName: 'O nas',
    slug: { _type: 'slug', current: '/o-nas' },
    isActive: true,
    focusKeyword: 'studio Next.js Polska',
    metaTitle: 'O nas — Syntance Studio | Next.js, PageSpeed 90+',
    metaDescription: 'Studio oferujące strony i sklepy Next.js. Specjalizujemy się w headless CMS, MedusaJS i nowoczesnym e-commerce. Strategia przed kodem. Małopolska, Polska.',
    keywords: [
      'studio Next.js Polska',
      'agencja Next.js',
      'tworzenie stron Małopolska',
    ],
  },
  {
    _id: 'page-seo-polityka',
    _type: 'pageSeo',
    pageName: 'Polityka prywatności',
    slug: { _type: 'slug', current: '/polityka-prywatnosci' },
    isActive: true,
    metaTitle: 'Polityka prywatności | Syntance',
    metaDescription: 'Polityka prywatności Syntance. Dowiedz się jak przetwarzamy Twoje dane osobowe.',
    keywords: ['polityka prywatności', 'RODO', 'ochrona danych'],
  },
  {
    _id: 'page-seo-regulamin',
    _type: 'pageSeo',
    pageName: 'Regulamin',
    slug: { _type: 'slug', current: '/regulamin' },
    isActive: true,
    metaTitle: 'Regulamin świadczenia usług | Syntance',
    metaDescription: 'Regulamin świadczenia usług przez Syntance. Warunki współpracy, realizacji projektów i reklamacji.',
    keywords: ['regulamin', 'warunki współpracy'],
  },
]

async function seedPageSeo() {
  console.log('📄 Inicjalizacja SEO podstron w Sanity...\n')
  
  let created = 0
  let skipped = 0
  
  for (const page of defaultPages) {
    try {
      // Sprawdź czy dokument już istnieje
      const existing = await client.getDocument(page._id)
      
      if (existing) {
        console.log(`⚠️  ${page.pageName} (${page.slug.current}) już istnieje - pomijam`)
        skipped++
        continue
      }
      
      // Utwórz dokument
      await client.createOrReplace(page)
      console.log(`✅ ${page.pageName} (${page.slug.current}) - utworzono`)
      created++
      
    } catch (error: any) {
      if (error.statusCode === 404) {
        // Dokument nie istnieje, utwórz go
        try {
          await client.createOrReplace(page)
          console.log(`✅ ${page.pageName} (${page.slug.current}) - utworzono`)
          created++
        } catch (createError) {
          console.error(`❌ Błąd podczas tworzenia ${page.pageName}:`, createError)
        }
      } else {
        console.error(`❌ Błąd podczas sprawdzania ${page.pageName}:`, error)
      }
    }
  }
  
  console.log(`\n📊 Podsumowanie:`)
  console.log(`   ✅ Utworzono: ${created}`)
  console.log(`   ⚠️  Pominięto (już istnieją): ${skipped}`)
  console.log(`\n📝 Możesz teraz edytować SEO podstron w Sanity Studio:`)
  console.log(`   https://syntance.sanity.studio/`)
}

seedPageSeo()
