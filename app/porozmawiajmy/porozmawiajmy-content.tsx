'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, ArrowLeft, Check, Mail, Loader2 } from 'lucide-react'
import { trackEvent } from '@/lib/tracking'

/* ----------------------------------------------------------------------
 * Treść 1:1 z Notion /porozmawiajmy (BOFU, lead form, audyt offline).
 * --------------------------------------------------------------------*/

type Differ = {
  number: number
  title: string
  bad: string
  good: string
  why: string
}

const DIFFERENCES: ReadonlyArray<Differ> = [
  {
    number: 1,
    title: 'Nagłówek',
    bad: '„Jesteśmy zespołem profesjonalistów z 10-letnim doświadczeniem…”',
    good: '„Klinika stomatologiczna w Warszawie. Rezerwacja online w 30 sekund.” (nazywa problem konkretnego klienta)',
    why: 'Klient szuka swojego problemu, nie Twoich kompetencji. Nagłówek o sobie = strona dla nikogo.',
  },
  {
    number: 2,
    title: 'CTA',
    bad: '5 równorzędnych przycisków na ekranie + „Kontakt” gdzieś w prawym górnym rogu',
    good: 'Jeden dominujący CTA z konkretem: „Wyceń projekt w 24h” lub „Umów bezpłatną konsultację”',
    why: 'Wybór = paraliż = exit. Klient potrzebuje jednej oczywistej następnej akcji, nie menu opcji.',
  },
  {
    number: 3,
    title: 'Prędkość',
    bad: 'WordPress + Elementor + 15 wtyczek → 3–5 s ładowania na mobile, PageSpeed 31/100',
    good: 'Next.js + SSG/SSR + zero śmieciowych scriptów → < 1 s ładowania na mobile, PageSpeed 96/100',
    why: 'Każda sekunda powyżej 1 s = –17% konwersji. Reklamy w Google płacisz drożej (niski Quality Score). Klient wychodzi zanim zobaczy ofertę.',
  },
  {
    number: 4,
    title: 'Dowody',
    bad: '„Jesteśmy najlepsi”, „Nasz zespół to pasjonaci”, zero liczb, zero opinii, zero case study',
    good: 'Case study z konkretem: „80 → 240 leadów/mc w 3 miesiące”. Opinie z imieniem i firmą. Loga klientów. Zrzuty dashboardów.',
    why: 'Klient nie zaryzykuje 50k PLN dla firmy, która mówi tylko o sobie. Trust to pierwsza bariera — żadne „jesteśmy najlepsi” jej nie pokona.',
  },
  {
    number: 5,
    title: 'Lejek',
    bad: 'Blog → czytelnik → wyjście. Strona = kolekcja sekcji bez ścieżki.',
    good: 'Blog → kontekstowy CTA do oferty → CTA do formularza. Każda podstrona ma jasny następny krok. Strona = lejek.',
    why: 'Jeśli ruch jest, a sprzedaży nie ma — problem jest w lejku, nie w ruchu. Marketing wydaje budżet, sprzedaż pyta „gdzie leady?”.',
  },
]

type Industry =
  | 'klinika'
  | 'd2c_meble'
  | 'deweloper'
  | 'fashion_beauty'
  | 'subskrypcje_saas'
  | 'b2b'
  | 'inne'

type Goal =
  | 'leady_b2b'
  | 'ecommerce'
  | 'wizerunek'
  | 'redesign'
  | 'porozmawiac'

type Budget = '<10' | '10-30' | '30-60' | '60+' | 'niewiem'
type Timeline = '1m' | '1-3m' | '3-6m' | 'bez'
type HasWebsite = 'dziala' | 'do_wymiany'

type FormState = {
  hasWebsite: HasWebsite | ''
  websiteUrl: string
  industry: Industry | ''
  goal: Goal | ''
  pain: string
  fullName: string
  email: string
  budget: Budget | ''
  timeline: Timeline | ''
  phone: string
  rodo: boolean
  hp: string
}

const INDUSTRIES: { value: Industry; label: string }[] = [
  { value: 'klinika', label: 'Klinika / lekarz' },
  { value: 'd2c_meble', label: 'Producent mebli D2C' },
  { value: 'deweloper', label: 'Deweloper mieszkaniowy' },
  { value: 'fashion_beauty', label: 'Fashion & Beauty' },
  { value: 'subskrypcje_saas', label: 'Subskrypcje / SaaS' },
  { value: 'b2b', label: 'B2B usługi' },
  { value: 'inne', label: 'Inne' },
]

const GOALS: { value: Goal; label: string }[] = [
  { value: 'leady_b2b', label: 'Generować leady B2B (formularze, telefon)' },
  { value: 'ecommerce', label: 'Sprzedawać produkty online (e-commerce)' },
  { value: 'wizerunek', label: 'Budować wizerunek / wiarygodność marki' },
  { value: 'redesign', label: 'Wymienić starą stronę na lepszą' },
  { value: 'porozmawiac', label: 'Jeszcze nie wiem, chcę porozmawiać' },
]

const BUDGETS: { value: Budget; label: string }[] = [
  { value: '<10', label: '< 10k PLN' },
  { value: '10-30', label: '10–30k PLN' },
  { value: '30-60', label: '30–60k PLN' },
  { value: '60+', label: '60k+ PLN' },
  { value: 'niewiem', label: 'Nie wiem jeszcze' },
]

const TIMELINES: { value: Timeline; label: string }[] = [
  { value: '1m', label: 'Do 1 mc' },
  { value: '1-3m', label: '1–3 mc' },
  { value: '3-6m', label: '3–6 mc' },
  { value: 'bez', label: 'Bez deadline' },
]

const GENERIC_EMAIL_DOMAINS = [
  'gmail.com',
  'wp.pl',
  'onet.pl',
  'interia.pl',
  'o2.pl',
  'icloud.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
]

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Czy moje dane są bezpieczne?',
    a: 'Tak. URL strony i odpowiedzi formularza widzi tylko Kamil. Nie przekazujemy ich nikomu, nie ma retargetingu, nie ma „marketingu przyzwyczajającego do reklam”. RODO + polityka prywatności linkowane w formularzu.',
  },
  {
    q: 'Co jeśli raport mi się nie spodoba?',
    a: 'Trudno. To darmowy raport. Powiedz mi czemu (jedno zdanie maila wystarczy) — przyda się jako feedback. Zero roszczeń, zero zobowiązań.',
  },
  {
    q: 'Ile to zajmuje mojego czasu?',
    a: 'Formularz: 3 minuty. Raport: 15 minut na PDF + 10 minut na Loom = łącznie do 30 minut, rozłożone na 3 dni.',
  },
  {
    q: 'Czy muszę kupić Wasz projekt po raporcie?',
    a: 'Nie. Raport jest Twój, możesz go pokazać dowolnemu wykonawcy. Połowa klientów wraca po 2–6 miesiącach, część idzie własną drogą — obie opcje są OK.',
  },
  {
    q: 'Mam stronę na WordPressie. Polecicie ją wyrzucić?',
    a: 'Niekoniecznie. Czasem 3 quick-winy poprawiają konwersję bardziej niż pełny redesign. Audyt mówi co najpierw, nie „kupcie nową stronę”.',
  },
  {
    q: 'Robię reklamy Google / Meta — pomoże to performance?',
    a: 'Tak. Quality Score w Google zależy m.in. od PageSpeed i UX landing page. Optymalizacja często obniża CPL o 20–40% bez zmiany budżetu reklamowego.',
  },
]

const TIMELINE_STEPS = [
  {
    when: '0 min',
    title: 'Email potwierdzający',
    desc: 'Info, że zgłoszenie dotarło + data raportu.',
  },
  {
    when: '1–3 dni robocze',
    title: 'Audyt offline (Tier 1) lub automat (Tier 2)',
    desc: 'Analizuję Twoją stronę w układzie 5 różnic, branżę, konkurencję.',
  },
  {
    when: 'Dzień 3 max',
    title: 'Raport w skrzynce',
    desc: 'PDF + Loom (Tier 1) lub PDF (Tier 2). Bez logowania, bez kalendarza.',
  },
  {
    when: 'Dzień 5',
    title: 'Follow-up #1 (tylko Tier 1)',
    desc: 'Krótki mail: „Co o tym myślisz?” Jedno zdanie, opt-out wyraźny.',
  },
  {
    when: 'Dzień 14',
    title: 'Follow-up #2 (tylko Tier 1)',
    desc: 'Ostatni: „Nadal chcesz pogadać? Jeśli nie — koniec ciszy.” Po tym mailu brak dalszego kontaktu.',
  },
  {
    when: 'Twoja decyzja',
    title: '30 min rozmowy z konkretnym scope i ceną',
    desc: 'Ty inicjujesz.',
  },
]

function isValidUrl(value: string): boolean {
  if (!value) return false
  try {
    const normalized = value.startsWith('http') ? value : `https://${value}`
    const u = new URL(normalized)
    return Boolean(u.hostname && u.hostname.includes('.'))
  } catch {
    return false
  }
}

function isGenericEmail(email: string): boolean {
  const at = email.indexOf('@')
  if (at === -1) return false
  return GENERIC_EMAIL_DOMAINS.includes(email.slice(at + 1).toLowerCase())
}

export default function PorozmawiajmyContent() {
  const searchParams = useSearchParams()

  const utm = useMemo(() => {
    return {
      utm_source: searchParams?.get('utm_source') ?? undefined,
      utm_medium: searchParams?.get('utm_medium') ?? undefined,
      utm_campaign: searchParams?.get('utm_campaign') ?? undefined,
    }
  }, [searchParams])

  /* --------------------- PostHog: view + section observer ---------------- */

  const viewTrackedRef = useRef(false)
  useEffect(() => {
    if (viewTrackedRef.current) return
    viewTrackedRef.current = true
    trackEvent('lead_landing_view', {
      ...utm,
      device:
        typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent)
          ? 'mobile'
          : 'desktop',
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    })
  }, [utm])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-section]'),
    )
    if (sections.length === 0) return
    const seen = new Set<string>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const name = e.target.getAttribute('data-section')
          if (!name || seen.has(name)) continue
          if (e.isIntersecting) {
            seen.add(name)
            trackEvent('lead_section_viewed', { section_name: name })
          }
        }
      },
      { threshold: 0.4 },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  const handleCtaClick = useCallback(
    (position: 'hero' | 'post-5-roznic' | 'post-jak' | 'post-raport') => {
      trackEvent('lead_cta_clicked', { position })
      const el = document.getElementById('formularz')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    [],
  )

  /* --------------------- Form state -------------------------------------- */

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState<FormState>({
    hasWebsite: '',
    websiteUrl: '',
    industry: '',
    goal: '',
    pain: '',
    fullName: '',
    email: '',
    budget: '',
    timeline: '',
    phone: '',
    rodo: false,
    hp: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const formStartedRef = useRef(false)

  const update = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((s) => ({ ...s, [key]: value }))
      setErrors((e) => ({ ...e, [key]: undefined }))
      if (!formStartedRef.current) {
        formStartedRef.current = true
        trackEvent('lead_form_started')
      }
    },
    [],
  )

  const validateStep1 = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.hasWebsite) e.hasWebsite = 'Wybierz opcję.'
    if (!isValidUrl(form.websiteUrl)) e.websiteUrl = 'Podaj poprawny URL strony.'
    if (!form.industry) e.industry = 'Wybierz branżę.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep2 = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.goal) e.goal = 'Wybierz cel.'
    if (form.pain.length > 500) e.pain = 'Maks. 500 znaków.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep3 = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (form.fullName.trim().length < 2) e.fullName = 'Podaj imię i nazwisko.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      e.email = 'Podaj poprawny email.'
    if (!form.budget) e.budget = 'Wybierz przedział budżetu.'
    if (!form.timeline) e.timeline = 'Wybierz horyzont czasowy.'
    if (!form.rodo) e.rodo = 'Wymagana zgoda na przetwarzanie danych.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const goNext = () => {
    if (step === 1) {
      if (!validateStep1()) return
      trackEvent('lead_form_step_completed', { step: 1 })
      setStep(2)
    } else if (step === 2) {
      if (!validateStep2()) return
      trackEvent('lead_form_step_completed', { step: 2 })
      setStep(3)
    }
    if (typeof window !== 'undefined') {
      const el = document.getElementById('formularz')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const goBack = () => {
    if (step === 2) setStep(1)
    if (step === 3) setStep(2)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateStep3()) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/audyt-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          utm,
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? 'Coś poszło nie tak. Spróbuj ponownie.')
      }
      trackEvent('lead_form_step_completed', { step: 3 })
      trackEvent('lead_form_submitted', {
        budget_range: form.budget,
        timeline: form.timeline,
        industry: form.industry,
        has_website: form.hasWebsite,
        goal: form.goal,
      })
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Błąd wysyłki.')
    } finally {
      setSubmitting(false)
    }
  }

  /* --------------------- Render ------------------------------------------ */

  return (
    <div className="min-h-screen w-full bg-black text-[#F5F3FF]" style={{ overflowX: 'clip' }}>
      <header className="px-6 pt-10 md:px-10">
        <div className="mx-auto max-w-[880px]">
          <Link
            href="/"
            className="text-sm font-medium tracking-wider text-gray-400 transition-colors hover:text-white"
          >
            Syntance
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-6 pt-10 pb-24 md:px-10 md:pt-16">
        {/* 1. HERO */}
        <section data-section="hero" className="mb-20">
          <h1 className="mb-6 text-[clamp(2rem,5vw,3rem)] font-light leading-[1.1] tracking-tight text-white">
            5 różnic między stroną, która{' '}
            <span className="font-medium text-white">sprzedaje</span>, a tą,
            która tylko <span className="text-purple-400">ładnie wygląda</span>.
          </h1>
          <p className="mb-6 text-[17px] leading-relaxed text-gray-300 md:text-lg">
            <strong className="font-medium text-white">
              Dla firm, które już mają stronę i nie wiedzą, czemu nie sprzedaje.
            </strong>{' '}
            Wypełnij formularz — w 3 dni dostaniesz raport, w którym obszarze
            Twoja strona jest po lewej, a w którym po prawej, plus co
            konkretnie zmienić. PDF + 10-min Loom (Tier 1) lub PDF (Tier 2).
            Zero sales calli na zimno.
          </p>
          <p className="mb-8 text-sm italic text-gray-400">
            „Średni PageSpeed naszych stron: 96/100. Case study Syntance:
            RetroHouse — 80 → 240 leadów/mc.”
          </p>
          <button
            type="button"
            onClick={() => handleCtaClick('hero')}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-4 font-medium tracking-wider text-white shadow-lg transition-all hover:shadow-purple-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Zamów darmowy audyt swojej strony <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-4 text-xs text-gray-500">
            3 min wypełniania. Raport mailem w 3 dni. Zero zobowiązań.
          </p>
        </section>
      </main>

      {/* 2. 5 RÓŻNIC — szersza sekcja (880 px) */}
      <section data-section="5-roznic" className="px-6 md:px-10">
        <div className="mx-auto max-w-[880px]">
          <header className="mb-10">
            <h2 className="mb-4 text-[clamp(1.6rem,4vw,2rem)] font-light leading-tight text-white">
              5 różnic, które decydują o sprzedaży
            </h2>
            <p className="text-[17px] leading-relaxed text-gray-300 md:text-lg">
              Przeprowadziłem dziesiątki audytów. 90% różnic w skuteczności
              sprowadza się do pięciu obszarów. W każdym z nich strona jest
              albo po lewej, albo po prawej.
            </p>
          </header>

          <div className="space-y-12">
            {DIFFERENCES.map((d) => (
              <DifferenceBlock key={d.number} d={d} />
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.04] p-6 text-center">
            <p className="mb-4 text-[17px] italic text-yellow-100/90 md:text-lg">
              W których z tych 5 obszarów Twoja strona jest po lewej?
              Sprawdźmy konkretnie.
            </p>
            <button
              type="button"
              onClick={() => handleCtaClick('post-5-roznic')}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-4 font-medium tracking-wider text-white shadow-lg transition-all hover:shadow-purple-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Zamów darmowy audyt swojej strony <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[720px] px-6 md:px-10">
        {/* 3. JAK TO ROBIMY W SYNTANCE */}
        <section data-section="jak" className="mt-24 mb-20">
          <h2 className="mb-8 text-[clamp(1.6rem,4vw,2rem)] font-light leading-tight text-white">
            Jak to robimy w Syntance
          </h2>
          <ol className="space-y-6">
            <li className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <h3 className="mb-2 text-base font-medium text-white">
                <span className="mr-2 text-purple-400">1.</span> Strategia
                przed kodem.
              </h3>
              <p className="text-[15px] leading-relaxed text-gray-300">
                Buyer persona, buyer journey, lejek. Wiemy{' '}
                <em className="text-white">kto</em> kupuje,{' '}
                <em className="text-white">kiedy</em> i{' '}
                <em className="text-white">dlaczego</em>. Nagłówek (Różnica 1) i
                lejek (Różnica 5) wychodzą ze strategii, nie z „ładnie było”.
              </p>
            </li>
            <li className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <h3 className="mb-2 text-base font-medium text-white">
                <span className="mr-2 text-purple-400">2.</span> Next.js +
                MedusaJS.
              </h3>
              <p className="text-[15px] leading-relaxed text-gray-300">
                Nasz domyślny stack. PageSpeed 96/100 (Różnica 3). Zero wtyczek
                = zero podatności. Twój kod w Twoim repo — zero vendor lock-in.
              </p>
            </li>
            <li className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <h3 className="mb-2 text-base font-medium text-white">
                <span className="mr-2 text-purple-400">3.</span> Tempo AI,
                jakość seniora.
              </h3>
              <p className="text-[15px] leading-relaxed text-gray-300">
                Strona w <strong className="text-white">4 tygodnie</strong>,
                sklep w <strong className="text-white">8 tygodni</strong> od
                strategii do launch. Software house robi to w 3–6 miesięcy za
                3× więcej. AI pisze kod według naszej architektury, ja
                kontroluję jakość.
              </p>
            </li>
          </ol>
        </section>

        {/* 4. CO DOSTANIESZ */}
        <section data-section="raport" className="mb-20">
          <h2 className="mb-8 text-[clamp(1.6rem,4vw,2rem)] font-light leading-tight text-white">
            Co dostajesz w 3 dni robocze{' '}
            <span className="text-gray-400">(tier zależy od profilu)</span>
          </h2>

          <div className="space-y-6">
            <article className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-6">
              <header className="mb-4">
                <h3 className="text-lg font-medium text-white">
                  Tier 1 — Pełny audyt
                </h3>
                <p className="text-sm italic text-gray-400">
                  (budżet projektu 30k+ PLN, fit z profilem klienta)
                </p>
              </header>
              <ul className="space-y-2">
                <Bullet>
                  <strong className="text-white">
                    Twoja strona w układzie 5 różnic
                  </strong>{' '}
                  — gdzie jesteś po lewej, gdzie po prawej, ze screenshotami i
                  konkretnymi przykładami
                </Bullet>
                <Bullet>
                  <strong className="text-white">Twarde liczby</strong> —
                  PageSpeed Mobile/Desktop, Core Web Vitals, błędy techniczne SEO
                </Bullet>
                <Bullet>
                  <strong className="text-white">
                    5–10 konkretnych rekomendacji
                  </strong>{' '}
                  — od quick-wins (zrobisz dzisiaj) do większych projektów
                </Bullet>
                <Bullet>
                  <strong className="text-white">
                    Wstępna wycena projektu
                  </strong>{' '}
                  — orientacyjne widełki cen i czas realizacji
                </Bullet>
                <Bullet>
                  <strong className="text-white">Loom video 10 min</strong> —
                  osobiście przejdę przez raport głosowo
                </Bullet>
              </ul>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <header className="mb-4">
                <h3 className="text-lg font-medium text-white">
                  Tier 2 — Mini-audyt automatyczny
                </h3>
                <p className="text-sm italic text-gray-400">
                  (budżet &lt; 30k PLN lub spoza profilu)
                </p>
              </header>
              <ul className="space-y-2">
                <Bullet>
                  <strong className="text-white">
                    PageSpeed + Core Web Vitals snapshot
                  </strong>{' '}
                  — wygenerowane automatycznie
                </Bullet>
                <Bullet>
                  <strong className="text-white">
                    3 quick-winy z szablonu
                  </strong>{' '}
                  — typowe błędy w Twojej branży
                </Bullet>
                <Bullet>
                  <strong className="text-white">
                    Rekomendacja kierunku
                  </strong>{' '}
                  — czy potrzebujesz redesignu, optymalizacji, czy wystarczy
                  no-code / freelancer (polecimy zaufanych)
                </Bullet>
              </ul>
            </article>
          </div>

          <p className="mt-6 text-[15px] leading-relaxed text-gray-300">
            <strong className="text-white">Co dalej:</strong> Po raporcie
            Tier 1 — możemy umówić 30 min na rozmowę z konkretną wyceną.{' '}
            <strong className="text-white">
              Ty inicjujesz; my wysyłamy maks 2 krótkie follow-upy (dzień 5 i
              dzień 14), potem cisza.
            </strong>{' '}
            Po raporcie Tier 2 — zostajesz z gotowym planem i zero zobowiązań.
          </p>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => handleCtaClick('post-raport')}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-4 font-medium tracking-wider text-white shadow-lg transition-all hover:shadow-purple-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Zamów darmowy audyt swojej strony{' '}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* 5. DLA KOGO / DLA KOGO NIE */}
        <section data-section="dla-kogo" className="mb-20">
          <h2 className="mb-8 text-[clamp(1.6rem,4vw,2rem)] font-light leading-tight text-white">
            Dla kogo ten audyt (i dla kogo nie)
          </h2>

          <article className="mb-6 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h3 className="mb-3 text-base font-medium text-white">
              Pełny audyt (Tier 1) ma sens, jeśli:
            </h3>
            <ul className="space-y-2">
              <Bullet>
                Masz istniejącą stronę B2B / D2C i widzisz, że ruch jest, a
                konwersji nie ma
              </Bullet>
              <Bullet>
                Budżet projektu od <strong className="text-white">30k PLN</strong>{' '}
                w górę (mniejsze = Tier 2 mini-audyt)
              </Bullet>
              <Bullet>
                Decyzja o przebudowie / nowej stronie w horyzoncie{' '}
                <strong className="text-white">1–6 miesięcy</strong>
              </Bullet>
              <Bullet>
                Branża: kliniki, producenci D2C, deweloperzy, B2B usługi,
                fashion, SaaS, subskrypcje
              </Bullet>
            </ul>
          </article>

          <article className="mb-6 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h3 className="mb-3 text-base font-medium text-white">
              To nie jest dla Ciebie, jeśli:
            </h3>
            <ul className="space-y-2">
              <Bullet variant="muted">
                Szukasz strony za &lt; 10k PLN — polecimy sprawdzonego
                freelancera lub no-code (Webflow, Framer)
              </Bullet>
              <Bullet variant="muted">
                Potrzebujesz tylko poprawić jeden bug techniczny — wystarczy
                konsultacja godzinowa, nie audyt
              </Bullet>
              <Bullet variant="muted">
                Robisz hobby / projekt poboczny bez P&amp;L
              </Bullet>
              <Bullet variant="muted">
                Twoja branża to gambling, crypto bez fundamentów, MLM lub
                szeroko pojęte „get rich quick” — nie pracujemy z tymi
                segmentami
              </Bullet>
            </ul>
          </article>

          <p className="text-[15px] leading-relaxed text-gray-400">
            <strong className="text-white">Dlaczego mówimy „nie”:</strong>{' '}
            raport Tier 1 to 2–4h Kamila. Lepiej zrobić 5 raportów rocznie,
            które kończą się projektem, niż 50 raportów, które rozmywają czas.
            Jasna dyskwalifikacja na wejściu = oszczędność po obu stronach.
          </p>
        </section>

        {/* 6. FORMULARZ */}
        <section
          data-section="form"
          id="formularz"
          className="mb-20 scroll-mt-24"
        >
          <h2 className="mb-2 text-[clamp(1.6rem,4vw,2rem)] font-light leading-tight text-white">
            Zamów darmowy audyt
          </h2>
          <p className="mb-6 text-sm text-gray-400">
            3 kroki, ok. 3 minuty.
          </p>

          {submitted ? (
            <SubmittedCard email={form.email} />
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:p-8"
              noValidate
            >
              <ProgressBar step={step} />

              {step === 1 && (
                <fieldset className="space-y-6">
                  <legend className="mb-2 text-base font-medium text-white">
                    Krok 1: Twoja sytuacja
                  </legend>

                  <Field
                    label="Masz już stronę?"
                    error={errors.hasWebsite}
                    htmlFor="hasWebsite"
                  >
                    <RadioGroup
                      name="hasWebsite"
                      value={form.hasWebsite}
                      onChange={(v) => update('hasWebsite', v as HasWebsite)}
                      options={[
                        { value: 'dziala', label: 'Tak, działa' },
                        {
                          value: 'do_wymiany',
                          label: 'Tak, ale chcę nowej',
                        },
                      ]}
                    />
                  </Field>

                  <Field
                    label="URL strony"
                    error={errors.websiteUrl}
                    htmlFor="websiteUrl"
                    required
                    hint="Ten landing jest dla firm z istniejącą stroną. Klienci „od zera” mają osobny lejek na /strony-www."
                  >
                    <input
                      id="websiteUrl"
                      type="text"
                      inputMode="url"
                      autoComplete="url"
                      placeholder="np. twoja-firma.pl"
                      value={form.websiteUrl}
                      onChange={(e) => update('websiteUrl', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-[15px] text-white placeholder-gray-500 outline-none transition focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20"
                    />
                  </Field>

                  <Field
                    label="Branża"
                    error={errors.industry}
                    htmlFor="industry"
                    required
                  >
                    <select
                      id="industry"
                      value={form.industry}
                      onChange={(e) =>
                        update('industry', e.target.value as Industry)
                      }
                      className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-[15px] text-white outline-none transition focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20"
                    >
                      <option value="">— wybierz —</option>
                      {INDUSTRIES.map((it) => (
                        <option key={it.value} value={it.value}>
                          {it.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </fieldset>
              )}

              {step === 2 && (
                <fieldset className="space-y-6">
                  <legend className="mb-2 text-base font-medium text-white">
                    Krok 2: Cel biznesowy
                  </legend>

                  <Field
                    label="Co chcesz osiągnąć?"
                    error={errors.goal}
                    htmlFor="goal"
                    required
                  >
                    <RadioGroup
                      name="goal"
                      value={form.goal}
                      onChange={(v) => update('goal', v as Goal)}
                      options={GOALS}
                      columns={1}
                    />
                  </Field>

                  <Field
                    label="Największy ból ze stroną dzisiaj? (opcjonalnie, max 500 znaków)"
                    error={errors.pain}
                    htmlFor="pain"
                  >
                    <textarea
                      id="pain"
                      maxLength={500}
                      rows={4}
                      value={form.pain}
                      onChange={(e) => update('pain', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-[15px] text-white placeholder-gray-500 outline-none transition focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20"
                      placeholder="np. „dużo wejść z reklam, mało telefonów”"
                    />
                    <div className="mt-1 text-right text-xs text-gray-500">
                      {form.pain.length}/500
                    </div>
                  </Field>
                </fieldset>
              )}

              {step === 3 && (
                <fieldset className="space-y-6">
                  <legend className="mb-2 text-base font-medium text-white">
                    Krok 3: Praktyczne
                  </legend>

                  <Field
                    label="Imię i nazwisko"
                    error={errors.fullName}
                    htmlFor="fullName"
                    required
                  >
                    <input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      value={form.fullName}
                      onChange={(e) => update('fullName', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-[15px] text-white outline-none transition focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20"
                    />
                  </Field>

                  <Field
                    label="Email"
                    error={errors.email}
                    htmlFor="email"
                    required
                    hint={
                      form.email && isGenericEmail(form.email)
                        ? 'Używamy też emaila firmowego — jeśli go masz, daj go zamiast prywatnego (lepsze dopasowanie).'
                        : undefined
                    }
                  >
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-[15px] text-white outline-none transition focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20"
                    />
                  </Field>

                  <Field
                    label="Budżet projektu"
                    error={errors.budget}
                    htmlFor="budget"
                    required
                  >
                    <RadioGroup
                      name="budget"
                      value={form.budget}
                      onChange={(v) => update('budget', v as Budget)}
                      options={BUDGETS}
                    />
                  </Field>

                  <Field
                    label="Kiedy chcesz wystartować?"
                    error={errors.timeline}
                    htmlFor="timeline"
                    required
                  >
                    <RadioGroup
                      name="timeline"
                      value={form.timeline}
                      onChange={(v) => update('timeline', v as Timeline)}
                      options={TIMELINES}
                    />
                  </Field>

                  <Field
                    label="Telefon (opcjonalnie)"
                    error={errors.phone}
                    htmlFor="phone"
                  >
                    <input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-[15px] text-white outline-none transition focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20"
                    />
                  </Field>

                  <label className="flex cursor-pointer items-start gap-3 text-[14px] leading-relaxed text-gray-300">
                    <input
                      type="checkbox"
                      checked={form.rodo}
                      onChange={(e) => update('rodo', e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-black/40 text-purple-500 focus:ring-2 focus:ring-purple-400/40"
                    />
                    <span>
                      Wyrażam zgodę na przetwarzanie moich danych zgodnie z{' '}
                      <Link
                        href="/polityka-prywatnosci"
                        className="underline underline-offset-4 hover:text-white"
                        target="_blank"
                      >
                        polityką prywatności
                      </Link>{' '}
                      Syntance, w celu przygotowania i wysyłki raportu.{' '}
                      <span className="text-red-300">*</span>
                    </span>
                  </label>
                  {errors.rodo && (
                    <p className="text-sm text-red-300">{errors.rodo}</p>
                  )}

                  {/* honeypot */}
                  <input
                    type="text"
                    name="hp"
                    value={form.hp}
                    onChange={(e) => setForm((s) => ({ ...s, hp: e.target.value }))}
                    tabIndex={-1}
                    autoComplete="off"
                    className="absolute left-[-9999px] h-0 w-0 opacity-0"
                    aria-hidden="true"
                  />
                </fieldset>
              )}

              {submitError && (
                <p
                  role="alert"
                  className="mt-6 rounded-lg border border-red-400/30 bg-red-400/[0.05] p-3 text-sm text-red-200"
                >
                  {submitError}
                </p>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm text-gray-200 transition hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
                  >
                    <ArrowLeft className="h-4 w-4" /> Wstecz
                  </button>
                ) : (
                  <span />
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-3 font-medium tracking-wider text-white shadow-lg transition-all hover:shadow-purple-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    Dalej <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-3 font-medium tracking-wider text-white shadow-lg transition-all hover:shadow-purple-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Wysyłam…
                      </>
                    ) : (
                      <>
                        Wyślij i odbierz raport <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>

              <p className="mt-4 text-xs text-gray-500">
                Bez spamu. Email tylko z raportem i ewentualną propozycją.
              </p>
            </form>
          )}
        </section>

        {/* 7. CO DALEJ - TIMELINE */}
        <section data-section="dalej" className="mb-20">
          <h2 className="mb-8 text-[clamp(1.6rem,4vw,2rem)] font-light leading-tight text-white">
            Co dalej — timeline
          </h2>
          <ol className="space-y-4">
            {TIMELINE_STEPS.map((s, i) => (
              <li
                key={i}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-5"
              >
                <div className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-purple-300">
                  {s.when}
                </div>
                <div className="text-base font-medium text-white">
                  {s.title}
                </div>
                <p className="mt-1 text-[15px] leading-relaxed text-gray-300">
                  {s.desc}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* 8. SOCIAL PROOF */}
        <section data-section="proof" className="mb-20">
          <p className="text-sm text-gray-500">
            Wybrane projekty Syntance:{' '}
            <span className="text-gray-300">RetroHouse</span>,{' '}
            <span className="text-gray-300">Lumine</span>,{' '}
            <span className="text-gray-300">OZE Asystent</span>.
          </p>
        </section>

        {/* 9. FAQ */}
        <section data-section="faq" className="mb-20">
          <h2 className="mb-8 text-[clamp(1.6rem,4vw,2rem)] font-light leading-tight text-white">
            FAQ — częste pytania
          </h2>
          <div className="divide-y divide-white/5 rounded-2xl border border-white/5 bg-white/[0.02]">
            {FAQ.map((item, i) => (
              <details key={i} className="group p-5 open:bg-white/[0.02]">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[15px] font-medium text-white">
                  <span>{item.q}</span>
                  <span className="mt-1 select-none text-gray-500 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-gray-300">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Email fallback */}
        <section className="mb-16 text-center">
          <a
            href="mailto:kamil@syntance.com?subject=Audyt%20strony%20-%20pytanie"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-gray-400 underline underline-offset-4 transition-colors hover:text-white"
          >
            <Mail className="h-4 w-4" />
            Wolisz napisać? kamil@syntance.com
          </a>
        </section>
      </div>

      {/* 10. FOOTER (minimalny) */}
      <footer className="border-t border-white/5 px-6 py-8 md:px-10">
        <div className="mx-auto flex max-w-[720px] flex-col items-start justify-between gap-4 text-sm text-gray-500 md:flex-row md:items-center">
          <div>
            <span className="font-medium text-gray-300">Syntance</span>
            <span className="ml-2">— strategia, strony, sklepy</span>
          </div>
          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()}</span>
            <Link
              href="/polityka-prywatnosci"
              className="transition-colors hover:text-gray-300"
            >
              Polityka prywatności
            </Link>
            <a
              href="mailto:kamil@syntance.com"
              className="transition-colors hover:text-gray-300"
            >
              kamil@syntance.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ----------------------------- Sub-components ---------------------------- */

function DifferenceBlock({ d }: { d: Differ }) {
  const dwellRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = dwellRef.current
    if (!el) return
    let start: number | null = null
    let fired = false
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            if (start === null) start = Date.now()
          } else if (start !== null) {
            const elapsed = Date.now() - start
            if (!fired && elapsed > 10_000) {
              fired = true
              trackEvent('lead_difference_dwell', {
                difference_number: d.number,
                time_spent: Math.round(elapsed / 1000),
              })
            }
            start = null
          }
        }
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [d.number])

  return (
    <div
      ref={dwellRef}
      className="border-b border-white/5 pb-12 last:border-b-0 last:pb-0"
    >
      <header className="mb-5 flex items-baseline gap-4">
        <span className="text-4xl font-bold leading-none text-purple-400 md:text-5xl">
          {d.number}
        </span>
        <h3 className="text-xl font-medium text-white md:text-2xl">
          {d.title}
        </h3>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* MOBILE-FIRST: w mobile ✅ jest pierwsza (wg briefu),
            na desktop ❌ z lewej, ✅ z prawej (md:order-*) */}
        <div className="order-2 rounded-2xl border border-red-400/15 bg-red-400/[0.04] p-5 md:order-1">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-red-300/80">
              Tylko ładnie wygląda
            </span>
            <span aria-hidden="true" className="text-red-300/80">
              ❌
            </span>
          </div>
          <p className="text-[15px] leading-relaxed text-gray-200">{d.bad}</p>
        </div>

        <div className="order-1 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-5 md:order-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300/80">
              Sprzedaje
            </span>
            <span aria-hidden="true" className="text-emerald-300/80">
              ✅
            </span>
          </div>
          <p className="text-[15px] leading-relaxed text-gray-100">{d.good}</p>
        </div>
      </div>

      <p className="mt-4 text-[15px] italic leading-relaxed text-gray-400">
        Dlaczego to ma znaczenie: {d.why}
      </p>
    </div>
  )
}

function Bullet({
  children,
  variant = 'default',
}: {
  children: ReactNode
  variant?: 'default' | 'muted'
}) {
  return (
    <li className="flex items-start gap-3 text-[15px] leading-relaxed">
      <Check
        className={`mt-1 h-4 w-4 flex-none ${
          variant === 'muted' ? 'text-gray-500' : 'text-emerald-400'
        }`}
      />
      <span className={variant === 'muted' ? 'text-gray-400' : 'text-gray-200'}>
        {children}
      </span>
    </li>
  )
}

function ProgressBar({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="mb-8" aria-live="polite">
      <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
        <span>Krok {step} z 3</span>
        <span>{Math.round((step / 3) * 100)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-medium text-gray-200"
      >
        {label}
        {required && <span className="ml-1 text-red-300">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-sm text-red-300" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function RadioGroup({
  name,
  value,
  onChange,
  options,
  columns = 2,
}: {
  name: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  columns?: 1 | 2
}) {
  return (
    <div
      className={`grid gap-2 ${
        columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-1'
      }`}
      role="radiogroup"
    >
      {options.map((opt) => {
        const id = `${name}-${opt.value}`
        const selected = value === opt.value
        return (
          <label
            key={opt.value}
            htmlFor={id}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-[15px] transition ${
              selected
                ? 'border-purple-400/50 bg-purple-400/[0.08] text-white'
                : 'border-white/10 bg-black/30 text-gray-200 hover:border-white/20'
            }`}
          >
            <input
              id={id}
              type="radio"
              name={name}
              value={opt.value}
              checked={selected}
              onChange={() => onChange(opt.value)}
              className="h-4 w-4 border-white/20 bg-black/40 text-purple-500 focus:ring-2 focus:ring-purple-400/40"
            />
            <span>{opt.label}</span>
          </label>
        )
      })}
    </div>
  )
}

function SubmittedCard({ email }: { email: string }) {
  return (
    <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.05] p-6 md:p-8">
      <h3 className="mb-2 text-xl font-medium text-white">
        Dzięki — zgłoszenie dotarło.
      </h3>
      <p className="mb-4 text-[15px] leading-relaxed text-gray-200">
        Email potwierdzający trafił na{' '}
        <strong className="text-white">{email}</strong>. Sprawdzam już Twoją
        stronę — raport (5 różnic + plan) wraca w ciągu{' '}
        <strong className="text-white">3 dni roboczych</strong>. Bez
        kalendarza, bez logowania.
      </p>
      <p className="text-sm text-gray-400">
        Gdyby coś nie dotarło — pisz wprost: kamil@syntance.com.
      </p>
    </div>
  )
}
