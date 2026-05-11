import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { Resend } from 'resend'
import {
  ensureDealHasBookingNumber,
  fetchCurrentDealBookingId,
  getClientDataByDealId,
  getDealNativeStageTitle,
  getAttioDealsStageIds,
  type AttioClientData,
} from '@/lib/attio'
import { getPaymentSettings } from '@/sanity/queries/paymentSettings'
import { getContractFiles } from '@/sanity/queries/contractFiles'
import { getEmailTemplates } from '@/sanity/queries/emailTemplates'
import {
  renderContractsEmail,
  renderPaymentEmail,
  renderProjectKickoffEmail,
  renderRejectionEmail,
} from '@/lib/emails/templates'

// ─── Mapowanie natywnego Status (stage) → akcja emailowa ──────────────────
// Pole: stage (system status) na obiekcie deals — to co widzisz w Attio UI
const STATUS_ACTIONS: Record<string, 'contracts' | 'payment' | 'kickoff' | 'reject'> = {
  'Umowa':     'contracts',  // → wyślij umowy PDF
  'Zaliczka':  'payment',    // → wyślij dane bankowe (IBAN)
  /** Po wpłacie zaliczki — potwierdzenie startu (tytuł etapu musi być 1:1 jak w Attio). */
  'Aktywny': 'kickoff',
  'Realizacja': 'kickoff',
  'W realizacji': 'kickoff',
  'Anulowany': 'reject',     // → wyślij email o odrzuceniu
  // Oczekujący / Zakończony — bez emaila (uwaga: wiele etapów → kickoff może wysłać mail wielokrotnie przy kolejnych ruchach)
}

/**
 * Opcjonalnie: dodatkowe UUID kolumn etapu na listach (gdy ≠ natywny stage deala).
 * Zwykle niepotrzebne — ta sama kolumna „Deal stage” na kanbanie ma często ten sam
 * attribute_id co GET /objects/deals/attributes/stage.
 */
const LIST_STAGE_ATTRIBUTE_IDS = (process.env.ATTIO_LIST_STAGE_ATTRIBUTE_IDS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

let resend: Resend | null = null
function requireResend(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  if (!resend) resend = new Resend(key)
  return resend
}

// ─── HMAC weryfikacja podpisu Attio ────────────────────────────────────────
function verifyAttioSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.ATTIO_WEBHOOK_SECRET
  if (!secret) {
    // Bez skonfigurowanego sekretu — przyjmuj (tylko dev!)
    console.warn('[attio-webhook] ATTIO_WEBHOOK_SECRET not set — skipping signature check')
    return true
  }
  if (!signature) return false

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  const sig = signature.trim().toLowerCase()
  const exp = expected.toLowerCase()
  try {
    return timingSafeEqual(Buffer.from(sig, 'utf8'), Buffer.from(exp, 'utf8'))
  } catch {
    return false
  }
}

type V2Event = {
  event_type?: string
  id?: {
    workspace_id?: string
    object_id?: string
    record_id?: string
    attribute_id?: string
    list_id?: string
    entry_id?: string
  }
  parent_object_id?: string
  parent_record_id?: string
  actor?: unknown
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature =
    req.headers.get('Attio-Signature') ??
    req.headers.get('X-Attio-Signature') ??
    req.headers.get('x-attio-signature')

  if (!verifyAttioSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // ── Attio V2: { webhook_id, events: [...] } ──────────────────────────────
  const events = payload.events as V2Event[] | undefined
  if (Array.isArray(events) && events.length > 0) {
    const results: Record<string, unknown>[] = []
    let httpStatus = 200
    for (const ev of events) {
      const r = await processV2Event(ev)
      results.push(r)
      if ('error' in r && r.error) httpStatus = 500
    }
    return NextResponse.json({ ok: httpStatus === 200, results }, { status: httpStatus })
  }

  // ── Legacy (stary kształt body — zachowany na wszelki wypadek) ─────────
  return processLegacyAttioPayload(payload)
}

function actionForStageTitle(
  title: string | undefined,
): 'contracts' | 'payment' | 'kickoff' | 'reject' | undefined {
  if (!title) return undefined
  const k = title.normalize('NFC').trim().replace(/\u00a0/g, ' ')
  return STATUS_ACTIONS[k]
}

/** Świeży numer zlecenia z CRM tuż przed mailem (umowa / przelew / odrzucenie). */
async function mergeFreshBookingId(dealRecordId: string, data: AttioClientData): Promise<AttioClientData> {
  const live = await fetchCurrentDealBookingId(dealRecordId)
  if (!live || live === data.bookingId) return data
  return { ...data, bookingId: live }
}

/** Attio V2: record.created / record.updated / list-entry.updated */
async function processV2Event(event: V2Event): Promise<Record<string, unknown>> {
  const meta = await getAttioDealsStageIds()
  if (!meta) {
    return {
      error:
        'Brak mapowania Attio (ATTIO_API_KEY lub GET /objects/deals/attributes/stage); sprawdź logi',
    }
  }

  const eventType = event.event_type ?? ''
  const id = event.id ?? {}

  if (eventType === 'record.created') {
    const objectId = id.object_id
    const recordId = id.record_id
    if (!objectId || !recordId) {
      return { skipped: 'record.created: brak object_id / record_id' }
    }
    if (objectId !== meta.objectId) {
      return { skipped: 'record.created: nie jest to obiekt deals', gotObjectId: objectId }
    }
    const result = await ensureDealHasBookingNumber(recordId)
    if (!result) {
      return { error: 'record.created: nie udało się nadać numeru zlecenia', dealRecordId: recordId }
    }
    return {
      ok: true,
      event: 'record.created',
      bookingId: result.bookingId,
      assigned: result.wasNew,
    }
  }

  if (eventType === 'record.updated') {
    const objectId = id.object_id
    const recordId = id.record_id
    const attributeId = id.attribute_id
    if (!objectId || !recordId || !attributeId) {
      return { skipped: 'record.updated: brak object_id / record_id / attribute_id' }
    }
    if (objectId !== meta.objectId) {
      return { skipped: 'record.updated: nie jest to obiekt deals', gotObjectId: objectId }
    }
    if (attributeId !== meta.stageAttributeId) {
      return {
        skipped: 'record.updated: zmieniono inny atrybut niż Deal stage',
        attributeId,
        expectedStageAttributeId: meta.stageAttributeId,
      }
    }
    return handleDealStageChange(recordId)
  }

  if (eventType === 'list-entry.updated') {
    const parentObjectId = event.parent_object_id
    const parentRecordId = event.parent_record_id
    const attributeId = id.attribute_id
    if (!parentObjectId || !parentRecordId || !attributeId) {
      return { skipped: 'list-entry.updated: brak parent_record_id / attribute_id' }
    }
    if (parentObjectId !== meta.objectId) {
      return { skipped: 'list-entry.updated: parent nie jest deal' }
    }
    const isStageColumn =
      attributeId === meta.stageAttributeId || LIST_STAGE_ATTRIBUTE_IDS.includes(attributeId)
    if (!isStageColumn) {
      return {
        skipped: 'list-entry.updated: nie jest to kolumna etapu',
        attributeId,
        dealStageAttributeId: meta.stageAttributeId,
      }
    }
    return handleDealStageChange(parentRecordId)
  }

  return { skipped: `event_type "${eventType}" — brak obsługi` }
}

async function handleDealStageChange(dealRecordId: string): Promise<Record<string, unknown>> {
  const stageTitle = await getDealNativeStageTitle(dealRecordId)
  const action = actionForStageTitle(stageTitle)

  if (!action) {
    const normalized = stageTitle?.normalize('NFC').trim() ?? ''
    return { skipped: `etap "${normalized}" bez mapowanego emaila` }
  }

  const clientData = await getClientDataByDealId(dealRecordId)
  if (!clientData) {
    console.error(`[attio-webhook] Brak danych klienta / osoby dla deala ${dealRecordId}`)
    return { error: 'Brak danych klienta (email / powiązana osoba)', dealRecordId }
  }

  const forEmail = await mergeFreshBookingId(dealRecordId, clientData)

  try {
    if (action === 'contracts') {
      await sendContractsEmail(forEmail)
    } else if (action === 'payment') {
      await sendPaymentEmail(forEmail)
    } else if (action === 'kickoff') {
      await sendProjectKickoffEmail(forEmail)
    } else if (action === 'reject') {
      await sendRejectionEmail(forEmail)
    }
    return {
      ok: true,
      action,
      bookingId: forEmail.bookingId,
      stage: stageTitle?.normalize('NFC').trim() ?? '',
    }
  } catch (err) {
    console.error('[attio-webhook] Email send failed:', err)
    return { error: err instanceof Error ? err.message : 'Email failed', dealRecordId }
  }
}

/** Stary format webhooka (event_type na root + data.record) */
async function processLegacyAttioPayload(payload: Record<string, unknown>): Promise<Response> {
  const eventType = payload.event_type as string
  const objectSlug = payload.object_slug as string | undefined
  const data = payload.data as Record<string, unknown> | undefined

  if (objectSlug !== 'deals' && objectSlug !== undefined) {
    return NextResponse.json({ ok: true, skipped: 'not a deal' })
  }

  if (eventType !== 'record.updated' && eventType !== 'record.created') {
    return NextResponse.json({ ok: true, skipped: `event ${eventType} ignored` })
  }

  const changedAttrs = (data?.changed_attributes as string[]) ?? []
  if (eventType === 'record.updated' && changedAttrs.length > 0 && !changedAttrs.includes('stage')) {
    return NextResponse.json({ ok: true, skipped: 'stage not changed (legacy)' })
  }

  const record = data?.record as Record<string, unknown> | undefined
  const recordId = (record?.id as { record_id?: string })?.record_id
  const values = record?.values as
    | Record<string, Array<{ status?: { title?: string } }>>
    | undefined

  if (!recordId) {
    return NextResponse.json({ error: 'Missing record id (legacy)' }, { status: 400 })
  }

  const newStatus = (values?.stage?.[0]?.status?.title as string) ?? ''
  const action = actionForStageTitle(newStatus)

  if (!action) {
    return NextResponse.json({ ok: true, skipped: `status "${newStatus}" has no mapped action` })
  }

  const clientData = await getClientDataByDealId(recordId)
  if (!clientData) {
    console.error(`[attio-webhook] No client data for deal ${recordId}`)
    return NextResponse.json({ error: 'Client data not found' }, { status: 422 })
  }

  const forEmail = await mergeFreshBookingId(recordId, clientData)

  try {
    if (action === 'contracts') {
      await sendContractsEmail(forEmail)
    } else if (action === 'payment') {
      await sendPaymentEmail(forEmail)
    } else if (action === 'kickoff') {
      await sendProjectKickoffEmail(forEmail)
    } else if (action === 'reject') {
      await sendRejectionEmail(forEmail)
    }
    return NextResponse.json({ ok: true, action, bookingId: forEmail.bookingId, legacy: true })
  } catch (err) {
    console.error('[attio-webhook] Email send failed:', err)
    return NextResponse.json({ error: 'Email failed' }, { status: 500 })
  }
}

// ─── EMAIL: Umowy ──────────────────────────────────────────────────────────

async function sendContractsEmail(data: AttioClientData) {
  const [contracts, templates] = await Promise.all([
    getContractFiles(),
    getEmailTemplates(),
  ])

  // Backward-compat: jeśli intro nie zostało zmigrowane do `emailTemplates.contracts.intro`,
  // użyj `contractFiles.introText` jako wartości tej sekcji.
  const merged = {
    ...templates,
    contracts: {
      ...templates.contracts,
      intro: contracts.introText?.trim() ? contracts.introText : templates.contracts.intro,
    },
  }

  const attachments: { filename: string; content: Buffer }[] = []
  for (const f of contracts.files) {
    try {
      const res = await fetch(f.url, { signal: AbortSignal.timeout(10_000) })
      if (res.ok) {
        attachments.push({ filename: `${f.label}.pdf`, content: Buffer.from(await res.arrayBuffer()) })
      }
    } catch (err) {
      console.error(`[attio-webhook] Contract download failed for "${f.label}":`, err)
    }
  }

  const { subject, html } = renderContractsEmail(data, merged)

  await requireResend().emails.send({
    from: 'Syntance <kontakt@syntance.com>',
    to: [data.email],
    subject,
    html,
    attachments: attachments.length > 0 ? attachments : undefined,
  })
}

// ─── EMAIL: Dane do przelewu ───────────────────────────────────────────────

async function sendPaymentEmail(data: AttioClientData) {
  const [payment, templates] = await Promise.all([
    getPaymentSettings(),
    getEmailTemplates(),
  ])
  const { subject, html } = renderPaymentEmail(data, templates, payment)

  await requireResend().emails.send({
    from: 'Syntance <kontakt@syntance.com>',
    to: [data.email],
    subject,
    html,
  })
}

// ─── EMAIL: Start realizacji (zaliczka) ────────────────────────────────────

async function sendProjectKickoffEmail(data: AttioClientData) {
  const templates = await getEmailTemplates()
  const { subject, html } = renderProjectKickoffEmail(data, templates)

  await requireResend().emails.send({
    from: 'Syntance <kontakt@syntance.com>',
    to: [data.email],
    subject,
    html,
  })
}

// ─── EMAIL: Odrzucenie ─────────────────────────────────────────────────────

async function sendRejectionEmail(data: AttioClientData) {
  const templates = await getEmailTemplates()
  const { subject, html } = renderRejectionEmail(data, templates)

  await requireResend().emails.send({
    from: 'Syntance <kontakt@syntance.com>',
    to: [data.email],
    subject,
    html,
  })
}

