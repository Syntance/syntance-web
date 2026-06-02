'use client'

import {
  useEffect,
  useState,
  useRef,
  useMemo,
  type FormEvent,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  ChevronDown,
  Loader2,
  LayoutTemplate,
  ShoppingCart,
  BadgeCheck,
} from 'lucide-react'
import GradientText from '@/components/GradientText'
import TiltCard from '@/components/tilt-card'
import SubpageScrollbar from '@/components/SubpageScrollbar'
import StickyCtaFloat from '@/components/StickyCtaFloat'
import { trackEvent } from '@/lib/tracking'

/* ─────────────────────────────────────────────────────────
   DANE STATYCZNE
───────────────────────────────────────────────────────── */

const scrollbarSections = [
  { id: 'pzm-hero', label: 'Start' },
  { id: 'pzm-bez-strategii', label: 'Problem' },
  { id: 'pzm-obszary', label: '3 obszary' },
  { id: 'pzm-audyt', label: 'Audyt' },
  { id: 'pzm-faq', label: 'FAQ' },
]

const BEZ_STRATEGII = [
  'Nagłówek o sobie zamiast o kliencie.',
  'Pięć równorzędnych CTA zamiast jednej oczywistej akcji.',
  'Blog jako kolekcja artykułów, nie lejek do oferty.',
  'Stack dobrany „bo każdy ma WordPress".',
  'Brak liczb, opinii, case studies.',
] as const

const OBSZARY = [
  {
    icon: LayoutTemplate,
    title: 'Strona internetowa',
    body: 'Buyer persona, lejek, hierarchia treści, performance. Każda sekcja ma rolę w drodze klienta do zakupu — albo jej tam nie ma.',
    cta: 'Jak budujemy strony',
    href: '/strony-www',
    gradient: 'from-blue-500 to-cyan-500',
    trackTarget: 'strony' as const,
  },
  {
    icon: ShoppingCart,
    title: 'Sklep online',
    body: 'Kategorie zbudowane wokół intencji zakupowej klienta, nie wokół katalogu producenta. Checkout zoptymalizowany pod konkretną branżę.',
    cta: 'Jak budujemy sklepy',
    href: '/sklepy',
    gradient: 'from-purple-500 to-pink-500',
    trackTarget: 'sklepy' as const,
  },
  {
    icon: BadgeCheck,
    title: 'Komunikacja i wiarygodność',
    body: 'Tone of voice, UVP, dowody. Strona, oferty i LinkedIn mówią jednym głosem — albo klient czuje rozjazd i wychodzi.',
    cta: 'Realizacje i case studies',
    href: '/realizacje',
    gradient: 'from-amber-500 to-orange-500',
    trackTarget: 'realizacje' as const,
  },
]

const FAQ_ITEMS = [
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

/* ─────────────────────────────────────────────────────────
   FORM TYPES / HELPERS
───────────────────────────────────────────────────────── */

type Industry = 'klinika' | 'd2c_meble' | 'deweloper' | 'fashion_beauty' | 'subskrypcje_saas' | 'b2b' | 'inne'
type Goal = 'leady_b2b' | 'ecommerce' | 'wizerunek' | 'redesign' | 'porozmawiac'
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

const GENERIC_DOMAINS = ['gmail.com', 'wp.pl', 'onet.pl', 'interia.pl', 'o2.pl', 'icloud.com', 'yahoo.com', 'outlook.com', 'hotmail.com']

function isValidUrl(v: string) {
  if (!v) return false
  try {
    const u = new URL(v.startsWith('http') ? v : `https://${v}`)
    return u.hostname.includes('.')
  } catch { return false }
}

function isGenericEmail(email: string) {
  const at = email.indexOf('@')
  return at !== -1 && GENERIC_DOMAINS.includes(email.slice(at + 1).toLowerCase())
}

/* ─────────────────────────────────────────────────────────
   SHARED ANIMATION COMPONENT (identyczny jak w strony-www)
───────────────────────────────────────────────────────── */

function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1, rootMargin: '-50px' },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
    >
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */

export default function PorozmawiajmyContent() {
  const searchParams = useSearchParams()
  const utm = useMemo(() => ({
    utm_source: searchParams?.get('utm_source') ?? undefined,
    utm_medium: searchParams?.get('utm_medium') ?? undefined,
    utm_campaign: searchParams?.get('utm_campaign') ?? undefined,
  }), [searchParams])

  const [heroVisible, setHeroVisible] = useState(false)
  useEffect(() => setHeroVisible(true), [])

  // PostHog view
  const viewTrackedRef = useRef(false)
  useEffect(() => {
    if (viewTrackedRef.current) return
    viewTrackedRef.current = true
    trackEvent('lead_landing_view', {
      ...utm,
      device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    })
  }, [utm])

  // Section tracker
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-ph-section]'))
    if (!sections.length) return
    const seen = new Set<string>()
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        const name = e.target.getAttribute('data-ph-section')
        if (!name || seen.has(name) || !e.isIntersecting) continue
        seen.add(name)
        trackEvent('lead_section_viewed', { section_name: name })
      }
    }, { threshold: 0.35 })
    sections.forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [])

  const scrollToForm = () => {
    document.getElementById('pzm-formularz')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleCta = (position: 'hero' | 'post-3-obszary' | 'post-audyt') => {
    trackEvent('lead_cta_clicked', { position })
    scrollToForm()
  }

  /* ── FORM STATE ── */
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState<FormState>({
    hasWebsite: '', websiteUrl: '', industry: '', goal: '', pain: '',
    fullName: '', email: '', budget: '', timeline: '', phone: '', rodo: false, hp: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm(s => ({ ...s, [k]: v }))
    setErrors(e => ({ ...e, [k]: undefined }))
  }

  const validateStep1 = () => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.hasWebsite) e.hasWebsite = 'Wybierz opcję.'
    if (!isValidUrl(form.websiteUrl)) e.websiteUrl = 'Podaj poprawny URL strony.'
    if (!form.industry) e.industry = 'Wybierz branżę.'
    setErrors(e); return !Object.keys(e).length
  }
  const validateStep2 = () => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.goal) e.goal = 'Wybierz cel.'
    if (form.pain.length > 500) e.pain = 'Maks. 500 znaków.'
    setErrors(e); return !Object.keys(e).length
  }
  const validateStep3 = () => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (form.fullName.trim().length < 2) e.fullName = 'Podaj imię i nazwisko.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Podaj poprawny email.'
    if (!form.budget) e.budget = 'Wybierz budżet.'
    if (!form.timeline) e.timeline = 'Wybierz horyzont.'
    if (!form.rodo) e.rodo = 'Wymagana zgoda.'
    setErrors(e); return !Object.keys(e).length
  }

  const goNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    if (step < 3) setStep(s => (s + 1) as 2 | 3)
    document.getElementById('pzm-formularz')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const goBack = () => step > 1 && setStep(s => (s - 1) as 1 | 2)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateStep3()) return
    setSubmitting(true); setSubmitError(null)
    try {
      const res = await fetch('/api/audyt-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, utm }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? 'Coś poszło nie tak.')
      }
      trackEvent('lead_form_submitted', { budget_range: form.budget, timeline: form.timeline, industry: form.industry })
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Błąd wysyłki.')
    } finally {
      setSubmitting(false)
    }
  }

  /* ── RENDER ── */
  return (
    <div className="min-h-screen w-full" style={{ overflowX: 'clip' }}>
      <SubpageScrollbar sections={scrollbarSections} />

      {/* ─── 1. HERO ──────────────────────────────────────────────── */}
      <section
        id="pzm-hero"
        data-ph-section="hero"
        className="relative z-10 flex min-h-screen items-center justify-center px-6 pt-32 pb-20 lg:px-12"
      >
        <div
          className={`mx-auto max-w-3xl text-center transition-all duration-1000 ${
            heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <h1 className="font-heading glow-text mb-8 text-4xl font-light leading-tight tracking-tight md:text-5xl lg:text-6xl">
            Skuteczna strona musi być zbudowana{' '}
            <GradientText
              colors={['#ffaa40', '#9c40ff', '#ffaa40']}
              animationSpeed={4}
              className="font-medium"
            >
              w oparciu o strategię.
            </GradientText>
          </h1>

          <p className="mx-auto mb-12 max-w-2xl text-lg font-light leading-relaxed tracking-wide text-gray-400 md:text-xl">
            To filozofia, na której budujemy strony i sklepy internetowe.
          </p>

          {/* CTA row */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            {/* Primary */}
            <div className="group relative w-fit shrink-0">
              <div
                className="animate-gradient absolute -inset-1 -z-10 rounded-full opacity-25 blur-md transition-opacity group-hover:opacity-50"
                style={{
                  backgroundImage: 'linear-gradient(to right, #ffaa40, #9c40ff, #ffaa40)',
                  backgroundSize: '300% 100%',
                }}
              />
              <button
                type="button"
                onClick={() => document.getElementById('pzm-bez-strategii')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="relative z-10 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-white px-8 py-3 font-medium tracking-wider text-gray-900 shadow-lg shadow-white/10 transition-all hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Dowiedz się więcej
                <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-1" />
              </button>
            </div>

            {/* Sticky CTA — inline w hero, po scrollu przechodzi do fixed corner */}
            <StickyCtaFloat
              heroId="pzm-hero"
              hideSectionId="pzm-formularz"
              href="/cennik"
              label="Sprawdź cenę"
            />
          </div>

        </div>

        {/* Scroll mouse */}
        <div
          className={`absolute bottom-10 left-1/2 -translate-x-1/2 transition-all delay-700 duration-1000 ${
            heroVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            type="button"
            aria-label="Przewiń w dół"
            onClick={() => document.getElementById('pzm-bez-strategii')?.scrollIntoView({ behavior: 'smooth' })}
            className="group flex flex-col items-center gap-2"
          >
            <div className="flex h-10 w-6 justify-center rounded-full border-2 border-gray-600 group-hover:border-gray-400 transition-colors">
              <div className="mt-2 h-3 w-1 animate-bounce rounded-full bg-gray-400 group-hover:bg-white transition-colors" />
            </div>
          </button>
        </div>
      </section>

      {/* ─── 2. BEZ STRATEGII ─────────────────────────────────────── */}
      <section
        id="pzm-bez-strategii"
        data-ph-section="bez-strategii"
        className="relative z-10 px-6 py-32 lg:px-12"
      >
        <div className="mx-auto max-w-4xl">
          <AnimatedSection className="mb-16 text-center">
            <h2 className="glow-text mb-6 text-3xl font-light tracking-wide md:text-5xl">
              Strona bez strategii{' '}
              <span className="text-red-400">wygląda tak:</span>
            </h2>
            <p className="mx-auto max-w-xl text-xl text-gray-400">
              Klient się rozpoznaje — i rozumie, dlaczego konwersji nie ma.
            </p>
          </AnimatedSection>

          <div className="mb-16 grid gap-4 md:grid-cols-2 md:gap-5">
            {BEZ_STRATEGII.map((line, i) => (
              <AnimatedSection key={i} delay={i * 80}>
                <div className="flex items-start gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 transition-colors hover:border-red-500/40">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <p className="text-white leading-relaxed">{line}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={500}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
              <p className="text-lg leading-relaxed text-gray-300">
                <strong className="font-medium text-white">Efekt:</strong> ruch
                jest, leadów nie ma. Marketing pyta sprzedaży gdzie konwersje,
                sprzedaż pyta marketingu gdzie ruch.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Transition */}
      <section className="relative z-10 px-6 py-24 lg:px-12">
        <AnimatedSection className="mx-auto max-w-3xl text-center">
          <p className="text-2xl font-light leading-relaxed text-gray-400 md:text-4xl">
            A gdyby strona działała jak{' '}
            <span className="text-white">lejek</span>, nie jak{' '}
            <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              broszura?
            </span>
          </p>
        </AnimatedSection>
      </section>

      {/* ─── 3. TRZY OBSZARY ──────────────────────────────────────── */}
      <section
        id="pzm-obszary"
        data-ph-section="3-obszary"
        className="relative z-10 bg-linear-to-b from-transparent via-blue-950/10 to-transparent px-6 py-32 lg:px-12"
      >
        <div className="mx-auto max-w-5xl">
          <AnimatedSection className="mb-16 text-center">
            <h2 className="glow-text mb-6 text-3xl font-light tracking-wide md:text-5xl">
              Trzy miejsca, w których{' '}
              <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                strategia decyduje o wyniku
              </span>
            </h2>
            <p className="mx-auto max-w-xl text-xl text-gray-400">
              Klient wybiera obszar, który go dotyczy i klika dalej. Jeśli
              żaden — klika audyt.
            </p>
          </AnimatedSection>

          <div className="mb-16 grid gap-6 md:grid-cols-3 md:gap-8">
            {OBSZARY.map((item, i) => {
              const Icon = item.icon
              return (
                <AnimatedSection key={i} delay={i * 150}>
                  <TiltCard className="h-full">
                    <div className="group relative h-full">
                      <div
                        className={`absolute -inset-0.5 bg-linear-to-r ${item.gradient} rounded-2xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-20`}
                      />
                      <div className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-gray-900/80 p-8 backdrop-blur-sm">
                        <div
                          className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br ${item.gradient}`}
                        >
                          <Icon size={28} className="text-white" />
                        </div>
                        <h3 className="mb-3 text-xl font-medium text-white">
                          {item.title}
                        </h3>
                        <p className="mb-6 grow text-gray-400 leading-relaxed">
                          {item.body}
                        </p>
                        <Link
                          href={item.href}
                          onClick={() =>
                            trackEvent('lead_subpage_clicked', { target: item.trackTarget })
                          }
                          className="group/link mt-auto inline-flex items-center gap-2 text-[15px] font-medium text-white/70 transition-colors hover:text-white"
                        >
                          {item.cta}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </TiltCard>
                </AnimatedSection>
              )
            })}
          </div>

          {/* Repeat CTA */}
          <AnimatedSection delay={400}>
            <div className="group relative mx-auto max-w-2xl">
              <div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-purple-500 via-pink-500 to-orange-500 opacity-15 blur-xl transition-opacity duration-500 group-hover:opacity-25" />
              <div className="relative rounded-3xl border border-white/10 bg-gray-900/80 p-10 text-center backdrop-blur-sm">
                <p className="mb-6 text-xl leading-relaxed text-gray-300">
                  Nie wiesz, w którym obszarze tkwi problem Twojej strony?{' '}
                  <strong className="font-medium text-white">
                    Sprawdźmy konkretnie.
                  </strong>
                </p>
                <div className="relative inline-block w-fit">
                  <div
                    className="animate-gradient absolute -inset-1 -z-10 rounded-full opacity-30 blur-md transition-opacity group-hover:opacity-50"
                    style={{
                      backgroundImage: 'linear-gradient(to right, #9c40ff, #ff6b6b, #9c40ff)',
                      backgroundSize: '300% 100%',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleCta('post-3-obszary')}
                    className="relative z-10 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-white px-8 py-3 font-medium tracking-wider text-gray-900 shadow-lg transition-all hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    Zamów darmowy audyt swojej strony
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  3 minuty wypełniania. Raport w 3 dni. Zero sales calli.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── 4. CO DOSTAJESZ W AUDYCIE ────────────────────────────── */}
      <section
        id="pzm-audyt"
        data-ph-section="audyt"
        className="relative z-10 px-6 py-32 lg:px-12"
      >
        <div className="mx-auto max-w-4xl">
          <AnimatedSection className="mb-16 text-center">
            <h2 className="glow-text mb-4 text-3xl font-light tracking-wide md:text-5xl">
              Co dostajesz w audycie
            </h2>
            <p className="text-xl text-gray-400">
              Czas: 3 dni robocze. Zobowiązania: zero.
            </p>
          </AnimatedSection>

          <div className="mb-16 grid gap-6 md:grid-cols-2">
            {/* Tier 1 */}
            <AnimatedSection delay={0}>
              <div className="relative h-full overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8">
                <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl" />
                <div className="relative">
                  <div className="mb-2 inline-block rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300 tracking-wider">
                    TIER 1 — PEŁNY AUDYT
                  </div>
                  <p className="mb-1 text-sm text-gray-400 italic">budżet projektu 30k+ PLN</p>
                  <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-gray-200">
                    {[
                      'PDF z analizą w 5 obszarach',
                      'PageSpeed, Core Web Vitals, SEO',
                      '5–10 konkretnych rekomendacji',
                      'Wstępna wycena projektu',
                      '10-min Loom osobiście',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 text-emerald-400">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimatedSection>

            {/* Tier 2 */}
            <AnimatedSection delay={150}>
              <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8">
                <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
                <div className="relative">
                  <div className="mb-2 inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-gray-300 tracking-wider">
                    TIER 2 — MINI-AUDYT
                  </div>
                  <p className="mb-1 text-sm text-gray-400 italic">mniejsze projekty</p>
                  <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-gray-200">
                    {[
                      'PageSpeed snapshot',
                      '3 quick-winy z szablonu',
                      'Rekomendacja kierunku',
                      'Redesign / optymalizacja / no-code',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 text-gray-400">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Third CTA */}
          <AnimatedSection delay={200} className="text-center">
            <button
              type="button"
              onClick={() => handleCta('post-audyt')}
              className="group inline-flex items-center gap-3 rounded-full bg-linear-to-r from-blue-500 to-cyan-500 px-8 py-4 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30"
            >
              Zamów darmowy audyt swojej strony
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── 5. FAQ ───────────────────────────────────────────────── */}
      <section
        id="pzm-faq"
        data-ph-section="faq"
        className="relative z-10 px-6 py-32 lg:px-12"
      >
        <div className="mx-auto max-w-3xl">
          <AnimatedSection className="mb-16 text-center">
            <h2 className="glow-text text-3xl font-light tracking-wide md:text-5xl">
              Pytania i odpowiedzi
            </h2>
          </AnimatedSection>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <AnimatedSection key={i} delay={i * 60}>
                <details className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-colors hover:border-white/20">
                  <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                    <span className="pr-4 font-medium text-white">{item.q}</span>
                    <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-6 pt-0">
                    <p className="leading-relaxed text-gray-400">{item.a}</p>
                  </div>
                </details>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. FORMULARZ ─────────────────────────────────────────── */}
      <section
        id="pzm-formularz"
        data-ph-section="form"
        className="relative z-10 scroll-mt-24 px-6 py-32 lg:px-12 bg-linear-to-b from-transparent via-purple-950/10 to-transparent"
      >
        <div className="mx-auto max-w-2xl">
          <AnimatedSection className="mb-12 text-center">
            <h2 className="glow-text mb-4 text-3xl font-light tracking-wide md:text-5xl">
              Zamów darmowy audyt
            </h2>
            <p className="text-xl text-gray-400">
              3 kroki, ok. 3 minuty.
            </p>
          </AnimatedSection>

          {submitted ? (
            <AnimatedSection>
              <SubmittedCard email={form.email} />
            </AnimatedSection>
          ) : (
            <AnimatedSection>
              <div className="relative">
                <div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-purple-500/20 to-blue-500/20 blur-xl" />
                <form
                  onSubmit={handleSubmit}
                  className="relative rounded-3xl border border-white/10 bg-gray-900/80 p-8 backdrop-blur-sm md:p-10"
                  noValidate
                >
                  <ProgressBar step={step} />

                  {step === 1 && (
                    <fieldset className="space-y-6">
                      <legend className="mb-6 text-lg font-medium text-white">
                        Krok 1 — Twoja sytuacja
                      </legend>
                      <Field label="Masz już stronę?" error={errors.hasWebsite} htmlFor="hasWebsite">
                        <RadioGroup
                          name="hasWebsite" value={form.hasWebsite}
                          onChange={v => set('hasWebsite', v as HasWebsite)}
                          options={[
                            { value: 'dziala', label: 'Tak, działa' },
                            { value: 'do_wymiany', label: 'Tak, ale chcę nową' },
                          ]}
                        />
                      </Field>
                      <Field label="URL strony" required error={errors.websiteUrl} htmlFor="websiteUrl"
                        hint={'Ten landing jest dla firm z istniejącą stroną. Klienci \u201eod zera\u201d mają osobny lejek na /strony-www.'}>
                        <input id="websiteUrl" type="text" inputMode="url" autoComplete="url"
                          placeholder="np. twoja-firma.pl" value={form.websiteUrl}
                          onChange={e => set('websiteUrl', e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-[15px] text-white placeholder-gray-600 outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/20"
                        />
                      </Field>
                      <Field label="Branża" required error={errors.industry} htmlFor="industry">
                        <select id="industry" value={form.industry}
                          onChange={e => set('industry', e.target.value as Industry)}
                          className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-[15px] text-white outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/20"
                        >
                          <option value="">— wybierz —</option>
                          {INDUSTRIES.map(it => <option key={it.value} value={it.value}>{it.label}</option>)}
                        </select>
                      </Field>
                    </fieldset>
                  )}

                  {step === 2 && (
                    <fieldset className="space-y-6">
                      <legend className="mb-6 text-lg font-medium text-white">
                        Krok 2 — Cel biznesowy
                      </legend>
                      <Field label="Co chcesz osiągnąć?" required error={errors.goal} htmlFor="goal">
                        <RadioGroup name="goal" value={form.goal}
                          onChange={v => set('goal', v as Goal)} options={GOALS} columns={1} />
                      </Field>
                      <Field label="Największy ból ze stroną dzisiaj? (opcjonalnie, max 500 znaków)"
                        error={errors.pain} htmlFor="pain">
                        <textarea id="pain" rows={4} maxLength={500} value={form.pain}
                          onChange={e => set('pain', e.target.value)}
                          placeholder='np. „dużo wejść z reklam, mało telefonów"'
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-[15px] text-white placeholder-gray-600 outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/20"
                        />
                        <p className="mt-1 text-right text-xs text-gray-500">{form.pain.length}/500</p>
                      </Field>
                    </fieldset>
                  )}

                  {step === 3 && (
                    <fieldset className="space-y-6">
                      <legend className="mb-6 text-lg font-medium text-white">
                        Krok 3 — Praktyczne
                      </legend>
                      <Field label="Imię i nazwisko" required error={errors.fullName} htmlFor="fullName">
                        <input id="fullName" type="text" autoComplete="name" value={form.fullName}
                          onChange={e => set('fullName', e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-[15px] text-white outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/20"
                        />
                      </Field>
                      <Field label="Email" required error={errors.email} htmlFor="email"
                        hint={form.email && isGenericEmail(form.email) ? 'Używamy też adresu firmowego — jeśli go masz, podaj ten (lepsze dopasowanie).' : undefined}>
                        <input id="email" type="email" autoComplete="email" value={form.email}
                          onChange={e => set('email', e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-[15px] text-white outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/20"
                        />
                      </Field>
                      <Field label="Budżet projektu" required error={errors.budget} htmlFor="budget">
                        <RadioGroup name="budget" value={form.budget}
                          onChange={v => set('budget', v as Budget)} options={BUDGETS} />
                      </Field>
                      <Field label="Kiedy chcesz wystartować?" required error={errors.timeline} htmlFor="timeline">
                        <RadioGroup name="timeline" value={form.timeline}
                          onChange={v => set('timeline', v as Timeline)} options={TIMELINES} />
                      </Field>
                      <Field label="Telefon (opcjonalnie)" htmlFor="phone">
                        <input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone}
                          onChange={e => set('phone', e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-[15px] text-white outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/20"
                        />
                      </Field>
                      <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-gray-300">
                        <input type="checkbox" checked={form.rodo}
                          onChange={e => set('rodo', e.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-white/20 bg-black/40 text-purple-500 focus:ring-2 focus:ring-purple-400/40"
                        />
                        <span>
                          Wyrażam zgodę na przetwarzanie danych zgodnie z{' '}
                          <Link href="/polityka-prywatnosci" target="_blank"
                            className="underline underline-offset-4 hover:text-white">
                            polityką prywatności
                          </Link>{' '}
                          Syntance (cel: przygotowanie audytu).{' '}
                          <span className="text-red-400">*</span>
                        </span>
                      </label>
                      {errors.rodo && <p className="text-sm text-red-400">{errors.rodo}</p>}
                      {/* Honeypot */}
                      <input type="text" name="hp" value={form.hp} tabIndex={-1} aria-hidden
                        autoComplete="off"
                        onChange={e => setForm(s => ({ ...s, hp: e.target.value }))}
                        className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
                      />
                    </fieldset>
                  )}

                  {submitError && (
                    <p role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                      {submitError}
                    </p>
                  )}

                  <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {step > 1 ? (
                      <button type="button" onClick={goBack}
                        className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm text-gray-200 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30">
                        <ArrowLeft className="h-4 w-4" /> Wstecz
                      </button>
                    ) : <span />}
                    {step < 3 ? (
                      <button type="button" onClick={goNext}
                        className="group inline-flex min-h-[48px] items-center gap-2 rounded-full bg-linear-to-r from-purple-500 to-blue-500 px-8 py-3 font-medium tracking-wider text-white shadow-lg transition-all hover:scale-105 hover:shadow-purple-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300">
                        Dalej <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    ) : (
                      <button type="submit" disabled={submitting}
                        className="group inline-flex min-h-[48px] items-center gap-2 rounded-full bg-linear-to-r from-purple-500 to-blue-500 px-8 py-3 font-medium tracking-wider text-white shadow-lg transition-all hover:scale-105 hover:shadow-purple-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 disabled:opacity-50 disabled:pointer-events-none">
                        {submitting ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Wysyłamy…</>
                        ) : (
                          <>Wyślij i odbierz raport <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>
                        )}
                      </button>
                    )}
                  </div>
                  <p className="mt-4 text-center text-xs text-gray-500">
                    Bez spamu. Email tylko z raportem i ewentualną propozycją.
                  </p>
                </form>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-gray-900 px-6 py-12 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Link href="/" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">
              Syntance — strategia, strony, sklepy
            </Link>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>© {new Date().getFullYear()}</span>
              <Link href="/polityka-prywatnosci" className="transition-colors hover:text-gray-300">
                Polityka prywatności
              </Link>
              <a href="mailto:kamil@syntance.com" className="transition-colors hover:text-gray-300">
                kamil@syntance.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────── */

function ProgressBar({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="mb-8" aria-live="polite">
      <div className="mb-2 flex justify-between text-xs text-gray-400">
        <span>Krok {step} z 3</span>
        <span>{Math.round((step / 3) * 100)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-linear-to-r from-purple-500 to-blue-500 transition-[width] duration-500"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>
    </div>
  )
}

function Field({
  label, htmlFor, required, error, hint, children,
}: {
  label: string; htmlFor: string; required?: boolean; error?: string; hint?: string; children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-gray-200">
        {label}{required && <span className="ml-1 text-red-400">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-2 text-xs text-gray-500">{hint}</p>}
      {error && <p role="alert" className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  )
}

function RadioGroup({
  name, value, onChange, options, columns = 2,
}: {
  name: string; value: string; onChange: (v: string) => void
  options: readonly { value: string; label: string }[]; columns?: 1 | 2
}) {
  return (
    <div className={`grid gap-3 ${columns === 2 ? 'sm:grid-cols-2' : ''}`}>
      {options.map(opt => {
        const selected = value === opt.value
        return (
          <label key={opt.value} htmlFor={`${name}-${opt.value}`}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-[15px] transition-colors ${
              selected
                ? 'border-purple-400/60 bg-purple-400/10 text-white'
                : 'border-white/10 bg-black/30 text-gray-200 hover:border-white/20'
            }`}
          >
            <input id={`${name}-${opt.value}`} name={name} type="radio"
              checked={selected} onChange={() => onChange(opt.value)}
              className="h-4 w-4 shrink-0 border-white/25 bg-transparent text-purple-500"
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
    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-10 text-center">
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 h-40 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="relative">
        <div className="mb-4 text-5xl">✓</div>
        <h3 className="mb-4 text-2xl font-medium text-white">Dzięki — zapisaliśmy zgłoszenie.</h3>
        <p className="mx-auto max-w-sm leading-relaxed text-gray-300">
          Na adres <strong className="text-white">{email}</strong> pojawi się potwierdzenie.
          Raport przygotujemy do <strong className="text-white">3 dni roboczych</strong>.
        </p>
        <p className="mt-6 text-sm text-gray-500">
          Brak czegoś na skrzynce? Pisz:{' '}
          <a href="mailto:kamil@syntance.com" className="text-gray-300 underline underline-offset-4">
            kamil@syntance.com
          </a>
        </p>
      </div>
    </div>
  )
}
