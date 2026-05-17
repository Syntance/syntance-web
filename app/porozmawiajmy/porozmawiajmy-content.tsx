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
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { trackEvent } from '@/lib/tracking'

/* Treść zsynchronizowana z Notion /porozmawiajmy (aktualna struktura: strategia + 3 obszary + FAQ + form osobno). */

const BEZ_STRATEGII_LINES = [
  'Nagłówek o sobie zamiast o kliencie.',
  'Pięć równorzędnych CTA zamiast jednej oczywistej akcji.',
  'Blog jako kolekcja artykułów, nie lejek do oferty.',
  'Stack dobrany „bo każdy ma WordPress”.',
  'Brak liczb, opinii, case studies.',
] as const

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Czy muszę wiedzieć, czego potrzebuję?',
    a: 'Nie. Audyt służy temu, żeby to zdefiniować.',
  },
  {
    q: 'Czy raport mnie do czegoś zobowiązuje?',
    a: 'Nie. Raport jest Twój — możesz pokazać go dowolnemu wykonawcy.',
  },
  {
    q: 'Ile zajmuje mojego czasu?',
    a: 'Formularz: 3 minuty. Raport: 15 min PDF + 10 min Loom.',
  },
  {
    q: 'Mam stronę na WordPressie. Polecicie ją wyrzucić?',
    a: 'Niekoniecznie. Czasem 3 quick-winy poprawiają konwersję bardziej niż pełny redesign.',
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

  const scrollToForm = () => {
    const el = document.getElementById('formularz')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleCtaClick = useCallback(
    (position: 'hero' | 'post-3-obszary' | 'post-audyt') => {
      trackEvent('lead_cta_clicked', { position })
      scrollToForm()
    },
    [],
  )

  const handleSubpageClick = (target: 'strony' | 'sklepy' | 'realizacje') => {
    trackEvent('lead_subpage_clicked', { target })
  }

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

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((s) => ({ ...s, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
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
      setStep(2)
    } else if (step === 2) {
      if (!validateStep2()) return
      setStep(3)
    }
    scrollToForm()
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
      trackEvent('lead_form_submitted', {
        budget_range: form.budget,
        timeline: form.timeline,
        industry: form.industry,
      })
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Błąd wysyłki.')
    } finally {
      setSubmitting(false)
    }
  }

  const ctaClass =
    'inline-flex min-h-[48px] items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-4 font-medium tracking-wider text-white shadow-lg transition-all hover:shadow-purple-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black'

  return (
    <div className="min-h-screen w-full bg-black text-[#F5F3FF]" style={{ overflowX: 'clip' }}>
      <main
        id="main-content"
        className="mx-auto max-w-[720px] px-6 pb-16 pt-10 md:px-10 md:pt-16"
      >
        {/* 1. Hero */}
        <section data-section="hero" className="mb-16 md:mb-20">
          <h1 className="mb-6 text-[clamp(2rem,5vw,3rem)] font-light leading-[1.15] tracking-tight text-white">
            Strategia to różnica między stroną, która sprzedaje, a tą, która
            tylko ładnie wygląda.
          </h1>
          <p className="mb-8 text-[17px] leading-relaxed text-gray-300 md:text-lg">
            90% stron w polskim internecie wygląda dobrze i nie sprzedaje. Powód
            jest jeden: powstały bez strategii.
          </p>
          <button type="button" onClick={() => handleCtaClick('hero')} className={ctaClass}>
            Zamów darmowy audyt swojej strony <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-4 text-sm text-gray-500">
            <em className="not-italic">3 minuty wypełniania. Raport w 3 dni. Zero sales calli.</em>
          </p>
        </section>

        {/* 2. Bez strategii */}
        <section data-section="bez-strategii" className="mb-16 md:mb-20">
          <h2 className="mb-6 text-[clamp(1.5rem,4vw,2rem)] font-light leading-tight text-white md:text-[2rem]">
            Strona bez strategii wygląda tak:
          </h2>
          <ul className="mb-8 list-none space-y-3 text-[17px] leading-relaxed text-gray-200 md:text-lg">
            {BEZ_STRATEGII_LINES.map((line, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-none select-none text-gray-500">—</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="text-[15px] leading-relaxed text-gray-400 md:text-[17px]">
            <strong className="font-medium text-gray-300">Efekt:</strong> ruch
            jest, leadów nie ma. Marketing pyta sprzedaży gdzie konwersje,
            sprzedaż pyta marketingu gdzie ruch.
          </p>
        </section>
      </main>

      {/* 3. Trzy obszary + repeat CTA (grid do 880px) */}
      <section data-section="3-obszary" className="border-y border-white/5 bg-white/[0.02] px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[880px]">
          <h2 className="mb-10 text-[clamp(1.5rem,4vw,2rem)] font-light leading-tight text-white md:text-[2rem]">
            Trzy miejsca, w których strategia decyduje o wyniku
          </h2>
          <div className="mb-14 grid gap-6 md:grid-cols-3 md:gap-5">
            <article className="flex flex-col rounded-2xl border border-white/10 bg-black/35 p-6">
              <h3 className="mb-3 text-lg font-medium text-white">Strona internetowa</h3>
              <p className="mb-6 flex-grow text-[15px] leading-relaxed text-gray-300">
                Buyer persona, lejek, hierarchia treści, performance. Każda sekcja
                ma rolę w drodze klienta do zakupu — albo jej tam nie ma.
              </p>
              <Link
                href="/strony-www"
                onClick={() => handleSubpageClick('strony')}
                className="mt-auto inline-flex min-h-[44px] items-center gap-2 text-[15px] font-medium tracking-wide text-purple-300 underline decoration-purple-400/60 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
              >
                Jak budujemy strony <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
            <article className="flex flex-col rounded-2xl border border-white/10 bg-black/35 p-6">
              <h3 className="mb-3 text-lg font-medium text-white">Sklep online</h3>
              <p className="mb-6 flex-grow text-[15px] leading-relaxed text-gray-300">
                Kategorie zbudowane wokół intencji zakupowej klienta, nie wokół
                katalogu producenta. Checkout zoptymalizowany pod konkretną
                branżę.
              </p>
              <Link
                href="/sklepy"
                onClick={() => handleSubpageClick('sklepy')}
                className="mt-auto inline-flex min-h-[44px] items-center gap-2 text-[15px] font-medium tracking-wide text-purple-300 underline decoration-purple-400/60 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
              >
                Jak budujemy sklepy <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
            <article className="flex flex-col rounded-2xl border border-white/10 bg-black/35 p-6">
              <h3 className="mb-3 text-lg font-medium text-white">
                Komunikacja i wiarygodność
              </h3>
              <p className="mb-6 flex-grow text-[15px] leading-relaxed text-gray-300">
                Tone of voice, UVP, dowody. Strona, oferty i LinkedIn mówią
                jednym głosem — albo klient czuje rozjazd i wychodzi.
              </p>
              <Link
                href="/realizacje"
                onClick={() => handleSubpageClick('realizacje')}
                className="mt-auto inline-flex min-h-[44px] items-center gap-2 text-[15px] font-medium tracking-wide text-purple-300 underline decoration-purple-400/60 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
              >
                Realizacje i case studies <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          </div>

          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.06] p-8 text-center">
            <p className="mb-6 text-[17px] leading-relaxed italic text-yellow-50/95 md:text-lg">
              Nie wiesz, w którym obszarze tkwi problem Twojej strony? Sprawdźmy
              konkretnie.
            </p>
            <button type="button" onClick={() => handleCtaClick('post-3-obszary')} className={ctaClass}>
              Zamów darmowy audyt swojej strony <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4–6: tiery audytu, CTA, FAQ, formularz */}
      <div className="mx-auto max-w-[720px] px-6 py-16 md:px-10 md:py-24">
        <section data-section="audyt" className="mb-14">
          <h2 className="mb-8 text-[clamp(1.5rem,4vw,2rem)] font-light leading-tight text-white md:text-[2rem]">
            Co dostajesz w audycie
          </h2>
          <div className="space-y-6">
            <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-6">
              <h3 className="mb-4 text-lg font-medium text-white">
                Tier 1 — pełny audyt{' '}
                <span className="text-sm font-normal text-gray-400">
                  (budżet projektu 30k+ PLN)
                </span>
              </h3>
              <p className="text-[15px] leading-relaxed text-gray-200">
                PDF z analizą Twojej strony w 5 obszarach + twarde liczby
                (PageSpeed, Core Web Vitals, SEO) + 5–10 rekomendacji + wstępna
                wycena + 10-min Loom.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="mb-4 text-lg font-medium text-white">
                Tier 2 — mini-audyt automatyczny{' '}
                <span className="text-sm font-normal text-gray-400">
                  (mniejsze projekty)
                </span>
              </h3>
              <p className="text-[15px] leading-relaxed text-gray-200">
                PageSpeed snapshot + 3 quick-winy z szablonu + rekomendacja
                kierunku (redesign / optymalizacja / no-code).
              </p>
            </div>
          </div>
          <p className="mt-8 text-[15px] leading-relaxed text-gray-300">
            <strong className="text-white">Czas:</strong> 3 dni robocze.{' '}
            <strong className="text-white">Zobowiązania:</strong> zero.
          </p>
          <div className="mt-10">
            <button type="button" onClick={() => handleCtaClick('post-audyt')} className={ctaClass}>
              Zamów darmowy audyt swojej strony <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section data-section="faq" className="mb-20">
          <h2 className="mb-8 text-[clamp(1.5rem,4vw,2rem)] font-light leading-tight text-white md:text-[2rem]">
            FAQ — częste pytania
          </h2>
          <div className="divide-y divide-white/5 rounded-2xl border border-white/5 bg-white/[0.02]">
            {FAQ.map((item, i) => (
              <details key={i} className="group p-5 open:bg-white/[0.02]">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[15px] font-medium text-white">
                  <span>{item.q}</span>
                  <span className="mt-1 shrink-0 select-none text-gray-500 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-gray-300">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Form osobny, pod treścią (Notion: modal lub sekcja niżej) */}
        <section
          data-section="form"
          id="formularz"
          aria-labelledby="form-heading"
          className="scroll-mt-28 pb-12"
        >
          <h2
            id="form-heading"
            className="mb-2 text-[clamp(1.5rem,4vw,2rem)] font-light leading-tight text-white md:text-[2rem]"
          >
            Zamów darmowy audyt
          </h2>
          <p className="mb-8 text-sm text-gray-400">3 kroki, ok. 3 minuty.</p>

          {submitted ? (
            <SubmittedCard email={form.email} />
          ) : (
            <form
              onSubmit={handleSubmit}
              className="relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:p-8"
              noValidate
            >
              <ProgressBar step={step} />

              {step === 1 && (
                <fieldset className="space-y-6">
                  <legend className="mb-2 text-base font-medium text-white">
                    Krok 1: Twoja sytuacja
                  </legend>
                  <Field label="Masz już stronę?" error={errors.hasWebsite} htmlFor="hasWebsite">
                    <RadioGroup
                      name="hasWebsite"
                      value={form.hasWebsite}
                      onChange={(v) => update('hasWebsite', v as HasWebsite)}
                      options={[
                        { value: 'dziala', label: 'Tak, działa' },
                        { value: 'do_wymiany', label: 'Tak, ale chcę nowej' },
                      ]}
                    />
                  </Field>
                  <Field
                    label="URL strony"
                    required
                    error={errors.websiteUrl}
                    htmlFor="websiteUrl"
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
                  <Field label="Branża" required error={errors.industry} htmlFor="industry">
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
                  <Field label="Co chcesz osiągnąć?" required error={errors.goal} htmlFor="goal">
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
                      rows={4}
                      maxLength={500}
                      value={form.pain}
                      onChange={(e) => update('pain', e.target.value)}
                      placeholder='np. „dużo wejść z reklam, mało telefonów”'
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-[15px] text-white placeholder-gray-500 outline-none transition focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20"
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
                  <Field label="Imię i nazwisko" required error={errors.fullName} htmlFor="fullName">
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
                    required
                    error={errors.email}
                    htmlFor="email"
                    hint={
                      form.email && isGenericEmail(form.email)
                        ? 'Używamy też adresu firmowego — jeśli go masz, podaj ten (lepsze dopasowanie).'
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
                  <Field label="Budżet projektu" required error={errors.budget} htmlFor="budget">
                    <RadioGroup
                      name="budget"
                      value={form.budget}
                      onChange={(v) => update('budget', v as Budget)}
                      options={BUDGETS}
                    />
                  </Field>
                  <Field
                    label="Kiedy chcesz wystartować?"
                    required
                    error={errors.timeline}
                    htmlFor="timeline"
                  >
                    <RadioGroup
                      name="timeline"
                      value={form.timeline}
                      onChange={(v) => update('timeline', v as Timeline)}
                      options={TIMELINES}
                    />
                  </Field>
                  <Field label="Telefon (opcjonalnie)" htmlFor="phone">
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
                      Syntance (RODO — cel: przygotowanie i przesłanie raportu).{' '}
                      <span className="text-red-300">*</span>
                    </span>
                  </label>
                  {errors.rodo && (
                    <p className="text-sm text-red-300">{errors.rodo}</p>
                  )}
                  <input
                    type="text"
                    name="hp"
                    value={form.hp}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden
                    onChange={(e) => setForm((s) => ({ ...s, hp: e.target.value }))}
                    className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
                  />
                </fieldset>
              )}

              {submitError && (
                <p
                  role="alert"
                  className="mt-6 rounded-lg border border-red-400/30 bg-red-400/[0.06] p-4 text-sm text-red-100"
                >
                  {submitError}
                </p>
              )}
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm text-gray-200 transition hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden /> Wstecz
                  </button>
                ) : (
                  <span aria-hidden />
                )}
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-3 font-medium tracking-wider text-white shadow-lg transition hover:shadow-purple-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
                  >
                    Dalej <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-3 font-medium tracking-wider text-white shadow-lg transition hover:shadow-purple-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 disabled:opacity-55"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        Wysyłamy…
                      </>
                    ) : (
                      <>
                        Wyślij i odbierz raport{' '}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </section>
      </div>

      <footer className="border-t border-white/5 px-6 py-8 md:px-10">
        <div className="mx-auto flex max-w-[720px] flex-col items-start justify-between gap-6 text-sm text-gray-500 md:flex-row md:items-center">
          <div>
            <span className="font-medium text-gray-300">Syntance</span>{' '}
            <span>— strategia, strony, sklepy</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>© {new Date().getFullYear()}</span>
            <Link href="/polityka-prywatnosci" className="underline-offset-4 hover:text-gray-300">
              Polityka prywatności
            </Link>
            <a href="mailto:kamil@syntance.com" className="underline-offset-4 hover:text-gray-300">
              kamil@syntance.com
            </a>
          </div>
        </div>
      </footer>
    </div>
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
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-[width]"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>
    </div>
  )
}

function Field(props: {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
}) {
  const { label, htmlFor, required, error, hint, children } = props
  return (
    <div className="text-left">
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-gray-200">
        {label}
        {required ? (
          <>
            {' '}
            <span className="text-red-300">*</span>
          </>
        ) : null}
      </label>
      {children}
      {hint && !error ? <p className="mt-2 text-xs text-gray-500">{hint}</p> : null}
      {error ? (
        <p className="mt-2 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function RadioGroup(props: {
  name: string
  value: string
  onChange: (value: string) => void
  options: readonly { value: string; label: string }[]
  columns?: 1 | 2
}) {
  const { name, value, onChange, options, columns = 2 } = props
  return (
    <div className={`grid gap-3 ${columns === 2 ? 'sm:grid-cols-2' : ''}`}>
      {options.map((opt) => {
        const id = `${name}-${opt.value}`
        const selected = value === opt.value
        return (
          <label
            key={opt.value}
            htmlFor={id}
            className={`flex cursor-pointer gap-3 rounded-xl border px-4 py-3 text-[15px] transition-colors ${
              selected
                ? 'border-purple-400/55 bg-purple-400/[0.12] text-white'
                : 'border-white/10 bg-black/30 text-gray-200 hover:border-white/22'
            }`}
          >
            <input
              id={id}
              name={name}
              type="radio"
              checked={selected}
              onChange={() => onChange(opt.value)}
              className="mt-[3px] h-4 w-4 shrink-0 border-white/25 bg-transparent text-purple-500 focus-visible:ring-2 focus-visible:ring-purple-400/50"
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
    <div className="rounded-2xl border border-emerald-400/35 bg-emerald-400/[0.06] p-8 md:p-10">
      <h3 className="mb-4 text-xl font-medium text-white">Dzięki — zapisaliśmy zgłoszenie.</h3>
      <p className="text-[15px] leading-relaxed text-gray-200">
        Na adres <strong className="text-white">{email}</strong> pojawi się potwierdzenie. Raport
        (analiza + rekomendacje) przygotujemy najpóźniej w&nbsp;
        <strong className="text-white">ciągu 3 dni roboczych</strong>, tak jak zakładamy przy
        tej kampanii.
      </p>
      <p className="mt-6 text-sm text-gray-400">
        Brak czegoś na skrzynce? Pisz bezpośrednio:{' '}
        <a className="text-gray-200 underline underline-offset-4" href="mailto:kamil@syntance.com">
          kamil@syntance.com
        </a>
        .
      </p>
    </div>
  )
}
