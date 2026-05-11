// Attio CRM Integration
// Dokumentacja API: https://developers.attio.com/reference/introduction

const ATTIO_API_URL = 'https://api.attio.com/v2'

// Klucz tej notatki identyfikuje nasze dane systemowe (nie zmieniaj)
const SYSTEM_NOTE_TITLE = '[[SYNTANCE_DATA]]'

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

  const statusLabel = {
    pending: 'Nowe zapytanie',
    confirmed: 'Zaakceptowane',
    rejected: 'Odrzucone',
    in_progress: 'W realizacji',
    completed: 'Zakończone',
  }[project.status]

  const dealData = await attioRequest('/objects/deals/records', 'POST', {
    data: {
      values: {
        name: [{ value: `${project.bookingId} — ${project.contact.name}` }],
        etap_zlecenia: [{ value: statusLabel }],
        value: [{ value: project.value, currency_code: 'PLN' }],
        people: [{ referenced_actor_type: 'person-reference', referenced_actor_id: contactId }],
      },
    },
  })

  const dealId = dealData?.data?.id?.record_id
  if (!dealId) return null

  // ── Notatka z danymi systemowymi (JSON) — używana przez webhook do wysyłki emaili ──
  const clientData: AttioClientData = {
    email: project.contact.email,
    name: project.contact.name,
    phone: project.contact.phone,
    bookingId: project.bookingId,
    projectType: project.name,
    priceNetto: project.value,
    priceBrutto: Math.round(project.value * 1.23),
    deposit: project.deposit,
    days: project.days,
    description: project.description,
    hasExistingSite: project.hasExistingSite,
    existingSiteUrl: project.existingSiteUrl,
  }

  await attioRequest('/notes', 'POST', {
    data: {
      parent_object: 'deals',
      parent_record_id: dealId,
      title: SYSTEM_NOTE_TITLE,
      content: JSON.stringify(clientData),
      format: 'plaintext',
    },
  })

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

/**
 * Pobiera dane klienta z notatki JSON przypiętej do deala.
 * Używane przez webhook Attio do wysyłki emaili po zmianie statusu.
 */
export async function getClientDataByDealId(dealId: string): Promise<AttioClientData | null> {
  const notes = await attioRequest(`/notes?parent_object=deals&parent_record_id=${dealId}&limit=50`, 'GET')

  if (!notes?.data) return null

  for (const note of notes.data) {
    if (note.data?.title === SYSTEM_NOTE_TITLE) {
      try {
        return JSON.parse(note.data.content_plaintext ?? note.data.content ?? '') as AttioClientData
      } catch {
        console.error('Failed to parse Attio system note JSON')
        return null
      }
    }
  }

  return null
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

  const statusLabel = {
    pending: 'Nowe zapytanie',
    confirmed: 'Zaakceptowane',
    rejected: 'Odrzucone',
    in_progress: 'W realizacji',
    completed: 'Zakończone',
  }[status]

  const updated = await attioRequest(`/objects/deals/records/${projectId}`, 'PATCH', {
    data: { values: { etap_zlecenia: [{ value: statusLabel }] } },
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
