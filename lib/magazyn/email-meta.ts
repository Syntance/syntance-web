import type { EmailTemplates } from '@/lib/data/email-templates'

export type TemplateKey = keyof EmailTemplates

/** Blok reprezentujący edytowalne pole tekstowe szablonu. */
export type EmailBlock = {
  id: string
  fieldKey: string
  type: 'subject' | 'emoji' | 'heading' | 'text' | 'footer'
  label: string
  snippet: string
}

/** Metadane szablonu e-mail — widok listy i edytora. */
export interface TemplateMeta {
  key: TemplateKey
  /** Parametr dla /api/admin/email-preview?template=... (lowercase, brak separatorów) */
  previewParam: string | null
  nazwa: string
  klucz: string
  opis: string
  hasInternalVersion: boolean
}

export const TEMPLATE_META: TemplateMeta[] = [
  {
    key: 'contracts',
    previewParam: 'contracts',
    nazwa: 'Umowy do podpisu',
    klucz: 'contracts',
    opis: 'Wysyłany po akceptacji zlecenia z umowami do podpisu.',
    hasInternalVersion: false,
  },
  {
    key: 'payment',
    previewParam: 'payment',
    nazwa: 'Dane do płatności',
    klucz: 'payment',
    opis: 'Dane do przelewu zaliczki po podpisaniu umów.',
    hasInternalVersion: false,
  },
  {
    key: 'projectKickoff',
    previewParam: 'projectkickoff',
    nazwa: 'Start realizacji',
    klucz: 'projectKickoff',
    opis: 'Potwierdzenie startu po zaksięgowaniu zaliczki.',
    hasInternalVersion: false,
  },
  {
    key: 'projectComplete',
    previewParam: 'projectcomplete',
    nazwa: 'Zakończenie projektu',
    klucz: 'projectComplete',
    opis: 'Podziękowanie po zamknięciu realizacji.',
    hasInternalVersion: false,
  },
  {
    key: 'dealReminder',
    previewParam: 'dealreminder',
    nazwa: 'Przypomnienie (CRM)',
    klucz: 'dealReminder',
    opis: 'Ręczny trigger z Attio — dowolna wiadomość do klienta.',
    hasInternalVersion: false,
  },
  {
    key: 'rejection',
    previewParam: 'rejection',
    nazwa: 'Odrzucenie zlecenia',
    klucz: 'rejection',
    opis: 'Informacja o odrzuceniu zlecenia.',
    hasInternalVersion: false,
  },
  {
    key: 'quoteRequestClient',
    previewParam: 'quoterequestclient',
    nazwa: 'Wycena → klient',
    klucz: 'quoteRequestClient',
    opis: 'Potwierdzenie zapytania o wycenę wysłane do klienta.',
    hasInternalVersion: true,
  },
  {
    key: 'quoteRequestOwner',
    previewParam: null,
    nazwa: 'Wycena → właściciel',
    klucz: 'quoteRequestOwner',
    opis: 'Powiadomienie o nowym zapytaniu o wycenę.',
    hasInternalVersion: true,
  },
  {
    key: 'contactFormClient',
    previewParam: 'contactformclient',
    nazwa: 'Kontakt → klient',
    klucz: 'contactFormClient',
    opis: 'Potwierdzenie formularza kontaktowego wysłane do klienta.',
    hasInternalVersion: true,
  },
  {
    key: 'contactFormOwner',
    previewParam: null,
    nazwa: 'Kontakt → właściciel',
    klucz: 'contactFormOwner',
    opis: 'Powiadomienie o nowej wiadomości z formularza.',
    hasInternalVersion: true,
  },
  {
    key: 'meetingBookingClient',
    previewParam: 'meetingbookingclient',
    nazwa: 'Spotkanie → klient',
    klucz: 'meetingBookingClient',
    opis: 'Potwierdzenie rezerwacji spotkania discovery wysłane do klienta.',
    hasInternalVersion: true,
  },
  {
    key: 'meetingBookingOwner',
    previewParam: null,
    nazwa: 'Spotkanie → właściciel',
    klucz: 'meetingBookingOwner',
    opis: 'Powiadomienie o nowej rezerwacji spotkania.',
    hasInternalVersion: true,
  },
]

export function getTemplateMeta(key: TemplateKey): TemplateMeta | undefined {
  return TEMPLATE_META.find((m) => m.key === key)
}

/** Zmienne merge dostępne w szablonach Syntance. */
export const MERGE_VARIABLES = [
  { token: 'name', label: 'Imię klienta' },
  { token: 'bookingId', label: 'ID zlecenia' },
  { token: 'amount', label: 'Kwota (zaliczka)' },
  { token: 'priceNetto', label: 'Wartość netto' },
  { token: 'priceBrutto', label: 'Wartość brutto' },
  { token: 'projectType', label: 'Typ projektu' },
] as const

/** Pola tekstowe szablonu mapowane na bloki edytora. */
const CONTENT_FIELD_META: Record<string, { type: EmailBlock['type']; label: string }> = {
  headerEmoji: { type: 'emoji', label: 'Emoji' },
  heading: { type: 'heading', label: 'Nagłówek' },
  greetingTemplate: { type: 'text', label: 'Powitanie' },
  intro: { type: 'text', label: 'Wstęp' },
  body: { type: 'text', label: 'Treść' },
  body2: { type: 'text', label: 'Treść (ciąg dalszy)' },
  bodyTemplate: { type: 'text', label: 'Treść' },
  footerNote: { type: 'footer', label: 'Stopka' },
  footerLine: { type: 'footer', label: 'Linia stopki' },
}

export const COLOR_FIELD_SUFFIXES = ['Color', 'BackgroundColor', 'BorderColor']

export function isColorField(key: string): boolean {
  return COLOR_FIELD_SUFFIXES.some((s) => key.endsWith(s) || key.includes(s))
}

/** Generuje listę bloków z obiektu szablonu (pola tekstowe → bloki edytora). */
export function buildBlocks(template: Record<string, unknown>): EmailBlock[] {
  const FIELD_ORDER = [
    'headerEmoji', 'heading', 'greetingTemplate',
    'intro', 'body', 'bodyTemplate', 'body2',
    'footerNote', 'footerLine',
  ]

  const blocks: EmailBlock[] = []
  const templateKeys = new Set(Object.keys(template))

  for (const fieldKey of FIELD_ORDER) {
    if (!templateKeys.has(fieldKey)) continue
    if (isColorField(fieldKey)) continue
    const meta = CONTENT_FIELD_META[fieldKey]
    if (!meta) continue
    const value = String(template[fieldKey] ?? '')
    blocks.push({
      id: fieldKey,
      fieldKey,
      type: meta.type,
      label: meta.label,
      snippet: value.length > 60 ? value.slice(0, 60) + '…' : value,
    })
  }

  return blocks
}

export function buildPreviewUrl(previewParam: string): string {
  return `/api/admin/email-preview?template=${previewParam}&useDefaults=0`
}
