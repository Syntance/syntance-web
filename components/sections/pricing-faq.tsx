'use client'

import { useState } from 'react'
import { ChevronDown, DollarSign, Clock, Shield, Scale, Twitter, Linkedin, Github } from 'lucide-react'
import { ContactForm } from '@/components/contact-form'

interface FAQItem {
  question: string
  answer: string
  category: 'pricing' | 'time' | 'trust' | 'comparison'
}

const faqItems: FAQItem[] = [
  // Pytania cenowe
  {
    category: 'pricing',
    question: 'Ile kosztuje strona internetowa?',
    answer: 'Strona firmowa zaczyna się od 5 400 PLN netto. Cena zależy od liczby podstron, funkcjonalności i integracji. Skorzystaj z konfiguratora powyżej, żeby poznać dokładną wycenę dla Twojego projektu.',
  },
  {
    category: 'pricing',
    question: 'Ile kosztuje sklep internetowy?',
    answer: 'Sklep e-commerce zaczyna się od 12 000 PLN netto (baza). Pełnofunkcyjny sklep z płatnościami, filtrowaniem i kontami użytkowników to zazwyczaj 18-25k PLN. Aplikacje typu marketplace — od 50k PLN.',
  },
  {
    category: 'pricing',
    question: 'Dlaczego ceny zaczynają się od 5k, a nie 500 zł?',
    answer: 'Buduję strony w technologii Next.js — tej samej, której używają Nike, Netflix czy Notion. To nie jest szablon z WordPress. Dostajesz kod pisany pod Ciebie, błyskawiczną szybkość (Core Web Vitals 95+) i stronę, która będzie działać latami bez "aktualizacji wtyczek".',
  },
  {
    category: 'pricing',
    question: 'Od czego zależy cena strony?',
    answer: 'Główne czynniki: liczba podstron, rodzaj funkcjonalności (formularz, blog, galeria), integracje (CMS, płatności, newsletter) oraz poziom animacji. Konfigurator powyżej pokaże Ci dokładny rozkład kosztów.',
  },
  // Pytania o czas i proces
  {
    category: 'time',
    question: 'Ile trwa realizacja strony?',
    answer: 'Strona firmowa: 2-3 tygodnie. Sklep e-commerce: 4-6 tygodni. Widzisz postęp na żywo (preview link) — nie czekasz 3 miesiące na "efekt końcowy".',
  },
  {
    category: 'time',
    question: 'Co to jest Warsztat Discovery?',
    answer: '2-3 godzinne spotkanie, na którym definiujemy strategię, grupę docelową i cele strony. Wynikiem jest dokument z wytycznymi — dzięki temu strona jest skuteczna, a nie tylko "ładna". Warsztat kosztuje 4 500 PLN i jest zaliczany na poczet projektu.',
  },
  // Pytania o ryzyko/zaufanie
  {
    category: 'trust',
    question: 'A co jeśli efekt mi się nie spodoba?',
    answer: 'Widzisz postęp co tydzień na podglądzie (preview link). Poprawki wdrażamy na bieżąco — nie po 3 miesiącach. Jeśli coś nie pasuje, zmieniamy od razu.',
  },
  {
    category: 'trust',
    question: 'Czy mogę rozłożyć płatność?',
    answer: 'Tak. Standardowy model: 50% na start, 50% przy odbiorze. Przy większych projektach możliwe płatności w 3 ratach.',
  },
  {
    category: 'trust',
    question: 'Co jeśli potrzebuję zmian po wdrożeniu?',
    answer: 'Oferuję pakiety opieki od 500 PLN/msc — poprawki, aktualizacje, wsparcie. Możesz też zlecać zmiany jednorazowo.',
  },
  // Porównania
  {
    category: 'comparison',
    question: 'Dlaczego Ty, a nie tańszy freelancer?',
    answer: 'Freelancer za 2k PLN da Ci szablon WordPress, który za rok będzie wymagał aktualizacji 47 wtyczek. Ja daję Ci kod, który jest Twój, szybki i bezpieczny. To inwestycja, nie koszt.',
  },
]

const categoryInfo = {
  pricing: { icon: DollarSign, label: 'Pytania cenowe', color: 'from-emerald-500 to-green-500' },
  time: { icon: Clock, label: 'Czas i proces', color: 'from-blue-500 to-cyan-500' },
  trust: { icon: Shield, label: 'Ryzyko i zaufanie', color: 'from-purple-500 to-pink-500' },
  comparison: { icon: Scale, label: 'Porównania', color: 'from-amber-500 to-orange-500' },
}

function FAQAccordionItem({ item, isOpen, onClick }: { item: FAQItem; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={onClick}
        className="w-full py-5 px-4 flex items-start justify-between gap-4 text-left hover:bg-white/5 transition-colors rounded-lg"
        aria-expanded={isOpen}
      >
        <span className={`font-medium text-lg ${isOpen ? 'text-white' : 'text-gray-300'}`}>
          {item.question}
        </span>
        <ChevronDown 
          size={20} 
          className={`flex-shrink-0 mt-1 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}
      >
        <p className="px-4 text-gray-400 leading-relaxed">
          {item.answer}
        </p>
      </div>
    </div>
  )
}

export function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredItems = activeCategory 
    ? faqItems.filter(item => item.category === activeCategory)
    : faqItems

  const groupedByCategory = faqItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, FAQItem[]>)

  return (
    <section className="relative z-10 py-20 px-6 lg:px-12" id="faq">
      {/* JSON-LD Schema.org FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqItems.map(item => ({
              "@type": "Question",
              "name": item.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer,
              },
            })),
          }),
        }}
      />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-light tracking-widest glow-text mb-4">
            Najczęstsze pytania
          </h2>
          <p className="text-lg text-gray-400">
            Wszystko, co powinieneś wiedzieć przed współpracą
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === null
                ? 'bg-white text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Wszystkie
          </button>
          {Object.entries(categoryInfo).map(([key, { icon: Icon, label, color }]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(activeCategory === key ? null : key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                activeCategory === key
                  ? `bg-gradient-to-r ${color} text-white`
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {filteredItems.map((item, index) => (
            <FAQAccordionItem
              key={index}
              item={item}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        {/* Formularz kontaktowy */}
        <div className="mt-16">
          <p className="text-gray-400 mb-8 text-center">
            Nie znalazłeś odpowiedzi na swoje pytanie?
          </p>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <address className="space-y-8 not-italic">
              <div>
                <h3 className="text-xl font-medium tracking-wider mb-4">Email</h3>
                <a href="mailto:kontakt@syntance.com" className="text-gray-300 hover:text-white transition-colors text-lg">
                  kontakt@syntance.com
                </a>
              </div>
              
              <div>
                <h3 className="text-xl font-medium tracking-wider mb-4">Telefon</h3>
                <a href="tel:+48662519544" className="text-gray-300 hover:text-white transition-colors text-lg">
                  +48 662 519 544
                </a>
              </div>
              
              <div>
                <h3 className="text-xl font-medium tracking-wider mb-4">Social Media</h3>
                <nav aria-label="Social media" className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter/X">
                    <Twitter size={24} aria-hidden="true" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                    <Linkedin size={24} aria-hidden="true" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="GitHub">
                    <Github size={24} aria-hidden="true" />
                  </a>
                </nav>
              </div>
            </address>
            
            {/* Contact Form */}
            <div>
              <ContactForm 
                idPrefix="faq" 
                showFullRodo={true} 
                source="pricing-faq"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PricingFAQ
