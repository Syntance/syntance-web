import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { Resend } from 'resend'
import { getClientDataByDealId, getDealNativeStageTitle, getAttioDealsStageIds, type AttioClientData } from '@/lib/attio'
import { getPaymentSettings, resolveTransferTitle, type PaymentSettings } from '@/sanity/queries/paymentSettings'
import { getContractFiles } from '@/sanity/queries/contractFiles'

// ─── Mapowanie natywnego Status (stage) → akcja emailowa ──────────────────
// Pole: stage (system status) na obiekcie deals — to co widzisz w Attio UI
const STATUS_ACTIONS: Record<string, 'contracts' | 'payment' | 'reject'> = {
  'Umowa':     'contracts',  // → wyślij umowy PDF
  'Zaliczka':  'payment',    // → wyślij dane bankowe (IBAN)
  'Anulowany': 'reject',     // → wyślij email o odrzuceniu
  // Oczekujący / Aktywny / Zakończony — bez emaila
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
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

function actionForStageTitle(title: string | undefined): 'contracts' | 'payment' | 'reject' | undefined {
  if (!title) return undefined
  const k = title.normalize('NFC').trim().replace(/\u00a0/g, ' ')
  return STATUS_ACTIONS[k]
}

/** Attio V2 record.updated / list-entry.updated */
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

  try {
    if (action === 'contracts') {
      await sendContractsEmail(clientData)
    } else if (action === 'payment') {
      await sendPaymentEmail(clientData)
    } else if (action === 'reject') {
      await sendRejectionEmail(clientData)
    }
    return {
      ok: true,
      action,
      bookingId: clientData.bookingId,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values = record?.values as Record<string, any[]> | undefined

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

  try {
    if (action === 'contracts') {
      await sendContractsEmail(clientData)
    } else if (action === 'payment') {
      await sendPaymentEmail(clientData)
    } else if (action === 'reject') {
      await sendRejectionEmail(clientData)
    }
    return NextResponse.json({ ok: true, action, bookingId: clientData.bookingId, legacy: true })
  } catch (err) {
    console.error('[attio-webhook] Email send failed:', err)
    return NextResponse.json({ error: 'Email failed' }, { status: 500 })
  }
}

// ─── EMAIL: Umowy ──────────────────────────────────────────────────────────

async function sendContractsEmail(data: AttioClientData) {
  const contracts = await getContractFiles()
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

  const intro = contracts.introText
    ? escapeHtml(contracts.introText).replace(/\n/g, '<br>')
    : `W załączeniu przesyłamy umowy dotyczące realizacji Twojego zlecenia (<strong>${escapeHtml(data.bookingId)}</strong>).<br><br>Prosimy o zapoznanie się z dokumentami, podpisanie ich i odesłanie skanów na <a href="mailto:kontakt@syntance.com" style="color:#a78bfa;">kontakt@syntance.com</a>. Po otrzymaniu podpisanych umów wyślemy dane do płatności zaliczki.`

  await requireResend().emails.send({
    from: 'Syntance <kontakt@syntance.com>',
    to: [data.email],
    subject: `Syntance - Umowy do zlecenia ${data.bookingId}`,
    html: contractsEmailHtml(data, intro),
    attachments: attachments.length > 0 ? attachments : undefined,
  })
}

// ─── EMAIL: Dane do przelewu ───────────────────────────────────────────────

async function sendPaymentEmail(data: AttioClientData) {
  const payment = await getPaymentSettings()

  await requireResend().emails.send({
    from: 'Syntance <kontakt@syntance.com>',
    to: [data.email],
    subject: `Syntance - Dane do płatności - ${data.bookingId}`,
    html: paymentEmailHtml(data, payment),
  })
}

// ─── EMAIL: Odrzucenie ─────────────────────────────────────────────────────

async function sendRejectionEmail(data: AttioClientData) {
  await requireResend().emails.send({
    from: 'Syntance <kontakt@syntance.com>',
    to: [data.email],
    subject: `Syntance - Informacja o zleceniu`,
    html: rejectionEmailHtml(data),
  })
}

// ─── Szablony HTML emaili ──────────────────────────────────────────────────

function contractsEmailHtml(data: AttioClientData, intro: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#111;border-radius:16px;border:1px solid #222;">
        <tr>
          <td style="padding:32px;text-align:center;border-bottom:1px solid #222;">
            <div style="font-size:56px;margin-bottom:16px;">📄</div>
            <h1 style="margin:0;color:#fff;font-size:26px;">Umowy do Twojego zlecenia</h1>
            <p style="margin:8px 0 0;color:#888;">Nr referencyjny: <strong style="color:#a78bfa;">${escapeHtml(data.bookingId)}</strong></p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="color:#ccc;font-size:16px;line-height:1.6;">Cześć <strong style="color:#fff;">${escapeHtml(data.name)}</strong>,</p>
            <p style="color:#ccc;font-size:15px;line-height:1.7;">${intro}</p>
            <div style="background-color:#1a1a1a;border-radius:12px;padding:24px;margin:24px 0;">
              <h3 style="margin:0 0 16px;color:#fff;font-size:15px;">📋 Szczegóły zlecenia</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:5px 0;color:#888;font-size:14px;width:160px;">Typ projektu:</td><td style="padding:5px 0;color:#fff;font-size:14px;">${escapeHtml(data.projectType)}</td></tr>
                <tr><td style="padding:5px 0;color:#888;font-size:14px;">Wartość:</td><td style="padding:5px 0;color:#fff;font-size:14px;">${data.priceNetto.toLocaleString('pl-PL')} PLN netto / ${data.priceBrutto.toLocaleString('pl-PL')} PLN brutto</td></tr>
                <tr><td style="padding:5px 0;color:#888;font-size:14px;">Zaliczka:</td><td style="padding:5px 0;color:#a78bfa;font-size:14px;font-weight:600;">${data.deposit.toLocaleString('pl-PL')} PLN</td></tr>
              </table>
            </div>
            <p style="color:#888;font-size:13px;">Pytania? <a href="mailto:kontakt@syntance.com" style="color:#a78bfa;">kontakt@syntance.com</a></p>
          </td>
        </tr>
        <tr><td style="padding:20px 32px;text-align:center;background-color:#0d0d0d;border-top:1px solid #222;"><p style="margin:0;color:#555;font-size:12px;">© ${new Date().getFullYear()} Syntance. Wszystkie prawa zastrzeżone.</p></td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function paymentEmailHtml(data: AttioClientData, payment: PaymentSettings | null): string {
  const transferTitle = payment
    ? resolveTransferTitle(payment.transferTitleTemplate, data.bookingId)
    : `Zaliczka ${data.bookingId} — Syntance`

  const paymentRows = payment ? `
    <tr><td style="padding:6px 0;color:#888;font-size:14px;width:160px;vertical-align:top;">Właściciel konta:</td><td style="padding:6px 0;color:#fff;font-size:14px;font-weight:600;">${escapeHtml(payment.accountHolder)}</td></tr>
    ${payment.bankName ? `<tr><td style="padding:6px 0;color:#888;font-size:14px;">Bank:</td><td style="padding:6px 0;color:#fff;font-size:14px;">${escapeHtml(payment.bankName)}</td></tr>` : ''}
    <tr><td style="padding:6px 0;color:#888;font-size:14px;vertical-align:top;">Numer konta:</td><td style="padding:6px 0;color:#fff;font-size:14px;font-weight:600;font-family:monospace,monospace;">${escapeHtml(payment.accountNumber)}</td></tr>
    ${payment.swiftBic ? `<tr><td style="padding:6px 0;color:#888;font-size:14px;">SWIFT/BIC:</td><td style="padding:6px 0;color:#fff;font-size:14px;font-family:monospace,monospace;">${escapeHtml(payment.swiftBic)}</td></tr>` : ''}
    <tr><td style="padding:6px 0;color:#888;font-size:14px;vertical-align:top;">Tytuł przelewu:</td><td style="padding:6px 0;color:#a78bfa;font-size:14px;font-weight:600;">${escapeHtml(transferTitle)}</td></tr>
    <tr><td style="padding:6px 0;color:#888;font-size:14px;vertical-align:top;">Kwota zaliczki:</td><td style="padding:6px 0;color:#22c55e;font-size:16px;font-weight:700;">${data.deposit.toLocaleString('pl-PL')} PLN</td></tr>
    ${payment.additionalInfo ? `<tr><td colspan="2" style="padding-top:12px;border-top:1px solid #222;color:#888;font-size:13px;line-height:1.6;">${escapeHtml(payment.additionalInfo).replace(/\n/g, '<br>')}</td></tr>` : ''}
  ` : `
    <tr><td colspan="2" style="padding:8px 0;color:#ccc;font-size:14px;"><strong>Tytuł przelewu:</strong> ${escapeHtml(transferTitle)}</td></tr>
    <tr><td colspan="2" style="padding:8px 0;color:#22c55e;font-size:15px;font-weight:700;">Kwota: ${data.deposit.toLocaleString('pl-PL')} PLN</td></tr>
  `

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#111;border-radius:16px;border:1px solid #222;">
        <tr>
          <td style="padding:32px;text-align:center;border-bottom:1px solid #222;">
            <div style="font-size:56px;margin-bottom:16px;">🎉</div>
            <h1 style="margin:0;color:#22c55e;font-size:26px;">Zlecenie potwierdzone!</h1>
            <p style="margin:8px 0 0;color:#888;">Nr referencyjny: <strong style="color:#a78bfa;">${escapeHtml(data.bookingId)}</strong></p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="color:#ccc;font-size:16px;line-height:1.6;">Cześć <strong style="color:#fff;">${escapeHtml(data.name)}</strong>,</p>
            <p style="color:#ccc;font-size:15px;line-height:1.7;">Dziękujemy za podpisanie umów! Poniżej znajdziesz dane do wpłaty zaliczki, po której <strong style="color:#fff;">rozpoczynamy realizację projektu</strong>.</p>
            <div style="background-color:#1a1a1a;border-radius:12px;padding:24px;margin:24px 0;">
              <h3 style="margin:0 0 16px;color:#fff;font-size:15px;">💰 Podsumowanie zlecenia</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:5px 0;color:#888;font-size:14px;width:160px;">Typ projektu:</td><td style="padding:5px 0;color:#fff;font-size:14px;">${escapeHtml(data.projectType)}</td></tr>
                <tr><td style="padding:5px 0;color:#888;font-size:14px;">Wartość netto:</td><td style="padding:5px 0;color:#fff;font-size:14px;">${data.priceNetto.toLocaleString('pl-PL')} PLN</td></tr>
                <tr><td style="padding:5px 0;color:#888;font-size:14px;">Wartość brutto:</td><td style="padding:5px 0;color:#fff;font-size:14px;">${data.priceBrutto.toLocaleString('pl-PL')} PLN</td></tr>
                <tr><td style="padding:5px 0;color:#888;font-size:14px;">Zaliczka:</td><td style="padding:5px 0;color:#22c55e;font-size:15px;font-weight:700;">${data.deposit.toLocaleString('pl-PL')} PLN</td></tr>
              </table>
            </div>
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0d0d;border-radius:12px;border:1px solid #333;margin:24px 0;">
              <tr><td style="padding:20px;">
                <h4 style="margin:0 0 16px;color:#fff;font-size:14px;">🏦 Dane do przelewu</h4>
                <table width="100%" cellpadding="0" cellspacing="0">${paymentRows}</table>
              </td></tr>
            </table>
            <p style="color:#888;font-size:13px;">Po zaksięgowaniu wpłaty skontaktujemy się w sprawie startu projektu. Pytania? <a href="mailto:kontakt@syntance.com" style="color:#a78bfa;">kontakt@syntance.com</a></p>
          </td>
        </tr>
        <tr><td style="padding:20px 32px;text-align:center;background-color:#0d0d0d;border-top:1px solid #222;"><p style="margin:0;color:#555;font-size:12px;">© ${new Date().getFullYear()} Syntance. Wszystkie prawa zastrzeżone.</p></td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function rejectionEmailHtml(data: AttioClientData): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#111;border-radius:16px;border:1px solid #222;">
        <tr>
          <td style="padding:32px;text-align:center;border-bottom:1px solid #222;">
            <h1 style="margin:0;color:#fff;font-size:24px;">Informacja o zapytaniu</h1>
            <p style="margin:8px 0 0;color:#888;">Nr referencyjny: ${escapeHtml(data.bookingId)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="color:#ccc;font-size:16px;line-height:1.6;">Cześć <strong style="color:#fff;">${escapeHtml(data.name)}</strong>,</p>
            <p style="color:#ccc;font-size:15px;line-height:1.7;">Dziękujemy za zainteresowanie współpracą z Syntance. Niestety, <strong style="color:#f87171;">w tym momencie nie możemy przyjąć Twojego zlecenia</strong>.</p>
            <p style="color:#ccc;font-size:15px;line-height:1.7;">Skontaktujemy się z Tobą wkrótce, aby omówić możliwe alternatywy.</p>
            <p style="color:#888;font-size:13px;margin-top:24px;">Pytania? <a href="mailto:kontakt@syntance.com" style="color:#a78bfa;">kontakt@syntance.com</a> · <a href="tel:+48537110170" style="color:#a78bfa;">+48 537 110 170</a></p>
          </td>
        </tr>
        <tr><td style="padding:20px 32px;text-align:center;background-color:#0d0d0d;border-top:1px solid #222;"><p style="margin:0;color:#555;font-size:12px;">© ${new Date().getFullYear()} Syntance. Wszystkie prawa zastrzeżone.</p></td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}
