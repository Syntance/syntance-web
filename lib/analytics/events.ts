/**
 * Standard analityki Syntance — nazwy zdarzeń category:object_action (snake_case).
 * GA4: mapowanie na recommended events tam, gdzie ma to sens.
 * PostHog: te same nazwy kanoniczne (product analytics + lejek).
 */

export const AnalyticsEvent = {
  // Lejek /porozmawiajmy
  LeadLandingView: 'lead_flow:landing_view',
  LeadSectionView: 'lead_flow:section_view',
  LeadCtaClick: 'lead_flow:cta_click',
  LeadFormSubmit: 'lead_flow:form_submit',
  LeadSubpageClick: 'lead_flow:subpage_click',
  // Booking widget (kalendarz)
  BookingSlotSelect: 'booking_flow:slot_select',
  BookingComplete: 'booking_flow:booking_complete',
  // Formularz kontaktowy
  ContactFormSubmit: 'contact_flow:form_submit',
  ContactFormSuccess: 'contact_flow:form_success',
  // Konfigurator cennika
  PricingTypeSelect: 'pricing_flow:type_select',
  PricingItemToggle: 'pricing_flow:item_toggle',
  PricingInquiryOpen: 'pricing_flow:inquiry_open',
  PricingInquirySubmit: 'pricing_flow:inquiry_submit',
  // Globalny CTA (sticky float, hero)
  SiteCtaClick: 'site:cta_click',
} as const

export type AnalyticsEventName = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent]

export type AnalyticsEventProps = Record<string, string | number | boolean | undefined>

/** Właściwości nigdy nie wysyłane do GA4 / PostHog (RODO). */
const BLOCKED_PROP_KEYS = new Set([
  'email',
  'phone',
  'full_name',
  'name',
  'first_name',
  'last_name',
  'ip',
  'user_id',
])

export function sanitizeAnalyticsProps(
  props?: AnalyticsEventProps,
): AnalyticsEventProps | undefined {
  if (!props) return undefined

  const clean: AnalyticsEventProps = {}
  for (const [key, value] of Object.entries(props)) {
    if (BLOCKED_PROP_KEYS.has(key.toLowerCase())) continue
    if (value === undefined) continue
    clean[key] = value
  }

  return Object.keys(clean).length > 0 ? clean : undefined
}

type Ga4ParamValue = string | number | boolean

type Ga4Mapping = {
  event: string
  mapProps?: (props: AnalyticsEventProps) => Record<string, Ga4ParamValue>
}

function toGa4Params(props?: AnalyticsEventProps): Record<string, Ga4ParamValue> {
  const safe = sanitizeAnalyticsProps(props)
  if (!safe) return {}

  const out: Record<string, Ga4ParamValue> = {}
  for (const [key, value] of Object.entries(safe)) {
    if (value !== undefined) out[key] = value
  }
  return out
}

/** Mapowanie zdarzeń Syntance → GA4 recommended / custom. */
export function mapEventToGa4(
  name: AnalyticsEventName | string,
  props?: AnalyticsEventProps,
): Ga4Mapping | null {
  const safe = sanitizeAnalyticsProps(props)

  switch (name) {
    case AnalyticsEvent.LeadCtaClick:
      return {
        event: 'select_promotion',
        mapProps: () => ({
          promotion_name: String(safe?.position ?? 'cta'),
          location_id: String(safe?.page_path ?? 'unknown'),
        }),
      }
    case AnalyticsEvent.LeadFormSubmit:
      return {
        event: 'generate_lead',
        mapProps: () => ({
          lead_type: 'audit_request',
          ...(safe?.budget_range ? { value: String(safe.budget_range) } : {}),
        }),
      }
    case AnalyticsEvent.LeadSubpageClick:
      return {
        event: 'select_content',
        mapProps: () => ({
          content_type: 'subpage',
          item_id: String(safe?.target ?? 'unknown'),
        }),
      }
    case AnalyticsEvent.BookingComplete:
      return {
        event: 'generate_lead',
        mapProps: () => ({
          lead_type: 'meeting_booking',
          ...(safe?.source ? { source: String(safe.source) } : {}),
        }),
      }
    case AnalyticsEvent.ContactFormSubmit:
    case AnalyticsEvent.ContactFormSuccess:
      return {
        event: 'generate_lead',
        mapProps: () => ({
          lead_type: 'contact_form',
          ...(safe?.source ? { source: String(safe.source) } : {}),
        }),
      }
    case AnalyticsEvent.PricingInquirySubmit:
      return {
        event: 'generate_lead',
        mapProps: () => ({
          lead_type: 'pricing_inquiry',
          ...(safe?.project_type ? { content_type: String(safe.project_type) } : {}),
        }),
      }
    case AnalyticsEvent.SiteCtaClick:
      return {
        event: 'select_promotion',
        mapProps: () => ({
          promotion_name: String(safe?.label ?? 'cta'),
          location_id: String(safe?.location ?? 'unknown'),
        }),
      }
    case AnalyticsEvent.LeadLandingView:
    case AnalyticsEvent.LeadSectionView:
    case AnalyticsEvent.BookingSlotSelect:
    case AnalyticsEvent.PricingTypeSelect:
    case AnalyticsEvent.PricingItemToggle:
    case AnalyticsEvent.PricingInquiryOpen:
      return {
        event: name.replace(':', '_'),
        mapProps: (input) => toGa4Params(input),
      }
    default:
      return {
        event: name.replace(':', '_'),
        mapProps: (input) => toGa4Params(input),
      }
  }
}
