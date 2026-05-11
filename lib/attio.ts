// Attio CRM Integration
// Dokumentacja API: https://developers.attio.com/reference/introduction

const ATTIO_API_URL = 'https://api.attio.com/v2'

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
  const existing = await attioRequest('/objects/people/records/query', 'POST', {
    filter: { email_addresses: { any: { email_address: contact.email } } },
    limit: 1,
  })

  if (existing?.data?.[0]?.id?.record_id) {
    return existing.data[0].id.record_id
  }

  const newContact = await attioRequest('/objects/people/records', 'POST', {
    data: {
      values: {
        name: [{ value: contact.name }],
        email_addresses: [{ email_address: contact.email, attribute_type: 'work' }],
        ...(contact.phone && {
          phone_numbers: [{ phone_number: contact.phone, attribute_type: 'work' }],
        }),
      },
    },
  })

  return newContact?.data?.id?.record_id || null
}

/**
 * Tworzy deal w Attio z pełnymi danymi klienta.
 * Dane do emaili są zapisywane w notatce JSON (nie wymagają custom fields).
 */
export async function createProject(project: AttioProject): Promise<AttioRecordResponse | null> {
  const contactId = await createOrUpdateContact(project.contact)
  if (!contactId) {
    console.error('Failed to create/get contact for project')
    return null
  }

  // stage ID dla "Oczekujący" — nowe zapytanie z formularza
  const STAGE_OCZEKUJACY = '3f17ccc3-37b7-480c-9e06-20d0744548ad'

  const priceBrutto = Math.round(project.value * 1.23)
  const today = new Date().toISOString().slice(0, 10)
  const cleanUrl = project.existingSiteUrl?.trim() || ''

  const dealData = await attioRequest('/objects/deals/records', 'POST', {
    data: {
      values: {
        name: [{ value: `${project.bookingId} — ${project.contact.name}` }],
        stage: [{ status_id: STAGE_OCZEKUJACY }],
        value: [{ value: project.value, currency_code: 'PLN' }],
        associated_people: [{ target_object: 'people', target_record_id: contactId }],
        booking_id: [{ value: project.bookingId }],
        wartosc_brutto: [{ value: priceBrutto }],
        zaliczka: [{ value: project.deposit }],
        typ_zlecenia: [{ value: project.name }],
        data_zapytania: [{ value: today }],
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
  const fullName = personValues.name?.[0]?.full_name as string | undefined
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
    filter: { booking_id: { equals: bookingId } },
    limit: 1,
  })

  const projectId = projects?.data?.[0]?.id?.record_id
  if (!projectId) {
    console.warn(`Project ${bookingId} not found in Attio`)
    return false
  }

  // Mapowanie na status_id (natywne pole stage w Attio)
  const STAGE_IDS: Record<string, string> = {
    pending:    '3f17ccc3-37b7-480c-9e06-20d0744548ad', // Oczekujący
    confirmed:  '06ad7243-aae8-4f56-987f-2e5cb3c6ce9f', // Umowa
    rejected:   '6a76ae6a-8b87-43d8-9d08-e4b65f27e7cf', // Anulowany
    in_progress: 'e4794d3f-7535-48bf-8fef-d87131ab140e', // Aktywny
    completed:  '040f06c6-5c8a-4b7e-afb6-c4aa4a4c1c3e', // Zakończony
  }
  const statusId = STAGE_IDS[status]
  if (!statusId) return false

  const updated = await attioRequest(`/objects/deals/records/${projectId}`, 'PATCH', {
    data: { values: { stage: [{ status_id: statusId }] } },
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
    filter: { booking_id: { equals: bookingId } },
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
