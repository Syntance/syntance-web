import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'

/* ----------------------------------------------------------------------
 * Handler dla formularza /porozmawiajmy (audyt strony).
 * - Walidacja Zod
 * - Email do klienta (potwierdzenie + data raportu)
 * - Email do Kamila z pełnym kontekstem leada + deep linki audytowe
 * - Rate limit memory-only (po IP)
 *
 * Brief: docs Notion „/porozmawiajmy”.
 * Webhook do PostHog / GA4 jest po stronie klienta (lead_flow:form_submit).
 * --------------------------------------------------------------------*/

const schema = z.object({
  hasWebsite: z.enum(['dziala', 'do_wymiany']),
  websiteUrl: z.string().min(3).max(500),
  industry: z.enum([
    'klinika',
    'd2c_meble',
    'deweloper',
    'fashion_beauty',
    'subskrypcje_saas',
    'b2b',
    'inne',
  ]),
  goal: z.enum([
    'leady_b2b',
    'ecommerce',
    'wizerunek',
    'redesign',
    'porozmawiac',
  ]),
  pain: z.string().max(500).optional().default(''),
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  budget: z.enum(['<10', '10-30', '30-60', '60+', 'niewiem']),
  timeline: z.enum(['1m', '1-3m', '3-6m', 'bez']),
  phone: z.string().max(40).optional().default(''),
  rodo: z.literal(true),
  hp: z.string().optional().default(''),
  utm: z
    .object({
      utm_source: z.string().optional(),
      utm_medium: z.string().optional(),
      utm_campaign: z.string().optional(),
    })
    .optional(),
})

type Payload = z.infer<typeof schema>

const INDUSTRY_LABEL: Record<Payload['industry'], string> = {
  klinika: 'Klinika / lekarz',
  d2c_meble: 'Producent mebli D2C',
  deweloper: 'Deweloper mieszkaniowy',
  fashion_beauty: 'Fashion & Beauty',
  subskrypcje_saas: 'Subskrypcje / SaaS',
  b2b: 'B2B usługi',
  inne: 'Inne',
}

const GOAL_LABEL: Record<Payload['goal'], string> = {
  leady_b2b: 'Generować leady B2B',
  ecommerce: 'Sprzedawać produkty online',
  wizerunek: 'Budować wizerunek / wiarygodność marki',
  redesign: 'Wymienić starą stronę na lepszą',
  porozmawiac: 'Nie wie jeszcze, chce porozmawiać',
}

const BUDGET_LABEL: Record<Payload['budget'], string> = {
  '<10': '< 10k PLN',
  '10-30': '10–30k PLN',
  '30-60': '30–60k PLN',
  '60+': '60k+ PLN',
  niewiem: 'Nie wie jeszcze',
}

const TIMELINE_LABEL: Record<Payload['timeline'], string> = {
  '1m': 'Do 1 mc',
  '1-3m': '1–3 mc',
  '3-6m': '3–6 mc',
  bez: 'Bez deadline',
}

const HAS_WEBSITE_LABEL: Record<Payload['hasWebsite'], string> = {
  dziala: 'Tak, działa',
  do_wymiany: 'Tak, ale chce nowej',
}

function tier(p: Payload): 'Tier 1' | 'Tier 2' {
  const fitBudget = p.budget === '30-60' || p.budget === '60+'
  const fitIndustry = p.industry !== 'inne'
  return fitBudget && fitIndustry ? 'Tier 1' : 'Tier 2'
}

function normalizeUrl(input: string): string {
  const trimmed = input.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function addBusinessDays(date: Date, days: number): Date {
  const d = new Date(date)
  let added = 0
  while (added < days) {
    d.setDate(d.getDate() + 1)
    const day = d.getDay()
    if (day !== 0 && day !== 6) added += 1
  }
  return d
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

let resend: Resend | null = null
function getResend(): Resend {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY ?? '')
  return resend
}

const hits = new Map<string, number>()
function rateLimited(ip: string): boolean {
  const now = Date.now()
  const last = hits.get(ip) ?? 0
  if (now - last < 30_000) return true
  hits.set(ip, now)
  return false
}

export async function POST(req: Request) {
  try {
    const ip =
      (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ||
      '0.0.0.0'
    if (rateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: 'Za dużo prób. Odczekaj chwilę.' },
        { status: 429 },
      )
    }

    const json = await req.json().catch(() => null)
    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'Niepoprawne dane formularza.' },
        { status: 400 },
      )
    }

    if (parsed.data.hp && parsed.data.hp.length > 0) {
      return NextResponse.json({ ok: true })
    }

    const p = parsed.data
    const t = tier(p)
    const url = normalizeUrl(p.websiteUrl)
    const reportDate = fmtDate(addBusinessDays(new Date(), 3))
    const ownerTo = process.env.CONTACT_TO_EMAIL ?? 'kamil@syntance.com'

    const resendClient = getResend()

    // 1. Mail do klienta
    const subjectClient = 'Dzięki — Twój audyt jest w drodze'
    const textClient = `Cześć ${p.fullName.split(' ')[0] ?? p.fullName},

Dzięki za zgłoszenie. Twój raport (5 różnic + plan) wróci do Ciebie do ${reportDate} (3 dni robocze).

W międzyczasie sprawdzam już Twoją stronę: ${url}.

Tier audytu: ${t}.
${
  t === 'Tier 1'
    ? '— Pełny audyt offline (2–4 h analizy), PDF + 10-min Loom, wstępna wycena.'
    : '— Mini-audyt automatyczny (PageSpeed + 3 quick-winy z szablonu), bez Looma.'
}

Zero kalendarza, zero logowania. Po raporcie ${
      t === 'Tier 1' ? 'mogę wysłać maks 2 krótkie follow-upy (dzień 5 i 14), potem cisza' : 'zostajesz z planem i zero zobowiązań'
    }.

Gdyby coś nie dotarło — pisz wprost na ten adres.

Kamil
Syntance — strategia, strony, sklepy
https://syntance.com
`

    await resendClient.emails.send({
      from: 'Syntance <hello@syntance.com>',
      to: [p.email],
      subject: subjectClient,
      text: textClient,
      replyTo: ownerTo,
    })

    // 2. Mail do Kamila — pełny kontekst + deep linki audytowe
    const psiMobile = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}&form_factor=mobile`
    const psiDesktop = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}&form_factor=desktop`
    const similarWeb = `https://www.similarweb.com/website/${encodeURIComponent(
      url.replace(/^https?:\/\//, '').replace(/\/.*$/, ''),
    )}`
    const ahrefs = `https://app.ahrefs.com/v2-site-explorer/overview/v2/exact/recent?target=${encodeURIComponent(url)}`

    const subjectOwner = `[${t}] Nowy lead audytu: ${p.fullName} (${INDUSTRY_LABEL[p.industry]}, ${BUDGET_LABEL[p.budget]})`
    const textOwner = `Nowe zgłoszenie /porozmawiajmy

Tier:        ${t}
Imię:        ${p.fullName}
Email:       ${p.email}
Telefon:     ${p.phone || '—'}

Strona:      ${url}
Status:      ${HAS_WEBSITE_LABEL[p.hasWebsite]}
Branża:      ${INDUSTRY_LABEL[p.industry]}
Cel:         ${GOAL_LABEL[p.goal]}
Budżet:      ${BUDGET_LABEL[p.budget]}
Timeline:    ${TIMELINE_LABEL[p.timeline]}

Ból:
${p.pain || '—'}

UTM:
  source:   ${p.utm?.utm_source ?? '—'}
  medium:   ${p.utm?.utm_medium ?? '—'}
  campaign: ${p.utm?.utm_campaign ?? '—'}

Deep linki audytowe:
- PageSpeed mobile:  ${psiMobile}
- PageSpeed desktop: ${psiDesktop}
- SimilarWeb:        ${similarWeb}
- Ahrefs:            ${ahrefs}

Data raportu (klient widzi): ${reportDate}
`

    await resendClient.emails.send({
      from: 'Syntance <hello@syntance.com>',
      to: [ownerTo],
      replyTo: p.email,
      subject: subjectOwner,
      text: textOwner,
    })

    return NextResponse.json({ ok: true, tier: t })
  } catch (e) {
    console.error('[audyt-submit] error', e)
    return NextResponse.json(
      { ok: false, error: 'Błąd serwera. Spróbuj ponownie za chwilę.' },
      { status: 500 },
    )
  }
}
