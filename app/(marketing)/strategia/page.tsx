'use client'

import { useEffect, useState, useRef } from 'react'
import { 
  Target, 
  Users, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  FileText, 
  Clock, 
  TrendingUp,
  ChevronDown,
  Lightbulb,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import GradientText from '@/components/GradientText'
import TiltCard from '@/components/tilt-card'
import SubpageScrollbar from '@/components/SubpageScrollbar'

// Sekcje dla scrollbar
const scrollbarSections = [
  { id: "hero-strategia", label: "Start" },
  { id: "problem", label: "Problem" },
  { id: "fundamenty", label: "3 Fundamenty" },
  { id: "buyer-journey", label: "Buyer Journey" },
  { id: "discovery", label: "Warsztat" },
  { id: "dla-kogo", label: "Dla kogo" },
  { id: "faq", label: "FAQ" },
]

// Komponent animowanej sekcji
function AnimatedSection({ 
  children, 
  className = '', 
  delay = 0 
}: { 
  children: React.ReactNode
  className?: string
  delay?: number 
}) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1, rootMargin: '-50px' }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div 
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
    >
      {children}
    </div>
  )
}

// Buyer Journey stages data
const buyerJourneyStages = [
  { stage: "1. Problem", think: "\"Coś nie działa\"", see: "Hero + opis bólu", gradient: "from-red-500 to-orange-500" },
  { stage: "2. Zrozumienie", think: "\"Jak to naprawić?\"", see: "Edukacja / metodyka", gradient: "from-orange-500 to-yellow-500" },
  { stage: "3. Wybór", think: "\"Jakie mam opcje?\"", see: "Porównanie / oferta", gradient: "from-yellow-500 to-green-500" },
  { stage: "4. Decyzja", think: "\"Czy warto ryzykować?\"", see: "Social proof, FAQ", gradient: "from-green-500 to-blue-500" },
  { stage: "5. Zakup", think: "\"Chcę zacząć\"", see: "Cennik, CTA, kontakt", gradient: "from-blue-500 to-purple-500" }
]

const fundamenty = [
  {
    icon: Target,
    title: "Cel biznesowy",
    question: "Co strona ma osiągnąć?",
    gradient: "from-purple-500 to-blue-500",
    textColor: "text-purple-400",
    description: "Strona bez celu to strona bez mierzalnych wyników.",
    examples: [
      "Zwiększyć liczbę zapytań ofertowych o 50%",
      "Zmniejszyć liczbę \"głupich pytań\" na telefon",
      "Podnieść średnią wartość klienta",
      "Zbudować listę mailingową",
    ],
    kontrolne: "Skąd za 6 miesięcy będziesz wiedział, czy strona działa?"
  },
  {
    icon: Users,
    title: "Buyer Persona",
    question: "Do kogo mówisz?",
    gradient: "from-blue-500 to-cyan-500",
    textColor: "text-blue-400",
    description: "Strona \"dla wszystkich\" jest stroną dla nikogo.",
    nie: ["\"Mężczyzna 35-50 lat\"", "\"Firmy z sektora MŚP\""],
    tak: ["Co go boli?", "Czego się boi?", "Co wyzwala decyzję?", "Jakie ma obiekcje?"],
    kontrolne: "Strona mówi językiem klienta i zbija jego obiekcje, zanim je wypowie."
  },
  {
    icon: Zap,
    title: "Propozycja Wartości (UVP)",
    question: "Dlaczego Ty, nie konkurencja?",
    gradient: "from-cyan-500 to-teal-500",
    textColor: "text-cyan-400",
    description: "UVP to odpowiedź na pytanie: \"Dlaczego klient ma wybrać Ciebie?\"",
    template: "Dla [segment], którzy [problem], [firma] to [kategoria], która [wyróżnik], ponieważ [dowód].",
    example: "Dla właścicieli firm usługowych, którzy chcą więcej klientów z internetu, Syntance to studio webowe, które buduje strony generujące leady, ponieważ każdy projekt zaczyna od strategii.",
    kontrolne: "Czy potrafisz powiedzieć to w jednym zdaniu?"
  }
]

const faqItems = [
  {
    question: "Czy mogę pominąć strategię i od razu zacząć od projektu?",
    answer: "Możesz, ale ryzykujesz, że strona będzie ładna, ale nieskuteczna. 80% naszych klientów, którzy przyszli \"tylko po stronę\", po Discovery zmienili całą koncepcję."
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
    answer: "Tak. Każdy projekt strony lub sklepu zawiera uproszczoną wersję Discovery w cenie. Pełny Warsztat (4 500 PLN) to opcja dla firm, które chcą głębszej analizy."
  },
  {
    question: "Dla jakiej wielkości firm jest Warsztat Discovery?",
    answer: "Dla firm, które traktują stronę jako narzędzie biznesowe, nie wizytówkę. Typowo: 1-50 pracowników, B2B lub usługi premium B2C."
  }
]

export default function StrategiaPage() {
  const [heroVisible, setHeroVisible] = useState(false)

  useEffect(() => {
    setHeroVisible(true)
  }, [])

  return (
    <div className="min-h-screen w-full" style={{ overflowX: 'clip' }}>
      <SubpageScrollbar sections={scrollbarSections} />
      
      {/* Hero Section */}
      <section id="hero-strategia" className="relative z-10 min-h-screen flex items-center justify-center px-6 lg:px-12 pt-32 pb-20">
        <div className={`max-w-5xl mx-auto text-center transition-all duration-1000 ${
          heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-widest leading-tight mb-8 glow-text">
            Strategia{" "}
            <GradientText
              colors={["#a855f7", "#3b82f6", "#06b6d4", "#3b82f6", "#a855f7"]}
              animationSpeed={4}
              className="font-medium"
            >
              przed kodem
            </GradientText>
          </h1>
          <p className="text-xl md:text-2xl font-light tracking-wide text-gray-400 mb-6">
            Dlaczego 80% stron nie generuje leadów?
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-12">
            Większość stron wygląda dobrze, ale nie sprzedaje. 
            Problem? Brak fundamentów strategicznych przed pierwszym pikselem.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/cennik"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full font-medium tracking-wider hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              Zamów stronę ze strategią
            </Link>
            <button 
              onClick={() => {
                document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-8 py-4 bg-white bg-opacity-10 border border-gray-700 text-white rounded-full font-medium tracking-wider hover:bg-opacity-20 transition-all"
            >
              Dowiedz się więcej
            </button>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-500 ${
          heroVisible ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="relative z-10 py-32 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-light tracking-wide text-center mb-6">
              Czy Twoja strona to{' '}
              <span className="text-red-400">&ldquo;ładny obrazek&rdquo;</span>?
            </h2>
            <p className="text-xl text-gray-400 text-center mb-16">
              Większość stron wygląda dobrze, ale nie sprzedaje.
            </p>
          </AnimatedSection>
          
          <AnimatedSection delay={100}>
            <div className="p-8 rounded-2xl bg-red-500/5 border border-red-500/20 mb-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-medium text-white">Typowe objawy strony bez strategii:</h3>
              </div>
              <ul className="space-y-3 ml-16">
                {[
                  "Strona wygląda dobrze, ale nie generuje zapytań",
                  "Nie wiesz, kto jest Twoim idealnym klientem",
                  "Nagłówek brzmi: \"Jesteśmy liderem\" lub \"Kompleksowe rozwiązania\"",
                  "Każda zmiana wymaga 2 tygodni i wyceny od developera",
                  "Nie masz pojęcia, czy strona się zwraca"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-400">
                    <span className="text-red-400 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="p-8 rounded-2xl bg-purple-500/5 border border-purple-500/20">
              <div className="flex items-start gap-4">
                <Lightbulb className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                <p className="text-lg text-gray-300 leading-relaxed">
                  <strong className="text-white">Prawda:</strong> Strona internetowa to nie wizytówka. 
                  To strategiczne narzędzie marketingowe, które musi być zaprojektowane wokół procesu zakupowego klienta.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Transition */}
      <section className="relative z-10 py-24 px-6 lg:px-12">
        <AnimatedSection className="max-w-3xl mx-auto text-center">
          <p className="text-2xl md:text-4xl font-light text-gray-400 leading-relaxed">
            Zanim zaprojektujesz pierwszy piksel, musisz odpowiedzieć na{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              3 pytania
            </span>.
          </p>
        </AnimatedSection>
      </section>

      {/* 3 Fundamenty Section */}
      <section id="fundamenty" className="relative z-10 py-32 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6 glow-text">
              3 fundamenty skutecznej strony
            </h2>
            <p className="text-xl text-gray-400">
              (zanim napiszesz linijkę kodu)
            </p>
          </AnimatedSection>
          
          <div className="space-y-8">
            {fundamenty.map((fundament, index) => {
              const Icon = fundament.icon
              return (
                <AnimatedSection key={index} delay={index * 150}>
                  <TiltCard className="w-full">
                    <div className="relative group">
                      <div className={`absolute -inset-0.5 bg-gradient-to-r ${fundament.gradient} rounded-3xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500`} />
                      <div className="relative p-8 md:p-12 rounded-3xl bg-gray-900/80 backdrop-blur-sm border border-white/10">
                        <div className="flex flex-col md:flex-row gap-8">
                          <div className="flex-shrink-0">
                            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${fundament.gradient} flex items-center justify-center mb-4`}>
                              <Icon className="w-10 h-10 text-white" />
                            </div>
                            <div className={`text-6xl font-light ${fundament.textColor} opacity-30`}>
                              0{index + 1}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-2xl md:text-3xl font-medium text-white mb-2">
                              {fundament.title}
                            </h3>
                            <p className={`text-lg ${fundament.textColor} mb-4`}>
                              {fundament.question}
                            </p>
                            <p className="text-gray-400 mb-6">
                              {fundament.description}
                            </p>
                            
                            {fundament.examples && (
                              <div className="mb-6">
                                <h4 className="text-sm font-medium text-white mb-3">Przykładowe cele:</h4>
                                <ul className="grid md:grid-cols-2 gap-2">
                                  {fundament.examples.map((ex, i) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
                                      <CheckCircle2 size={16} className={`${fundament.textColor} flex-shrink-0 mt-0.5`} />
                                      <span>{ex}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {fundament.nie && fundament.tak && (
                              <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                  <h4 className="text-sm font-medium text-red-400 mb-3">Buyer Persona to NIE:</h4>
                                  <ul className="space-y-2">
                                    {fundament.nie.map((item, i) => (
                                      <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
                                        <XCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-green-400 mb-3">Buyer Persona to:</h4>
                                  <ul className="space-y-2">
                                    {fundament.tak.map((item, i) => (
                                      <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
                                        <CheckCircle2 size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                            
                            {fundament.template && (
                              <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
                                <h4 className="text-sm font-medium text-white mb-2">Szablon UVP:</h4>
                                <p className="text-gray-400 text-sm italic">{fundament.template}</p>
                              </div>
                            )}
                            
                            {fundament.example && (
                              <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                                <h4 className="text-sm font-medium text-white mb-2">Przykład:</h4>
                                <p className="text-gray-400 text-sm">{fundament.example}</p>
                              </div>
                            )}
                            
                            <div className={`p-4 rounded-xl bg-gradient-to-r ${fundament.gradient} bg-opacity-5 border border-white/10`}>
                              <div className="flex items-start gap-3">
                                <AlertCircle size={18} className={`${fundament.textColor} flex-shrink-0 mt-0.5`} />
                                <p className="text-sm text-gray-400">
                                  <span className={`font-medium ${fundament.textColor}`}>Pytanie kontrolne: </span>
                                  {fundament.kontrolne}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* Buyer Journey Section */}
      <section id="buyer-journey" className="relative z-10 py-32 px-6 lg:px-12 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6 glow-text">
              Strona = mapa procesu decyzyjnego
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Zamiast projektować &ldquo;ładny layout&rdquo;, projektujesz proces decyzyjny w formie scrolla.
            </p>
          </AnimatedSection>
          
          <div className="space-y-4">
            {buyerJourneyStages.map((stage, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <div className="relative group">
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${stage.gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300`} />
                  <div className="relative p-6 rounded-2xl bg-gray-900/60 border border-white/10 hover:border-white/20 transition-colors">
                    <div className="grid md:grid-cols-3 gap-4 items-center">
                      <div className={`text-lg font-medium bg-gradient-to-r ${stage.gradient} bg-clip-text text-transparent`}>
                        {stage.stage}
                      </div>
                      <div className="text-gray-400">
                        <MessageSquare size={16} className="inline mr-2 opacity-50" />
                        {stage.think}
                      </div>
                      <div className="text-gray-300">
                        {stage.see}
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
          
          <AnimatedSection delay={500} className="mt-12">
            <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/20">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-400 mb-1">Pytanie kluczowe:</p>
                  <p className="text-gray-400">
                    Z jakiego etapu lejka przychodzi użytkownik na Twoją stronę? TOFU (zimny), MOFU (ciepły) czy BOFU (gorący)?
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Warsztat Discovery Section */}
      <section id="discovery" className="relative z-10 py-32 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6 glow-text">
              Warsztat Discovery
            </h2>
            <p className="text-xl text-gray-400">
              2-3 godzinne spotkanie strategiczne, na którym definiujemy fundamenty Twojej strony.
            </p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 gap-8">
            <AnimatedSection delay={0}>
              <TiltCard className="h-full">
                <div className="relative group h-full">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500" />
                  <div className="relative h-full p-8 rounded-2xl bg-gray-900/80 backdrop-blur-sm border border-white/10">
                    <h3 className="text-xl font-medium text-white mb-6">Co otrzymujesz:</h3>
                    <ul className="space-y-4">
                      {[
                        { title: "Analiza biznesu", desc: "cel strony, KPI, obecna sytuacja" },
                        { title: "Segmentacja i ICP", desc: "dla kogo jest ta strona" },
                        { title: "Buyer Persona", desc: "profil decydenta (bóle, cele, obiekcje)" },
                        { title: "Buyer Journey", desc: "mapa procesu zakupowego" },
                        { title: "Propozycja Wartości", desc: "wyróżniki i komunikaty" },
                        { title: "Architektura strony", desc: "struktura sekcji i user flow" },
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-400">
                            <strong className="text-white">{item.title}</strong> — {item.desc}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TiltCard>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <div className="space-y-6 h-full flex flex-col">
                <TiltCard className="flex-1">
                  <div className="relative group h-full">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500" />
                    <div className="relative h-full p-8 rounded-2xl bg-gray-900/80 backdrop-blur-sm border border-white/10">
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
                  </div>
                </TiltCard>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-30 blur-lg" />
                  <div className="relative p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-purple-400" />
                        <div>
                          <p className="text-sm text-purple-400 font-medium">Cena</p>
                          <p className="text-3xl font-light text-white">4 500 PLN <span className="text-lg text-gray-400">netto</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-blue-400" />
                      <p className="text-gray-400">2-3h warsztat + 3-5 dni na dokument</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Dla kogo Section */}
      <section id="dla-kogo" className="relative z-10 py-32 px-6 lg:px-12 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6 glow-text">
              Strategia nie jest dla każdego
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8">
            <AnimatedSection delay={0}>
              <TiltCard className="h-full">
                <div className="relative group h-full">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500" />
                  <div className="relative h-full p-8 rounded-2xl bg-red-500/5 border border-red-500/20">
                    <div className="flex items-center gap-3 mb-6">
                      <XCircle className="w-6 h-6 text-red-400" />
                      <h3 className="text-xl font-medium text-white">NIE jest dla Ciebie, jeśli:</h3>
                    </div>
                    <ul className="space-y-3">
                      {[
                        "Potrzebujesz \"prostej wizytówki za 2000 zł\"",
                        "Masz już strategię i szukasz tylko wykonawcy",
                        "Nie masz czasu na 2-3h spotkanie",
                        "Twój budżet na stronę to poniżej 5000 PLN"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-400">
                          <span className="text-red-400 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TiltCard>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <TiltCard className="h-full">
                <div className="relative group h-full">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500" />
                  <div className="relative h-full p-8 rounded-2xl bg-green-500/5 border border-green-500/20">
                    <div className="flex items-center gap-3 mb-6">
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                      <h3 className="text-xl font-medium text-white">JEST dla Ciebie, jeśli:</h3>
                    </div>
                    <ul className="space-y-3">
                      {[
                        "Chcesz, żeby strona generowała leady",
                        "Nie wiesz, od czego zacząć",
                        "Poprzednia strona była porażką",
                        "Zależy Ci na ROI, nie tylko estetyce"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-400">
                          <span className="text-green-400 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TiltCard>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-32 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6 glow-text">
              Pytania i odpowiedzi
            </h2>
          </AnimatedSection>
          
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <AnimatedSection key={index} delay={index * 50}>
                <details className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-colors">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <span className="font-medium text-white pr-4">{item.question}</span>
                    <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-300 group-open:rotate-180 flex-shrink-0" />
                  </summary>
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-gray-400 leading-relaxed">{item.answer}</p>
                  </div>
                </details>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-32 px-6 lg:px-12">
        <AnimatedSection className="max-w-4xl mx-auto text-center">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            
            <div className="relative bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-12 md:p-16">
              <h2 className="text-3xl md:text-5xl font-light tracking-wide text-white mb-6">
                Gotowy na stronę, która{' '}
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  generuje leady?
                </span>
              </h2>
              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                Zamów stronę ze strategią — każdy projekt zaczynamy od Discovery
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  href="/cennik" 
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105"
                >
                  <span>Sprawdź cennik</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link 
                  href="/#contact" 
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 text-white font-medium transition-all duration-300 hover:bg-white/5"
                >
                  <span>Porozmawiajmy o projekcie</span>
                </Link>
              </div>
            </div>
          </div>
        </AnimatedSection>
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
