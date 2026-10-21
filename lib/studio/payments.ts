import { createHmac, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import { ENTITLEMENTS } from './license-contract'

/** Zdarzenie płatności niezależne od dostawcy. */
export type PaymentEvent =
  | {
      kind: 'purchase'
      eventId: string
      reference: string
      email: string
      plan: 'perpetual' | 'subscription'
      entitlements: (typeof ENTITLEMENTS)[number][]
      updatesUntil: string
      expiresAt: string | null
      /** Kwota i waluta do rejestru zamówień (jednostki najmniejsze, np. grosze); null, gdy dostawca ich nie podał. */
      amount: { total: number; currency: string } | null
    }
  | { kind: 'renewal'; eventId: string; reference: string; expiresAt: string }
  | { kind: 'refund'; eventId: string; reference: string }

export class WebhookSignatureError extends Error {}

/** Co sprzedaje dany price id Paddle (tabela studio_prices, edytowalna w panelu). */
export interface PriceEntry {
  plan: 'perpetual' | 'subscription'
  entitlements: (typeof ENTITLEMENTS)[number][]
  /** Perpetual: liczba miesięcy aktualizacji w cenie. */
  updateMonths: number
}
export type PriceLookup = (priceId: string) => Promise<PriceEntry | undefined>

type Headers = Readonly<Record<string, string | string[] | undefined>>

export interface PaymentProvider {
  readonly id: string
  /** Weryfikuje podpis PRZED parsowaniem; null = typ zdarzenia, na który nie reagujemy. */
  parseWebhook(rawBody: Buffer, headers: Headers, now: number, prices: PriceLookup): Promise<PaymentEvent | null>
}

function header(headers: Headers, name: string): string {
  const value = headers[name.toLowerCase()]
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

function safeEqualHex(a: string, b: string): boolean {
  if (!/^[0-9a-f]*$/i.test(a) || !/^[0-9a-f]*$/i.test(b)) return false
  const x = Buffer.from(a, 'hex')
  const y = Buffer.from(b, 'hex')
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y)
}

const PaddleEnvelope = z.object({
  event_id: z.string(),
  event_type: z.string(),
  data: z.record(z.string(), z.unknown()),
})
const PaddleTransaction = z.object({
  id: z.string(),
  subscription_id: z.string().nullable().optional(),
  currency_code: z.string().optional(),
  custom_data: z.object({ email: z.email() }).partial().nullable().optional(),
  items: z.array(z.object({ price: z.object({ id: z.string() }) })).min(1),
  billing_period: z.object({ ends_at: z.iso.datetime({ offset: true }) }).nullable().optional(),
  details: z.object({ totals: z.object({ grand_total: z.string() }).optional() }).optional(),
})
const PaddleSubscription = z.object({
  id: z.string(),
  status: z.string(),
  current_billing_period: z.object({ ends_at: z.iso.datetime({ offset: true }) }).nullable().optional(),
  canceled_at: z.iso.datetime({ offset: true }).nullable().optional(),
})
const PaddleAdjustment = z.object({ transaction_id: z.string(), action: z.string(), status: z.string() })

export function addMonths(from: number, months: number): string {
  const d = new Date(from)
  d.setUTCMonth(d.getUTCMonth() + months)
  return d.toISOString()
}

/**
 * Paddle Billing: nagłówek `Paddle-Signature: ts=<unix>;h1=<hex>` (kilka h1 przy rotacji sekretu),
 * HMAC-SHA256 nad `${ts}:${rawBody}` sekretem destynacji powiadomień, tolerancja czasu (domyślnie 5 s).
 * Mapowanie (do potwierdzenia w sandboxie Paddle przed produkcją — zadanie właściciela):
 * `transaction.completed` → zakup (e-mail z `custom_data.email` przekazanego w checkout, produkt z price id),
 * `subscription.updated`/`canceled` → odnowienie (koniec bieżącego okresu), zatwierdzony zwrot → refund.
 */
export class PaddleProvider implements PaymentProvider {
  readonly id = 'paddle'
  constructor(
    private readonly secret: string,
    private readonly toleranceSeconds = 5,
  ) {}

  async parseWebhook(rawBody: Buffer, headers: Headers, now: number, prices: PriceLookup): Promise<PaymentEvent | null> {
    const parts = header(headers, 'paddle-signature').split(';')
    const ts = parts.find((p) => p.startsWith('ts='))?.slice(3) ?? ''
    const signatures = parts.filter((p) => p.startsWith('h1=')).map((p) => p.slice(3))
    if (!/^\d+$/.test(ts) || signatures.length === 0) throw new WebhookSignatureError('Missing Paddle-Signature')
    if (Math.abs(now / 1000 - Number(ts)) > this.toleranceSeconds) throw new WebhookSignatureError('Stale webhook')
    const expected = createHmac('sha256', this.secret).update(`${ts}:`).update(rawBody).digest('hex')
    if (!signatures.some((s) => safeEqualHex(s, expected))) throw new WebhookSignatureError('Bad Paddle signature')

    const envelope = PaddleEnvelope.parse(JSON.parse(rawBody.toString('utf8')))
    switch (envelope.event_type) {
      case 'transaction.completed': {
        const tx = PaddleTransaction.parse(envelope.data)
        let product: PriceEntry | undefined
        for (const item of tx.items) {
          product = await prices(item.price.id)
          if (product) break
        }
        const email = tx.custom_data?.email
        if (!product || !email) return null
        const expiresAt = product.plan === 'subscription' ? (tx.billing_period?.ends_at ?? null) : null
        const total = tx.details?.totals?.grand_total
        return {
          kind: 'purchase',
          eventId: envelope.event_id,
          reference: product.plan === 'subscription' && tx.subscription_id ? tx.subscription_id : tx.id,
          email,
          plan: product.plan,
          entitlements: product.entitlements,
          updatesUntil: expiresAt ? new Date(expiresAt).toISOString() : addMonths(now, product.updateMonths),
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          amount: total !== undefined && tx.currency_code && /^\d+$/.test(total) ? { total: Number(total), currency: tx.currency_code } : null,
        }
      }
      case 'subscription.updated':
      case 'subscription.canceled': {
        const sub = PaddleSubscription.parse(envelope.data)
        const end = sub.current_billing_period?.ends_at ?? sub.canceled_at
        if (!end) return null
        return { kind: 'renewal', eventId: envelope.event_id, reference: sub.id, expiresAt: new Date(end).toISOString() }
      }
      case 'adjustment.created':
      case 'adjustment.updated': {
        const adj = PaddleAdjustment.parse(envelope.data)
        if (adj.action !== 'refund' || adj.status !== 'approved') return null
        return { kind: 'refund', eventId: envelope.event_id, reference: adj.transaction_id }
      }
      default:
        return null
    }
  }
}
