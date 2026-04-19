import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  company: z.string().max(160).optional(),
  topic: z.string().max(2000).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  source: z.string().max(80).optional(),
})

let resend: Resend | null = null
function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY || '')
  return resend
}

// Rate limiting — 1 request / email / 60s
const hits = new Map<string, number>()
function limited(key: string) {
  const now = Date.now()
  const last = hits.get(key) ?? 0
  if (now - last < 60_000) return true
  hits.set(key, now)
  return false
}

function polishDate(iso: string): string {
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('pl-PL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function toICSDate(date: string, time: string): string {
  // Europe/Warsaw jako „floating local” — większość klientów (Apple, Google)
  // przyjmie to jako czas lokalny spotkania. Nie osadzamy TZID żeby nie
  // komplikować parsera.
  const [y, m, d] = date.split('-')
  const [hh, mm] = time.split(':')
  return `${y}${m}${d}T${hh}${mm}00`
}

function addMinutes(date: string, time: string, minutes: number): { date: string; time: string } {
  const d = new Date(`${date}T${time}:00`)
  d.setMinutes(d.getMinutes() + minutes)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${min}` }
}

function buildICS(params: {
  uid: string
  summary: string
  description: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  organizerEmail: string
  attendeeEmail: string
  attendeeName: string
}): string {
  const dtstart = toICSDate(params.startDate, params.startTime)
  const dtend = toICSDate(params.endDate, params.endTime)
  const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Syntance//Meeting Booking//PL',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${params.uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${params.summary}`,
    `DESCRIPTION:${params.description.replace(/\n/g, '\\n')}`,
    `ORGANIZER;CN=Syntance:mailto:${params.organizerEmail}`,
    `ATTENDEE;CN=${params.attendeeName};RSVP=TRUE:mailto:${params.attendeeEmail}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'Nieprawidłowe dane formularza.' },
        { status: 400 }
      )
    }

    const data = parsed.data

    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || '0.0.0.0'
    if (limited(`${ip}:${data.email}`)) {
      return NextResponse.json(
        { ok: false, error: 'Za szybko. Spróbuj ponownie za chwilę.' },
        { status: 429 }
      )
    }

    const end = addMinutes(data.date, data.time, 30)
    const dateLabel = polishDate(data.date)

    // 1) Opcjonalnie: zablokuj slot w Google Calendar (jeśli skonfigurowany)
    try {
      const origin =
        req.headers.get('origin') ??
        (process.env.NEXT_PUBLIC_SITE_URL ? process.env.NEXT_PUBLIC_SITE_URL : 'https://syntance.com')
      await fetch(`${origin}/api/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: data.date,
          endDate: end.date,
          title: `Rozmowa — ${data.name}${data.company ? ` (${data.company})` : ''}`,
          description:
            `Godz. ${data.time}–${end.time}\n` +
            `Email: ${data.email}\n` +
            (data.topic ? `Temat: ${data.topic}\n` : '') +
            (data.source ? `Źródło: ${data.source}\n` : ''),
          clientEmail: data.email,
          clientName: data.name,
        }),
      })
    } catch (e) {
      console.warn('Calendar block (meeting) failed:', e)
    }

    // 2) Maile
    const ownerEmail = 'kamil@syntance.com'
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@syntance.com`
    const ics = buildICS({
      uid,
      summary: `Rozmowa 30 min — ${data.name}${data.company ? ` (${data.company})` : ''}`,
      description:
        `${data.topic ? `Temat: ${data.topic}\n` : ''}Klient: ${data.name}\nEmail: ${data.email}` +
        (data.source ? `\nŹródło: ${data.source}` : ''),
      startDate: data.date,
      startTime: data.time,
      endDate: end.date,
      endTime: end.time,
      organizerEmail: ownerEmail,
      attendeeEmail: data.email,
      attendeeName: data.name,
    })
    const icsBase64 = Buffer.from(ics, 'utf8').toString('base64')

    const ownerText =
      `Nowa rezerwacja 30-min rozmowy\n\n` +
      `Data: ${dateLabel}\nGodzina: ${data.time} (30 min)\n\n` +
      `Imię: ${data.name}\nEmail: ${data.email}\n` +
      (data.company ? `Firma: ${data.company}\n` : '') +
      (data.topic ? `Temat: ${data.topic}\n` : '') +
      (data.source ? `Źródło: ${data.source}\n` : '')

    const clientHtml = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;border:1px solid #222;">
  <tr><td style="padding:32px;border-bottom:1px solid #222;">
    <h1 style="margin:0;color:#fff;font-size:22px;">Dzięki, ${data.name} — mamy termin</h1>
    <p style="margin:8px 0 0;color:#aaa;">Potwierdzenie rezerwacji 30-min rozmowy z Kamilem.</p>
  </td></tr>
  <tr><td style="padding:24px 32px;color:#ccc;font-size:15px;line-height:1.6;">
    <p><strong style="color:#fff;">${dateLabel}</strong><br/>
    godz. <strong style="color:#fff;">${data.time}</strong> (30 min, strefa czasowa Europe/Warsaw)</p>
    <p>W załączniku znajdziesz plik <code>.ics</code> — kliknij, żeby dodać spotkanie do kalendarza. Link do Google Meet wyślę w potwierdzeniu na Twoim kalendarzu.</p>
    <p>Jak będziesz chciał/a przesunąć termin — wystarczy odpowiedzieć na tego maila.</p>
  </td></tr>
  <tr><td style="padding:24px 32px;background:#0d0d0d;border-top:1px solid #222;color:#666;font-size:12px;">
    Syntance • kamil@syntance.com
  </td></tr>
</table>
</td></tr></table></body></html>`

    await getResend().emails.send({
      from: 'Syntance <kontakt@syntance.com>',
      to: [ownerEmail],
      replyTo: data.email,
      subject: `Nowa rozmowa: ${dateLabel}, ${data.time} — ${data.name}`,
      text: ownerText,
    })

    await getResend().emails.send({
      from: 'Syntance <kontakt@syntance.com>',
      to: [data.email],
      replyTo: ownerEmail,
      subject: `Potwierdzenie rozmowy — ${dateLabel}, ${data.time}`,
      html: clientHtml,
      attachments: [
        {
          filename: 'rozmowa-syntance.ics',
          content: icsBase64,
        },
      ],
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Meeting booking failed:', err)
    return NextResponse.json(
      { ok: false, error: 'Coś poszło nie tak. Napisz bezpośrednio: kamil@syntance.com.' },
      { status: 500 }
    )
  }
}
