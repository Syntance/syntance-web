/**
 * Wspólne renderowanie HTML emaili (umowa / przelew / odrzucenie).
 *
 * Plik jest "czysty" — bez Node API. Może być importowany zarówno przez:
 *  - serwerowe route handlery Next.js (`/api/webhooks/attio`, `/api/booking/accept`),
 *  - panel Sanity Studio (live preview w iframe srcDoc).
 *
 * Wszystkie teksty są pobierane z `EmailTemplates` (Sanity), z fallbackiem do `DEFAULT_EMAIL_TEMPLATES`.
 */

import {
  applyEmailTokens,
  type EmailTemplateContract,
  type EmailTemplatePayment,
  type EmailTemplateQuoteRequestClient,
  type EmailTemplates,
} from '../../sanity/queries/emailTemplates'
import {
  resolveTransferTitle,
  type PaymentSettings,
} from '../../sanity/queries/paymentSettings'

export interface EmailRenderData {
  bookingId: string
  name: string
  email: string
  projectType: string
  priceNetto: number
  priceBrutto: number
  deposit: number
}

const COPY_FALLBACK = {
  bookingId: 'SYN-XXXX',
  name: 'Klient',
  email: 'klient@example.com',
  projectType: 'Strona WWW',
  priceNetto: 12000,
  priceBrutto: 14760,
  deposit: 3000,
} satisfies EmailRenderData

export const DEFAULT_PREVIEW_DATA: EmailRenderData = COPY_FALLBACK

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Duża emotka nad tytułem; pusty string w CMS = ukryta. */
function headerHeroEmojiHtml(emoji: string | undefined, fontSizePx: number): string {
  const trimmed = emoji?.trim() ?? ''
  if (!trimmed) return ''
  return `<div style="font-size:${fontSizePx}px;margin-bottom:16px;line-height:1;">${escapeHtml(trimmed)}</div>`
}

function paragraphsHtml(text: string | undefined, color: string, size = 15): string {
  if (!text) return ''
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="color:${color};font-size:${size}px;line-height:1.7;margin:0 0 14px;">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`,
    )
    .join('')
}

/** Stałe otoczki karty — spójne wszędzie; tło karty z szablonu Sanity. */
const SHELL_PAGE_BG = '#0a0a0a'
const SHELL_CARD_BORDER = '#222222'
const SHELL_FOOTER_BG = '#0d0d0d'
const SHELL_COPYRIGHT = '#555555'

function shellHtml(headerHtml: string, bodyHtml: string, cardBackground: string): string {
  return `<!DOCTYPE html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:${SHELL_PAGE_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${SHELL_PAGE_BG};padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:${cardBackground};border-radius:16px;border:1px solid ${SHELL_CARD_BORDER};">
        <tr>${headerHtml}</tr>
        <tr><td style="padding:32px;">${bodyHtml}</td></tr>
        <tr><td style="padding:20px 32px;text-align:center;background-color:${SHELL_FOOTER_BG};border-top:1px solid ${SHELL_CARD_BORDER};"><p style="margin:0;color:${SHELL_COPYRIGHT};font-size:12px;">© ${new Date().getFullYear()} Syntance. Wszystkie prawa zastrzeżone.</p></td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function summaryRowsHtml(data: EmailRenderData, t: EmailTemplateContract | EmailTemplatePayment): string {
  return `
    <tr><td style="padding:5px 0;color:${t.tableLabelColor};font-size:14px;width:160px;">Typ projektu:</td><td style="padding:5px 0;color:${t.tableValueColor};font-size:14px;">${escapeHtml(data.projectType)}</td></tr>
    <tr><td style="padding:5px 0;color:${t.tableLabelColor};font-size:14px;">Wartość netto:</td><td style="padding:5px 0;color:${t.tableValueColor};font-size:14px;">${data.priceNetto.toLocaleString('pl-PL')} PLN</td></tr>
    <tr><td style="padding:5px 0;color:${t.tableLabelColor};font-size:14px;">Wartość brutto:</td><td style="padding:5px 0;color:${t.tableValueColor};font-size:14px;">${data.priceBrutto.toLocaleString('pl-PL')} PLN</td></tr>
    <tr><td style="padding:5px 0;color:${t.tableLabelColor};font-size:14px;">Zaliczka:</td><td style="padding:5px 0;color:${t.tableAccentColor};font-size:14px;font-weight:600;">${data.deposit.toLocaleString('pl-PL')} PLN</td></tr>
  `
}

export function renderEmailSubject(
  template: string,
  data: Pick<EmailRenderData, 'bookingId' | 'name'>
): string {
  return applyEmailTokens(template, { bookingId: data.bookingId, name: data.name })
}

/* ─── Umowa ─────────────────────────────────────────────────────────────── */

export function renderContractsEmail(
  data: EmailRenderData,
  templates: EmailTemplates,
): { subject: string; html: string } {
  const t = templates.contracts
  const tokens = { bookingId: data.bookingId, name: data.name }
  const subject = applyEmailTokens(t.subjectTemplate, tokens)
  const greeting = applyEmailTokens(t.greetingTemplate ?? 'Cześć {name},', tokens)
  const intro = applyEmailTokens(t.intro ?? '', tokens)
  const footer = applyEmailTokens(t.footerNote ?? '', tokens)

  const header = `<td style="padding:32px;text-align:center;border-bottom:1px solid ${SHELL_CARD_BORDER};">
    ${headerHeroEmojiHtml(t.headerEmoji, 56)}
    <h1 style="margin:0;color:${t.headingColor};font-size:26px;">${escapeHtml(t.heading)}</h1>
    <p style="margin:8px 0 0;color:${t.referenceLineMutedColor};">Nr referencyjny: <strong style="color:${t.referenceLineAccentColor};">${escapeHtml(data.bookingId)}</strong></p>
  </td>`

  const body = `
    <p style="color:${t.greetingColor};font-size:16px;line-height:1.6;margin:0 0 12px;"><strong style="color:${t.headingColor};">${escapeHtml(greeting)}</strong></p>
    ${paragraphsHtml(intro, t.introColor)}
    <div style="background-color:${t.sectionPanelBackgroundColor};border-radius:12px;padding:24px;margin:24px 0;">
      <h3 style="margin:0 0 16px;color:${t.summarySectionHeadingColor};font-size:15px;">📋 Szczegóły zlecenia</h3>
      <table width="100%" cellpadding="0" cellspacing="0">${summaryRowsHtml(data, t)}</table>
    </div>
    ${footer ? paragraphsHtml(footer, t.footerNoteColor, 13) : ''}
  `

  return { subject, html: shellHtml(header, body, t.mailBackgroundColor) }
}

/* ─── Przelew ───────────────────────────────────────────────────────────── */

function paymentBlockHtml(
  data: EmailRenderData,
  payment: PaymentSettings | null,
  t: EmailTemplatePayment,
): string {
  const transferTitle = payment
    ? resolveTransferTitle(payment.transferTitleTemplate, data.bookingId)
    : `Zaliczka ${data.bookingId} — Syntance`

  const rows = payment
    ? `
      <tr><td style="padding:6px 0;color:${t.tableLabelColor};font-size:14px;width:160px;vertical-align:top;">Właściciel konta:</td><td style="padding:6px 0;color:${t.tableValueColor};font-size:14px;font-weight:600;">${escapeHtml(payment.accountHolder)}</td></tr>
      ${payment.bankName ? `<tr><td style="padding:6px 0;color:${t.tableLabelColor};font-size:14px;">Bank:</td><td style="padding:6px 0;color:${t.tableValueColor};font-size:14px;">${escapeHtml(payment.bankName)}</td></tr>` : ''}
      <tr><td style="padding:6px 0;color:${t.tableLabelColor};font-size:14px;vertical-align:top;">Numer konta:</td><td style="padding:6px 0;color:${t.tableValueColor};font-size:14px;font-weight:600;font-family:monospace;letter-spacing:0.5px;">${escapeHtml(payment.accountNumber)}</td></tr>
      ${payment.swiftBic ? `<tr><td style="padding:6px 0;color:${t.tableLabelColor};font-size:14px;">SWIFT/BIC:</td><td style="padding:6px 0;color:${t.tableValueColor};font-size:14px;font-family:monospace;">${escapeHtml(payment.swiftBic)}</td></tr>` : ''}
      <tr><td style="padding:6px 0;color:${t.tableLabelColor};font-size:14px;vertical-align:top;">Tytuł przelewu:</td><td style="padding:6px 0;color:${t.transferTitleColor};font-size:14px;font-weight:600;">${escapeHtml(transferTitle)}</td></tr>
      <tr><td style="padding:6px 0;color:${t.tableLabelColor};font-size:14px;vertical-align:top;">Kwota zaliczki:</td><td style="padding:6px 0;color:${t.transferAmountColor};font-size:16px;font-weight:700;">${data.deposit.toLocaleString('pl-PL')} PLN</td></tr>
      ${payment.additionalInfo ? `<tr><td colspan="2" style="padding-top:12px;border-top:1px solid ${t.paymentDetailsBorderColor};color:${t.tableLabelColor};font-size:13px;line-height:1.6;">${escapeHtml(payment.additionalInfo).replace(/\n/g, '<br>')}</td></tr>` : ''}
    `
    : `
      <tr><td colspan="2" style="padding:8px 0;color:${t.introColor};font-size:14px;"><strong>Tytuł przelewu:</strong> ${escapeHtml(transferTitle)}</td></tr>
      <tr><td colspan="2" style="padding:8px 0;color:${t.transferAmountColor};font-size:15px;font-weight:700;">Kwota: ${data.deposit.toLocaleString('pl-PL')} PLN</td></tr>
    `

  return `<table width="100%" cellpadding="0" cellspacing="0" style="background-color:${t.paymentDetailsPanelBackgroundColor};border-radius:12px;border:1px solid ${t.paymentDetailsBorderColor};margin:24px 0;">
    <tr><td style="padding:20px;">
      <h4 style="margin:0 0 16px;color:${t.paymentDetailsHeadingColor};font-size:14px;">🏦 Dane do przelewu</h4>
      <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    </td></tr>
  </table>`
}

export function renderPaymentEmail(
  data: EmailRenderData,
  templates: EmailTemplates,
  payment: PaymentSettings | null,
): { subject: string; html: string; transferTitle: string } {
  const t = templates.payment
  const tokens = { bookingId: data.bookingId, name: data.name }
  const subject = applyEmailTokens(t.subjectTemplate, tokens)
  const greeting = applyEmailTokens(t.greetingTemplate ?? 'Cześć {name},', tokens)
  const intro = applyEmailTokens(t.intro ?? '', tokens)
  const footer = applyEmailTokens(t.footerNote ?? '', tokens)

  const transferTitle = payment
    ? resolveTransferTitle(payment.transferTitleTemplate, data.bookingId)
    : `Zaliczka ${data.bookingId} — Syntance`

  const header = `<td style="padding:32px;text-align:center;border-bottom:1px solid ${SHELL_CARD_BORDER};">
    ${headerHeroEmojiHtml(t.headerEmoji, 56)}
    <h1 style="margin:0;color:${t.headingColor};font-size:26px;">${escapeHtml(t.heading)}</h1>
    <p style="margin:8px 0 0;color:${t.referenceLineMutedColor};">Nr referencyjny: <strong style="color:${t.referenceLineAccentColor};">${escapeHtml(data.bookingId)}</strong></p>
  </td>`

  const body = `
    <p style="color:${t.greetingColor};font-size:16px;line-height:1.6;margin:0 0 12px;"><strong style="color:${t.headingColor};">${escapeHtml(greeting)}</strong></p>
    ${paragraphsHtml(intro, t.introColor)}
    <div style="background-color:${t.sectionPanelBackgroundColor};border-radius:12px;padding:24px;margin:24px 0;">
      <h3 style="margin:0 0 16px;color:${t.summarySectionHeadingColor};font-size:15px;">💰 Podsumowanie zlecenia</h3>
      <table width="100%" cellpadding="0" cellspacing="0">${summaryRowsHtml(data, t)}</table>
    </div>
    ${paymentBlockHtml(data, payment, t)}
    ${footer ? paragraphsHtml(footer, t.footerNoteColor, 13) : ''}
  `

  return { subject, html: shellHtml(header, body, t.mailBackgroundColor), transferTitle }
}

/* ─── Odrzucenie ───────────────────────────────────────────────────────── */

export function renderRejectionEmail(
  data: EmailRenderData,
  templates: EmailTemplates,
): { subject: string; html: string } {
  const t = templates.rejection
  const tokens = { bookingId: data.bookingId, name: data.name }
  const subject = applyEmailTokens(t.subjectTemplate, tokens)
  const greeting = applyEmailTokens(t.greetingTemplate ?? 'Cześć {name},', tokens)
  const body1 = applyEmailTokens(t.body ?? '', tokens)
  const body2 = applyEmailTokens(t.body2 ?? '', tokens)
  const footer = applyEmailTokens(t.footerNote ?? '', tokens)

  const header = `<td style="padding:32px;text-align:center;border-bottom:1px solid ${SHELL_CARD_BORDER};">
    ${headerHeroEmojiHtml(t.headerEmoji, 48)}
    <h1 style="margin:0;color:${t.headingColor};font-size:24px;">${escapeHtml(t.heading)}</h1>
    <p style="margin:8px 0 0;color:${t.referenceLineMutedColor};">Nr referencyjny: ${escapeHtml(data.bookingId)}</p>
  </td>`

  const bodyHtml = `
    <p style="color:${t.greetingColor};font-size:16px;line-height:1.6;margin:0 0 12px;"><strong style="color:${t.headingColor};">${escapeHtml(greeting)}</strong></p>
    ${paragraphsHtml(body1, t.bodyColor)}
    ${paragraphsHtml(body2, t.body2Color)}
    ${footer ? paragraphsHtml(footer, t.footerNoteColor, 13) : ''}
  `

  return { subject, html: shellHtml(header, bodyHtml, t.mailBackgroundColor) }
}

/* ─── Pierwszy kontakt: konfigurator, formularz, rozmowa ───────────────── */

const CONTACT_LOGO_SRC =
  'https://syntance.com/icons/Logo%20Sygnet%20+%20Syntance%20V.3%20bia%C5%82e.svg'

function safeHref(url: string | undefined): string {
  const trimmed = url?.trim() ?? ''
  if (!trimmed) return '#'
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const parsed = new URL(candidate)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString()
    }
  } catch {
    return '#'
  }
  return '#'
}

function greetingWithHighlightedPlaceholder(
  greetingTemplate: string | undefined,
  displayValue: string,
  placeholder: string,
  bodyColor: string,
  strongColor: string,
): string {
  const defaultTpl = placeholder === '{firstName}' ? 'Cześć {firstName},' : 'Cześć {name},'
  const tpl = greetingTemplate ?? defaultTpl
  const safeValue = escapeHtml(displayValue)
  if (!tpl.includes(placeholder)) {
    return `<p style="color:${bodyColor};font-size:16px;line-height:1.6;margin:0 0 12px;">${escapeHtml(tpl)}</p>`
  }
  const parts = tpl.split(placeholder)
  const inner = parts
    .map((part, i) => {
      const escaped = escapeHtml(part)
      return i < parts.length - 1 ? `${escaped}<strong style="color:${strongColor};">${safeValue}</strong>` : escaped
    })
    .join('')
  return `<p style="color:${bodyColor};font-size:16px;line-height:1.6;margin:0 0 12px;">${inner}</p>`
}

export interface QuoteRequestClientData extends EmailRenderData {
  days: number
  items: string[]
  itemsCount: number
}

export interface QuoteRequestOwnerPayload {
  bookingId: string
  titleDate: string
  projectTypeGenitive: string
  acceptUrl: string
  rejectUrl: string
  name: string
  email: string
  phone?: string
  companyName?: string
  description?: string
  hasExistingSite: boolean
  existingSiteUrl?: string
  booking: {
    projectType: string
    priceNetto: number
    priceBrutto: number
    deposit: number
    days: number
    complexity: string
    complexityLabel: string
    items: string[]
    itemsCount: number
  }
}

function quoteSummaryRowsHtml(data: QuoteRequestClientData, t: EmailTemplateQuoteRequestClient): string {
  return `
    <tr>
      <td style="padding:8px 0;color:${t.tableLabelColor};font-size:14px;">Typ projektu:</td>
      <td align="right" style="color:${t.tableValueColor};font-weight:500;font-size:14px;">${escapeHtml(data.projectType)}</td>
    </tr>
    <tr>
      <td style="padding:8px 0;color:${t.tableLabelColor};font-size:14px;">Cena netto:</td>
      <td align="right" style="color:${t.tableValueColor};font-weight:600;font-size:14px;">${data.priceNetto.toLocaleString('pl-PL')} PLN</td>
    </tr>
    <tr>
      <td style="padding:8px 0;color:${t.tableLabelColor};font-size:14px;">Cena brutto:</td>
      <td align="right" style="color:${t.tableValueColor};font-weight:600;font-size:14px;">${data.priceBrutto.toLocaleString('pl-PL')} PLN</td>
    </tr>
    <tr>
      <td style="padding:8px 0;color:${t.tableLabelColor};font-size:14px;">Czas realizacji:</td>
      <td align="right" style="color:${t.tableValueColor};font-weight:600;font-size:14px;">${data.days} dni roboczych</td>
    </tr>
    <tr>
      <td style="padding:8px 0;color:${t.tableLabelColor};font-size:14px;">Zaliczka:</td>
      <td align="right" style="color:${t.tableAccentColor};font-weight:600;font-size:14px;">${data.deposit.toLocaleString('pl-PL')} PLN</td>
    </tr>
  `
}

function complexityColor(complexity: string): string {
  if (complexity === 'very-high') return '#c084fc'
  if (complexity === 'high') return '#f87171'
  if (complexity === 'medium') return '#fbbf24'
  return '#4ade80'
}

export function renderQuoteRequestClientEmail(
  data: QuoteRequestClientData,
  templates: EmailTemplates,
  meta: { titleDate: string; projectTypeGenitive: string },
): { subject: string; html: string } {
  const t = templates.quoteRequestClient
  const tokens = {
    name: data.name,
    bookingId: data.bookingId,
    projectTypeGenitive: meta.projectTypeGenitive,
    titleDate: meta.titleDate,
  }
  const subject = applyEmailTokens(t.subjectTemplate, tokens)
  const intro = applyEmailTokens(t.intro ?? '', tokens)
  const nextBody = applyEmailTokens(t.nextStepsBody ?? '', tokens)
  const footer = applyEmailTokens(t.footerNote ?? '', tokens)
  const nextTitle = escapeHtml(t.nextStepsTitle ?? 'Co dalej?')

  const header = `<td style="padding:32px;text-align:center;border-bottom:1px solid ${SHELL_CARD_BORDER};">
    ${headerHeroEmojiHtml(t.headerEmoji, 48)}
    <h1 style="margin:0;color:${t.headingColor};font-size:24px;">${escapeHtml(t.heading)}</h1>
    <p style="margin:8px 0 0;color:${t.referenceLineMutedColor};">Numer referencyjny: ${escapeHtml(data.bookingId)}</p>
  </td>`

  const itemsHtml = data.items
    .map(
      (item) => `
      <div style="display:flex;align-items:center;margin:8px 0;color:${t.itemListTextColor};font-size:14px;">
        <span style="display:inline-block;width:6px;height:6px;background-color:${t.listBulletColor};border-radius:50%;margin-right:12px;"></span>
        ${escapeHtml(item)}
      </div>`,
    )
    .join('')

  const body = `
    ${greetingWithHighlightedPlaceholder(t.greetingTemplate, data.name, '{name}', t.greetingColor, t.headingColor)}
    ${paragraphsHtml(intro, t.introColor)}
    <div style="background-color:${t.sectionPanelBackgroundColor};border-radius:12px;padding:24px;margin:24px 0;">
      <h3 style="margin:0 0 16px;color:${t.summarySectionHeadingColor};font-size:16px;">📋 Podsumowanie wyceny:</h3>
      <table width="100%" style="color:${t.introColor};font-size:14px;">${quoteSummaryRowsHtml(data, t)}</table>
    </div>
    <div style="background-color:${t.sectionPanelBackgroundColor};border-radius:12px;padding:24px;margin:24px 0;">
      <h3 style="margin:0 0 16px;color:${t.summarySectionHeadingColor};font-size:16px;">📦 Wybrane elementy (${data.itemsCount}):</h3>
      ${itemsHtml}
    </div>
    <div style="background-color:${t.calloutBackgroundColor};border-radius:12px;padding:16px;margin:24px 0;border:1px solid ${t.calloutBorderColor};">
      <p style="margin:0 0 8px;color:${t.nextStepsTitleColor};font-size:14px;line-height:1.6;">💡 <strong>${nextTitle}</strong></p>
      ${paragraphsHtml(nextBody, t.nextStepsBodyColor, 14)}
    </div>
    ${footer ? paragraphsHtml(footer, t.footerNoteColor, 14) : ''}
  `

  return { subject, html: shellHtml(header, body, t.mailBackgroundColor) }
}

export function renderQuoteRequestOwnerEmail(
  payload: QuoteRequestOwnerPayload,
  templates: EmailTemplates,
): { subject: string; html: string } {
  const t = templates.quoteRequestOwner
  const { booking } = payload
  const tokens = {
    projectTypeGenitive: payload.projectTypeGenitive,
    titleDate: payload.titleDate,
    bookingId: payload.bookingId,
  }
  const subject = applyEmailTokens(t.subjectTemplate, tokens)

  const safeName = escapeHtml(payload.name)
  const safeEmail = escapeHtml(payload.email)
  const safeCompany = payload.companyName ? escapeHtml(payload.companyName) : ''
  const safePhone = payload.phone ? escapeHtml(payload.phone) : ''
  const safeDescription = payload.description ? escapeHtml(payload.description).replace(/\n/g, '<br>') : ''
  const existingHref = payload.existingSiteUrl ? safeHref(payload.existingSiteUrl) : '#'
  const safeExistingText = payload.existingSiteUrl ? escapeHtml(payload.existingSiteUrl.trim()) : ''

  const itemsHtml = booking.items
    .map(
      (item) => `
        <div style="display:flex;align-items:center;margin:8px 0;color:${t.itemsListTextColor};font-size:14px;">
          <span style="display:inline-block;width:6px;height:6px;background-color:${t.listBulletColor};border-radius:50%;margin-right:12px;"></span>
          ${escapeHtml(item)}
        </div>`,
    )
    .join('')

  const headerHtml = `<td style="padding:32px;border-bottom:1px solid ${SHELL_CARD_BORDER};">
    ${headerHeroEmojiHtml(t.headerEmoji, 44)}
    <h1 style="margin:0;color:${t.headerTitleColor};font-size:24px;font-weight:600;">${escapeHtml(t.headerTitle)}</h1>
    <p style="margin:8px 0 0;color:${t.headerMetaColor};font-size:14px;">
      ID: ${escapeHtml(payload.bookingId)} • ${escapeHtml(
    new Date().toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  )}
    </p>
  </td>`

  const innerBody = `
  <tr><td style="padding:24px 32px;">
    <h2 style="margin:0 0 16px;color:${t.sectionHeadingColor};font-size:16px;font-weight:600;">👤 Dane klienta</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${t.sectionPanelBackgroundColor};border-radius:12px;padding:16px;">
      <tr><td style="padding:12px 16px;">
        <p style="margin:0;color:${t.clientFieldLabelColor};font-size:13px;">Imię i nazwisko</p>
        <p style="margin:4px 0 0;color:${t.clientFieldValueColor};font-size:16px;font-weight:500;">${safeName}</p>
      </td></tr>
      ${safeCompany ? `<tr><td style="padding:12px 16px;">
        <p style="margin:0;color:${t.clientFieldLabelColor};font-size:13px;">Firma</p>
        <p style="margin:4px 0 0;color:${t.clientFieldValueColor};font-size:16px;font-weight:500;">${safeCompany}</p>
      </td></tr>` : ''}
      <tr><td style="padding:12px 16px;">
        <p style="margin:0;color:${t.clientFieldLabelColor};font-size:13px;">Email</p>
        <p style="margin:4px 0 0;color:${t.linkAccentColor};font-size:16px;">
          <a href="mailto:${safeEmail}" style="color:${t.linkAccentColor};text-decoration:none;">${safeEmail}</a>
        </p>
      </td></tr>
      ${safePhone ? `<tr><td style="padding:12px 16px;">
        <p style="margin:0;color:${t.clientFieldLabelColor};font-size:13px;">Telefon</p>
        <p style="margin:4px 0 0;color:${t.clientFieldValueColor};font-size:16px;">
          <a href="tel:${safePhone}" style="color:${t.clientFieldValueColor};text-decoration:none;">${safePhone}</a>
        </p>
      </td></tr>` : ''}
    </table>
  </td></tr>

  ${safeDescription ? `<tr><td style="padding:0 32px 24px;">
    <h2 style="margin:0 0 16px;color:${t.sectionHeadingColor};font-size:16px;font-weight:600;">📝 Opis firmy i potrzeb</h2>
    <div style="background-color:${t.sectionPanelBackgroundColor};border-radius:12px;padding:16px;color:${t.descriptionTextColor};font-size:14px;line-height:1.6;">${safeDescription}</div>
  </td></tr>` : ''}

  ${payload.hasExistingSite ? `<tr><td style="padding:0 32px 24px;">
    <h2 style="margin:0 0 16px;color:${t.sectionHeadingColor};font-size:16px;font-weight:600;">🌐 Obecna strona klienta</h2>
    <div style="background-color:${t.sectionPanelBackgroundColor};border-radius:12px;padding:16px;color:${t.descriptionTextColor};font-size:14px;">
      ${safeExistingText
        ? `<a href="${existingHref}" target="_blank" rel="noopener noreferrer" style="color:${t.linkAccentColor};text-decoration:none;word-break:break-all;">${safeExistingText}</a>`
        : `<span style=\"color:${t.descriptionTextColor}\">Klient zaznaczył, że ma już stronę, ale nie podał linku.</span>`}
    </div>
  </td></tr>` : ''}

  <tr><td style="padding:0 32px 24px;">
    <h2 style="margin:0 0 16px;color:${t.sectionHeadingColor};font-size:16px;font-weight:600;">💰 Wycena</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${t.sectionPanelBackgroundColor};border-radius:12px;">
      <tr><td style="padding:16px;border-bottom:1px solid ${t.dividerRowColor};">
        <table width="100%"><tr>
          <td style="color:${t.pricingLabelColor};font-size:14px;">Typ projektu</td>
          <td align="right" style="color:${t.clientFieldValueColor};font-size:14px;font-weight:500;">${escapeHtml(booking.projectType)}</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:16px;border-bottom:1px solid ${t.dividerRowColor};">
        <table width="100%"><tr>
          <td style="color:${t.pricingLabelColor};font-size:14px;">Cena netto</td>
          <td align="right" style="color:${t.pricingValueNettoColor};font-size:20px;font-weight:700;">${booking.priceNetto.toLocaleString('pl-PL')} PLN</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:16px;border-bottom:1px solid ${t.dividerRowColor};">
        <table width="100%"><tr>
          <td style="color:${t.pricingLabelColor};font-size:14px;">Cena brutto</td>
          <td align="right" style="color:${t.pricingValueBruttoColor};font-size:14px;">${booking.priceBrutto.toLocaleString('pl-PL')} PLN</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:16px;border-bottom:1px solid ${t.dividerRowColor};">
        <table width="100%"><tr>
          <td style="color:${t.pricingLabelColor};font-size:14px;">Zaliczka</td>
          <td align="right" style="color:${t.pricingDepositColor};font-size:16px;font-weight:600;">${booking.deposit.toLocaleString('pl-PL')} PLN</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:16px;border-bottom:1px solid ${t.dividerRowColor};">
        <table width="100%"><tr>
          <td style="color:${t.pricingLabelColor};font-size:14px;">Czas realizacji</td>
          <td align="right" style="color:${t.pricingTimeColor};font-size:16px;font-weight:600;">${booking.days} dni roboczych</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:16px;">
        <table width="100%"><tr>
          <td style="color:${t.pricingLabelColor};font-size:14px;">Złożoność</td>
          <td align="right" style="color:${complexityColor(booking.complexity)};font-size:14px;font-weight:500;">${escapeHtml(booking.complexityLabel)}</td>
        </tr></table>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:0 32px 24px;">
    <h2 style="margin:0 0 16px;color:${t.sectionHeadingColor};font-size:16px;font-weight:600;">📦 Wybrane elementy (${booking.itemsCount})</h2>
    <div style="background-color:${t.sectionPanelBackgroundColor};border-radius:12px;padding:16px;">${itemsHtml}</div>
  </td></tr>

  <tr><td style="padding:24px 32px;background-color:${t.actionStripBackgroundColor};border-top:1px solid ${SHELL_CARD_BORDER};">
    <p style="margin:0 0 16px;color:${t.actionPromptColor};font-size:14px;text-align:center;">${escapeHtml(t.actionPrompt ?? '')}</p>
    <table width="100%"><tr>
      <td align="center" style="padding:0 8px;">
        <a href="${escapeHtml(payload.acceptUrl)}" style="display:inline-block;padding:16px 32px;background:linear-gradient(135deg,${t.acceptButtonGradientStartColor},${t.acceptButtonGradientEndColor});color:${t.acceptButtonTextColor};text-decoration:none;border-radius:12px;font-weight:600;font-size:16px;">
          ${escapeHtml(t.acceptButtonLabel ?? 'Akceptuj')}
        </a>
      </td>
      <td align="center" style="padding:0 8px;">
        <a href="${escapeHtml(payload.rejectUrl)}" style="display:inline-block;padding:16px 32px;background-color:${t.rejectButtonBackgroundColor};color:${t.rejectButtonTextColor};text-decoration:none;border-radius:12px;font-weight:600;font-size:16px;">
          ${escapeHtml(t.rejectButtonLabel ?? 'Odrzuć')}
        </a>
      </td>
    </tr></table>
  </td></tr>

  <tr><td style="padding:24px 32px;text-align:center;">
    <p style="margin:0;color:${t.autoFooterNoteColor};font-size:12px;">${escapeHtml(t.autoFooterNote ?? '')}</p>
  </td></tr>
  `

  const html = `<!DOCTYPE html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:${SHELL_PAGE_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${SHELL_PAGE_BG};padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:${t.mailBackgroundColor};border-radius:16px;border:1px solid ${SHELL_CARD_BORDER};">
        <tr>${headerHtml}</tr>
        ${innerBody}
      </table>
    </td></tr>
  </table>
</body></html>`

  return { subject, html }
}

/** Wersja tekstowa dla powiadomienia wewnętrznego (konfigurator). */
export function renderQuoteRequestOwnerPlainText(payload: QuoteRequestOwnerPayload): string {
  const { booking } = payload
  const itemsList = booking.items.map((item) => `• ${item}`).join('\n')
  return `
NOWE ZAPYTANIE O WYCENĘ - ${payload.bookingId}
============================

Status: Oczekuje na kontakt — termin do ustalenia indywidualnie

DANE KLIENTA:
- Imię i nazwisko: ${payload.name}
- Email: ${payload.email}
${payload.phone ? `- Telefon: ${payload.phone}` : ''}
${payload.description ? `
OPIS FIRMY I POTRZEB:
${payload.description}
` : ''}${payload.hasExistingSite ? `
OBECNA STRONA: ${payload.existingSiteUrl?.trim() || 'klient nie podał linku'}
` : ''}
WYCENA:
- Typ projektu: ${booking.projectType}
- Cena netto: ${booking.priceNetto.toLocaleString('pl-PL')} PLN
- Cena brutto: ${booking.priceBrutto.toLocaleString('pl-PL')} PLN
- Zaliczka: ${booking.deposit.toLocaleString('pl-PL')} PLN
- Czas realizacji: ${booking.days} dni roboczych
- Złożoność: ${booking.complexityLabel}

WYBRANE ELEMENTY (${booking.itemsCount}):
${itemsList}

AKCJE:
- Akceptuj: ${payload.acceptUrl}
- Odrzuć: ${payload.rejectUrl}
`.trim()
}

export interface ContactFormClientInput {
  firstName: string
}

export function renderContactFormClientEmail(
  data: ContactFormClientInput,
  templates: EmailTemplates,
): { subject: string; html: string; text: string } {
  const t = templates.contactFormClient
  const tokens = { firstName: data.firstName }
  const subject = applyEmailTokens(t.subjectTemplate, tokens)

  const p1 = applyEmailTokens(t.bodyParagraph1 ?? '', tokens)
  const p2 = applyEmailTokens(t.bodyParagraph2 ?? '', tokens)
  const asideRaw = t.asideTitle ?? ''
  const asideTitleHtml = asideRaw.trim()
    ? `<p style="margin:0 0 30px;color:${t.asideTitleColor};font-size:16px;line-height:1.6;">${escapeHtml(asideRaw)}</p>`
    : ''
  const link1Href = safeHref(t.link1Url)
  const link2Href = safeHref(t.link2Url)
  const closing = escapeHtml(applyEmailTokens(t.closingLine ?? '', tokens))

  const html = `<!DOCTYPE html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:${SHELL_PAGE_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:40px 20px;">
      <table role="presentation" style="max-width:600px;margin:0 auto;background-color:${t.mailBackgroundColor};border-radius:16px;overflow:hidden;border:1px solid ${SHELL_CARD_BORDER};">
        <tr><td style="padding:40px 40px 30px;text-align:center;background-color:${t.headerBandBackgroundColor};">
          <img src="${CONTACT_LOGO_SRC}" alt="Syntance" style="height:32px;margin-bottom:20px;">
          ${headerHeroEmojiHtml(t.headerEmoji, 40)}
          <h1 style="margin:0;color:${t.headingColor};font-size:24px;font-weight:400;letter-spacing:0.5px;">${escapeHtml(t.heading)}</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          ${greetingWithHighlightedPlaceholder(t.greetingTemplate, data.firstName, '{firstName}', t.greetingColor, t.headingColor)}
          ${paragraphsHtml(p1, t.bodyParagraph1Color, 16)}
          ${paragraphsHtml(p2, t.bodyParagraph2Color, 16)}
          ${asideTitleHtml}
          <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:30px;">
            <tr><td style="padding:16px 20px;background-color:${t.link1RowBackgroundColor};border-radius:12px;border:1px solid ${t.link1RowBorderColor};">
              <a href="${link1Href}" style="color:${t.link1LabelColor};text-decoration:none;font-size:15px;">${escapeHtml(t.link1Label ?? '')}</a>
            </td></tr>
            <tr><td style="height:12px;"></td></tr>
            <tr><td style="padding:16px 20px;background-color:${t.link2RowBackgroundColor};border-radius:12px;border:1px solid ${t.link2RowBorderColor};">
              <a href="${link2Href}" style="color:${t.link2LabelColor};text-decoration:none;font-size:15px;">${escapeHtml(t.link2Label ?? '')}</a>
            </td></tr>
          </table>
          <p style="margin:0;color:${t.closingLineColor};font-size:16px;line-height:1.6;">${closing}</p>
        </td></tr>
        <tr><td style="padding:30px 40px;background-color:${t.footerBandBackgroundColor};border-top:1px solid ${SHELL_CARD_BORDER};">
          <p style="margin:0 0 10px;color:${t.footerSecondaryLinkColor};font-size:14px;text-align:center;">
            <strong style="color:${t.footerTaglineColor};">${escapeHtml(t.footerTagline ?? '')}</strong>
          </p>
          <p style="margin:0;color:${t.footerSecondaryLinkColor};font-size:13px;text-align:center;">
            <a href="${safeHref(t.footerSiteUrl)}" style="color:${t.footerSecondaryLinkColor};text-decoration:none;">${escapeHtml(t.footerSiteLabel ?? '')}</a>
            &nbsp;•&nbsp;
            <a href="mailto:${escapeHtml(t.footerEmail ?? '')}" style="color:${t.footerSecondaryLinkColor};text-decoration:none;">${escapeHtml(t.footerEmail ?? '')}</a>
          </p>
        </td></tr>
      </table>
      <p style="margin:20px auto 0;max-width:600px;color:${t.legalNoteColor};font-size:12px;text-align:center;line-height:1.5;">
        ${escapeHtml(t.legalNote ?? '')}
      </p>
    </td></tr>
  </table>
</body></html>`

  const text = [
    applyEmailTokens(t.greetingTemplate ?? 'Cześć {firstName},', tokens),
    '',
    p1,
    '',
    p2,
    '',
    `${t.asideTitle ?? ''}`,
    `${t.link1Label ?? ''}: ${t.link1Url ?? ''}`,
    `${t.link2Label ?? ''}: ${t.link2Url ?? ''}`,
    '',
    t.closingLine ?? '',
    '',
    t.footerTagline ?? '',
    `${t.footerSiteUrl ?? ''} | ${t.footerEmail ?? ''}`,
  ].join('\n')

  return { subject, html, text }
}

export interface ContactFormOwnerInput {
  name: string
  email: string
  phone: string
  message: string
  source: string
}

export function renderContactFormOwnerPlain(
  data: ContactFormOwnerInput,
  templates: EmailTemplates,
): { subject: string; text: string } {
  const t = templates.contactFormOwner
  const tokens = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
    source: data.source,
  }
  return {
    subject: applyEmailTokens(t.subjectTemplate, tokens),
    text: applyEmailTokens(t.bodyTemplate ?? '', tokens),
  }
}

export interface MeetingBookingClientInput {
  name: string
  meetingDateLabel: string
  meetingTime: string
  slotMinutes: number
  meetLink?: string | null
}

export function renderMeetingBookingClientEmail(
  data: MeetingBookingClientInput,
  templates: EmailTemplates,
): { subject: string; html: string } {
  const t = templates.meetingBookingClient
  const tokens = {
    name: data.name,
    meetingDateLabel: data.meetingDateLabel,
    meetingTime: data.meetingTime,
    slotMinutes: String(data.slotMinutes),
  }
  const subject = applyEmailTokens(t.subjectTemplate, tokens)
  const heading = escapeHtml(applyEmailTokens(t.headingTemplate ?? '', tokens))
  const sub = escapeHtml(applyEmailTokens(t.subheadingTemplate ?? '', tokens))
  const meetIntro = escapeHtml(t.meetLinkIntro ?? '')
  const fallback = escapeHtml(t.fallbackNoMeetParagraph ?? '')
  const reschedule = escapeHtml(t.rescheduleNote ?? '')
  const footer = escapeHtml(t.footerLine ?? '')

  const meetHref = data.meetLink ? safeHref(data.meetLink) : '#'
  const meetBlock =
    data.meetLink && meetHref !== '#'
      ? `<p style="margin:0 0 12px;color:${t.meetIntroColor};font-size:15px;line-height:1.6;">${meetIntro}<br/>
         <a href="${meetHref}" style="color:${t.meetLinkColor};word-break:break-all;">${escapeHtml(data.meetLink)}</a></p>`
      : `<p style="margin:0 0 12px;color:${t.fallbackParagraphColor};font-size:15px;line-height:1.6;">${fallback}</p>`

  const inner = `<!DOCTYPE html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:${SHELL_PAGE_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${SHELL_PAGE_BG};padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:${t.mailBackgroundColor};border-radius:16px;border:1px solid ${SHELL_CARD_BORDER};">
  <tr><td style="padding:32px;border-bottom:1px solid ${SHELL_CARD_BORDER};background-color:${t.sectionPanelBackgroundColor};">
    ${headerHeroEmojiHtml(t.headerEmoji, 44)}
    <h1 style="margin:0;color:${t.headingColor};font-size:22px;">${heading}</h1>
    <p style="margin:8px 0 0;color:${t.subheadingColor};">${sub}</p>
  </td></tr>
  <tr><td style="padding:24px 32px;color:${t.mainContentTextColor};font-size:15px;line-height:1.6;">
    <p style="margin:0 0 12px;"><strong style="color:${t.dateStrongColor};">${escapeHtml(data.meetingDateLabel)}</strong><br/>
    godz. <strong style="color:${t.dateStrongColor};">${escapeHtml(data.meetingTime)}</strong> (${data.slotMinutes} min, Europe/Warsaw)</p>
    ${meetBlock}
    <p style="margin:12px 0 0;color:${t.rescheduleNoteColor};font-size:15px;line-height:1.6;">${reschedule}</p>
  </td></tr>
  <tr><td style="padding:24px 32px;background:${t.footerStripBackgroundColor};border-top:1px solid ${SHELL_CARD_BORDER};color:${t.footerLineColor};font-size:12px;">
    ${footer}
  </td></tr>
</table>
</td></tr></table></body></html>`

  return { subject, html: inner }
}

export interface MeetingBookingOwnerInput {
  name: string
  email: string
  meetingDateLabel: string
  meetingTime: string
  slotMinutes: number
  company?: string
  topic?: string
  source?: string
  calendarLine: string
  meetLine: string
  sanityLine: string
}

export function renderMeetingBookingOwnerPlain(
  data: MeetingBookingOwnerInput,
  templates: EmailTemplates,
): { subject: string; text: string } {
  const t = templates.meetingBookingOwner
  const tokens: Record<string, string | undefined> = {
    name: data.name,
    email: data.email,
    meetingDateLabel: data.meetingDateLabel,
    meetingTime: data.meetingTime,
    slotMinutes: String(data.slotMinutes),
    companyLine: data.company ? `Firma: ${data.company}\n` : '',
    topicLine: data.topic ? `Temat: ${data.topic}\n` : '',
    sourceLine: data.source ? `Źródło: ${data.source}\n` : '',
    calendarLine: data.calendarLine,
    meetLine: data.meetLine,
    sanityLine: data.sanityLine,
  }
  return {
    subject: applyEmailTokens(t.subjectTemplate, tokens),
    text: applyEmailTokens(t.bodyTemplate ?? '', tokens),
  }
}
