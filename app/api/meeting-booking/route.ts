import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { getAvailableSlotsForDate, warsawSlotToIso } from '@/lib/booking-slots'
import { createMeetingEvent } from '@/lib/google-calendar'
import { createBooking, getBookingRules } from '@/lib/sanity/booking'

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

function toIcsStamp(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  )
}

function buildICS(params: {
  uid: string
  summary: string
  description: string
  startIso: string
  endIso: string
  organizerEmail: string
  attendeeEmail: string
  attendeeName: string
  meetLink?: string
}): string {
  const dtstart = toIcsStamp(new Date(params.startIso))
  const dtend = toIcsStamp(new Date(params.endIso))
  const dtstamp = toIcsStamp(new Date())
  const desc = [params.description, params.meetLink ? `Google Meet: ${params.meetLink}` : '']
    .filter(Boolean)
    .join('\\n\\n')

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
    `DESCRIPTION:${desc}`,
    `ORGANIZER;CN=Syntance:mailto:${params.organizerEmail}`,
    `ATTENDEE;CN=${params.attendeeName};RSVP=TRUE:mailto:${params.attendeeEmail}`,
    ...(params.meetLink ? [`URL:${params.meetLink}`] : []),
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

    // Weryfikuj, że slot nadal jest wolny (ochrona przed race conditions)
    const day = await getAvailableSlotsForDate(data.date)
    const slotOk = day.slots.some((s) => s.time === data.time)
    if (!slotOk) {
      return NextResponse.json(
        { ok: false, error: 'Ten termin jest już zajęty. Wybierz inny.' },
        { status: 409 }
      )
    }

    const rules = await getBookingRules()
    const startIso = warsawSlotToIso(data.date, data.time)
    const endIso = new Date(new Date(startIso).getTime() + rules.slotMinutes * 60 * 1000).toISOString()
    const dateLabel = polishDate(data.date)
    const summary = `Rozmowa ${rules.slotMinutes} min — ${data.name}${data.company ? ` (${data.company})` : ''}`
    const description =
      [
        data.topic ? `Temat: ${data.topic}` : null,
        `Klient: ${data.name}`,
        `Email: ${data.email}`,
        data.company ? `Firma: ${data.company}` : null,
        data.source ? `Źródło: ${data.source}` : null,
      ]
        .filter(Boolean)
        .join('\n')

    // 1) Tworzymy wydarzenie w Google Calendar (z Meet i zaproszeniem klienta)
    let googleEvent: Awaited<ReturnType<typeof createMeetingEvent>> = null
    try {
      googleEvent = await createMeetingEvent({
        summary,
        description,
        startIso,
        endIso,
        attendeeEmail: data.email,
        attendeeName: data.name,
        createMeetLink: true,
      })
    } catch (err) {
      console.error('Google Calendar event insert failed:', err)
    }

    // 2) Zapis do Sanity (jako źródło prawdy dla dashboardu)
    let sanityId: string | undefined
    try {
      const doc = await createBooking({
        status: 'confirmed',
        startAt: startIso,
        endAt: endIso,
        name: data.name,
        email: data.email,
        company: data.company,
        topic: data.topic,
        source: data.source,
        meetLink: googleEvent?.meetLink,
        googleEventId: googleEvent?.id,
        googleCalendarId: googleEvent?.calendarId,
        createdAt: new Date().toISOString(),
      })
      sanityId = doc._id
    } catch (err) {
      console.error('Sanity booking save failed:', err)
    }

    // 3) Maile (Resend) + ICS
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@syntance.com`
    const ics = buildICS({
      uid,
      summary,
      description,
      startIso,
      endIso,
      organizerEmail: 'kamil@syntance.com',
      attendeeEmail: data.email,
      attendeeName: data.name,
      meetLink: googleEvent?.meetLink,
    })
    const icsBase64 = Buffer.from(ics, 'utf8').toString('base64')

    const ownerText =
      `Nowa rezerwacja ${rules.slotMinutes}-min rozmowy\n\n` +
      `Data: ${dateLabel}\n` +
      `Godzina: ${data.time} (${rules.slotMinutes} min)\n\n` +
      `Imię: ${data.name}\nEmail: ${data.email}\n` +
      (data.company ? `Firma: ${data.company}\n` : '') +
      (data.topic ? `Temat: ${data.topic}\n` : '') +
      (data.source ? `Źródło: ${data.source}\n` : '') +
      (googleEvent ? `\nGoogle Calendar: ${googleEvent.htmlLink ?? '(bez linku)'}` : '\n(⚠ event nie został dodany do kalendarza — sprawdź credentiale)') +
      (googleEvent?.meetLink ? `\nMeet: ${googleEvent.meetLink}` : '') +
      (sanityId ? `\nSanity ID: ${sanityId}` : '')

    const clientHtml = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;border:1px solid #222;">
  <tr><td style="padding:32px;border-bottom:1px solid #222;">
    <h1 style="margin:0;color:#fff;font-size:22px;">Dzięki, ${data.name} — mamy termin</h1>
    <p style="margin:8px 0 0;color:#aaa;">Potwierdzenie rezerwacji ${rules.slotMinutes}-min rozmowy z Kamilem.</p>
  </td></tr>
  <tr><td style="padding:24px 32px;color:#ccc;font-size:15px;line-height:1.6;">
    <p><strong style="color:#fff;">${dateLabel}</strong><br/>
    godz. <strong style="color:#fff;">${data.time}</strong> (${rules.slotMinutes} min, Europe/Warsaw)</p>
    ${
      googleEvent?.meetLink
        ? `<p>Link do Google Meet: <a href="${googleEvent.meetLink}" style="color:#a78bfa;">${googleEvent.meetLink}</a><br/>
           (otrzymasz też zaproszenie w kalendarzu)</p>`
        : `<p>W załączniku znajdziesz plik <code>.ics</code> — kliknij, żeby dodać spotkanie do kalendarza.</p>`
    }
    <p>Chcesz przesunąć / odwołać? Wystarczy odpowiedzieć na tego maila.</p>
  </td></tr>
  <tr><td style="padding:24px 32px;background:#0d0d0d;border-top:1px solid #222;color:#666;font-size:12px;">
    Syntance • kamil@syntance.com
  </td></tr>
</table>
</td></tr></table></body></html>`

    const ownerEmail = 'kamil@syntance.com'

    // Powiadomienie do Ciebie (zawsze — nawet gdy GCal padł)
    await getResend().emails.send({
      from: 'Syntance <kontakt@syntance.com>',
      to: [ownerEmail],
      replyTo: data.email,
      subject: `Nowa rozmowa: ${dateLabel}, ${data.time} — ${data.name}`,
      text: ownerText,
    })

    // Potwierdzenie klienta — z ICS fallbackiem. Jeśli Google wysłał zaproszenie
    // (sendUpdates: 'all'), klient i tak dostanie osobne zaproszenie z kalendarza.
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

    return NextResponse.json({
      ok: true,
      bookingId: sanityId,
      meetLink: googleEvent?.meetLink,
    })
  } catch (err) {
    console.error('Meeting booking failed:', err)
    return NextResponse.json(
      { ok: false, error: 'Coś poszło nie tak. Napisz bezpośrednio: kamil@syntance.com.' },
      { status: 500 }
    )
  }
}
