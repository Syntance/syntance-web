/**
 * Skrypt do inicjalizacji domyślnych FAQ w Sanity
 * Uruchom: pnpm seed:faq
 */

import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'sqgw0wlq',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const defaultFaqItems = [
  // Pytania cenowe
  {
    _id: 'faq-1',
    _type: 'pricingFaq',
    question: 'Ile kosztuje strona internetowa?',
    answer: 'Strona firmowa zaczyna się od 5 400 PLN netto. Cena zależy od liczby podstron, funkcjonalności i integracji. Skorzystaj z konfiguratora powyżej, żeby poznać dokładną wycenę dla Twojego projektu.',
    category: 'pricing',
    order: 1,
    isActive: true,
  },
  {
    _id: 'faq-2',
    _type: 'pricingFaq',
    question: 'Ile kosztuje sklep internetowy?',
    answer: 'Sklep e-commerce zaczyna się od 12 000 PLN netto (baza). Pełnofunkcyjny sklep z płatnościami, filtrowaniem i kontami użytkowników to zazwyczaj 18-25k PLN. Aplikacje typu marketplace — od 50k PLN.',
    category: 'pricing',
    order: 2,
    isActive: true,
  },
  {
    _id: 'faq-3',
    _type: 'pricingFaq',
    question: 'Dlaczego ceny zaczynają się od 5k, a nie 500 zł?',
    answer: 'Buduję strony w technologii Next.js — tej samej, której używają Nike, Netflix czy Notion. To nie jest szablon z WordPress. Dostajesz kod pisany pod Ciebie, błyskawiczną szybkość (Core Web Vitals 95+) i stronę, która będzie działać latami bez "aktualizacji wtyczek".',
    category: 'pricing',
    order: 3,
    isActive: true,
  },
  {
    _id: 'faq-4',
    _type: 'pricingFaq',
    question: 'Od czego zależy cena strony?',
    answer: 'Główne czynniki: liczba podstron, rodzaj funkcjonalności (formularz, blog, galeria), integracje (CMS, płatności, newsletter) oraz poziom animacji. Konfigurator powyżej pokaże Ci dokładny rozkład kosztów.',
    category: 'pricing',
    order: 4,
    isActive: true,
  },
  // Pytania o czas i proces
  {
    _id: 'faq-5',
    _type: 'pricingFaq',
    question: 'Ile trwa realizacja strony?',
    answer: 'Strona firmowa: 2-3 tygodnie. Sklep e-commerce: 4-6 tygodni. Widzisz postęp na żywo (preview link) — nie czekasz 3 miesiące na "efekt końcowy".',
    category: 'time',
    order: 5,
    isActive: true,
  },
  {
    _id: 'faq-6',
    _type: 'pricingFaq',
    question: 'Co to jest Warsztat Discovery?',
    answer: '2-3 godzinne spotkanie, na którym definiujemy strategię, grupę docelową i cele strony. Wynikiem jest dokument z wytycznymi — dzięki temu strona jest skuteczna, a nie tylko "ładna". Warsztat kosztuje 4 500 PLN i jest zaliczany na poczet projektu.',
    category: 'time',
    order: 6,
    isActive: true,
  },
  // Pytania o ryzyko/zaufanie
  {
    _id: 'faq-7',
    _type: 'pricingFaq',
    question: 'A co jeśli efekt mi się nie spodoba?',
    answer: 'Widzisz postęp co tydzień na podglądzie (preview link). Poprawki wdrażamy na bieżąco — nie po 3 miesiącach. Jeśli coś nie pasuje, zmieniamy od razu.',
    category: 'trust',
    order: 7,
    isActive: true,
  },
  {
    _id: 'faq-8',
    _type: 'pricingFaq',
    question: 'Czy mogę rozłożyć płatność?',
    answer: 'Tak. Standardowy model: 50% na start, 50% przy odbiorze. Przy większych projektach możliwe płatności w 3 ratach.',
    category: 'trust',
    order: 8,
    isActive: true,
  },
  {
    _id: 'faq-9',
    _type: 'pricingFaq',
    question: 'Co jeśli potrzebuję zmian po wdrożeniu?',
    answer: 'Oferuję pakiety opieki od 500 PLN/msc — poprawki, aktualizacje, wsparcie. Możesz też zlecać zmiany jednorazowo.',
    category: 'trust',
    order: 9,
    isActive: true,
  },
  // Porównania
  {
    _id: 'faq-10',
    _type: 'pricingFaq',
    question: 'Dlaczego Ty, a nie tańszy freelancer?',
    answer: 'Freelancer za 2k PLN da Ci szablon WordPress, który za rok będzie wymagał aktualizacji 47 wtyczek. Ja daję Ci kod, który jest Twój, szybki i bezpieczny. To inwestycja, nie koszt.',
    category: 'comparison',
    order: 10,
    isActive: true,
  },
]

async function seedFaq() {
  console.log('❓ Inicjalizacja FAQ w Sanity...\n')
  
  let created = 0
  let skipped = 0
  
  for (const item of defaultFaqItems) {
    try {
      // Sprawdź czy dokument już istnieje
      const existing = await client.getDocument(item._id)
      
      if (existing) {
        console.log(`⚠️  "${item.question.substring(0, 40)}..." już istnieje - pomijam`)
        skipped++
        continue
      }
      
      // Utwórz dokument
      await client.createOrReplace(item)
      console.log(`✅ "${item.question.substring(0, 40)}..." - utworzono`)
      created++
      
    } catch (error: any) {
      if (error.statusCode === 404) {
        try {
          await client.createOrReplace(item)
          console.log(`✅ "${item.question.substring(0, 40)}..." - utworzono`)
          created++
        } catch (createError) {
          console.error(`❌ Błąd podczas tworzenia:`, createError)
        }
      } else {
        console.error(`❌ Błąd:`, error)
      }
    }
  }
  
  console.log(`\n📊 Podsumowanie:`)
  console.log(`   ✅ Utworzono: ${created}`)
  console.log(`   ⚠️  Pominięto (już istnieją): ${skipped}`)
  console.log(`\n📝 Możesz teraz edytować FAQ w Sanity Studio:`)
  console.log(`   https://syntance.sanity.studio/`)
}

seedFaq()
