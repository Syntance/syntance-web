import { google, calendar_v3 } from 'googleapis'

/**
 * Integracja z Google Calendar dla Google Workspace.
 *
 * Zakłada service account z włączonym "domain-wide delegation":
 * 1. Utwórz service account w GCP, wygeneruj klucz JSON.
 * 2. W Google Workspace Admin Console → Security → API Controls → Domain-wide Delegation
 *    dodaj client_id service accountu z zakresem:
 *      https://www.googleapis.com/auth/calendar
 * 3. Ustaw zmienne środowiskowe:
 *    - GOOGLE_CLIENT_EMAIL
 *    - GOOGLE_PRIVATE_KEY (z "\n" zamiast realnych newlinów)
 *    - GOOGLE_CALENDAR_USER (np. "kamil@syntance.com") — impersonation subject
 *    - GOOGLE_CALENDAR_ID (np. "primary" lub dokładny kalendarz)
 */

const CALENDAR_SCOPES = ['https://www.googleapis.com/auth/calendar']

function hasCredentials(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY)
}

function getCalendarClient(): calendar_v3.Calendar {
  if (!hasCredentials()) {
    throw new Error('Google Calendar credentials not configured')
  }

  const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n')
  const subject = process.env.GOOGLE_CALENDAR_USER // impersonate (Workspace)

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: privateKey,
    scopes: CALENDAR_SCOPES,
    subject,
  })

  return google.calendar({ version: 'v3', auth })
}

export function getCalendarId(): string {
  return process.env.GOOGLE_CALENDAR_ID || 'primary'
}

export interface BusyInterval {
  start: string // ISO
  end: string // ISO
}

/** Zwraca busy intervals w zakresie [timeMin, timeMax). Pusta tablica, jeśli brak credsów. */
export async function getBusyIntervals(timeMin: Date, timeMax: Date): Promise<BusyInterval[]> {
  if (!hasCredentials()) return []

  try {
    const calendar = getCalendarClient()
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        timeZone: 'Europe/Warsaw',
        items: [{ id: getCalendarId() }],
      },
    })
    const busy = response.data.calendars?.[getCalendarId()]?.busy ?? []
    const result: BusyInterval[] = []
    for (const b of busy) {
      if (b.start && b.end) result.push({ start: b.start, end: b.end })
    }
    return result
  } catch (err) {
    console.error('Google Calendar freebusy error:', err)
    return []
  }
}

export interface CreatedEvent {
  id: string
  htmlLink?: string
  meetLink?: string
  calendarId: string
}

export async function createMeetingEvent(params: {
  summary: string
  description: string
  startIso: string // ISO with timezone info
  endIso: string
  attendeeEmail: string
  attendeeName?: string
  createMeetLink?: boolean
}): Promise<CreatedEvent | null> {
  if (!hasCredentials()) {
    console.warn('Google Calendar not configured, skipping event creation')
    return null
  }

  const calendar = getCalendarClient()
  const calendarId = getCalendarId()

  const requestBody: calendar_v3.Schema$Event = {
    summary: params.summary,
    description: params.description,
    start: { dateTime: params.startIso, timeZone: 'Europe/Warsaw' },
    end: { dateTime: params.endIso, timeZone: 'Europe/Warsaw' },
    attendees: [
      {
        email: params.attendeeEmail,
        displayName: params.attendeeName,
        responseStatus: 'needsAction',
      },
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 60 },
        { method: 'popup', minutes: 15 },
      ],
    },
    transparency: 'opaque',
  }

  if (params.createMeetLink) {
    requestBody.conferenceData = {
      createRequest: {
        requestId: `meet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    }
  }

  const result = await calendar.events.insert({
    calendarId,
    requestBody,
    conferenceDataVersion: params.createMeetLink ? 1 : 0,
    sendUpdates: 'all',
  })

  const data = result.data
  return {
    id: data.id ?? '',
    htmlLink: data.htmlLink ?? undefined,
    meetLink: data.hangoutLink ?? data.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri ?? undefined,
    calendarId,
  }
}

export async function cancelEvent(eventId: string): Promise<boolean> {
  if (!hasCredentials()) return false
  try {
    const calendar = getCalendarClient()
    await calendar.events.delete({
      calendarId: getCalendarId(),
      eventId,
      sendUpdates: 'all',
    })
    return true
  } catch (err) {
    console.error('Google Calendar delete event error:', err)
    return false
  }
}
