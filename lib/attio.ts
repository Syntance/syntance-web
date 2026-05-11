// Attio CRM Integration
// Dokumentacja API: https://developers.attio.com/reference/introduction

const ATTIO_API_URL = 'https://api.attio.com/v2'

// Deal stage IDs (native "Deal stage" status attribute)
const STAGE_IDS = {
  oczekujacy: '3f17ccc3-37b7-480c-9e06-20d0744548ad',
  umowa:      '06ad7243-aae8-4f56-987f-2e5cb3c6ce9f',
  zaliczka:   'd4b8427d-8898-47ed-84d5-f8b1b0cc033e',
  aktywny:    'e4794d3f-7535-48bf-8fef-d87131ab140e',
  zakonczony: '040f06c6-5c8a-4b7e-afb6-c4aa4a4c1c3e',
  anulowany:  '6a76ae6a-8b87-43d8-9d08-e4b65f27e7cf',
} as const

// typ_zlecenia select option IDs
const TYP_ZLECENIA_OPTIONS: Record<string, string> = {
  'strona':       '08b18e41-e871-4754-85e2-574342137fab', // Strona WWW
  'sklep':        '41499c07-c2eb-4ef0-b5bf-f2e0b6993587', // Sklep
  'abonament':    '2b02ff6c-be3d-4834-9f77-bdad4792a991', // Abonament
  'aplikacja':    'df51554d-8377-4eeb-86e5-32eec377dbe5', // Aplikacja
}

// Workspace member (deal owner)
const OWNER_MEMBER_ID = '6213f7e1-b35b-498f-840d-ae1126c19d03'

function mapProjectTypeToOptionId(projectType: string): string | null {
  const lower = projectType.toLowerCase()
  if (lower.includes('sklep') || lower.includes('shop') || lower.includes('e-com')) {
    return TYP_ZLECENIA_OPTIONS['sklep']
  }
  if (lower.includes('abonament') || lower.includes('opieka')) {
    return TYP_ZLECENIA_OPTIONS['abonament']
  }
  if (lower.includes('aplikacja') || lower.includes('app')) {
    return TYP_ZLECENIA_OPTIONS['aplikacja']
  }
  if (lower.includes('strona') || lower.includes('www') || lower.includes('web')) {
    return TYP_ZLECENIA_OPTIONS['strona']
  }
  return null
}

export interface AttioClientData {
  email: string
  name: string
  phone?: string
  bookingId: string
  projectType: string
  priceNetto: number
  priceBrutto: number
  deposit: number
  days: number
  description?: string
  hasExistingSite?: boolean
  existingSiteUrl?: string
}

interface AttioContact {
  name: string
  email: string
  phone?: string
  companyName?: string
}

interface AttioProject {
  name: string
  contact: AttioContact
  value: number
  status: 'pending' | 'confirmed' | 'rejected' | 'in_progress' | 'completed'
  days: number
  deposit: number
  bookingId: string
  items: string[]
  complexity: string
  description?: string
  hasExistingSite?: boolean
  existingSiteUrl?: string
}

interface AttioRecordResponse {
  id: { record_id: string }
  created_at: string
}

async function attioRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const apiKey = process.env.ATTIO_API_KEY
  if (!apiKey) {
    console.warn('ATTIO_API_KEY not configured — skipping Attio integration')
    return null
  }

  try {
    const response = await fetch(`${ATTIO_API_URL}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(8_000),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`Attio API error (${response.status}):`, error)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Attio API request failed:', error)
    return null
  }
}

async function createOrUpdateContact(contact: AttioContact): Promise<string | null> {
  // Attio API v2: email filter accepts plain string match on email_addresses slug.
  // Old `{ any: { email_address: ... } }` shape returns 400 "Failed to transform constraints".
  const existing = await attioRequest('/objects/people/records/query', 'POST', {
    filter: { email_addresses: contact.email },
    limit: 1,
  })

  if (existing?.data?.[0]?.id?.record_id) {
    return existing.data[0].id.record_id
  }

  // Attio API v2 format:
  // - email_addresses: { email_address } only (no attribute_type)
  // - phone_numbers: { original_phone_number } (not phone_number)
  // - personal-name type cannot be written via /records POST; we patch job_title instead
  const newContact = await attioRequest('/objects/people/records', 'POST', {
    data: {
      values: {
        email_addresses: [{ email_address: contact.email }],
        ...(contact.phone && {
          phone_numbers: [{ original_phone_number: contact.phone }],
        }),
      },
    },
  })

  const personId = newContact?.data?.id?.record_id
  if (!personId) return null

  // Set display name via job_title (text field) so we can identify the client in Attio UI
  if (contact.name) {
    await attioRequest(`/objects/people/records/${personId}`, 'PATCH', {
      data: { values: { job_title: [{ value: contact.name }] } },
    })
  }

  return personId
}

/**
 * Tworzy deal w Attio z pełnymi danymi klienta.
 * Dane do emaili są zapisywane w notatce JSON (nie wymagają custom fields).
 */
export async function createProject(project: AttioProject): Promise<AttioRecordResponse | null> {
  const contactId = await createOrUpdateContact(project.contact)
  if (!contactId) {
    console.error(`[attio] Failed to create/get contact for ${project.contact.email} (booking ${project.bookingId})`)
    return null
  }

  const priceBrutto = Math.round(project.value * 1.23)
  const today = new Date().toISOString().slice(0, 10)
  const cleanUrl = project.existingSiteUrl?.trim() || ''
  const typOptionId = mapProjectTypeToOptionId(project.name)

  // Tytuł deala w Attio: tylko firma albo imię i nazwisko — numer zlecenia jest w polu booking_id.
  const company = project.contact.companyName?.trim()
  const person = project.contact.name.trim()
  const dealTitle = company || person || 'Nowe zapytanie'

  const dealData = await attioRequest('/objects/deals/records', 'POST', {
    data: {
      values: {
        name: [{ value: dealTitle }],
        // stage: plain status UUID (not wrapped in object)
        stage: STAGE_IDS.oczekujacy,
        // owner: required field
        owner: [{ referenced_actor_type: 'workspace-member', referenced_actor_id: OWNER_MEMBER_ID }],
        associated_people: [{ target_object: 'people', target_record_id: contactId }],
        booking_id: [{ value: project.bookingId }],
        wartosc_brutto: [{ value: priceBrutto }],
        zaliczka: [{ value: project.deposit }],
        // typ_zlecenia: multiselect — use array of option_id strings
        ...(typOptionId && { typ_zlecenia: [typOptionId] }),
        data_zapytania: [{ value: today }],
        ...(project.contact.companyName && { nazwa_firmy: [{ value: project.contact.companyName }] }),
        ...(project.description && { opis_potrzeb: [{ value: project.description }] }),
        ...(cleanUrl && { istniejaca_strona_url: [{ value: cleanUrl }] }),
      },
    },
  })

  const dealId = dealData?.data?.id?.record_id
  if (!dealId) return null

  // ── Notatka czytelna dla człowieka ──────────────────────────────────────
  const lines = [
    `Typ projektu: ${project.name}`,
    `Wartość: ${project.value.toLocaleString('pl-PL')} PLN netto`,
    `Zaliczka: ${project.deposit.toLocaleString('pl-PL')} PLN`,
    `Złożoność: ${project.complexity}`,
    `Czas realizacji: ${project.days} dni roboczych`,
    '',
    ...(project.description ? [`Opis potrzeb:\n${project.description}`, ''] : []),
    ...(project.hasExistingSite
      ? [`Istniejąca strona: TAK${project.existingSiteUrl ? `\nURL: ${project.existingSiteUrl}` : ''}`]
      : ['Istniejąca strona: NIE']),
    '',
    `Elementy:\n${project.items.map((i, n) => `${n + 1}. ${i}`).join('\n')}`,
  ]

  await attioRequest('/notes', 'POST', {
    data: {
      parent_object: 'deals',
      parent_record_id: dealId,
      title: 'Szczegóły zapytania',
      content: lines.join('\n'),
      format: 'plaintext',
    },
  })

  return dealData?.data
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickValue(values: Record<string, any[]> | undefined, slug: string): unknown {
  return values?.[slug]?.[0]?.value
}

/**
 * Pobiera dane klienta z pól deala + powiązanej osoby.
 * Jeśli deal nie ma booking_id (klient z poza formularza),
 * generuje nowy numer i zapisuje go w Attio automatycznie.
 */
export async function getClientDataByDealId(dealId: string): Promise<AttioClientData | null> {
  const deal = await attioRequest(`/objects/deals/records/${dealId}`, 'GET')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values = (deal?.data?.values as Record<string, any[]>) ?? {}

  // ── Booking ID — generuj jeśli brak (ręcznie stworzony deal) ────────────
  let bookingId = pickValue(values, 'booking_id') as string | undefined
  if (!bookingId) {
    const { getNextOrderNumber } = await import('@/sanity/queries/orderCounter')
    bookingId = await getNextOrderNumber()
    // Zapisz wygenerowany numer z powrotem do deala w Attio
    await attioRequest(`/objects/deals/records/${dealId}`, 'PATCH', {
      data: { values: { booking_id: [{ value: bookingId }] } },
    })
    console.log(`[attio] Auto-generated booking_id ${bookingId} for deal ${dealId}`)
  }

  // ── Powiązana osoba (klient) ─────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const personRef = (values.associated_people as any[])?.[0]
  const personId = personRef?.target_record_id
  if (!personId) {
    console.error(`[attio] Deal ${dealId} (${bookingId}) has no associated person — add a contact in Attio`)
    return null
  }

  const person = await attioRequest(`/objects/people/records/${personId}`, 'GET')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const personValues = (person?.data?.values as Record<string, any[]>) ?? {}

  const email = personValues.email_addresses?.[0]?.email_address as string | undefined
  const fullName = (personValues.name?.[0]?.full_name
    ?? personValues.job_title?.[0]?.value) as string | undefined
  const phone = personValues.phone_numbers?.[0]?.original_phone_number as string | undefined

  if (!email) {
    console.error(`[attio] Person on deal ${bookingId} has no email — add email to the contact in Attio`)
    return null
  }

  const valueNetto = (values.value?.[0]?.currency_value as number) ?? 0

  return {
    email,
    name: fullName || email,
    phone,
    bookingId,
    projectType: (pickValue(values, 'typ_zlecenia') as string) || 'Projekt',
    priceNetto: valueNetto,
    priceBrutto: (pickValue(values, 'wartosc_brutto') as number) || Math.round(valueNetto * 1.23),
    deposit: (pickValue(values, 'zaliczka') as number) || 0,
    days: 0,
    description: (pickValue(values, 'opis_potrzeb') as string) || undefined,
    existingSiteUrl: (pickValue(values, 'istniejaca_strona_url') as string) || undefined,
    hasExistingSite: !!pickValue(values, 'istniejaca_strona_url'),
  }
}

/**
 * Aktualizuje status deala w Attio.
 */
export async function updateProjectStatus(
  bookingId: string,
  status: 'pending' | 'confirmed' | 'rejected' | 'in_progress' | 'completed'
): Promise<boolean> {
  const projects = await attioRequest('/objects/deals/records/query', 'POST', {
    filter: { booking_id: bookingId },
    limit: 1,
  })

  const projectId = projects?.data?.[0]?.id?.record_id
  if (!projectId) {
    console.warn(`Project ${bookingId} not found in Attio`)
    return false
  }

  const STATUS_MAP: Record<string, string> = {
    pending:     STAGE_IDS.oczekujacy,
    confirmed:   STAGE_IDS.umowa,
    rejected:    STAGE_IDS.anulowany,
    in_progress: STAGE_IDS.aktywny,
    completed:   STAGE_IDS.zakonczony,
  }
  const statusId = STATUS_MAP[status]
  if (!statusId) return false

  const updated = await attioRequest(`/objects/deals/records/${projectId}`, 'PATCH', {
    data: { values: { stage: statusId } },
  })

  return !!updated
}

/**
 * Dodaje notatkę do deala.
 */
export async function addProjectNote(
  bookingId: string,
  title: string,
  content: string
): Promise<boolean> {
  const projects = await attioRequest('/objects/deals/records/query', 'POST', {
    filter: { booking_id: bookingId },
    limit: 1,
  })

  const projectId = projects?.data?.[0]?.id?.record_id
  if (!projectId) return false

  const note = await attioRequest('/notes', 'POST', {
    data: {
      parent_object: 'deals',
      parent_record_id: projectId,
      title,
      content,
      format: 'plaintext',
    },
  })

  return !!note
}
