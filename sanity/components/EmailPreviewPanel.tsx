'use client'

import { useEffect, useMemo, useState } from 'react'
import { useClient } from 'sanity'
import {
  DEFAULT_EMAIL_TEMPLATES,
  emailTemplatesQuery,
  mergeEmailTemplatesWithDefaults,
  type EmailTemplates,
} from '../queries/emailTemplates'
import {
  renderContactFormClientEmail,
  renderContractsEmail,
  renderMeetingBookingClientEmail,
  renderPaymentEmail,
  renderProjectKickoffEmail,
  renderQuoteRequestClientEmail,
  renderRejectionEmail,
  DEFAULT_PREVIEW_DATA,
  type EmailRenderData,
} from '../../lib/emails/templates'
import type { PaymentSettings } from '../queries/paymentSettings'

type TemplateKey =
  | 'contracts'
  | 'payment'
  | 'projectKickoff'
  | 'rejection'
  | 'quoteRequestClient'
  | 'contactFormClient'
  | 'meetingBookingClient'

const TEMPLATE_LABELS: Record<TemplateKey, string> = {
  contracts: '📄 Umowy',
  payment: '💳 Dane do przelewu',
  projectKickoff: '🎊 Start realizacji',
  rejection: '❌ Odrzucenie',
  quoteRequestClient: '📨 Konfigurator → klient',
  contactFormClient: '✉️ Formularz → klient',
  meetingBookingClient: '📅 Rozmowa → klient',
}

/**
 * Panel podglądu emaili w Sanity Studio.
 * - Pobiera teksty z dokumentu `emailTemplates` przez Studio client.
 * - Pobiera ustawienia konta z `paymentSettings` (dla emaila o przelewie).
 * - Renderuje HTML lokalnie przez wspólny moduł (`lib/emails/templates`)
 *   i osadza go w `<iframe srcDoc>` — bez problemów z CORS / X-Frame-Options.
 */
export default function EmailPreviewPanel() {
  const client = useClient({ apiVersion: '2024-01-01' })

  const [templateKey, setTemplateKey] = useState<TemplateKey>('contracts')
  const [templates, setTemplates] = useState<EmailTemplates>(DEFAULT_EMAIL_TEMPLATES)
  const [payment, setPayment] = useState<PaymentSettings | null>(null)
  const [data, setData] = useState<EmailRenderData>(DEFAULT_PREVIEW_DATA)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  /** Konfigurator — mock */
  const [quoteDays, setQuoteDays] = useState(14)
  const [quoteItemsRaw, setQuoteItemsRaw] = useState('Wdrożenie designu\nCMS')
  const [titleDateMock, setTitleDateMock] = useState('11.05.2026')
  const [projectGenitiveMock, setProjectGenitiveMock] = useState('strony WWW')

  /** Rozmowa — mock */
  const [meetingDateLabel, setMeetingDateLabel] = useState('poniedziałek, 12 maja 2025')
  const [meetingTime, setMeetingTime] = useState('10:00')
  const [slotMinutes, setSlotMinutes] = useState(30)
  const [meetLinkMock, setMeetLinkMock] = useState('https://meet.google.com/preview-demo')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      try {
        const [tplRaw, payRaw] = await Promise.all([
          client.fetch<Partial<EmailTemplates> | null>(emailTemplatesQuery),
          client.fetch<PaymentSettings | null>(
            `*[_type == "paymentSettings" && _id == "paymentSettings"][0]{
              accountHolder, bankName, accountNumber, swiftBic, transferTitleTemplate, additionalInfo
            }`,
          ),
        ])

        if (cancelled) return

        setTemplates(mergeEmailTemplatesWithDefaults(tplRaw))
        setPayment(payRaw ?? null)
      } catch (err) {
        console.error('[EmailPreviewPanel] fetch failed', err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [client, refreshKey])

  const firstNameFromName = data.name.trim().split(/\s+/)[0] ?? data.name

  const rendered = useMemo(() => {
    if (templateKey === 'payment') return renderPaymentEmail(data, templates, payment)
    if (templateKey === 'projectKickoff') return renderProjectKickoffEmail(data, templates)
    if (templateKey === 'rejection') return renderRejectionEmail(data, templates)
    if (templateKey === 'quoteRequestClient') {
      const items = quoteItemsRaw
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
      return renderQuoteRequestClientEmail(
        {
          ...data,
          days: quoteDays,
          items: items.length > 0 ? items : ['—'],
          itemsCount: items.length > 0 ? items.length : 1,
        },
        templates,
        { titleDate: titleDateMock, projectTypeGenitive: projectGenitiveMock },
      )
    }
    if (templateKey === 'contactFormClient') {
      return renderContactFormClientEmail({ firstName: firstNameFromName }, templates)
    }
    if (templateKey === 'meetingBookingClient') {
      return renderMeetingBookingClientEmail(
        {
          name: data.name,
          meetingDateLabel,
          meetingTime,
          slotMinutes,
          meetLink: meetLinkMock.trim() || null,
        },
        templates,
      )
    }
    return renderContractsEmail(data, templates)
  }, [
    templateKey,
    data,
    templates,
    payment,
    quoteDays,
    quoteItemsRaw,
    titleDateMock,
    projectGenitiveMock,
    firstNameFromName,
    meetingDateLabel,
    meetingTime,
    slotMinutes,
    meetLinkMock,
  ])

  const showBookingMocks =
    templateKey === 'contracts' ||
    templateKey === 'payment' ||
    templateKey === 'projectKickoff' ||
    templateKey === 'rejection' ||
    templateKey === 'quoteRequestClient'
  const showQuoteExtras = templateKey === 'quoteRequestClient'
  const showMeetingMocks = templateKey === 'meetingBookingClient'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: 16,
        padding: 16,
        height: '100%',
        boxSizing: 'border-box',
        background: '#0d0d0d',
        color: '#eaeaea',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <aside style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 14, color: '#fff' }}>Podgląd emaili</h2>
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={isLoading}
            style={buttonStyle}
            aria-label="Odśwież dane z Sanity"
          >
            {isLoading ? '…' : 'Odśwież'}
          </button>
        </div>

        <Field label="Szablon">
          <select
            value={templateKey}
            onChange={(e) => setTemplateKey(e.target.value as TemplateKey)}
            style={selectStyle}
          >
            {(Object.keys(TEMPLATE_LABELS) as TemplateKey[]).map((k) => (
              <option key={k} value={k}>
                {TEMPLATE_LABELS[k]}
              </option>
            ))}
          </select>
        </Field>

        <h3 style={subHeading}>Mock danych</h3>

        {(showBookingMocks || templateKey === 'meetingBookingClient' || templateKey === 'contactFormClient') && (
          <>
            <Field label="Imię / nazwa (w mailu)">
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
                style={inputStyle}
              />
            </Field>
          </>
        )}

        {showBookingMocks && (
          <>
            <Field label="Numer zlecenia">
              <input
                type="text"
                value={data.bookingId}
                onChange={(e) => setData((d) => ({ ...d, bookingId: e.target.value }))}
                style={inputStyle}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
                style={inputStyle}
              />
            </Field>
            <Field label="Typ projektu">
              <input
                type="text"
                value={data.projectType}
                onChange={(e) => setData((d) => ({ ...d, projectType: e.target.value }))}
                style={inputStyle}
              />
            </Field>
            <Field label="Wartość netto (PLN)">
              <input
                type="number"
                value={data.priceNetto}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    priceNetto: Number(e.target.value) || 0,
                    priceBrutto: Math.round((Number(e.target.value) || 0) * 1.23),
                  }))
                }
                style={inputStyle}
              />
            </Field>
            <Field label="Wartość brutto (PLN)">
              <input
                type="number"
                value={data.priceBrutto}
                onChange={(e) => setData((d) => ({ ...d, priceBrutto: Number(e.target.value) || 0 }))}
                style={inputStyle}
              />
            </Field>
            <Field label="Zaliczka (PLN)">
              <input
                type="number"
                value={data.deposit}
                onChange={(e) => setData((d) => ({ ...d, deposit: Number(e.target.value) || 0 }))}
                style={inputStyle}
              />
            </Field>
          </>
        )}

        {showQuoteExtras && (
          <>
            <Field label="Dni robocze (wycena)">
              <input
                type="number"
                value={quoteDays}
                onChange={(e) => setQuoteDays(Number(e.target.value) || 0)}
                style={inputStyle}
              />
            </Field>
            <Field label="Lista pozycji (1 linia = 1 pozycja)">
              <textarea
                value={quoteItemsRaw}
                onChange={(e) => setQuoteItemsRaw(e.target.value)}
                style={{ ...inputStyle, minHeight: 72, resize: 'vertical' as const }}
              />
            </Field>
            <Field label="Mock: titleDate (temat maila)">
              <input
                type="text"
                value={titleDateMock}
                onChange={(e) => setTitleDateMock(e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Mock: projectTypeGenitive (temat)">
              <input
                type="text"
                value={projectGenitiveMock}
                onChange={(e) => setProjectGenitiveMock(e.target.value)}
                style={inputStyle}
              />
            </Field>
          </>
        )}

        {showMeetingMocks && (
          <>
            <Field label="Data (tekst, PL)">
              <input
                type="text"
                value={meetingDateLabel}
                onChange={(e) => setMeetingDateLabel(e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Godzina">
              <input
                type="text"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Slot (minuty)">
              <input
                type="number"
                value={slotMinutes}
                onChange={(e) => setSlotMinutes(Number(e.target.value) || 15)}
                style={inputStyle}
              />
            </Field>
            <Field label="Link Meet (pusty = tryb .ics)">
              <input
                type="url"
                value={meetLinkMock}
                onChange={(e) => setMeetLinkMock(e.target.value)}
                style={inputStyle}
              />
            </Field>
          </>
        )}

        {templateKey === 'contactFormClient' && (
          <p style={{ marginTop: 12, fontSize: 11, color: '#888' }}>
            Imię w powitaniu: pierwsze słowo z pola „Imię / nazwa”:{' '}
            <strong style={{ color: '#a78bfa' }}>{firstNameFromName || '—'}</strong>
          </p>
        )}

        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: '#0a0a0a',
            border: '1px solid #222',
            borderRadius: 8,
            fontSize: 12,
            color: '#bbb',
          }}
        >
          <p style={{ margin: '0 0 6px', color: '#fff', fontSize: 12, fontWeight: 600 }}>Temat</p>
          <p style={{ margin: 0, fontFamily: 'monospace', color: '#a78bfa', wordBreak: 'break-word' }}>
            {rendered.subject}
          </p>
        </div>

        <div style={{ marginTop: 12, fontSize: 11, color: '#888', lineHeight: 1.5 }}>
          Edytuj treści w „📧 Treści emaili” i odśwież podgląd. Tokeny zależą od szablonu (m.in.{' '}
          <code style={{ color: '#a78bfa' }}>{'{bookingId}'}</code>,{' '}
          <code style={{ color: '#a78bfa' }}>{'{name}'}</code>,{' '}
          <code style={{ color: '#a78bfa' }}>{'{firstName}'}</code>,{' '}
          <code style={{ color: '#a78bfa' }}>{'{meetingDateLabel}'}</code>).
        </div>
      </aside>

      <div style={{ ...panelStyle, padding: 0, overflow: 'hidden' }}>
        <iframe
          title={`Podgląd emaila: ${TEMPLATE_LABELS[templateKey]}`}
          srcDoc={rendered.html}
          sandbox="allow-same-origin"
          style={{ width: '100%', height: '100%', border: 'none', minHeight: 600, background: '#0a0a0a' }}
        />
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12 }}>
      <span style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </span>
      {children}
    </label>
  )
}

const panelStyle: React.CSSProperties = {
  background: '#111',
  border: '1px solid #222',
  borderRadius: 12,
  padding: 16,
  overflowY: 'auto',
}

const inputStyle: React.CSSProperties = {
  background: '#0a0a0a',
  border: '1px solid #2a2a2a',
  borderRadius: 8,
  color: '#fff',
  padding: '8px 10px',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
}

const buttonStyle: React.CSSProperties = {
  background: '#a78bfa',
  color: '#000',
  border: 'none',
  borderRadius: 8,
  padding: '6px 12px',
  fontWeight: 600,
  fontSize: 12,
  cursor: 'pointer',
}

const subHeading: React.CSSProperties = {
  marginTop: 20,
  marginBottom: 0,
  fontSize: 11,
  color: '#888',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
}
