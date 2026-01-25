import { Metadata } from 'next'
import { Target, Users, Zap, AlertCircle, CheckCircle2, XCircle, ArrowRight, FileText, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { StrategyCTA } from '@/components/StrategyCTA'
import { HeroTransition } from '@/components/page-transition'
import { sanityFetch } from '@/sanity/lib/fetch'
import { startingPricesQuery, defaultStartingPrices, type StartingPrices } from '@/sanity/queries/pricing'

// Pobierz ceny startowe z Sanity
async function getStartingPrices(): Promise<StartingPrices> {
  try {
    const prices = await sanityFetch<StartingPrices>({ query: startingPricesQuery })
    if (!prices?.discoveryWorkshopPrice) {
      return defaultStartingPrices
    }
    return prices
  } catch {
    return defaultStartingPrices
  }
}

// Funkcja do formatowania ceny
function formatPrice(price: number): string {
  return price.toLocaleString('pl-PL')
}

// Dynamiczne metadata z cenami z Sanity
export async function generateMetadata(): Promise<Metadata> {
  const prices = await getStartingPrices()
  
  return {
    title: 'Strategia Strony Internetowej',
    description: `Dlaczego strona nie generuje leadów? Bo nie ma strategii. Poznaj 3 fundamenty skutecznej strony: cel biznesowy, buyer persona i UVP. Warsztat Discovery od ${formatPrice(prices.discoveryWorkshopPrice)} PLN.`,
    keywords: 'strategia strony internetowej, buyer persona, UVP, cel biznesowy strony, warsztat discovery, strona B2B',
    openGraph: {
      title: 'Strategia Strony Internetowej',
      description: 'Dlaczego strona nie generuje leadów? Bo nie ma strategii. Poznaj 3 fundamenty skutecznej strony.',
      url: 'https://syntance.com/strategia',
    },
  }
}


// Buyer Journey stages data
const buyerJourneyStages = [
  { stage: "1. Problem", think: "\"Coś nie działa\"", see: "Hero + opis bólu" },
  { stage: "2. Zrozumienie", think: "\"Jak to naprawić?\"", see: "Edukacja / metodyka" },
  { stage: "3. Wybór", think: "\"Jakie mam opcje?\"", see: "Porównanie / oferta" },
  { stage: "4. Decyzja", think: "\"Czy warto ryzykować?\"", see: "Social proof, FAQ" },
  { stage: "5. Zakup", think: "\"Chcę zacząć\"", see: "Cennik, CTA, kontakt" }
]

export default async function StrategiaPage() {
  const prices = await getStartingPrices()
  
  // FAQ Data with Schema.org structure - z dynamicznymi cenami
  const faqItems = [
    {
      question: "Czy mogę pominąć strategię i od razu zacząć od projektu?",
      answer: "Możesz, ale ryzykujesz, że strona będzie ładna, ale nieskuteczna. 80% naszych klientów, którzy przyszli &ldquo;tylko po stronę&rdquo;, po Discovery zmienili całą koncepcję."
    },
    {
      question: "Ile trwa Warsztat Discovery?",
      answer: "Spotkanie to 2-3 godziny. Dokument strategiczny otrzymujesz w ciągu 3-5 dni roboczych."
    },
    {
      question: "Co jeśli już mam strategię?",
      answer: "Świetnie! Wtedy możemy od razu przejść do projektu. Podczas briefu zweryfikujemy, czy masz wszystkie elementy."
    },
    {
      question: "Czy strategia jest wliczona w cenę strony?",
      answer: `Tak. Każdy projekt strony lub sklepu zawiera uproszczoną wersję Discovery w cenie. Pełny Warsztat (${formatPrice(prices.discoveryWorkshopPrice)} PLN) to opcja dla firm, które chcą głębszej analizy.`
    },
    {
      question: "Dla jakiej wielkości firm jest Warsztat Discovery?",
      answer: "Dla firm, które traktują stronę jako narzędzie biznesowe, nie wizytówkę. Typowo: 1-50 pracowników, B2B lub usługi premium B2C."
    }
  ]
  
  // Schema.org FAQ JSON-LD
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  }

  return (
    <div className="min-h-screen w-full" style={{ overflowX: 'clip' }}>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      {/* Hero Section */}
      <HeroTransition>
      <section className="relative z-10 pt-52 pb-24 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wide text-white mb-6 leading-tight">
            Strategia strony internetowej — dlaczego 80% stron nie działa
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Większość stron wygląda dobrze, ale nie sprzedaje. Problem? Brak fundamentów strategicznych przed pierwszym pikselem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/cennik#discovery" 
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105"
            >
              <span>Zamów stronę ze strategią</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link 
              href="#fundamenty"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 text-white font-medium transition-all duration-300 hover:bg-white/5"
            >
              <span>Dowiedz się więcej</span>
            </Link>
          </div>
        </div>
      </section>
      </HeroTransition>

      {/* Problem Section */}
      <section id="problem" className="relative z-10 py-24 px-6 lg:px-12 bg-gray-900/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light tracking-wide text-white mb-12 text-center">
            Czy Twoja strona to &ldquo;ładny obrazek&rdquo; czy narzędzie sprzedaży?
          </h2>
          
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <h3 className="text-xl font-medium text-white">Typowe objawy strony bez strategii:</h3>
            </div>
            <ul className="space-y-3 ml-10">
              <li className="text-gray-400 flex items-start gap-3">
                <span className="text-red-400 flex-shrink-0">•</span>
                <span>Strona wygląda dobrze, ale nie generuje zapytań</span>
              </li>
              <li className="text-gray-400 flex items-start gap-3">
                <span className="text-red-400 flex-shrink-0">•</span>
                <span>Nie wiesz, kto jest Twoim idealnym klientem</span>
              </li>
              <li className="text-gray-400 flex items-start gap-3">
                <span className="text-red-400 flex-shrink-0">•</span>
                <span>Nagłówek brzmi: &ldquo;Jesteśmy liderem&rdquo; lub &ldquo;Kompleksowe rozwiązania&rdquo;</span>
              </li>
              <li className="text-gray-400 flex items-start gap-3">
                <span className="text-red-400 flex-shrink-0">•</span>
                <span>Każda zmiana wymaga 2 tygodni i wyceny od developera</span>
              </li>
              <li className="text-gray-400 flex items-start gap-3">
                <span className="text-red-400 flex-shrink-0">•</span>
                <span>Nie masz pojęcia, czy strona się zwraca</span>
              </li>
            </ul>
          </div>

          <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-8">
            <p className="text-lg text-gray-400 leading-relaxed">
              <strong className="text-white">Prawda:</strong> Strona internetowa to nie wizytówka. To strategiczne narzędzie marketingowe, które musi być zaprojektowane wokół procesu zakupowego klienta.
            </p>
          </div>
        </div>
      </section>

      {/* 3 Fundamenty Section */}
      <section id="fundamenty" className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light tracking-wide text-white mb-4">
              3 fundamenty skutecznej strony
            </h2>
            <p className="text-xl text-gray-400 mb-2">
              (zanim napiszesz linijkę kodu)
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Zanim zaprojektujesz pierwszy piksel, musisz odpowiedzieć na 3 pytania. Bez nich strona będzie ładna, ale martwa.
            </p>
          </div>

          <div className="space-y-16">
            {/* Fundament 1: Cel Biznesowy */}
            <div className="bg-gray-900/50 border border-white/10 rounded-3xl p-8 md:p-12">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-medium text-white mb-2">
                    1. Cel biznesowy — co strona ma osiągnąć?
                  </h3>
                  <p className="text-gray-400">
                    Strona bez celu to strona bez mierzalnych wyników.
                  </p>
                </div>
              </div>

              <div className="ml-0 md:ml-22 space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">Przykładowe cele:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3 text-gray-400">
                      <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Zwiększyć liczbę zapytań ofertowych o 50%</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-400">
                      <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Zmniejszyć liczbę &ldquo;głupich pytań&rdquo; na telefon</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-400">
                      <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Podnieść średnią wartość klienta (premium pozycjonowanie)</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-400">
                      <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Zbudować listę mailingową (lead magnet)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-purple-400 mb-1">Pytanie kontrolne:</p>
                      <p className="text-gray-400">
                        Skąd za 6 miesięcy będziesz wiedział, czy strona działa?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fundament 2: Buyer Persona */}
            <div className="bg-gray-900/50 border border-white/10 rounded-3xl p-8 md:p-12">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-medium text-white mb-2">
                    2. Buyer Persona — do kogo mówisz?
                  </h3>
                  <p className="text-gray-400">
                    Strona &ldquo;dla wszystkich&rdquo; jest stroną dla nikogo.
                  </p>
                </div>
              </div>

              <div className="ml-0 md:ml-22 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">Buyer Persona to NIE:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 text-gray-400">
                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <span>&ldquo;Mężczyzna 35-50 lat, mieszka w mieście&rdquo;</span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-400">
                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <span>&ldquo;Firmy z sektora MŚP&rdquo;</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">Buyer Persona to:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 text-gray-400">
                        <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>Co go boli? (np. &ldquo;Konkurencja ma lepszą stronę&rdquo;)</span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-400">
                        <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>Czego się boi? (np. &ldquo;Ostatnia strona była porażką&rdquo;)</span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-400">
                        <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>Co wyzwala decyzję? (np. &ldquo;Nowa inwestycja&rdquo;)</span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-400">
                        <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>Jakie obiekcje? (np. &ldquo;To pewnie drogie&rdquo;)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-400 mb-1">Efekt:</p>
                      <p className="text-gray-400">
                        Strona mówi językiem klienta i zbija jego obiekcje, zanim je wypowie.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fundament 3: UVP */}
            <div className="bg-gray-900/50 border border-white/10 rounded-3xl p-8 md:p-12">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-medium text-white mb-2">
                    3. Propozycja Wartości (UVP) — dlaczego Ty, a nie konkurencja?
                  </h3>
                  <p className="text-gray-400">
                    UVP to odpowiedź na pytanie: &ldquo;Dlaczego klient ma wybrać Ciebie?&rdquo;
                  </p>
                </div>
              </div>

              <div className="ml-0 md:ml-22 space-y-6">
                <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-white mb-3">Szablon UVP:</h4>
                  <p className="text-gray-400 italic">
                    Dla [segment klientów], którzy [mają problem], [Twoja firma] to [kategoria], która [wyróżnik], ponieważ [dowód].
                  </p>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-white mb-3">Przykład:</h4>
                  <p className="text-gray-400">
                    Dla właścicieli firm usługowych, którzy chcą więcej klientów z internetu, Syntance to studio webowe, które buduje strony generujące leady, ponieważ każdy projekt zaczyna od strategii, nie od grafiki.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Buyer Journey Section */}
      <section id="buyer-journey" className="relative z-10 py-24 px-6 lg:px-12 bg-gray-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light tracking-wide text-white mb-4">
              Strona = mapa procesu decyzyjnego klienta
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  Zamiast projektować &ldquo;ładny layout&rdquo;, projektujesz proces decyzyjny w formie scrolla. Każda sekcja odpowiada na pytanie, które klient ma w głowie.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-6 text-sm font-medium text-purple-400 uppercase tracking-wider">Etap</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-purple-400 uppercase tracking-wider">Co klient myśli</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-purple-400 uppercase tracking-wider">Co musi zobaczyć</th>
                </tr>
              </thead>
              <tbody>
                {buyerJourneyStages.map((item, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 text-white font-medium">{item.stage}</td>
                    <td className="py-4 px-6 text-gray-400">{item.think}</td>
                    <td className="py-4 px-6 text-gray-400">{item.see}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 bg-purple-500/5 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-400 mb-1">Pytanie kluczowe:</p>
                <p className="text-gray-400">
                  Z jakiego etapu lejka przychodzi użytkownik na Twoją stronę? TOFU (zimny), MOFU (ciepły) czy BOFU (gorący)?
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Warsztat Discovery Section */}
      <section id="discovery" className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light tracking-wide text-white mb-4">
              Warsztat Discovery — strategia przed kodem
            </h2>
            <p className="text-xl text-gray-400">
              2-3 godzinne spotkanie strategiczne, na którym definiujemy fundamenty Twojej strony.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-8">
              <h3 className="text-xl font-medium text-white mb-6">Co otrzymujesz:</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">
                    <strong className="text-white">Analiza biznesu</strong> — cel strony, KPI, obecna sytuacja
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">
                    <strong className="text-white">Segmentacja i ICP</strong> — dla kogo jest ta strona
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">
                    <strong className="text-white">Buyer Persona</strong> — profil decydenta (bóle, cele, obiekcje)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">
                    <strong className="text-white">Buyer Journey</strong> — mapa procesu zakupowego
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">
                    <strong className="text-white">Propozycja Wartości (UVP)</strong> — wyróżniki i komunikaty
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">
                    <strong className="text-white">Architektura strony</strong> — struktura sekcji i user flow
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-8">
              <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-8">
                <h3 className="text-xl font-medium text-white mb-6">Format dostawy:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-gray-400">
                    <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>PDF + strona w Notion (możesz edytować)</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-400">
                    <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>15-25 stron strategicznego dokumentu</span>
                  </li>
                </ul>
              </div>

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <TrendingUp className="w-8 h-8 text-purple-400" />
                    <div>
                      <p className="text-sm text-purple-400 font-medium mb-1">Cena</p>
                      <p className="text-3xl font-light text-white">{formatPrice(prices.discoveryWorkshopPrice)} PLN <span className="text-lg text-gray-400">netto</span></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="text-sm text-blue-400 font-medium mb-1">Czas</p>
                      <p className="text-gray-400">2-3h warsztat + 3-5 dni na dokument</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dla kogo NIE jest Section */}
      <section id="nie-dla" className="relative z-10 py-24 px-6 lg:px-12 bg-gray-900/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light tracking-wide text-white mb-12 text-center">
            Strategia nie jest dla każdego
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <XCircle className="w-6 h-6 text-red-400" />
                <h3 className="text-xl font-medium text-white">NIE jest dla Ciebie, jeśli:</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-400">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Potrzebujesz &ldquo;prostej wizytówki za 2000 zł&rdquo;</span>
                </li>
                <li className="flex items-start gap-3 text-gray-400">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Masz już strategię i szukasz tylko wykonawcy</span>
                </li>
                <li className="flex items-start gap-3 text-gray-400">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Nie masz czasu na 2-3h spotkanie</span>
                </li>
                <li className="flex items-start gap-3 text-gray-400">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Twój budżet na stronę to poniżej 5000 PLN</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-medium text-white">JEST dla Ciebie, jeśli:</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-400">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Chcesz, żeby strona generowała leady, nie tylko &ldquo;wyglądała ładnie&rdquo;</span>
                </li>
                <li className="flex items-start gap-3 text-gray-400">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Nie wiesz, od czego zacząć (masz wizję, ale brak planu)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-400">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Poprzednia strona była porażką i nie chcesz powtarzać błędów</span>
                </li>
                <li className="flex items-start gap-3 text-gray-400">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Zależy Ci na ROI, nie tylko na estetyce</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA końcowe */}
      <StrategyCTA />

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-24 px-6 lg:px-12 bg-gray-900/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light tracking-wide text-white mb-12 text-center">
            Najczęściej zadawane pytania o strategię strony
          </h2>

          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-gray-900/50 border border-white/10 rounded-2xl p-8 hover:border-purple-500/30 transition-colors">
                <h3 className="text-lg font-medium text-white mb-3">
                  {item.question}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-900 pt-16 pb-12 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors font-medium">
              ← Powrót do strony głównej
            </Link>
            <div className="flex gap-6">
              <Link href="/cennik" className="text-gray-400 hover:text-white transition-colors">
                Cennik
              </Link>
              <Link href="/nextjs" className="text-gray-400 hover:text-white transition-colors">
                Technologia
              </Link>
              <Link href="/#contact" className="text-gray-400 hover:text-white transition-colors">
                Kontakt
              </Link>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-900">
            <p className="text-center text-sm font-light tracking-wider text-gray-400">
              © Syntance — Strony i sklepy, które działają.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
