import { client } from '../lib/client'

/** Szablon HTML — umowy */
export interface EmailTemplateContract {
  subjectTemplate: string
  headerEmoji?: string
  /** Tło głównej karty (600px). */
  mailBackgroundColor: string
  /** Tło wewnętrznych bloków (np. podsumowanie). */
  sectionPanelBackgroundColor: string
  heading: string
  headingColor: string
  greetingTemplate?: string
  greetingColor: string
  intro?: string
  introColor: string
  footerNote?: string
  footerNoteColor: string
  /** „Nr referencyjny” itd. */
  referenceLineMutedColor: string
  /** Wartość numeru zlecenia w nagłówku. */
  referenceLineAccentColor: string
  /** Nagłówek sekcji z tabelą (h3). */
  summarySectionHeadingColor: string
  tableLabelColor: string
  tableValueColor: string
  tableAccentColor: string
}

export interface EmailTemplatePayment {
  subjectTemplate: string
  headerEmoji?: string
  mailBackgroundColor: string
  sectionPanelBackgroundColor: string
  paymentDetailsPanelBackgroundColor: string
  paymentDetailsBorderColor: string
  heading: string
  headingColor: string
  greetingTemplate?: string
  greetingColor: string
  intro?: string
  introColor: string
  footerNote?: string
  footerNoteColor: string
  referenceLineMutedColor: string
  referenceLineAccentColor: string
  summarySectionHeadingColor: string
  tableLabelColor: string
  tableValueColor: string
  tableAccentColor: string
  paymentDetailsHeadingColor: string
  transferTitleColor: string
  transferAmountColor: string
}

/** Po zaksięgowaniu zaliczki — potwierdzenie startu realizacji (pipeline CRM). */
export interface EmailTemplateProjectKickoff {
  subjectTemplate: string
  headerEmoji?: string
  mailBackgroundColor: string
  heading: string
  headingColor: string
  greetingTemplate?: string
  greetingColor: string
  intro?: string
  introColor: string
  footerNote?: string
  footerNoteColor: string
  referenceLineMutedColor: string
  referenceLineAccentColor: string
}

export interface EmailTemplateRejection {
  subjectTemplate: string
  headerEmoji?: string
  mailBackgroundColor: string
  heading: string
  headingColor: string
  greetingTemplate?: string
  greetingColor: string
  body?: string
  bodyColor: string
  body2?: string
  body2Color: string
  footerNote?: string
  footerNoteColor: string
  referenceLineMutedColor: string
  referenceLineAccentColor: string
}

export interface EmailTemplateQuoteRequestClient {
  subjectTemplate: string
  headerEmoji?: string
  mailBackgroundColor: string
  sectionPanelBackgroundColor: string
  heading: string
  headingColor: string
  greetingTemplate?: string
  greetingColor: string
  intro?: string
  introColor: string
  nextStepsTitle?: string
  nextStepsTitleColor: string
  nextStepsBody?: string
  nextStepsBodyColor: string
  footerNote?: string
  footerNoteColor: string
  referenceLineMutedColor: string
  referenceLineAccentColor: string
  summarySectionHeadingColor: string
  tableLabelColor: string
  tableValueColor: string
  tableAccentColor: string
  itemListTextColor: string
  listBulletColor: string
  calloutBackgroundColor: string
  calloutBorderColor: string
}

export interface EmailTemplateQuoteRequestOwner {
  subjectTemplate: string
  headerEmoji?: string
  mailBackgroundColor: string
  sectionPanelBackgroundColor: string
  headerTitle: string
  headerTitleColor: string
  /** Kolor „ID: ” (jak etykieta „Nr referencyjny”). */
  referenceLineMutedColor: string
  /** Kolor numeru zapytania w nagłówku (jak wartość referencyjna). */
  referenceLineAccentColor: string
  /** Kolor daty po „•” w linii meta. */
  headerMetaColor: string
  sectionHeadingColor: string
  clientFieldLabelColor: string
  clientFieldValueColor: string
  descriptionTextColor: string
  linkAccentColor: string
  pricingLabelColor: string
  pricingValueNettoColor: string
  pricingValueBruttoColor: string
  pricingDepositColor: string
  pricingTimeColor: string
  dividerRowColor: string
  itemsListTextColor: string
  listBulletColor: string
  actionStripBackgroundColor: string
  actionPromptColor: string
  acceptButtonGradientStartColor: string
  acceptButtonGradientEndColor: string
  acceptButtonTextColor: string
  rejectButtonBackgroundColor: string
  rejectButtonTextColor: string
  autoFooterNoteColor: string
  actionPrompt?: string
  acceptButtonLabel?: string
  rejectButtonLabel?: string
  autoFooterNote?: string
}

export interface EmailTemplateContactFormClient {
  subjectTemplate: string
  headerEmoji?: string
  mailBackgroundColor: string
  headerBandBackgroundColor: string
  heading: string
  headingColor: string
  greetingTemplate?: string
  greetingColor: string
  bodyParagraph1?: string
  bodyParagraph1Color: string
  bodyParagraph2?: string
  bodyParagraph2Color: string
  asideTitle?: string
  asideTitleColor: string
  link1Label?: string
  link1LabelColor: string
  link1RowBackgroundColor: string
  link1RowBorderColor: string
  link1Url?: string
  link2Label?: string
  link2LabelColor: string
  link2RowBackgroundColor: string
  link2RowBorderColor: string
  link2Url?: string
  closingLine?: string
  closingLineColor: string
  footerBandBackgroundColor: string
  footerTagline?: string
  footerTaglineColor: string
  footerSecondaryLinkColor: string
  footerEmail?: string
  footerSiteLabel?: string
  footerSiteUrl?: string
  legalNote?: string
  legalNoteColor: string
}

export interface EmailTemplateContactFormOwner {
  subjectTemplate: string
  bodyTemplate?: string
}

export interface EmailTemplateMeetingBookingClient {
  subjectTemplate: string
  headerEmoji?: string
  mailBackgroundColor: string
  sectionPanelBackgroundColor: string
  headingTemplate?: string
  headingColor: string
  subheadingTemplate?: string
  subheadingColor: string
  meetLinkIntro?: string
  meetIntroColor: string
  fallbackNoMeetParagraph?: string
  fallbackParagraphColor: string
  rescheduleNote?: string
  rescheduleNoteColor: string
  mainContentTextColor: string
  dateStrongColor: string
  meetLinkColor: string
  footerLine?: string
  footerLineColor: string
  footerStripBackgroundColor: string
}

export interface EmailTemplateMeetingBookingOwner {
  subjectTemplate: string
  bodyTemplate?: string
}

export interface EmailTemplates {
  contracts: EmailTemplateContract
  payment: EmailTemplatePayment
  projectKickoff: EmailTemplateProjectKickoff
  rejection: EmailTemplateRejection
  quoteRequestClient: EmailTemplateQuoteRequestClient
  quoteRequestOwner: EmailTemplateQuoteRequestOwner
  contactFormClient: EmailTemplateContactFormClient
  contactFormOwner: EmailTemplateContactFormOwner
  meetingBookingClient: EmailTemplateMeetingBookingClient
  meetingBookingOwner: EmailTemplateMeetingBookingOwner
}

const C = {
  page: '#0a0a0a',
  card: '#111111',
  section: '#1a1a1a',
  border: '#222222',
  footerStrip: '#0d0d0d',
  white: '#ffffff',
  body: '#cccccc',
  muted: '#888888',
  strong: '#ffffff',
  accent: '#a78bfa',
  positive: '#22c55e',
  positiveSoft: '#86efac',
  subtle: '#555555',
  secondaryValue: '#aaaaaa',
  link2: '#93c5fd',
  footerSmall: '#666666',
  divider: '#333333',
  calloutBg: 'rgba(34,197,94,0.08)',
  calloutBorder: 'rgba(34,197,94,0.19)',
  copyright: '#555555',
} as const

/** Para kolorów dla linii „Nr referencyjny:” / „ID:” — szara etykieta, lawendowy kod (design system maili). */
const REF_LINE = {
  muted: '#9e9e9e',
  accent: '#a29bfe',
} as const

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplates = {
  contracts: {
    subjectTemplate: 'Syntance - Umowy do zlecenia {bookingId}',
    headerEmoji: '📄',
    mailBackgroundColor: C.card,
    sectionPanelBackgroundColor: C.section,
    heading: 'Umowy do Twojego zlecenia',
    headingColor: C.white,
    greetingTemplate: 'Cześć {name},',
    greetingColor: C.body,
    intro:
      'W załączeniu przesyłamy umowy dotyczące realizacji Twojego zlecenia ({bookingId}).\n\nProsimy o zapoznanie się z dokumentami, podpisanie ich i odesłanie skanów na kontakt@syntance.com. Po otrzymaniu podpisanych umów wyślemy dane do płatności zaliczki.',
    introColor: C.body,
    footerNote: 'Pytania? Napisz na kontakt@syntance.com.',
    footerNoteColor: C.muted,
    referenceLineMutedColor: REF_LINE.muted,
    referenceLineAccentColor: REF_LINE.accent,
    summarySectionHeadingColor: C.white,
    tableLabelColor: C.muted,
    tableValueColor: C.white,
    tableAccentColor: C.accent,
  },
  payment: {
    subjectTemplate: 'Syntance - Dane do płatności - {bookingId}',
    headerEmoji: '🎉',
    mailBackgroundColor: C.card,
    sectionPanelBackgroundColor: C.section,
    paymentDetailsPanelBackgroundColor: C.footerStrip,
    paymentDetailsBorderColor: C.divider,
    heading: 'Zlecenie potwierdzone!',
    headingColor: C.positive,
    greetingTemplate: 'Cześć {name},',
    greetingColor: C.body,
    intro:
      'Dziękujemy za podpisanie umów! Poniżej znajdziesz dane do wpłaty zaliczki, po której rozpoczynamy realizację projektu.',
    introColor: C.body,
    footerNote:
      'Po zaksięgowaniu wpłaty skontaktujemy się w sprawie startu projektu. Pytania? kontakt@syntance.com.',
    footerNoteColor: C.muted,
    referenceLineMutedColor: REF_LINE.muted,
    referenceLineAccentColor: REF_LINE.accent,
    summarySectionHeadingColor: C.white,
    tableLabelColor: C.muted,
    tableValueColor: C.white,
    tableAccentColor: C.accent,
    paymentDetailsHeadingColor: C.white,
    transferTitleColor: C.accent,
    transferAmountColor: C.positive,
  },
  projectKickoff: {
    subjectTemplate: 'Syntance - Zaczynamy realizację — {bookingId}',
    headerEmoji: '🥳',
    mailBackgroundColor: C.card,
    heading: 'Zaliczka u nas — zaczynamy realizację!',
    headingColor: C.positive,
    greetingTemplate: 'Cześć {name},',
    greetingColor: C.positiveSoft,
    intro:
      'Dziękujemy za wpłatę zaliczki — mamy ją zaksięgowaną i uruchamiamy Twój projekt.\n\nW kolejnych dniach skontaktujemy się w sprawie pierwszych kroków i harmonogramu. Pytania? kontakt@syntance.com.',
    introColor: C.body,
    footerNote: 'Do zobaczenia po drugiej stronie kodu — zespół Syntance',
    footerNoteColor: C.muted,
    referenceLineMutedColor: REF_LINE.muted,
    referenceLineAccentColor: REF_LINE.accent,
  },
  rejection: {
    subjectTemplate: 'Syntance - Informacja o zleceniu',
    headerEmoji: '',
    mailBackgroundColor: C.card,
    heading: 'Informacja o zapytaniu',
    headingColor: C.white,
    greetingTemplate: 'Cześć {name},',
    greetingColor: C.body,
    body:
      'Dziękujemy za zainteresowanie współpracą z Syntance. Niestety, w tym momencie nie możemy przyjąć Twojego zlecenia.',
    bodyColor: C.body,
    body2: 'Skontaktujemy się z Tobą wkrótce, aby omówić możliwe alternatywy.',
    body2Color: C.body,
    footerNote: 'Pytania? kontakt@syntance.com · +48 537 110 170',
    footerNoteColor: C.muted,
    referenceLineMutedColor: REF_LINE.muted,
    referenceLineAccentColor: REF_LINE.accent,
  },
  quoteRequestClient: {
    subjectTemplate: 'Syntance - Zapytanie o wycenę {projectTypeGenitive} - {titleDate}',
    headerEmoji: '📨',
    mailBackgroundColor: C.card,
    sectionPanelBackgroundColor: C.section,
    heading: 'Zapytanie o wycenę przyjęte',
    headingColor: C.white,
    greetingTemplate: 'Cześć {name},',
    greetingColor: C.body,
    intro:
      'Dziękujemy za zainteresowanie współpracą z Syntance! Otrzymaliśmy Twoje zapytanie i odezwiemy się w ciągu 24 godzin, żeby ustalić termin realizacji.',
    introColor: C.body,
    nextStepsTitle: 'Co dalej?',
    nextStepsTitleColor: C.positive,
    nextStepsBody:
      'Skontaktujemy się z Tobą, żeby omówić szczegóły, ustalić termin realizacji i przejść do akceptacji wyceny.',
    nextStepsBodyColor: C.positiveSoft,
    footerNote:
      'Jeśli masz pytania, odpowiedz na ten email lub napisz na kontakt@syntance.com.',
    footerNoteColor: C.muted,
    referenceLineMutedColor: REF_LINE.muted,
    referenceLineAccentColor: REF_LINE.accent,
    summarySectionHeadingColor: C.white,
    tableLabelColor: C.muted,
    tableValueColor: C.white,
    tableAccentColor: C.accent,
    itemListTextColor: C.body,
    listBulletColor: C.accent,
    calloutBackgroundColor: C.calloutBg,
    calloutBorderColor: C.calloutBorder,
  },
  quoteRequestOwner: {
    subjectTemplate: 'Syntance - Zapytanie o wycenę {projectTypeGenitive} - {titleDate}',
    headerEmoji: '🔔',
    mailBackgroundColor: C.card,
    sectionPanelBackgroundColor: C.section,
    headerTitle: 'Nowe zapytanie o wycenę',
    headerTitleColor: C.white,
    referenceLineMutedColor: REF_LINE.muted,
    referenceLineAccentColor: REF_LINE.accent,
    headerMetaColor: C.muted,
    sectionHeadingColor: C.white,
    clientFieldLabelColor: C.muted,
    clientFieldValueColor: C.white,
    descriptionTextColor: C.body,
    linkAccentColor: C.accent,
    pricingLabelColor: C.muted,
    pricingValueNettoColor: C.white,
    pricingValueBruttoColor: C.secondaryValue,
    pricingDepositColor: C.accent,
    pricingTimeColor: C.white,
    dividerRowColor: C.divider,
    itemsListTextColor: C.body,
    listBulletColor: C.accent,
    actionStripBackgroundColor: C.footerStrip,
    actionPromptColor: C.muted,
    acceptButtonGradientStartColor: C.positive,
    acceptButtonGradientEndColor: '#16a34a',
    acceptButtonTextColor: C.white,
    rejectButtonBackgroundColor: C.divider,
    rejectButtonTextColor: C.white,
    autoFooterNoteColor: C.subtle,
    actionPrompt: 'Kliknij aby zaakceptować lub odrzucić zlecenie:',
    acceptButtonLabel: '✓ Akceptuj zlecenie',
    rejectButtonLabel: '✗ Odrzuć',
    autoFooterNote: 'Ten email został wygenerowany automatycznie przez konfigurator Syntance.',
  },
  contactFormClient: {
    subjectTemplate: 'Otrzymaliśmy Twoje zapytanie — Syntance',
    headerEmoji: '',
    mailBackgroundColor: C.card,
    headerBandBackgroundColor: C.section,
    heading: 'Dziękujemy za wiadomość!',
    headingColor: C.white,
    greetingTemplate: 'Cześć {firstName},',
    greetingColor: C.body,
    bodyParagraph1: 'Otrzymaliśmy Twoje zapytanie i już je analizujemy.',
    bodyParagraph1Color: C.body,
    bodyParagraph2: 'Odezwiemy się w ciągu 24 godzin w dni robocze.',
    bodyParagraph2Color: C.body,
    asideTitle: 'W międzyczasie możesz:',
    asideTitleColor: C.muted,
    link1Label: '📋 Sprawdzić nasz cennik i ofertę',
    link1LabelColor: C.accent,
    link1RowBackgroundColor: C.calloutBg,
    link1RowBorderColor: C.calloutBorder,
    link1Url: 'https://syntance.com/cennik',
    link2Label: '🎯 Dowiedzieć się więcej o naszej strategii',
    link2LabelColor: C.link2,
    link2RowBackgroundColor: C.section,
    link2RowBorderColor: C.border,
    link2Url: 'https://syntance.com/strategia-marketingu-i-sprzedazy',
    closingLine: 'Do usłyszenia!',
    closingLineColor: C.body,
    footerBandBackgroundColor: C.footerStrip,
    footerTagline: 'Syntance — Strony i sklepy, które działają.',
    footerTaglineColor: C.muted,
    footerSecondaryLinkColor: C.footerSmall,
    footerSiteLabel: 'syntance.com',
    footerSiteUrl: 'https://syntance.com',
    footerEmail: 'biuro@syntance.com',
    legalNote:
      'Ten email został wysłany automatycznie w odpowiedzi na Twoje zapytanie przez formularz kontaktowy na stronie syntance.com.',
    legalNoteColor: C.subtle,
  },
  contactFormOwner: {
    subjectTemplate: 'Nowy lead ze strony: {name}',
    bodyTemplate: `Imię i nazwisko: {name}
Email: {email}
Telefon: {phone}
Źródło: {source}

Wiadomość:
{message}`,
  },
  meetingBookingClient: {
    subjectTemplate: 'Potwierdzenie rozmowy — {meetingDateLabel}, {meetingTime}',
    headerEmoji: '📅',
    mailBackgroundColor: C.card,
    sectionPanelBackgroundColor: C.section,
    headingTemplate: 'Dzięki, {name} — mamy termin',
    headingColor: C.white,
    subheadingTemplate: 'Potwierdzenie rezerwacji {slotMinutes}-min rozmowy z Kamilem.',
    subheadingColor: C.secondaryValue,
    meetLinkIntro: 'Link do Google Meet (otrzymasz też zaproszenie w kalendarzu):',
    meetIntroColor: C.body,
    fallbackNoMeetParagraph:
      'W załączniku znajdziesz plik .ics — kliknij, żeby dodać spotkanie do kalendarza.',
    fallbackParagraphColor: C.body,
    rescheduleNote: 'Chcesz przesunąć / odwołać? Wystarczy odpowiedzieć na tego maila.',
    rescheduleNoteColor: C.body,
    mainContentTextColor: C.body,
    dateStrongColor: C.white,
    meetLinkColor: C.accent,
    footerLine: 'Syntance • kamil@syntance.com',
    footerLineColor: C.footerSmall,
    footerStripBackgroundColor: C.footerStrip,
  },
  meetingBookingOwner: {
    subjectTemplate: 'Nowa rozmowa: {meetingDateLabel}, {meetingTime} — {name}',
    bodyTemplate: `Nowa rezerwacja {slotMinutes}-min rozmowy

Data: {meetingDateLabel}
Godzina: {meetingTime} ({slotMinutes} min)

Imię: {name}
Email: {email}
{companyLine}{topicLine}{sourceLine}{calendarLine}{meetLine}{sanityLine}`,
  },
}

export const emailTemplatesQuery = `*[_type == "emailTemplates" && _id == "emailTemplates"][0]{
  contracts{
    subjectTemplate, headerEmoji,
    mailBackgroundColor, sectionPanelBackgroundColor,
    heading, headingColor, greetingTemplate, greetingColor, intro, introColor, footerNote, footerNoteColor,
    referenceLineMutedColor, referenceLineAccentColor, summarySectionHeadingColor,
    tableLabelColor, tableValueColor, tableAccentColor
  },
  payment{
    subjectTemplate, headerEmoji,
    mailBackgroundColor, sectionPanelBackgroundColor, paymentDetailsPanelBackgroundColor, paymentDetailsBorderColor,
    heading, headingColor, greetingTemplate, greetingColor, intro, introColor, footerNote, footerNoteColor,
    referenceLineMutedColor, referenceLineAccentColor, summarySectionHeadingColor,
    tableLabelColor, tableValueColor, tableAccentColor,
    paymentDetailsHeadingColor, transferTitleColor, transferAmountColor
  },
  projectKickoff{
    subjectTemplate, headerEmoji, mailBackgroundColor,
    heading, headingColor, greetingTemplate, greetingColor, intro, introColor, footerNote, footerNoteColor,
    referenceLineMutedColor, referenceLineAccentColor
  },
  rejection{
    subjectTemplate, headerEmoji,
    mailBackgroundColor,
    heading, headingColor, greetingTemplate, greetingColor, body, bodyColor, body2, body2Color, footerNote, footerNoteColor,
    referenceLineMutedColor, referenceLineAccentColor
  },
  quoteRequestClient{
    subjectTemplate, headerEmoji,
    mailBackgroundColor, sectionPanelBackgroundColor,
    heading, headingColor, greetingTemplate, greetingColor, intro, introColor,
    nextStepsTitle, nextStepsTitleColor, nextStepsBody, nextStepsBodyColor, footerNote, footerNoteColor,
    referenceLineMutedColor, referenceLineAccentColor, summarySectionHeadingColor, tableLabelColor, tableValueColor, tableAccentColor,
    itemListTextColor, listBulletColor, calloutBackgroundColor, calloutBorderColor
  },
  quoteRequestOwner{
    subjectTemplate, headerEmoji,
    mailBackgroundColor, sectionPanelBackgroundColor,
    headerTitle, headerTitleColor, referenceLineMutedColor, referenceLineAccentColor, headerMetaColor, sectionHeadingColor,
    clientFieldLabelColor, clientFieldValueColor, descriptionTextColor, linkAccentColor,
    pricingLabelColor, pricingValueNettoColor, pricingValueBruttoColor, pricingDepositColor, pricingTimeColor,
    dividerRowColor, itemsListTextColor, listBulletColor,
    actionStripBackgroundColor, actionPromptColor,
    acceptButtonGradientStartColor, acceptButtonGradientEndColor, acceptButtonTextColor,
    rejectButtonBackgroundColor, rejectButtonTextColor, autoFooterNoteColor,
    actionPrompt, acceptButtonLabel, rejectButtonLabel, autoFooterNote
  },
  contactFormClient{
    subjectTemplate, headerEmoji,
    mailBackgroundColor, headerBandBackgroundColor,
    heading, headingColor, greetingTemplate, greetingColor,
    bodyParagraph1, bodyParagraph1Color, bodyParagraph2, bodyParagraph2Color,
    asideTitle, asideTitleColor,
    link1Label, link1LabelColor, link1RowBackgroundColor, link1RowBorderColor, link1Url,
    link2Label, link2LabelColor, link2RowBackgroundColor, link2RowBorderColor, link2Url,
    closingLine, closingLineColor,
    footerBandBackgroundColor, footerTagline, footerTaglineColor, footerSecondaryLinkColor,
    footerSiteLabel, footerSiteUrl, footerEmail, legalNote, legalNoteColor
  },
  contactFormOwner{ subjectTemplate, bodyTemplate },
  meetingBookingClient{
    subjectTemplate, headerEmoji,
    mailBackgroundColor, sectionPanelBackgroundColor,
    headingTemplate, headingColor, subheadingTemplate, subheadingColor,
    meetLinkIntro, meetIntroColor, fallbackNoMeetParagraph, fallbackParagraphColor,
    rescheduleNote, rescheduleNoteColor, mainContentTextColor, dateStrongColor, meetLinkColor,
    footerLine, footerLineColor, footerStripBackgroundColor
  },
  meetingBookingOwner{ subjectTemplate, bodyTemplate }
}`

export function mergeEmailTemplatesWithDefaults(
  raw: Partial<EmailTemplates> | null | undefined,
): EmailTemplates {
  return {
    contracts: { ...DEFAULT_EMAIL_TEMPLATES.contracts, ...(raw?.contracts ?? {}) },
    payment: { ...DEFAULT_EMAIL_TEMPLATES.payment, ...(raw?.payment ?? {}) },
    projectKickoff: {
      ...DEFAULT_EMAIL_TEMPLATES.projectKickoff,
      ...(raw?.projectKickoff ?? {}),
    },
    rejection: { ...DEFAULT_EMAIL_TEMPLATES.rejection, ...(raw?.rejection ?? {}) },
    quoteRequestClient: {
      ...DEFAULT_EMAIL_TEMPLATES.quoteRequestClient,
      ...(raw?.quoteRequestClient ?? {}),
    },
    quoteRequestOwner: {
      ...DEFAULT_EMAIL_TEMPLATES.quoteRequestOwner,
      ...(raw?.quoteRequestOwner ?? {}),
    },
    contactFormClient: {
      ...DEFAULT_EMAIL_TEMPLATES.contactFormClient,
      ...(raw?.contactFormClient ?? {}),
    },
    contactFormOwner: {
      ...DEFAULT_EMAIL_TEMPLATES.contactFormOwner,
      ...(raw?.contactFormOwner ?? {}),
    },
    meetingBookingClient: {
      ...DEFAULT_EMAIL_TEMPLATES.meetingBookingClient,
      ...(raw?.meetingBookingClient ?? {}),
    },
    meetingBookingOwner: {
      ...DEFAULT_EMAIL_TEMPLATES.meetingBookingOwner,
      ...(raw?.meetingBookingOwner ?? {}),
    },
  }
}

export async function getEmailTemplates(): Promise<EmailTemplates> {
  try {
    const data = await client.fetch<Partial<EmailTemplates> | null>(
      emailTemplatesQuery,
      {},
      { cache: 'no-store' },
    )
    return mergeEmailTemplatesWithDefaults(data)
  } catch (err) {
    console.error('[emailTemplates] Sanity fetch failed, using defaults:', err)
    return mergeEmailTemplatesWithDefaults(null)
  }
}

export function applyEmailTokens(template: string, tokens: Record<string, string | undefined>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => tokens[key] ?? '')
}
