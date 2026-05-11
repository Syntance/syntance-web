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

/** ID obiektu „deals” i atrybutu „Deal stage” — z ENV lub z GET /objects/deals/attributes/stage */
export interface AttioDealsStageIds {
  objectId: string
  stageAttributeId: string
}

let dealsStageIdsCache: AttioDealsStageIds | null = null

/**
 * Rozwiązuje UUID potrzebne do webhooka (record.updated / list-entry).
 * Unika zahardkodowanych wartości z innego workspace / środowiska.
 */
export async function getAttioDealsStageIds(): Promise<AttioDealsStageIds | null> {
  const envO = process.env.ATTIO_DEALS_OBJECT_ID?.trim()
  const envA = process.env.ATTIO_DEAL_STAGE_ATTRIBUTE_ID?.trim()
  if (envO && envA) {
    return { objectId: envO, stageAttributeId: envA }
  }
  if (dealsStageIdsCache) return dealsStageIdsCache

  const res = await attioRequest('/objects/deals/attributes/stage', 'GET')
  const id = res?.data?.id as { object_id?: string; attribute_id?: string } | undefined
  const objectId = id?.object_id
  const stageAttributeId = id?.attribute_id
  if (!objectId || !stageAttributeId) {
    console.error('[attio] getAttioDealsStageIds: brak object_id / attribute_id (GET …/attributes/stage)')
    return null
  }
  dealsStageIdsCache = { objectId, stageAttributeId }
  return dealsStageIdsCache
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
 * Znajduje firmę po nazwie lub tworzy rekord Company — do powiązania z dealem.
 */
async function createOrFindCompanyByName(companyName: string): Promise<string | null> {
  const trimmed = companyName.trim()
  if (!trimmed) return null

  const existing = await attioRequest('/objects/companies/records/query', 'POST', {
    filter: { name: trimmed },
    limit: 1,
  })

  if (existing?.data?.[0]?.id?.record_id) {
    return existing.data[0].id.record_id
  }

  const created = await attioRequest('/objects/companies/records', 'POST', {
    data: {
      values: {
        name: [{ value: trimmed }],
      },
    },
  })

  return created?.data?.id?.record_id ?? null
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

  const person = project.contact.name.trim()
  const companyTrimmed = project.contact.companyName?.trim() ?? ''
  const companyRecordId = companyTrimmed ? await createOrFindCompanyByName(companyTrimmed) : null

  // Nazwa deala = numer zlecenia; imię/nazwisko i firma w osobnych polach + Associated company.
  const dealData = await attioRequest('/objects/deals/records', 'POST', {
    data: {
      values: {
        name: [{ value: project.bookingId }],
        // stage: plain status UUID (not wrapped in object)
        stage: STAGE_IDS.oczekujacy,
        // owner: required field
        owner: [{ referenced_actor_type: 'workspace-member', referenced_actor_id: OWNER_MEMBER_ID }],
        associated_people: [{ target_object: 'people', target_record_id: contactId }],
        booking_id: [{ value: project.bookingId }],
        imie_nazwisko_klienta: [{ value: person }],
        ...(companyTrimmed && { nazwa_firmy: [{ value: companyTrimmed }] }),
        ...(companyRecordId && {
          associated_company: [{ target_object: 'companies', target_record_id: companyRecordId }],
        }),
        wartosc_brutto: [{ value: priceBrutto }],
        zaliczka: [{ value: project.deposit }],
        // typ_zlecenia: multiselect — use array of option_id strings
        ...(typOptionId && { typ_zlecenia: [typOptionId] }),
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
    `Numer zlecenia: ${project.bookingId}`,
    `Kontakt z formularza: ${project.contact.name} · ${project.contact.email}${project.contact.phone ? ` · ${project.contact.phone}` : ''}`,
    ...(companyTrimmed ? [`Firma: ${companyTrimmed}`] : []),
    '',
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickSelectFirstTitle(values: Record<string, any[]> | undefined, slug: string): string | undefined {
  const row = values?.[slug]?.[0]
  if (!row) return undefined
  const opt = row.option as { title?: string } | undefined
  if (opt?.title) return opt.title
  if (typeof row.value === 'string') return row.value
  return undefined
}

/** Dopasowanie numeracji zlecenia w polach deala (booking_id i często name = ten sam SYN-…). */
const SYN_ORDER_NUM_RE = /^SYN-(\d+)$/i

/** Numer zlecenia z rekordu deala: najpierw `booking_id`, inaczej `name` jeśli ma format SYN-…. */
function resolveBookingIdFromDealValues(values: Record<string, any[]> | undefined): string | undefined {
  const bid = (pickValue(values, 'booking_id') as string | undefined)?.trim()
  if (bid) return bid
  const name = (pickValue(values, 'name') as string | undefined)?.trim()
  if (name && SYN_ORDER_NUM_RE.test(name)) return name
  return undefined
}

/**
 * Aktualny numer zlecenia z Attio (świeży GET) — używaj przed mailami (umowa / przelew),
 * żeby treść zgadzała się z CRM po ręcznej edycji pola.
 */
export async function fetchCurrentDealBookingId(dealId: string): Promise<string | null> {
  const deal = await attioRequest(`/objects/deals/records/${dealId}`, 'GET')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values = deal?.data?.values as Record<string, any[]> | undefined
  const id = resolveBookingIdFromDealValues(values)
  return id ?? null
}

/**
 * Numer zlecenia z Attio, gdy w linku masz wcześniejszy SYN- (lookup po polu `booking_id`).
 * Gdy rekord nie istnieje pod starym numerem — zwraca `bookingIdFromUrl`.
 */
export async function resolveBookingIdFromAttioLink(bookingIdFromUrl: string): Promise<string> {
  const res = await attioRequest('/objects/deals/records/query', 'POST', {
    filter: { booking_id: bookingIdFromUrl },
    limit: 1,
  })
  const recordId = res?.data?.[0]?.id?.record_id as string | undefined
  if (!recordId) return bookingIdFromUrl
  const live = await fetchCurrentDealBookingId(recordId)
  return live ?? bookingIdFromUrl
}

function maxSynSequenceFromDealValues(values: Record<string, any[]> | undefined): number {
  let max = 0
  if (!values) return max
  for (const slug of ['booking_id', 'name'] as const) {
    const raw = pickValue(values, slug)
    if (typeof raw !== 'string') continue
    const m = raw.trim().match(SYN_ORDER_NUM_RE)
    if (!m) continue
    const n = Number.parseInt(m[1], 10)
    if (!Number.isNaN(n) && n > max) max = n
  }
  return max
}

async function getMaxSynSequenceAmongDeals(): Promise<number> {
  const pageSize = 100
  let offset = 0
  let max = 0
  for (;;) {
    const res = await attioRequest('/objects/deals/records/query', 'POST', {
      limit: pageSize,
      offset,
    })
    const rows = res?.data as Array<{ values?: Record<string, any[]> }> | undefined
    if (!rows?.length) break
    for (const row of rows) {
      const m = maxSynSequenceFromDealValues(row.values)
      if (m > max) max = m
    }
    if (rows.length < pageSize) break
    offset += pageSize
  }
  return max
}

/**
 * Kolejny numer zlecenia SYN-NNNN — wyłącznie z istniejących deali w Attio (CRM jako źródło prawdy).
 * Sanity nie jest tu używane. Przy równoległych żądaniach stosujemy sprawdzanie kolizji po `booking_id`.
 */
export async function getNextOrderNumberFromAttio(): Promise<string> {
  let seq = await getMaxSynSequenceAmongDeals()
  for (let attempt = 0; attempt < 24; attempt++) {
    seq += 1
    const candidate = `SYN-${String(seq).padStart(4, '0')}`
    const clash = await attioRequest('/objects/deals/records/query', 'POST', {
      filter: { booking_id: candidate },
      limit: 1,
    })
    if (!clash?.data?.[0]?.id?.record_id) {
      return candidate
    }
  }
  console.error('[attio] getNextOrderNumberFromAttio: kolizje — fallback czasowy')
  const now = new Date()
  const yy = now.getFullYear().toString().slice(2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const ms = String(now.getTime()).slice(-4)
  return `SYN-${yy}${mm}-${ms}`
}

/**
 * Gdy deal nie ma `booking_id` (np. utworzony ręcznie w Attio), nadaje kolejny SYN-…
 * z istniejących deali i zapisuje `booking_id` + `name` (spójnie z formularzem).
 */
export async function ensureDealHasBookingNumber(
  dealId: string
): Promise<{ bookingId: string; values: Record<string, any[]>; wasNew: boolean } | null> {
  const deal = await attioRequest(`/objects/deals/records/${dealId}`, 'GET')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values = (deal?.data?.values as Record<string, any[]>) ?? null
  if (!values) {
    console.error(`[attio] ensureDealHasBookingNumber: brak deala ${dealId}`)
    return null
  }

  const resolved = resolveBookingIdFromDealValues(values)
  if (resolved) {
    const bidOnly = (pickValue(values, 'booking_id') as string | undefined)?.trim()
    if (!bidOnly) {
      const sync = await attioRequest(`/objects/deals/records/${dealId}`, 'PATCH', {
        data: { values: { booking_id: [{ value: resolved }] } },
      })
      if (!sync?.data?.id?.record_id) {
        console.warn(`[attio] ensureDealHasBookingNumber: sync booking_id z name nieudany ${dealId}`)
      }
      const nextValues: Record<string, any[]> = { ...values, booking_id: [{ value: resolved }] }
      return { bookingId: resolved, values: nextValues, wasNew: false }
    }
    return { bookingId: resolved, values, wasNew: false }
  }

  const bookingId = await getNextOrderNumberFromAttio()
  const updated = await attioRequest(`/objects/deals/records/${dealId}`, 'PATCH', {
    data: {
      values: {
        booking_id: [{ value: bookingId }],
        name: [{ value: bookingId }],
      },
    },
  })
  if (!updated?.data?.id?.record_id) {
    console.error(`[attio] ensureDealHasBookingNumber: PATCH nieudany dla ${dealId}`)
    return null
  }

  const nextValues: Record<string, any[]> = {
    ...values,
    booking_id: [{ value: bookingId }],
    name: [{ value: bookingId }],
  }
  console.log(`[attio] Auto-generated booking_id ${bookingId} for deal ${dealId}`)
  return { bookingId, values: nextValues, wasNew: true }
}

/**
 * Tytuł natywnego etapu deala (Deal stage) — używane przez webhook po record.updated.
 */
export async function getDealNativeStageTitle(dealId: string): Promise<string | undefined> {
  const deal = await attioRequest(`/objects/deals/records/${dealId}`, 'GET')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = (deal?.data?.values as Record<string, any[]> | undefined)?.stage?.[0]
  const title = (row?.status as { title?: string } | undefined)?.title
  if (typeof title !== 'string') return undefined
  return title.normalize('NFC').trim()
}

/** Tytuł wybranej opcji w polu typu select na dealu (slug atrybutu z Attio). */
export async function getDealSelectOptionTitle(
  dealId: string,
  attributeSlug: string,
): Promise<string | undefined> {
  const deal = await attioRequest(`/objects/deals/records/${dealId}`, 'GET')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values = deal?.data?.values as Record<string, any[]> | undefined
  const t = pickSelectFirstTitle(values, attributeSlug)
  return t?.normalize('NFC').trim()
}

/** Ustawia select deala na konkretną opcję (UUID opcji) — np. „Brak” po wysłanym przypomnieniu. */
export async function resetDealSelectToOption(
  dealId: string,
  attributeSlug: string,
  optionId: string,
): Promise<boolean> {
  const res = await attioRequest(`/objects/deals/records/${dealId}`, 'PATCH', {
    data: { values: { [attributeSlug]: [{ option: optionId }] } },
  })
  return !!res?.data?.id?.record_id
}

/**
 * Pobiera dane klienta z pól deala + powiązanej osoby.
 * Jeśli deal nie ma booking_id (klient z poza formularza),
 * generuje nowy numer i zapisuje go w Attio automatycznie.
 */
export async function getClientDataByDealId(dealId: string): Promise<AttioClientData | null> {
  const ensured = await ensureDealHasBookingNumber(dealId)
  if (!ensured) return null
  const { bookingId, values } = ensured

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

  const contactNameFromDeal = pickValue(values, 'imie_nazwisko_klienta') as string | undefined

  if (!email) {
    console.error(`[attio] Person on deal ${bookingId} has no email — add email to the contact in Attio`)
    return null
  }

  const valueNetto = (values.value?.[0]?.currency_value as number) ?? 0

  return {
    email,
    name: fullName || (typeof contactNameFromDeal === 'string' ? contactNameFromDeal.trim() : '') || email,
    phone,
    bookingId,
    projectType: pickSelectFirstTitle(values, 'typ_zlecenia') || 'Projekt',
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
