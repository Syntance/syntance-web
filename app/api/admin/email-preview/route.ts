import { NextRequest, NextResponse } from 'next/server'
import {
  renderContactFormClientEmail,
  renderContractsEmail,
  renderDealReminderEmail,
  renderMeetingBookingClientEmail,
  renderPaymentEmail,
  renderProjectCompleteEmail,
  renderProjectKickoffEmail,
  renderQuoteRequestClientEmail,
  renderRejectionEmail,
  DEFAULT_PREVIEW_DATA,
  type EmailRenderData,
} from '@/lib/emails/templates'
import {
  getEmailTemplates,
  DEFAULT_EMAIL_TEMPLATES,
} from '@/lib/db/queries/settings'
import { getPaymentSettings } from '@/lib/db/queries/settings'

/**
 * Serwerowy podgląd HTML emaila — używany do testów / linkowania.
 * Studio renderuje preview po stronie klienta przez `iframe srcDoc`,
 * ten endpoint jest pomocniczy (np. otwarcie w nowej karcie).
 *
 * Zwraca HTML maila z mockowymi danymi klienta i aktualnymi tekstami z Sanity.
 *
 * Query params:
 *   - template = contracts | payment | projectKickoff | projectComplete | dealReminder | rejection | quoteRequestClient | contactFormClient | meetingBookingClient (default: contracts)
 *   - useDefaults = 1 — pomija fetch z Sanity i używa wbudowanych defaultów
 *   - bookingId / name — nadpisanie danych mock
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const template = (params.get('template') ?? 'contracts').toLowerCase()
  const useDefaults = params.get('useDefaults') === '1'

  const overrides: Partial<EmailRenderData> = {}
  const overrideBooking = params.get('bookingId')?.trim()
  if (overrideBooking) overrides.bookingId = overrideBooking
  const overrideName = params.get('name')?.trim()
  if (overrideName) overrides.name = overrideName

  const data: EmailRenderData = { ...DEFAULT_PREVIEW_DATA, ...overrides }
  const titleDate = params.get('titleDate')?.trim() ?? '11.05.2026'
  const projectTypeGenitive = params.get('projectTypeGenitive')?.trim() ?? 'strony WWW'

  const [templates, payment] = await Promise.all([
    useDefaults ? Promise.resolve(DEFAULT_EMAIL_TEMPLATES) : getEmailTemplates(),
    template === 'payment' ? getPaymentSettings() : Promise.resolve(null),
  ])

  let html: string
  if (template === 'payment') {
    html = renderPaymentEmail(data, templates, payment).html
  } else if (template === 'rejection') {
    html = renderRejectionEmail(data, templates).html
  } else if (template === 'projectkickoff') {
    html = renderProjectKickoffEmail(data, templates).html
  } else if (template === 'projectcomplete') {
    html = renderProjectCompleteEmail(data, templates).html
  } else if (template === 'dealreminder') {
    html = renderDealReminderEmail(data, templates).html
  } else if (template === 'quoterequestclient') {
    html = renderQuoteRequestClientEmail(
      {
        ...data,
        days: 14,
        items: ['Pozycja mock 1', 'Pozycja mock 2'],
        itemsCount: 2,
      },
      templates,
      { titleDate, projectTypeGenitive },
    ).html
  } else if (template === 'contactformclient') {
    const firstName = data.name.trim().split(/\s+/)[0] ?? data.name
    html = renderContactFormClientEmail({ firstName }, templates).html
  } else if (template === 'meetingbookingclient') {
    html = renderMeetingBookingClientEmail(
      {
        name: data.name,
        meetingDateLabel: 'poniedziałek, 12 maja 2025',
        meetingTime: '10:00',
        slotMinutes: 30,
        meetLink: params.get('meetLink')?.trim() || 'https://meet.google.com/mock',
      },
      templates,
    ).html
  } else {
    html = renderContractsEmail(data, templates).html
  }

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      // Pozwól osadzać w iframe (np. preview w Studio).
      // Header X-Frame-Options jest globalny (next.config.mjs) — CSP frame-ancestors
      // ma pierwszeństwo w nowoczesnych przeglądarkach, ale część (Safari) honoruje XFO.
      // W praktyce Studio używa srcDoc (same-origin null), więc to tylko dla podglądu po URL.
      'Content-Security-Policy': "frame-ancestors 'self'",
    },
  })
}
