import { describe, expect, it } from 'vitest'
import { generateLicenseKeyPair, privateKeyFromPem, publicKeyFromSpki, verifyCertificate } from './certificate'
import { LicenseService, StudioHttpError, type AuditEntry, type Mailer } from './license-service'
import type { PaymentEvent } from './payments'
import { MemoryStudioStore } from './testing/memory-store'

const pair = generateLicenseKeyPair()
const publicKey = publicKeyFromSpki(pair.publicKeySpki)
const DEVICE_A = 'a'.repeat(64)
const DEVICE_B = 'b'.repeat(64)
const DEVICE_C = 'c'.repeat(64)

class TestMailer implements Mailer {
  sent: { email: string; key: string }[] = []
  fail = false
  sendLicenseKey(email: string, key: string): Promise<void> {
    if (this.fail) return Promise.reject(new Error('smtp down'))
    this.sent.push({ email, key })
    return Promise.resolve()
  }
}

function setup(now = Date.parse('2026-10-21T10:00:00.000Z')) {
  const store = new MemoryStudioStore()
  const mailer = new TestMailer()
  const audits: AuditEntry[] = []
  const clock = { t: now }
  const service = new LicenseService({
    store,
    mailer,
    privateKey: privateKeyFromPem(pair.privateKeyPem),
    audit: (e) => {
      audits.push(e)
      return Promise.resolve()
    },
    now: () => clock.t,
  })
  return { store, mailer, audits, service, clock }
}

type Purchase = Extract<PaymentEvent, { kind: 'purchase' }>
const purchase = (over: Partial<Purchase> = {}): Purchase => ({
  kind: 'purchase',
  eventId: 'evt_1',
  reference: 'txn_1',
  email: 'klient@example.com',
  plan: 'perpetual',
  entitlements: ['pro', 'vector'],
  updatesUntil: '2027-10-21T10:00:00.000Z',
  expiresAt: null,
  amount: { total: 19900, currency: 'PLN' },
  ...over,
})

async function bought() {
  const ctx = setup()
  await ctx.service.applyPayment('paddle', purchase())
  const license = [...ctx.store.licenses.values()][0]!
  return { ...ctx, license }
}

const expectError = async (p: Promise<unknown>, status: number, code: string) => {
  const err = await p.then(
    () => null,
    (e: unknown) => e,
  )
  expect(err).toBeInstanceOf(StudioHttpError)
  expect((err as StudioHttpError).status).toBe(status)
  expect((err as StudioHttpError).code).toBe(code)
  return err as StudioHttpError
}

describe('zakup przez webhook', () => {
  it('tworzy licencję, zamówienie, wysyła klucz i wpis audytu', async () => {
    const { store, mailer, audits, license } = await bought()
    expect(license.status).toBe('active')
    expect(license.maxDevices).toBe(2)
    expect(license.entitlements).toEqual(['pro', 'vector'])
    expect(license.key).toMatch(/^STUDIO-/)
    expect(mailer.sent).toEqual([{ email: 'klient@example.com', key: license.key }])
    expect(store.orders).toHaveLength(1)
    expect(store.orders[0]).toMatchObject({ kind: 'purchase', amountTotal: 19900, currency: 'PLN' })
    expect(audits.map((a) => a.action)).toContain('license.created')
    // Klucz licencji nie trafia do logu audytu.
    expect(JSON.stringify(audits)).not.toContain(license.key)
  })

  it('jest idempotentny: to samo zdarzenie i ta sama transakcja = jedna licencja', async () => {
    const { store, mailer, service } = await bought()
    expect(await service.applyPayment('paddle', purchase())).toBe('duplicate')
    expect(await service.applyPayment('paddle', purchase({ eventId: 'evt_2' }))).toBe('applied')
    expect(store.licenses.size).toBe(1)
    expect(mailer.sent).toHaveLength(1)
  })

  it('awaria poczty nie przerywa zakupu (klucz można wysłać ponownie)', async () => {
    const ctx = setup()
    ctx.mailer.fail = true
    await ctx.service.applyPayment('paddle', purchase())
    const license = [...ctx.store.licenses.values()][0]!
    expect(ctx.audits.map((a) => a.action)).toContain('license.mail_failed')
    ctx.mailer.fail = false
    expect(await ctx.service.resendKey('owner', license.id)).toBe(true)
    expect(ctx.mailer.sent).toHaveLength(1)
  })

  it('zwrot unieważnia licencję, a aktywacja zwraca 410', async () => {
    const { service, license } = await bought()
    await service.applyPayment('paddle', { kind: 'refund', eventId: 'evt_r', reference: 'txn_1' })
    await expectError(service.activate({ key: license.key, deviceId: DEVICE_A }), 410, 'REVOKED')
  })

  it('odnowienie subskrypcji przesuwa koniec okresu; ponowna transakcja subskrypcji też', async () => {
    const ctx = setup()
    const sub = purchase({ plan: 'subscription', reference: 'sub_1', expiresAt: '2026-11-21T00:00:00.000Z', updatesUntil: '2026-11-21T00:00:00.000Z' })
    await ctx.service.applyPayment('paddle', sub)
    const id = [...ctx.store.licenses.keys()][0]!
    await ctx.service.applyPayment('paddle', { kind: 'renewal', eventId: 'evt_u', reference: 'sub_1', expiresAt: '2026-12-21T00:00:00.000Z' })
    expect(ctx.store.licenses.get(id)!.expiresAt).toBe('2026-12-21T00:00:00.000Z')
    await ctx.service.applyPayment('paddle', purchase({ ...sub, eventId: 'evt_t2', expiresAt: '2027-01-21T00:00:00.000Z', updatesUntil: '2027-01-21T00:00:00.000Z' }))
    expect(ctx.store.licenses.get(id)!.expiresAt).toBe('2027-01-21T00:00:00.000Z')
    expect(ctx.store.licenses.size).toBe(1)
    expect(ctx.mailer.sent).toHaveLength(1)
  })
})

describe('aktywacja, odświeżanie, dezaktywacja', () => {
  it('wydaje certyfikat per urządzenie, weryfikowalny kluczem publicznym', async () => {
    const { service, license } = await bought()
    const { certificate } = await service.activate({ key: license.key.toLowerCase(), deviceId: DEVICE_A, deviceName: 'Laptop' })
    const payload = verifyCertificate(certificate, publicKey)
    expect(payload).toMatchObject({ licenseId: license.id, key: license.key, deviceId: DEVICE_A, maxDevices: 2, plan: 'perpetual' })
    expect(Date.parse(payload!.validateBy) - Date.parse(payload!.issuedAt)).toBe(30 * 24 * 3600 * 1000)
  })

  it('limit 2 urządzeń: trzecie dostaje 409 DEVICE_LIMIT z listą; to samo urządzenie aktywuje się ponownie', async () => {
    const { service, license } = await bought()
    await service.activate({ key: license.key, deviceId: DEVICE_A, deviceName: 'A' })
    await service.activate({ key: license.key, deviceId: DEVICE_B, deviceName: 'B' })
    await service.activate({ key: license.key, deviceId: DEVICE_A, deviceName: 'A' })
    const err = await expectError(service.activate({ key: license.key, deviceId: DEVICE_C }), 409, 'DEVICE_LIMIT')
    expect(err.extra['maxDevices']).toBe(2)
    expect(err.extra['devices']).toHaveLength(2)
  })

  it('równoległe aktywacje nie przekraczają limitu', async () => {
    const { service, store, license } = await bought()
    const ids = ['1', '2', '3', '4'].map((c) => c.repeat(64).replace(/[^0-9a-f]/g, 'a'))
    const results = await Promise.allSettled(ids.map((d) => service.activate({ key: license.key, deviceId: d })))
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(2)
    expect(store.licenses.get(license.id)!.devices).toHaveLength(2)
  })

  it('odrzuca nieznany klucz, zły format i zły identyfikator urządzenia', async () => {
    const { service } = await bought()
    await expectError(service.activate({ key: 'STUDIO-AAAAA-AAAAA-AAAAA-AAAAA', deviceId: DEVICE_A }), 404, 'UNKNOWN_KEY')
    await expect(service.activate({ key: 'zly', deviceId: DEVICE_A })).rejects.toThrow()
    await expect(service.activate({ key: 'STUDIO-AAAAA-AAAAA-AAAAA-AAAAA', deviceId: 'xyz' })).rejects.toThrow()
  })

  it('odświeżenie wymaga wcześniejszej aktywacji tego urządzenia', async () => {
    const { service, license, clock, store } = await bought()
    await expectError(service.refresh({ key: license.key, deviceId: DEVICE_A }), 409, 'NOT_ACTIVATED')
    await service.activate({ key: license.key, deviceId: DEVICE_A })
    clock.t += 3600_000
    const { certificate } = await service.refresh({ key: license.key, deviceId: DEVICE_A })
    expect(verifyCertificate(certificate, publicKey)?.deviceId).toBe(DEVICE_A)
    expect(store.licenses.get(license.id)!.devices[0]!.lastSeen).toBe(new Date(clock.t).toISOString())
  })

  it('dezaktywacja zwalnia miejsce na urządzenie', async () => {
    const { service, license } = await bought()
    await service.activate({ key: license.key, deviceId: DEVICE_A })
    await service.activate({ key: license.key, deviceId: DEVICE_B })
    await service.deactivate({ key: license.key, deviceId: DEVICE_A })
    await expect(service.activate({ key: license.key, deviceId: DEVICE_C })).resolves.toHaveProperty('certificate')
  })

  it('unieważniona licencja nie odświeża certyfikatu', async () => {
    const { service, license } = await bought()
    await service.activate({ key: license.key, deviceId: DEVICE_A })
    await service.setStatus('owner', license.id, 'revoked')
    await expectError(service.refresh({ key: license.key, deviceId: DEVICE_A }), 410, 'REVOKED')
    await service.setStatus('owner', license.id, 'active')
    await expect(service.refresh({ key: license.key, deviceId: DEVICE_A })).resolves.toHaveProperty('certificate')
  })
})

describe('operacje panelu', () => {
  it('wystawia licencję ręcznie i trial jako krótką subskrypcję z audytem', async () => {
    const { service, audits, mailer } = setup()
    const trial = await service.issueTrial('owner', 'test@example.com', ['pro', 'print'], 14)
    expect(trial).toMatchObject({ plan: 'subscription', maxDevices: 1, source: null })
    expect(trial.expiresAt).toBe('2026-11-04T10:00:00.000Z')
    expect(mailer.sent).toHaveLength(1)
    expect(audits[0]).toMatchObject({ actor: 'owner', action: 'license.issued_manually' })
  })

  it('zmiana limitu urządzeń i uprawnień jest walidowana i trafia do certyfikatu', async () => {
    const { service, license } = await bought()
    await expect(service.setDeviceLimit('owner', license.id, 0)).rejects.toThrow()
    await expect(service.setDeviceLimit('owner', license.id, 11)).rejects.toThrow()
    await service.setDeviceLimit('owner', license.id, 3)
    await service.setEntitlements('owner', license.id, ['pro', 'print', 'vector', 'image'])
    const { certificate } = await service.activate({ key: license.key, deviceId: DEVICE_A })
    expect(verifyCertificate(certificate, publicKey)).toMatchObject({ maxDevices: 3, entitlements: ['pro', 'print', 'vector', 'image'] })
  })

  it('nieznana licencja → 404', async () => {
    const { service } = setup()
    await expectError(service.setStatus('owner', '3f1b5c3e-8a43-4e0b-9d8e-0d9c2f6a7b11', 'revoked'), 404, 'UNKNOWN_LICENSE')
  })
})
