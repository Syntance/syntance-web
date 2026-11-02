import { describe, expect, it } from 'vitest'
import { generateLicenseKeyPair, privateKeyFromPem, publicKeyFromSpki, verifyCertificate } from './certificate'
import { LicenseService, StudioHttpError, customerId, type AuditEntry, type Mailer } from './license-service'
import type { PaymentEvent } from './payments'
import { PromoService, generatePromoCode, normalizePromoCode, promoProblem } from './promo'
import { MemoryPromoStore } from './testing/memory-promo-store'
import { MemoryStudioStore } from './testing/memory-store'

const pair = generateLicenseKeyPair()
const publicKey = publicKeyFromSpki(pair.publicKeySpki)
const DEVICE = 'a'.repeat(64)
const NOW = Date.parse('2026-11-02T10:00:00.000Z')
const DAY = 24 * 60 * 60 * 1000

class TestMailer implements Mailer {
  sent: { email: string; key: string }[] = []
  fail = false
  sendLicenseKey(email: string, key: string): Promise<void> {
    if (this.fail) return Promise.reject(new Error('smtp down'))
    this.sent.push({ email, key })
    return Promise.resolve()
  }
}

function setup() {
  const store = new MemoryStudioStore()
  const promoStore = new MemoryPromoStore()
  const mailer = new TestMailer()
  const audits: AuditEntry[] = []
  const clock = { t: NOW }
  const audit = (e: AuditEntry) => {
    audits.push(e)
    return Promise.resolve()
  }
  // eslint-disable-next-line prefer-const -- onPromo odwołuje się do `promo`, a ten do `licenses`
  let promo: PromoService
  const licenses = new LicenseService({
    store,
    mailer,
    privateKey: privateKeyFromPem(pair.privateKeyPem),
    audit,
    now: () => clock.t,
    onPromo: (p, email, licenseId) => promo.recordPurchase(p, email, licenseId),
  })
  promo = new PromoService({ store: promoStore, licenses, isBlocked: (e) => store.isBlocked(e), audit, now: () => clock.t })
  return { store, promoStore, mailer, audits, clock, licenses, promo }
}

const expectError = async (p: Promise<unknown>, status: number, code: string) => {
  const err = await p.then(
    () => null,
    (e: unknown) => e,
  )
  expect(err).toBeInstanceOf(StudioHttpError)
  expect((err as StudioHttpError).status).toBe(status)
  expect((err as StudioHttpError).code).toBe(code)
}

describe('kody: tworzenie i walidacja', () => {
  it('generuje kod z bezpiecznego alfabetu i normalizuje wpisany', async () => {
    expect(generatePromoCode()).toMatch(/^[A-HJ-NP-Z2-9]{10}$/)
    expect(normalizePromoCode('  lato 2026 ')).toBe('LATO2026')
    const { promo, audits } = setup()
    const c = await promo.create('admin@x.pl', { kind: 'percent', percentOff: 20, code: 'lato-26' })
    expect(c.code).toBe('LATO-26')
    expect(audits.at(-1)).toMatchObject({ action: 'promo.created', actor: 'admin@x.pl' })
  })

  it('odrzuca duplikat kodu, zły format i niespójne okno dat', async () => {
    const { promo } = setup()
    await promo.create('a', { kind: 'percent', percentOff: 10, code: 'DUP1' })
    await expectError(promo.create('a', { kind: 'percent', percentOff: 10, code: 'dup1' }), 409, 'CODE_EXISTS')
    await expectError(promo.create('a', { kind: 'percent', percentOff: 10, code: '!!' }), 400, 'INVALID_CODE_FORMAT')
    await expect(
      promo.create('a', { kind: 'percent', percentOff: 10, validFrom: '2026-12-01T00:00:00.000Z', validUntil: '2026-11-01T00:00:00.000Z' }),
    ).rejects.toThrow()
    await expect(promo.create('a', { kind: 'percent', percentOff: 101 })).rejects.toThrow()
  })

  it('promoProblem rozpoznaje stany kodu', async () => {
    const { promo } = setup()
    const c = await promo.create('a', { kind: 'trial', trialDays: 30, grantEntitlements: ['pro'], maxUses: 1, validUntil: '2026-11-10T00:00:00.000Z' })
    expect(promoProblem(c, NOW)).toBeNull()
    expect(promoProblem({ ...c, active: false }, NOW)).toBe('INACTIVE')
    expect(promoProblem({ ...c, usedCount: 1 }, NOW)).toBe('EXHAUSTED')
    expect(promoProblem(c, Date.parse('2026-11-11T00:00:00.000Z'))).toBe('EXPIRED')
    expect(promoProblem({ ...c, validFrom: '2026-11-05T00:00:00.000Z' }, NOW)).toBe('NOT_STARTED')
  })
})

describe('kod z darmową licencją: pełna ścieżka', () => {
  it('wykorzystanie → licencja → klucz e-mailem → aktywacja → certyfikat z poprawnym podpisem', async () => {
    const { promo, store, mailer, licenses } = setup()
    const code = await promo.create('a', {
      kind: 'free_license',
      grantPlan: 'perpetual',
      grantEntitlements: ['pro', 'print'],
      grantUpdateMonths: 6,
      grantMaxDevices: 3,
      code: 'GRATIS',
    })
    const { licenseId } = await promo.redeem('redeem', 'gratis', 'Jan@Example.com', 'redeem')
    const lic = store.licenses.get(licenseId)!
    expect(lic).toMatchObject({ email: 'jan@example.com', plan: 'perpetual', maxDevices: 3, expiresAt: null, status: 'active' })
    expect(lic.entitlements).toEqual(['pro', 'print'])
    expect(new Date(lic.updatesUntil).getTime()).toBeGreaterThan(NOW + 170 * DAY)
    expect(mailer.sent).toEqual([{ email: 'jan@example.com', key: lic.key }])
    expect(lic.source).toEqual({ provider: 'promo', reference: `${code.id}:jan@example.com` })

    const { certificate } = await licenses.activate({ key: lic.key, deviceId: DEVICE, deviceName: 'Laptop' })
    const payload = verifyCertificate(certificate, publicKey)
    expect(payload).toMatchObject({ licenseId, plan: 'perpetual', entitlements: ['pro', 'print'], maxDevices: 3, deviceId: DEVICE })
  })

  it('kod próbny: subskrypcja na N dni, jedno urządzenie domyślnie z kodu', async () => {
    const { promo, store } = setup()
    await promo.create('a', { kind: 'trial', trialDays: 45, grantEntitlements: ['vector'], grantMaxDevices: 1, code: 'TRIAL45' })
    const { licenseId } = await promo.redeem('admin', 'TRIAL45', 'a@b.pl', 'manual')
    const lic = store.licenses.get(licenseId)!
    expect(lic.plan).toBe('subscription')
    expect(lic.expiresAt).toBe(new Date(NOW + 45 * DAY).toISOString())
    expect(lic.updatesUntil).toBe(lic.expiresAt)
    expect(lic.maxDevices).toBe(1)
  })

  it('ten sam e-mail nie wykorzysta kodu dwa razy, a limit użyć jest twardy', async () => {
    const { promo, promoStore, store } = setup()
    const c = await promo.create('a', { kind: 'free_license', grantPlan: 'perpetual', grantEntitlements: ['pro'], maxUses: 2, code: 'LIMIT2' })
    await promo.redeem('r', 'LIMIT2', 'a@x.pl', 'redeem')
    await expectError(promo.redeem('r', 'LIMIT2', 'A@x.pl', 'redeem'), 409, 'ALREADY_REDEEMED')
    await promo.redeem('r', 'LIMIT2', 'b@x.pl', 'redeem')
    await expectError(promo.redeem('r', 'LIMIT2', 'c@x.pl', 'redeem'), 410, 'CODE_EXHAUSTED')
    expect(promoStore.codes.get(c.id)?.usedCount).toBe(2)
    expect(store.licenses.size).toBe(2)
  })

  it('równoległe wykorzystania nie przekraczają limitu', async () => {
    const { promo, promoStore, store } = setup()
    const c = await promo.create('a', { kind: 'free_license', grantPlan: 'perpetual', grantEntitlements: ['pro'], maxUses: 3, code: 'RACE3' })
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, (_, i) => promo.redeem('r', 'RACE3', `u${i}@x.pl`, 'redeem')),
    )
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(3)
    expect(promoStore.codes.get(c.id)?.usedCount).toBe(3)
    expect(store.licenses.size).toBe(3)
  })

  it('wyłączony, wygasły i nieznany kod są odrzucane; zablokowany klient nie dostanie licencji', async () => {
    const { promo, store, clock } = setup()
    const c = await promo.create('a', { kind: 'free_license', grantPlan: 'perpetual', grantEntitlements: ['pro'], validUntil: '2026-11-05T00:00:00.000Z', code: 'SHORT' })
    await expectError(promo.redeem('r', 'NOPE', 'a@x.pl', 'redeem'), 404, 'UNKNOWN_CODE')
    await store.setBlocked('zly@x.pl', true, '')
    await expectError(promo.redeem('r', 'SHORT', 'zly@x.pl', 'redeem'), 403, 'BLOCKED')
    await promo.update('a', c.id, { active: false })
    await expectError(promo.redeem('r', 'SHORT', 'a@x.pl', 'redeem'), 410, 'CODE_INACTIVE')
    await promo.update('a', c.id, { active: true })
    clock.t = Date.parse('2026-11-06T00:00:00.000Z')
    await expectError(promo.redeem('r', 'SHORT', 'a@x.pl', 'redeem'), 410, 'CODE_EXPIRED')
    expect(store.licenses.size).toBe(0)
  })

  it('kod rabatowy nie jest „do zrealizowania” jako darmowa licencja', async () => {
    const { promo } = setup()
    await promo.create('a', { kind: 'percent', percentOff: 50, code: 'HALF' })
    await expectError(promo.redeem('r', 'HALF', 'a@x.pl', 'redeem'), 400, 'CODE_NOT_REDEEMABLE')
  })

  it('awaria wystawienia zwalnia rezerwację użycia', async () => {
    const { promo, promoStore, licenses } = setup()
    const c = await promo.create('a', { kind: 'free_license', grantPlan: 'perpetual', grantEntitlements: ['pro'], maxUses: 1, code: 'ONCE' })
    const original = licenses.issueManual.bind(licenses)
    licenses.issueManual = () => Promise.reject(new Error('db down'))
    await expect(promo.redeem('r', 'ONCE', 'a@x.pl', 'redeem')).rejects.toThrow('db down')
    expect(promoStore.codes.get(c.id)?.usedCount).toBe(0)
    licenses.issueManual = original
    await expect(promo.redeem('r', 'ONCE', 'a@x.pl', 'redeem')).resolves.toBeTruthy()
  })

  it('awaria poczty nie blokuje wydania (klucz można wysłać ponownie z panelu)', async () => {
    const { promo, mailer, store, audits } = setup()
    mailer.fail = true
    await promo.create('a', { kind: 'free_license', grantPlan: 'perpetual', grantEntitlements: ['pro'], code: 'MAILFAIL' })
    await promo.redeem('r', 'MAILFAIL', 'a@x.pl', 'redeem')
    expect(store.licenses.size).toBe(1)
    expect(audits.some((e) => e.action === 'license.mail_failed')).toBe(true)
  })
})

describe('kody rabatowe: wycena', () => {
  const order = { plan: 'perpetual' as const, entitlements: ['pro', 'vector'], amount: 5900, currency: 'EUR' }

  it('procent zaokrągla w dół, kwota nie przekracza ceny', async () => {
    const { promo } = setup()
    await promo.create('a', { kind: 'percent', percentOff: 33, code: 'P33' })
    await promo.create('a', { kind: 'amount', amountOff: 10000, currency: 'EUR', code: 'BIG' })
    expect(await promo.quote('p33', order)).toEqual({ discount: 1947, total: 3953 })
    expect(await promo.quote('BIG', order)).toEqual({ discount: 5900, total: 0 })
  })

  it('respektuje walutę, plan i uprawnienia', async () => {
    const { promo } = setup()
    await promo.create('a', { kind: 'amount', amountOff: 500, currency: 'PLN', code: 'PLNONLY' })
    await promo.create('a', { kind: 'percent', percentOff: 10, appliesToPlan: 'subscription', code: 'SUBONLY' })
    await promo.create('a', { kind: 'percent', percentOff: 10, appliesToEntitlements: ['image'], code: 'IMGONLY' })
    await expectError(promo.quote('PLNONLY', order), 400, 'CODE_NOT_APPLICABLE')
    await expectError(promo.quote('SUBONLY', order), 400, 'CODE_NOT_APPLICABLE')
    await expectError(promo.quote('IMGONLY', order), 400, 'CODE_NOT_APPLICABLE')
    expect((await promo.quote('IMGONLY', { ...order, entitlements: ['image'] })).discount).toBe(590)
  })

  it('darmowa licencja nie jest rabatem', async () => {
    const { promo } = setup()
    await promo.create('a', { kind: 'trial', trialDays: 7, grantEntitlements: ['pro'], code: 'TRIAL7' })
    await expectError(promo.quote('TRIAL7', order), 400, 'CODE_NOT_A_DISCOUNT')
  })
})

describe('webhook płatności z kodem promocyjnym', () => {
  const purchase = (promoCode?: string): Extract<PaymentEvent, { kind: 'purchase' }> => ({
    kind: 'purchase',
    eventId: 'evt_p1',
    reference: 'txn_p1',
    email: 'Klient@Example.com',
    plan: 'perpetual',
    entitlements: ['pro'],
    updatesUntil: '2027-11-02T10:00:00.000Z',
    expiresAt: null,
    amount: { total: 4720, currency: 'EUR' },
    ...(promoCode ? { promo: { code: promoCode, discount: 1180 } } : {}),
  })

  it('zapisuje wykorzystanie kodu z kwotą rabatu i liczy użycie', async () => {
    const { licenses, promo, promoStore } = setup()
    const c = await promo.create('a', { kind: 'percent', percentOff: 20, code: 'WEB20' })
    await licenses.applyPayment('paddle', purchase('web20'))
    expect(promoStore.codes.get(c.id)?.usedCount).toBe(1)
    expect(promoStore.redemptions[0]).toMatchObject({ email: 'klient@example.com', source: 'paddle', discountAmount: 1180, currency: 'EUR' })
    expect(promoStore.redemptions[0]?.licenseId).toBeTruthy()
  })

  it('nieznany kod nie blokuje wydania zapłaconej licencji', async () => {
    const { licenses, store, audits } = setup()
    await licenses.applyPayment('paddle', purchase('NIEMA'))
    expect(store.licenses.size).toBe(1)
    expect(audits.some((e) => e.action === 'promo.unknown_code')).toBe(true)
  })
})

describe('blokada klienta i warunki licencji', () => {
  it('zablokowany klient: aktywacja i odświeżenie dają REVOKED, odblokowanie przywraca działanie', async () => {
    const { promo, licenses, store, audits } = setup()
    await promo.create('a', { kind: 'free_license', grantPlan: 'perpetual', grantEntitlements: ['pro'], code: 'BLK' })
    const { licenseId } = await promo.redeem('r', 'BLK', 'Jan@x.pl', 'redeem')
    const key = store.licenses.get(licenseId)!.key
    await licenses.activate({ key, deviceId: DEVICE, deviceName: '' })

    await licenses.setCustomerBlocked('admin', 'JAN@x.pl', true, 'chargeback')
    await expectError(licenses.refresh({ key, deviceId: DEVICE }), 410, 'REVOKED')
    await expectError(licenses.activate({ key, deviceId: 'b'.repeat(64), deviceName: '' }), 410, 'REVOKED')
    const blockAudit = audits.find((e) => e.action === 'customer.blocked')
    expect(blockAudit?.target).toBe(customerId('jan@x.pl'))
    expect(JSON.stringify(blockAudit)).not.toContain('jan@x.pl')

    await licenses.setCustomerBlocked('admin', 'jan@x.pl', false)
    await expect(licenses.refresh({ key, deviceId: DEVICE })).resolves.toHaveProperty('certificate')
  })

  it('updateTerms pilnuje spójności planu i dat; zmiana planu trafia do certyfikatu', async () => {
    const { licenses, store } = setup()
    const lic = await licenses.issueManual('admin', {
      email: 'k@x.pl',
      plan: 'perpetual',
      entitlements: ['pro'],
      updatesUntil: '2027-01-01T00:00:00.000Z',
      expiresAt: null,
      maxDevices: 2,
      note: '',
      sendEmail: false,
    })
    await expect(
      licenses.updateTerms('admin', lic.id, { plan: 'subscription', updatesUntil: '2027-02-01T00:00:00.000Z', expiresAt: null }),
    ).rejects.toThrow()
    await expect(
      licenses.updateTerms('admin', lic.id, { plan: 'perpetual', updatesUntil: '2027-02-01T00:00:00.000Z', expiresAt: '2027-02-01T00:00:00.000Z' }),
    ).rejects.toThrow()
    await licenses.updateTerms('admin', lic.id, { plan: 'subscription', updatesUntil: '2027-02-01T00:00:00.000Z', expiresAt: '2027-02-01T00:00:00.000Z' })
    const { certificate } = await licenses.activate({ key: store.licenses.get(lic.id)!.key, deviceId: DEVICE, deviceName: '' })
    expect(verifyCertificate(certificate, publicKey)).toMatchObject({ plan: 'subscription', expiresAt: '2027-02-01T00:00:00.000Z' })
  })

  it('odebranie urządzenia zwalnia miejsce, unieważnienie blokuje licencję', async () => {
    const { licenses, store } = setup()
    const lic = await licenses.issueManual('admin', {
      email: 'k@x.pl',
      plan: 'perpetual',
      entitlements: ['pro'],
      updatesUntil: '2027-01-01T00:00:00.000Z',
      expiresAt: null,
      maxDevices: 1,
      note: '',
      sendEmail: false,
    })
    const key = store.licenses.get(lic.id)!.key
    await licenses.activate({ key, deviceId: DEVICE, deviceName: '' })
    await expectError(licenses.activate({ key, deviceId: 'b'.repeat(64), deviceName: '' }), 409, 'DEVICE_LIMIT')
    await licenses.removeDevice('admin', lic.id, DEVICE)
    await licenses.activate({ key, deviceId: 'b'.repeat(64), deviceName: '' })
    await licenses.setStatus('admin', lic.id, 'revoked')
    await expectError(licenses.refresh({ key, deviceId: 'b'.repeat(64) }), 410, 'REVOKED')
  })
})
