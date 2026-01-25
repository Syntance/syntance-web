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
    focusKeyword: 'agencja interaktywna',
    metaTitle: 'O nas — Syntance | Agencja interaktywna i software house Next.js',
    metaDescription: 'Syntance to agencja interaktywna i software house z Polski. Specjalizujemy się w tworzeniu stron internetowych i sklepów e-commerce w Next.js. Strategia przed kodem.',
    keywords: [
      'agencja interaktywna',
      'software house Polska',
      'agencja webowa',
      'firma od stron internetowych',
      'tworzenie stron internetowych',
      'studio Next.js',
    ],
  },
  {
    _id: 'page-seo-kontakt',
    _type: 'pageSeo',
    pageName: 'Kontakt',
    slug: { _type: 'slug', current: '/kontakt' },
    isActive: true,
    focusKeyword: 'kontakt Syntance',
    metaTitle: 'Kontakt — Syntance | Strony i sklepy Next.js',
    metaDescription: 'Skontaktuj się z Syntance. Email: kontakt@syntance.com, tel: +48 662 519 544. Bezpłatna rozmowa o Twoim projekcie.',
    keywords: [
      'kontakt Syntance',
      'wycena strony internetowej',
      'kontakt agencja webowa',
    ],
  },
  {
    _id: 'page-seo-strategia',
    _type: 'pageSeo',
    pageName: 'Strategia',
    slug: { _type: 'slug', current: '/strategia' },
    isActive: true,
    focusKeyword: 'strategia strony internetowej',
    metaTitle: 'Strategia przed kodem — Syntance | Warsztat Discovery',
    metaDescription: 'Strategia to fundament skutecznej strony. Warsztat Discovery: analiza biznesu, buyer persony, UVP, architektura informacji. Dowiedz się więcej.',
    keywords: [
      'strategia strony internetowej',
      'warsztat discovery',
      'strategia przed kodem',
      'buyer persona',
      'UVP strona internetowa',
    ],
  },
  {
    _id: 'page-seo-nextjs',
    _type: 'pageSeo',
    pageName: 'Technologia Next.js',
    slug: { _type: 'slug', current: '/nextjs' },
    isActive: true,
    focusKeyword: 'dlaczego Next.js',
    metaTitle: 'Dlaczego Next.js? Technologia stron Syntance',
    metaDescription: 'Dlaczego wybieramy Next.js? PageSpeed 90+, SEO-first, bezpieczeństwo, skalowalność. Poznaj technologię za naszymi stronami i sklepami.',
    keywords: [
      'dlaczego Next.js',
      'Next.js vs WordPress',
      'strony Next.js',
      'React framework',
      'headless CMS',
      'SSR SSG Next.js',
    ],
  },
  {
    _id: 'page-seo-strony-www',
    _type: 'pageSeo',
    pageName: 'Strony internetowe dla firm',
    slug: { _type: 'slug', current: '/strony-www' },
    isActive: true,
    focusKeyword: 'tworzenie stron internetowych',
    metaTitle: 'Strony internetowe dla firm | Profesjonalne strony www Next.js | Syntance',
    metaDescription: 'Tworzymy profesjonalne strony internetowe dla firm B2B. Next.js, PageSpeed 90+, strategia przed kodem. Strony od 5 400 PLN. Bezpłatna wycena →',
    keywords: [
      'tworzenie stron internetowych',
      'strona internetowa dla firmy',
      'profesjonalna strona internetowa',
      'strony dla firm',
      'strona www dla firmy',
      'strona internetowa Next.js',
      'strona B2B',
      'szybka strona internetowa',
      'tworzenie stron internetowych Kraków',
      'strony internetowe Małopolska',
      'agencja webowa Polska',
    ],
    seoNotes: 'Landing page SEO dla fraz z intencją zakupową + lokalne GEO. Główne frazy: tworzenie stron internetowych (5400 vol), strona internetowa dla firmy (260 vol).',
  },
  {
    _id: 'page-seo-sklepy-internetowe',
    _type: 'pageSeo',
    pageName: 'Sklepy internetowe headless',
    slug: { _type: 'slug', current: '/sklepy-internetowe' },
    isActive: true,
    focusKeyword: 'sklep internetowy headless',
    metaTitle: 'Sklepy internetowe headless | MedusaJS & Next.js | Syntance',
    metaDescription: 'Budujemy sklepy internetowe w architekturze headless. MedusaJS, Next.js, zero prowizji. Sklepy od 12 000 PLN. Wycena w 24h →',
    keywords: [
      'ile kosztuje sklep internetowy',
      'sklep internetowy dla firmy',
      'sklep internetowy headless',
      'headless ecommerce',
      'sklep next.js',
      'medusajs sklep',
      'własny sklep internetowy',
      'sklep dla producenta',
      'alternatywa dla Shopify',
      'sklep internetowy Kraków',
      'tworzenie sklepów internetowych Polska',
      'agencja e-commerce Małopolska',
    ],
    seoNotes: 'Landing page dla świadomych technologicznie klientów szukających headless e-commerce. Główne frazy: ile kosztuje sklep internetowy (320 vol), headless ecommerce (90 vol).',
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
