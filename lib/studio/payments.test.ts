import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { PaddleProvider, WebhookSignatureError, type PriceLookup } from './payments'

const SECRET = 'pdl_ntfset_test_secret'
const NOW = Date.parse('2026-10-21T10:00:00.000Z')
const prices: PriceLookup = (id) =>
  Promise.resolve(id === 'pri_pro' ? { plan: 'perpetual', entitlements: ['pro'], updateMonths: 12 } : id === 'pri_sub' ? { plan: 'subscription', entitlements: ['pro', 'vector'], updateMonths: 1 } : undefined)

const sign = (body: string, ts = Math.floor(NOW / 1000), secret = SECRET) =>
  `ts=${ts};h1=${createHmac('sha256', secret).update(`${ts}:${body}`).digest('hex')}`

const event = (type: string, data: unknown, id = 'evt_1') => JSON.stringify({ event_id: id, event_type: type, data })
const parse = (body: string, header: string | undefined, now = NOW) =>
  new PaddleProvider(SECRET).parseWebhook(Buffer.from(body), header === undefined ? {} : { 'paddle-signature': header }, now, prices)

const tx = (over: Record<string, unknown> = {}) => ({
  id: 'txn_1',
  currency_code: 'PLN',
  custom_data: { email: 'klient@example.com' },
  items: [{ price: { id: 'pri_pro' } }],
  details: { totals: { grand_total: '19900' } },
  ...over,
})

describe('Paddle webhook', () => {
  it('zakup perpetual: e-mail z custom_data, uprawnienia z mapy cen, 12 mies. aktualizacji', async () => {
    const body = event('transaction.completed', tx())
    expect(await parse(body, sign(body))).toEqual({
      kind: 'purchase',
      eventId: 'evt_1',
      reference: 'txn_1',
      email: 'klient@example.com',
      plan: 'perpetual',
      entitlements: ['pro'],
      updatesUntil: '2027-10-21T10:00:00.000Z',
      expiresAt: null,
      amount: { total: 19900, currency: 'PLN' },
    })
  })

  it('zakup subskrypcji: referencja = id subskrypcji, koniec okresu z billing_period', async () => {
    const body = event(
      'transaction.completed',
      tx({ subscription_id: 'sub_9', items: [{ price: { id: 'pri_sub' } }], billing_period: { ends_at: '2026-11-21T10:00:00Z' } }),
    )
    expect(await parse(body, sign(body))).toMatchObject({ reference: 'sub_9', plan: 'subscription', expiresAt: '2026-11-21T10:00:00.000Z' })
  })

  it('ignoruje nieznany price id, brak e-maila i nieobsługiwane typy', async () => {
    const unknown = event('transaction.completed', tx({ items: [{ price: { id: 'pri_x' } }] }))
    expect(await parse(unknown, sign(unknown))).toBeNull()
    const noEmail = event('transaction.completed', tx({ custom_data: null }))
    expect(await parse(noEmail, sign(noEmail))).toBeNull()
    const other = event('customer.created', {})
    expect(await parse(other, sign(other))).toBeNull()
  })

  it('odnowienie i zwrot', async () => {
    const upd = event('subscription.updated', { id: 'sub_9', status: 'active', current_billing_period: { ends_at: '2026-12-21T10:00:00Z' } })
    expect(await parse(upd, sign(upd))).toMatchObject({ kind: 'renewal', reference: 'sub_9', expiresAt: '2026-12-21T10:00:00.000Z' })
    const refund = event('adjustment.updated', { transaction_id: 'txn_1', action: 'refund', status: 'approved' })
    expect(await parse(refund, sign(refund))).toMatchObject({ kind: 'refund', reference: 'txn_1' })
    const pending = event('adjustment.created', { transaction_id: 'txn_1', action: 'refund', status: 'pending_approval' })
    expect(await parse(pending, sign(pending))).toBeNull()
  })

  it('odrzuca brak podpisu, zły podpis, zły sekret, nieaktualny znacznik czasu i zmodyfikowane ciało', async () => {
    const body = event('transaction.completed', tx())
    await expect(parse(body, undefined)).rejects.toBeInstanceOf(WebhookSignatureError)
    await expect(parse(body, 'ts=1;h1=zz')).rejects.toBeInstanceOf(WebhookSignatureError)
    await expect(parse(body, sign(body, undefined, 'inny'))).rejects.toBeInstanceOf(WebhookSignatureError)
    await expect(parse(body, sign(body, Math.floor(NOW / 1000) - 60))).rejects.toBeInstanceOf(WebhookSignatureError)
    await expect(parse(body.replace('19900', '1'), sign(body))).rejects.toBeInstanceOf(WebhookSignatureError)
  })

  it('akceptuje wiele h1 (rotacja sekretu)', async () => {
    const body = event('customer.created', {})
    const ts = Math.floor(NOW / 1000)
    const good = createHmac('sha256', SECRET).update(`${ts}:${body}`).digest('hex')
    expect(await parse(body, `ts=${ts};h1=${'0'.repeat(64)};h1=${good}`)).toBeNull()
  })
})
