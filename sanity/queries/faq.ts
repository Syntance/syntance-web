import { groq } from 'next-sanity'

// Query do pobrania aktywnych FAQ posortowanych po kolejności
export const pricingFaqQuery = groq`
  *[_type == "pricingFaq" && isActive == true] | order(order asc) {
    _id,
    question,
    answer,
    category,
    order
  }
`

// Typ TypeScript dla FAQ
export interface PricingFaqItem {
  _id: string
  question: string
  answer: string
  category: 'pricing' | 'time' | 'trust' | 'comparison'
  order: number
}

// Domyślne FAQ (fallback gdy Sanity nie skonfigurowane)
export const defaultFaqItems: PricingFaqItem[] = [
  // Pytania cenowe
  {
    _id: 'default-1',
    category: 'pricing',
    question: 'Ile kosztuje strona internetowa?',
    answer: 'Strona firmowa zaczyna się od 5 400 PLN netto. Cena zależy od liczby podstron, funkcjonalności i integracji. Skorzystaj z konfiguratora powyżej, żeby poznać dokładną wycenę dla Twojego projektu.',
    order: 1,
  },
  {
    _id: 'default-2',
    category: 'pricing',
    question: 'Ile kosztuje sklep internetowy?',
    answer: 'Sklep e-commerce zaczyna się od 12 000 PLN netto (baza). Pełnofunkcyjny sklep z płatnościami, filtrowaniem i kontami użytkowników to zazwyczaj 18-25k PLN. Aplikacje typu marketplace — od 50k PLN.',
    order: 2,
  },
  {
    _id: 'default-3',
    category: 'pricing',
    question: 'Dlaczego ceny zaczynają się od 5k, a nie 500 zł?',
    answer: 'Buduję strony w technologii Next.js — tej samej, której używają Nike, Netflix czy Notion. To nie jest szablon z WordPress. Dostajesz kod pisany pod Ciebie, błyskawiczną szybkość (Core Web Vitals 95+) i stronę, która będzie działać latami bez "aktualizacji wtyczek".',
    order: 3,
  },
  {
    _id: 'default-4',
    category: 'pricing',
    question: 'Od czego zależy cena strony?',
    answer: 'Główne czynniki: liczba podstron, rodzaj funkcjonalności (formularz, blog, galeria), integracje (CMS, płatności, newsletter) oraz poziom animacji. Konfigurator powyżej pokaże Ci dokładny rozkład kosztów.',
    order: 4,
  },
  // Pytania o czas i proces
  {
    _id: 'default-5',
    category: 'time',
    question: 'Ile trwa realizacja strony?',
    answer: 'Strona firmowa: 2-3 tygodnie. Sklep e-commerce: 4-6 tygodni. Widzisz postęp na żywo (preview link) — nie czekasz 3 miesiące na "efekt końcowy".',
    order: 5,
  },
  {
    _id: 'default-6',
    category: 'time',
    question: 'Co to jest Warsztat Discovery?',
    answer: '2-3 godzinne spotkanie, na którym definiujemy strategię, grupę docelową i cele strony. Wynikiem jest dokument z wytycznymi — dzięki temu strona jest skuteczna, a nie tylko "ładna". Warsztat kosztuje 4 500 PLN i jest zaliczany na poczet projektu.',
    order: 6,
  },
  // Pytania o ryzyko/zaufanie
  {
    _id: 'default-7',
    category: 'trust',
    question: 'A co jeśli efekt mi się nie spodoba?',
    answer: 'Widzisz postęp co tydzień na podglądzie (preview link). Poprawki wdrażamy na bieżąco — nie po 3 miesiącach. Jeśli coś nie pasuje, zmieniamy od razu.',
    order: 7,
  },
  {
    _id: 'default-8',
    category: 'trust',
    question: 'Czy mogę rozłożyć płatność?',
    answer: 'Tak. Standardowy model: 50% na start, 50% przy odbiorze. Przy większych projektach możliwe płatności w 3 ratach.',
    order: 8,
  },
  {
    _id: 'default-9',
    category: 'trust',
    question: 'Co jeśli potrzebuję zmian po wdrożeniu?',
    answer: 'Oferuję pakiety opieki od 500 PLN/msc — poprawki, aktualizacje, wsparcie. Możesz też zlecać zmiany jednorazowo.',
    order: 9,
  },
  // Porównania
  {
    _id: 'default-10',
    category: 'comparison',
    question: 'Dlaczego Ty, a nie tańszy freelancer?',
    answer: 'Freelancer za 2k PLN da Ci szablon WordPress, który za rok będzie wymagał aktualizacji 47 wtyczek. Ja daję Ci kod, który jest Twój, szybki i bezpieczny. To inwestycja, nie koszt.',
    order: 10,
  },
]
