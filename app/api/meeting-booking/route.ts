import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { getAvailableSlotsForDate, warsawSlotToIso } from '@/lib/booking-slots'
import { createMeetingEvent } from '@/lib/google-calendar'
import { createBooking, getBookingRules } from '@/lib/sanity/booking'
import { getEmailTemplates } from '@/sanity/queries/emailTemplates'
import {
  renderMeetingBookingClientEmail,
  renderMeetingBookingOwnerPlain,
} from '@/lib/emails/templates'

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

    const emailTemplates = await getEmailTemplates()
    const ownerPayload = {
      name: data.name,
      email: data.email,
      meetingDateLabel: dateLabel,
      meetingTime: data.time,
      slotMinutes: rules.slotMinutes,
      company: data.company,
      topic: data.topic,
      source: data.source,
      calendarLine: googleEvent
        ? `\nGoogle Calendar: ${googleEvent.htmlLink ?? '(bez linku)'}`
        : '\n(⚠ event nie został dodany do kalendarza — sprawdź credentiale)',
      meetLine: googleEvent?.meetLink ? `\nMeet: ${googleEvent.meetLink}` : '',
      sanityLine: sanityId ? `\nSanity ID: ${sanityId}` : '',
    }
    const ownerRendered = renderMeetingBookingOwnerPlain(ownerPayload, emailTemplates)

    const clientRendered = renderMeetingBookingClientEmail(
      {
        name: data.name,
        meetingDateLabel: dateLabel,
        meetingTime: data.time,
        slotMinutes: rules.slotMinutes,
        meetLink: googleEvent?.meetLink,
      },
      emailTemplates,
    )

    const ownerEmail = 'kamil@syntance.com'

    // Powiadomienie do Ciebie (zawsze — nawet gdy GCal padł)
    await getResend().emails.send({
      from: 'Syntance <kontakt@syntance.com>',
      to: [ownerEmail],
      replyTo: data.email,
      subject: ownerRendered.subject,
      text: ownerRendered.text,
    })

    // Potwierdzenie klienta — z ICS fallbackiem. Jeśli Google wysłał zaproszenie
    // (sendUpdates: 'all'), klient i tak dostanie osobne zaproszenie z kalendarza.
    await getResend().emails.send({
      from: 'Syntance <kontakt@syntance.com>',
      to: [data.email],
      replyTo: ownerEmail,
      subject: clientRendered.subject,
      html: clientRendered.html,
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
      { ok: false, error: 'Coś poszło nie tak. Napisz na kontakt@syntance.com lub zadzwoń — odpiszemy z zespołu.' },
      { status: 500 }
    )
  }
}
