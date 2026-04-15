'use client'

import { useEffect, useState, useRef } from 'react'
import {
  ArrowRight,
  Check,
  Gauge,
  UserX,
  Layers,
  Rocket,
  Shield,
  FileLock,
  MessageSquare,
  ExternalLink,
  ClipboardList,
} from 'lucide-react'
import GradientText from '@/components/GradientText'
import SubpageScrollbar from '@/components/SubpageScrollbar'
import { ContactForm } from '@/components/contact-form'

const LINKEDIN_COMPANY = 'https://www.linkedin.com/company/syntance'

const FORM_SECTION_ID = 'form-partnerski'

function scrollToPartnerForm() {
  document.getElementById(FORM_SECTION_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const scrollbarSections = [
  { id: 'hero-wl', label: 'Start' },
  { id: 'problem-agencje', label: 'Problem' },
  { id: 'model-wl', label: 'Model WL' },
  { id: 'cennik', label: 'Cennik' },
  { id: 'proces-wl', label: 'Proces' },
  { id: 'gwarancje-wl', label: 'Gwarancje' },
  { id: 'faq-wl', label: 'FAQ' },
  { id: 'cta-koncowy', label: 'Kontakt' },
]

function AnimatedSection({
  children,
  className = '',
  delay = 0,
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

function PartnerStickyBar({
  heroId,
  hideSectionId,
  label,
}: {
  heroId: string
  hideSectionId?: string
  label: string
}) {
  const [fixed, setFixed] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const hero = document.getElementById(heroId)
    if (!hero) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setFixed(entry.intersectionRatio < 0.35)
      },
      { threshold: [0, 0.15, 0.35, 0.5, 0.7, 1] }
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [heroId])

  useEffect(() => {
    if (!hideSectionId) return
    const section = document.getElementById(hideSectionId)
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHidden(entry.isIntersecting)
      },
      { threshold: 0.12 }
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [hideSectionId])

  if (!fixed || hidden) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 md:px-8 pointer-events-none">
      <div className="pointer-events-auto max-w-3xl mx-auto rounded-2xl border border-white/15 bg-black/85 backdrop-blur-md shadow-lg shadow-black/40 px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-3">
        <p className="text-sm text-gray-400 text-center sm:text-left">
          Zapytanie partnerskie — odpowiadamy w ciągu 24 godzin roboczych
        </p>
        <button
          type="button"
          onClick={scrollToPartnerForm}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white text-gray-900 font-medium text-sm hover:bg-gray-100 transition-colors whitespace-nowrap shadow-md"
        >
          <ClipboardList className="w-4 h-4 shrink-0" aria-hidden />
          {label}
        </button>
      </div>
    </div>
  )
}

const problemItems = [
  {
    icon: Gauge,
    title: 'PageSpeed 35 na mobile',
    body:
      'Częsty stack na szybko: klient sprawdza wynik w narzędziu i pyta: „dlaczego tak wolno?”. Ty łapiesz reklamację zamiast polecenia.',
  },
  {
    icon: UserX,
    title: 'Wykonawca „znika”',
    body:
      'Termin 3 tygodnie zamienia się w 3 miesiące. Klient czeka, a Ty tracisz reputację przy kolejnych projektach.',
  },
  {
    icon: Layers,
    title: 'Nie skalujesz usług webowych',
    body:
      'Kolejka do jednej osoby = limit przychodu. Nowi klienci odchodzą, bo nie dowozisz w czasie.',
  },
  {
    icon: Rocket,
    title: 'Konkurencja podnosi poprzeczkę',
    body:
      'Inne agencje sprzedają „stronę nowej generacji”. Twoi klienci pytają: „dlaczego u Was nie?”',
  },
]

const modelSteps = [
  {
    n: '1',
    title: 'Twój klient → Ty',
    text:
      'Klient przychodzi do Twojej agencji. Ty sprzedajesz realizację pod swoją marką po swojej cenie (np. 20–30 tys. PLN).',
  },
  {
    n: '2',
    title: 'Ty → Syntance',
    text:
      'Zlecasz nam wykonanie po cenie partnerskiej (white-label). NDA podpisane — bez wzmianek o Syntance przy kliencie.',
  },
  {
    n: '3',
    title: 'Syntance → dostawa',
    text:
      'Dostarczamy stronę z wysokim PageSpeed i edycją treści w CMS. Klient widzi Twoją markę. Ty utrzymujesz marżę na poziomie 40–60%.',
  },
]

const modelPrinciples = [
  'NDA od startu — nie kontaktujemy się z Twoim klientem',
  'Kod w Twoim repozytorium (lub klienta) — bez uzależnienia od jednego dostawcy',
  'Komunikacja przez Slack lub Teams — jeden kanał',
  'CMS pod treści — klient edytuje sam, mniej ticketów „drobnych poprawek”',
]

const pricingRows = [
  {
    name: 'Start (1–3 podstrony)',
    wl: '2 900 PLN',
    sell: '6 000–8 000 PLN',
    margin: '52–64%',
  },
  {
    name: 'Standard (4–8 podstron)',
    wl: '12 500 PLN',
    sell: '20 000–30 000 PLN',
    margin: '38–58%',
  },
  {
    name: 'Custom (9+ podstron)',
    wl: '140 PLN/h',
    sell: '250–350 PLN/h',
    margin: '44–60%',
  },
  {
    name: 'Utrzymanie / SLA',
    wl: '499 PLN/mies.',
    sell: '800–1 500 PLN/mies.',
    margin: '38–67%',
  },
]

const processSteps = [
  {
    title: 'Rozmowa partnerska',
    meta: 'formularz → kontakt zwrotny',
    text:
      'Po wysłaniu zgłoszenia umawiamy krótką rozmowę: poznajemy model pracy agencji, typ klientów i oczekiwania co do terminów oraz komunikacji.',
  },
  {
    title: 'Projekt pilotażowy',
    meta: '1. projekt w cenie detalicznej',
    text:
      'Pierwsza realizacja jak „egzamin”: termin, jakość, zero tarcia. Weryfikujesz nas bez ryzyka po stronie relacji z klientem.',
  },
  {
    title: 'Stałe partnerstwo',
    meta: 'od 2. projektu — ceny WL',
    text:
      'Dedykowany kanał Slack/Teams, priorytet w kolejce, SLA odpowiedzi poniżej 4 godzin.',
  },
  {
    title: 'Skalowanie',
    meta: '3+ projektów/kwartał',
    text:
      'Indywidualne warunki oraz bonus za polecenia — gdy współpraca staje się stałym kanałem przychodu.',
  },
]

const guarantees = [
  {
    name: 'NDA',
    desc:
      'Nie kontaktujemy się z Twoim klientem. Brak wzmianek o Syntance. Naruszenie — kara umowna.',
  },
  {
    name: 'PageSpeed 96+',
    desc:
      'Gwarantowany wynik Lighthouse na mobile. Poniżej 90 — poprawiamy na nasz koszt.',
  },
  {
    name: 'SLA poniżej 4h',
    desc:
      'Czas pierwszej odpowiedzi. Naprawa krytyczna: poniżej 24h. Partnerzy — wyższy priorytet.',
  },
  {
    name: 'Terminy',
    desc:
      'Start: ok. 7 dni. Standard: 14–21 dni. Custom: harmonogram uzgodniony na piśmie.',
  },
  {
    name: 'Kod = Twój',
    desc: 'Pełna własność. Repozytorium u Ciebie od dnia 1.',
  },
  {
    name: '30 dni wsparcia',
    desc: 'Po starcie: poprawki i pytania w ramach projektu.',
  },
]

const faqItems = [
  {
    q: 'Mam freelancera na WP, po co mi to?',
    a:
      'Twój freelancer często kończy na niskim wyniku w PageSpeed. Z nami w modelu WL: kupujesz np. od 2,9 tys., sprzedajesz np. za 8 tys. — zostaje Ci marża w tysiącach złotych przy wyższej jakości dostarczenia.',
  },
  {
    q: 'Za drogo — freelancer WP bierze 3 tys.',
    a:
      'Freelancer za 3 tys. to często słaba wydajność, bez porządnego CMS i bez gwarancji. W pakiecie partnerskim od 2 900 PLN masz m.in. PageSpeed 96+, CMS pod treści, SLA i NDA.',
  },
  {
    q: 'Klient nie zna headless, chce WP.',
    a:
      'Klient nie kupuje technologii — kupuje wynik. Panel treści jest prosty w obsłudze; dla klienta wygląda jak „normalna” strona do edycji.',
  },
  {
    q: 'A co jeśli klient chce zmiany?',
    a:
      'Treści edytuje sam w CMS. Zmiany w zakresie rozwoju obsługujemy w kanale partnerskim — SLA odpowiedzi poniżej 4 godzin.',
  },
  {
    q: 'Nie chcę NDA.',
    a:
      'NDA chroni Ciebie: gwarantuje, że nigdy nie skontaktujemy się z Twoim klientem i nie ujawnimy współpracy.',
  },
  {
    q: 'Jak wygląda komunikacja?',
    a:
      'Jeden kanał Slack lub Teams. Brief od Ciebie → my realizujemy → Ty akceptujesz.',
  },
]

export default function AgencjeMarketingoweClient() {
  const [heroVisible, setHeroVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className="min-h-screen w-full pb-28 md:pb-24"
      style={{ overflowX: 'clip' }}
    >
      <SubpageScrollbar sections={scrollbarSections} />

      <PartnerStickyBar
        heroId="hero-wl"
        hideSectionId="cta-koncowy"
        label="Wypełnij formularz"
      />

      {/* Hero */}
      <section
        id="hero-wl"
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 lg:px-12 pt-32 pb-24"
      >
        <div
          className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h1 className="mb-6 glow-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wide leading-tight">
            Dostarczamy strony{' '}
            <GradientText
              colors={['#06b6d4', '#3b82f6', '#8b5cf6', '#3b82f6', '#06b6d4']}
              animationSpeed={4}
              className="font-medium"
            >
              Next.js
            </GradientText>{' '}
            pod Twoją marką. PageSpeed 96+. NDA.
          </h1>
          <p className="text-lg md:text-xl font-light tracking-wide text-gray-400 mb-4 max-w-3xl mx-auto">
            Twoi klienci dostają stronę nowej generacji. Ty zarabiasz 40–60% marży. Nikt nie
            wie, że to my.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-10 text-xs md:text-sm text-gray-500">
            <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
              NDA od dnia 1
            </span>
            <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
              PageSpeed 96+ gwarantowany
            </span>
            <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
              SLA: odpowiedź poniżej 4h
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              type="button"
              onClick={scrollToPartnerForm}
              className="relative group inline-flex"
            >
              <div
                className="absolute -inset-1 rounded-full blur-md opacity-25 group-hover:opacity-40 transition-opacity animate-gradient -z-10"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #06b6d4, #3b82f6, #8b5cf6, #3b82f6, #06b6d4)',
                  backgroundSize: '300% 100%',
                }}
              />
              <span className="relative z-10 px-8 py-4 rounded-full bg-white text-gray-900 font-medium tracking-wide hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
                <ClipboardList className="w-5 h-5" aria-hidden />
                Wypełnij formularz partnerski
              </span>
            </button>
            <button
              type="button"
              onClick={() =>
                document.getElementById('cennik')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="px-8 py-4 rounded-full border border-gray-600 text-white font-medium tracking-wide hover:border-gray-400 hover:bg-white/5 transition-all inline-flex items-center gap-2"
            >
              Zobacz cennik WL
              <ArrowRight className="w-4 h-4" aria-hidden />
            </button>
          </div>
        </div>
        <div
          className={`absolute bottom-10 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-300 ${
            heroVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id="problem-agencje" className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-4 glow-text">
              Twoi klienci zasługują na lepsze strony.{' '}
              <span className="text-orange-300/90">Twoja marża — na lepszego partnera.</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Dlaczego klasyczny freelancer na WordPressie często hamuje agencję — w czterech
              scenariuszach, które słyszymy najczęściej.
            </p>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-6">
            {problemItems.map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 80}>
                <div className="flex gap-4 p-6 rounded-2xl bg-orange-500/5 border border-orange-500/20 h-full">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
                    <item.icon className="w-6 h-6 text-orange-300" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-2">{item.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Model WL */}
      <section
        id="model-wl"
        className="relative z-10 py-24 px-6 lg:px-12 bg-gradient-to-b from-transparent via-violet-950/20 to-transparent"
      >
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-4 glow-text">
              Ty sprzedajesz. My budujemy. <span className="text-violet-300">Klient nie wie.</span>
            </h2>
            <p className="text-lg text-gray-400">Trzy kroki — od briefu do marży.</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {modelSteps.map((step, i) => (
              <AnimatedSection key={step.n} delay={i * 100}>
                <div className="relative h-full p-8 rounded-2xl border border-white/10 bg-gray-900/50 backdrop-blur-sm">
                  <div className="text-4xl font-light text-violet-400/80 mb-4">{step.n}</div>
                  <h3 className="text-xl font-medium text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.text}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection>
            <div className="rounded-2xl border border-green-500/25 bg-green-500/5 p-8">
              <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" aria-hidden />
                Kluczowe zasady
              </h3>
              <ul className="space-y-3">
                {modelPrinciples.map((line) => (
                  <li key={line} className="flex gap-3 text-gray-300 text-sm">
                    <span className="text-green-400 mt-0.5">✓</span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Cennik */}
      <section id="cennik" className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-4 glow-text">
              Transparentne ceny.{' '}
              <span className="text-cyan-300/90">Twoja marża — Twoja sprawa.</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Orientacyjne widełki sprzedaży po stronie agencji — u Ciebie ustala się finalna
              oferta.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="p-4 font-medium text-white">Pakiet</th>
                    <th className="p-4 font-medium text-gray-300">Cena WL (Syntance)</th>
                    <th className="p-4 font-medium text-gray-300">Agencja sprzedaje za</th>
                    <th className="p-4 font-medium text-gray-300">Marża agencji</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingRows.map((row) => (
                    <tr key={row.name} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4 text-white font-medium">{row.name}</td>
                      <td className="p-4 text-gray-300">{row.wl}</td>
                      <td className="p-4 text-gray-300">{row.sell}</td>
                      <td className="p-4 text-cyan-300/90">{row.margin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-8 p-6 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-gray-400 space-y-2">
              <p>
                <strong className="text-gray-300">Warunki:</strong> brak minimalnego
                zobowiązania. Płatność per projekt. 50% zaliczki. Cena partnerska od 2. projektu
                (pierwszy = cena detaliczna jako test). NDA obowiązkowe.
              </p>
              <p>
                Pakiet Start to wejście w relację — naturalnie prowadzi do pakietów Standard i
                Custom przy większych wdrożeniach.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Proces */}
      <section id="proces-wl" className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-4 glow-text">
              Od pierwszego projektu do stałego partnerstwa
            </h2>
            <p className="text-gray-400">
              Czas po Twojej stronie: brief od klienta → przekazanie nam → akceptacja dostawy. Bez
              mikrozarządzania.
            </p>
          </AnimatedSection>
          <div className="relative pl-8 md:pl-10">
            <div
              className="absolute left-[7px] md:left-[11px] top-3 bottom-3 w-px bg-gradient-to-b from-violet-500 via-blue-500 to-emerald-500 opacity-40"
              aria-hidden
            />
            <div className="space-y-10">
              {processSteps.map((step, index) => (
                <AnimatedSection key={step.title} delay={index * 80}>
                  <div className="relative">
                    <div className="absolute -left-8 md:-left-10 top-1.5 w-3 h-3 rounded-full bg-violet-500 ring-2 ring-black" />
                    <p className="text-xs uppercase tracking-wider text-violet-300/90 mb-1">
                      {step.meta}
                    </p>
                    <h3 className="text-xl font-medium text-white mb-2">{step.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{step.text}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gwarancje */}
      <section
        id="gwarancje-wl"
        className="relative z-10 py-24 px-6 lg:px-12 bg-gradient-to-b from-transparent via-slate-900/40 to-transparent"
      >
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-4 glow-text">
              Zero ryzyka. <span className="text-emerald-300/90">Dla Ciebie i Twojego klienta.</span>
            </h2>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {guarantees.map((g, i) => (
              <AnimatedSection key={g.name} delay={i * 50}>
                <div className="h-full p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden />
                    <h3 className="font-medium text-white">{g.name}</h3>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{g.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq-wl" className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-4 glow-text">FAQ</h2>
            <p className="text-gray-400">Najczęstsze pytania od agencji</p>
          </AnimatedSection>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <AnimatedSection key={item.q} delay={i * 60}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <h3 className="text-white font-medium mb-2 flex gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" aria-hidden />
                    {item.q}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed pl-7">{item.a}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA końcowy */}
      <section
        id="cta-koncowy"
        className="relative z-10 py-28 px-6 lg:px-12 border-t border-white/10"
      >
        <AnimatedSection className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6 glow-text">
            Gotowy na strony, które Twoi klienci pokochają — pod Twoją marką?
          </h2>
          <p className="text-lg text-gray-400 mb-4">
            Wyślij zapytanie partnerskie — przedstawimy model, cennik i proces. Odezwiemy się,
            żeby umówić krótką rozmowę. Zero zobowiązań.
          </p>
          <p className="text-sm text-gray-500 mb-10">
            Wolisz DM?{' '}
            <a
              href={LINKEDIN_COMPANY}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-300 hover:text-violet-200 underline underline-offset-2 inline-flex items-center gap-1"
            >
              Napisz na LinkedIn
              <ExternalLink className="w-3.5 h-3.5" aria-hidden />
            </a>
          </p>

          <div
            id={FORM_SECTION_ID}
            className="mt-4 text-left rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8"
          >
            <h3 className="text-lg font-medium text-white mb-6 text-center md:text-left">
              Formularz partnerski
            </h3>
            <ContactForm
              idPrefix="agencje-wl"
              source="agencje-marketingowe"
              showFullRodo
            />
          </div>

          <p className="text-sm text-gray-500 italic max-w-xl mx-auto mt-10">
            Pierwszy projekt w cenie detalicznej — weryfikujesz jakość bez ryzyka. Od drugiego
            projektu — ceny partnerskie.
          </p>
          <p className="mt-10 text-xs text-gray-600 flex items-center justify-center gap-2">
            <FileLock className="w-3.5 h-3.5" aria-hidden />
            Strona partnerska — bez linków do cennika detalicznego. Rozmowa i pilotaż przed
            skalowaniem.
          </p>
        </AnimatedSection>
      </section>
    </div>
  )
}
