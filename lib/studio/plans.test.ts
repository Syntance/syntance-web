import { describe, expect, it } from 'vitest'
import { generateLicenseKeyPair, privateKeyFromPem, publicKeyFromSpki, verifyCertificate } from './certificate'
import { LicenseService, StudioHttpError, type AuditEntry, type Mailer } from './license-service'
import { PlanService } from './plans'
import { MemoryPlanStore } from './testing/memory-plan-store'
import { MemoryStudioStore } from './testing/memory-store'

const pair = generateLicenseKeyPair()
const publicKey = publicKeyFromSpki(pair.publicKeySpki)
const DEVICE = 'a'.repeat(64)
const NOW = Date.parse('2026-11-03T10:00:00.000Z')

class TestMailer implements Mailer {
  sent: { email: string; key: string }[] = []
  sendLicenseKey(email: string, key: string): Promise<void> {
    this.sent.push({ email, key })
    return Promise.resolve()
  }
}

function setup() {
  const store = new MemoryStudioStore()
  const planStore = new MemoryPlanStore()
  const mailer = new TestMailer()
  const audits: AuditEntry[] = []
  const audit = (e: AuditEntry) => {
    audits.push(e)
    return Promise.resolve()
  }
  const licenses = new LicenseService({
    store,
    mailer,
    privateKey: privateKeyFromPem(pair.privateKeyPem),
    audit,
    now: () => NOW,
    catalog: () => planStore.listFeatures(),
  })
  const plans = new PlanService({ store: planStore, licenses, audit, now: () => NOW })
  return { store, planStore, mailer, audits, licenses, plans }
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

const PRO = { slug: 'pro', name: 'Pro', billing: 'perpetual' as const, updateMonths: 12, maxDevices: 3, features: ['organize', 'ocr', 'edit'] }

describe('plany: tworzenie i walidacja', () => {
  it('tworzy plan i zapisuje w audycie', async () => {
    const { plans, audits } = setup()
    const p = await plans.createPlan('admin', PRO)
    expect(p).toMatchObject({ slug: 'pro', kind: 'paid', maxDevices: 3, features: ['organize', 'ocr', 'edit'] })
    expect(audits.at(-1)).toMatchObject({ action: 'plan.created', actor: 'admin', target: p.id })
  })

  it('odrzuca nieznaną funkcję, plan bez funkcji płatnej, zajęty slug i slug „free”', async () => {
    const { plans } = setup()
    await expectError(plans.createPlan('a', { ...PRO, features: ['organize', 'telepatia'] }), 400, 'UNKNOWN_FEATURE')
    await expectError(plans.createPlan('a', { ...PRO, features: ['viewer', 'comments'] }), 400, 'NO_PAID_FEATURES')
    await plans.createPlan('a', PRO)
    await expectError(plans.createPlan('a', PRO), 409, 'SLUG_TAKEN')
    await expectError(plans.createPlan('a', { ...PRO, slug: 'free' }), 409, 'SLUG_TAKEN')
    await expect(plans.createPlan('a', { ...PRO, slug: 'Zły Slug' })).rejects.toThrow()
    await expect(plans.createPlan('a', { ...PRO, slug: 'x1', maxDevices: 11 })).rejects.toThrow()
  })

  it('plan Free: nie da się go usunąć ani wystawić z niego licencji, ale można zmienić funkcje', async () => {
    const { plans, planStore } = setup()
    const free = { id: 'f0000000-0000-4000-8000-000000000001', appSlug: 'studio', slug: 'free', name: 'Free', description: '', kind: 'free' as const, billing: 'perpetual' as const, updateMonths: 12, maxDevices: 1, priceAmount: null, priceCurrency: null, features: ['viewer'], active: true, sortOrder: 0, createdAt: '2026-01-01T00:00:00.000Z' }
    await planStore.insertPlan(free)
    await expectError(plans.deletePlan('a', free.id), 400, 'FREE_PLAN_FIXED')
    await expectError(plans.issueFromPlan('a', free.id, { email: 'k@x.pl' }), 400, 'FREE_PLAN_NOT_ISSUABLE')
    await expectError(plans.updatePlan('a', free.id, { billing: 'subscription' }), 400, 'FREE_PLAN_FIXED')
    await plans.updatePlan('a', free.id, { features: ['viewer', 'comments', 'organize'] })
    expect((await planStore.findPlan(free.id))?.features).toEqual(['viewer', 'comments', 'organize'])
  })
})

describe('częściowa zmiana planu', () => {
  it('nieprzesłane pola zostają bez zmian (brak resetu do wartości domyślnych)', async () => {
    const { plans, planStore } = setup()
    const plan = await plans.createPlan('a', { ...PRO, description: 'opis', sortOrder: 3, priceAmount: 5900, priceCurrency: 'EUR' })
    await plans.updatePlan('a', plan.id, { name: 'Pro+' })
    expect(await planStore.findPlan(plan.id)).toMatchObject({ name: 'Pro+', description: 'opis', maxDevices: 3, updateMonths: 12, sortOrder: 3, active: true, priceAmount: 5900, priceCurrency: 'EUR' })
  })

  it('cena wymaga kwoty i waluty razem', async () => {
    const { plans } = setup()
    await expectError(plans.createPlan('a', { ...PRO, priceAmount: 5900 }), 400, 'INVALID_PRICE')
    const plan = await plans.createPlan('a', PRO)
    await expectError(plans.updatePlan('a', plan.id, { priceCurrency: 'EUR' }), 400, 'INVALID_PRICE')
    await plans.updatePlan('a', plan.id, { priceAmount: 5900, priceCurrency: 'EUR' })
    await plans.updatePlan('a', plan.id, { priceAmount: null, priceCurrency: null })
  })
})

describe('licencja z planu: pełna ścieżka', () => {
  it('kopiuje zakres planu, niesie funkcje w certyfikacie i aktywuje się na urządzeniu', async () => {
    const { plans, store, mailer, licenses } = setup()
    const plan = await plans.createPlan('admin', PRO)
    const lic = await plans.issueFromPlan('admin', plan.id, { email: 'Jan@Example.com' })
    expect(lic).toMatchObject({ planId: plan.id, plan: 'perpetual', maxDevices: 3, features: ['organize', 'ocr', 'edit'], expiresAt: null })
    expect(lic.entitlements).toEqual(['pro'])
    expect(new Date(lic.updatesUntil).getUTCFullYear()).toBe(2027)
    expect(mailer.sent).toHaveLength(1)

    const { certificate } = await licenses.activate({ key: store.licenses.get(lic.id)!.key, deviceId: DEVICE, deviceName: '' })
    const payload = verifyCertificate(certificate, publicKey)
    expect(payload).toMatchObject({ plan: 'perpetual', entitlements: ['pro'], features: ['organize', 'ocr', 'edit'], maxDevices: 3 })
  })

  it('subskrypcja z planu ma datę końca okresu, a nadpisania dotyczą tylko tej licencji', async () => {
    const { plans, planStore } = setup()
    const sub = await plans.createPlan('a', { ...PRO, slug: 'pro-mc', billing: 'subscription', updateMonths: 1, features: ['organize', 'vector'] })
    const lic = await plans.issueFromPlan('a', sub.id, { email: 'k@x.pl', maxDevices: 5, features: ['vector'], sendEmail: false })
    expect(lic).toMatchObject({ plan: 'subscription', maxDevices: 5, features: ['vector'] })
    expect(lic.expiresAt).toBe(lic.updatesUntil)
    expect(lic.entitlements).toEqual(['vector'])
    expect((await planStore.findPlan(sub.id))?.features).toEqual(['organize', 'vector'])
  })

  it('zmiana lub usunięcie planu nie rusza wystawionej licencji', async () => {
    const { plans, store } = setup()
    const plan = await plans.createPlan('a', PRO)
    const lic = await plans.issueFromPlan('a', plan.id, { email: 'k@x.pl', sendEmail: false })
    await plans.updatePlan('a', plan.id, { features: ['organize'], maxDevices: 1, active: false })
    await plans.deletePlan('a', plan.id)
    const kept = store.licenses.get(lic.id)!
    expect(kept.features).toEqual(['organize', 'ocr', 'edit'])
    expect(kept.maxDevices).toBe(3)
  })

  it('nieaktywny plan nie wystawia licencji; plan z przypiętą ceną nie daje się usunąć', async () => {
    const { plans, planStore } = setup()
    const plan = await plans.createPlan('a', PRO)
    planStore.pricedPlans.add(plan.id)
    await expectError(plans.deletePlan('a', plan.id), 409, 'PLAN_IN_USE_BY_PRICES')
    await plans.updatePlan('a', plan.id, { active: false })
    await expectError(plans.issueFromPlan('a', plan.id, { email: 'k@x.pl' }), 409, 'PLAN_INACTIVE')
  })
})

describe('zakres i usuwanie licencji', () => {
  async function issued() {
    const ctx = setup()
    const plan = await ctx.plans.createPlan('a', PRO)
    const lic = await ctx.plans.issueFromPlan('a', plan.id, { email: 'Klient@x.pl', sendEmail: false })
    return { ...ctx, lic }
  }

  it('setFeatures przelicza uprawnienia i odrzuca nieznane lub wyłącznie darmowe', async () => {
    const { licenses, store, lic } = await issued()
    await licenses.setFeatures('admin', lic.id, ['organize', 'prepress', 'viewer'])
    expect(store.licenses.get(lic.id)).toMatchObject({ features: ['organize', 'prepress', 'viewer'], entitlements: ['pro', 'print'] })
    await expectError(licenses.setFeatures('a', lic.id, ['nie-ma']), 400, 'UNKNOWN_FEATURE')
    await expectError(licenses.setFeatures('a', lic.id, ['viewer']), 400, 'NO_PAID_FEATURES')
  })

  it('licencja bez zakresu funkcji (sprzed planów) działa jak dotąd — certyfikat bez pola features', async () => {
    const { licenses, store } = setup()
    const lic = await licenses.issueManual('a', { email: 'k@x.pl', plan: 'perpetual', entitlements: ['pro'], updatesUntil: '2027-01-01T00:00:00.000Z', expiresAt: null, sendEmail: false })
    expect(lic.features).toBeNull()
    const { certificate } = await licenses.activate({ key: store.licenses.get(lic.id)!.key, deviceId: DEVICE, deviceName: '' })
    const payload = verifyCertificate(certificate, publicKey)
    expect(payload).toMatchObject({ entitlements: ['pro'] })
    expect(payload).not.toHaveProperty('features')
  })

  it('usuwanie: tylko unieważniona licencja i po wpisaniu e-maila klienta', async () => {
    const { licenses, store, lic, audits } = await issued()
    await expectError(licenses.deleteLicense('a', lic.id, 'klient@x.pl'), 409, 'LICENSE_NOT_REVOKED')
    await licenses.setStatus('a', lic.id, 'revoked')
    await expectError(licenses.deleteLicense('a', lic.id, 'ktos@inny.pl'), 400, 'CONFIRM_MISMATCH')
    await licenses.deleteLicense('admin', lic.id, ' KLIENT@x.pl ')
    expect(store.licenses.has(lic.id)).toBe(false)
    expect(audits.at(-1)).toMatchObject({ action: 'license.deleted', target: lic.id })
    expect(JSON.stringify(audits.at(-1))).not.toContain('klient@x.pl')
    await expectError(licenses.activate({ key: lic.key, deviceId: DEVICE, deviceName: '' }), 404, 'UNKNOWN_KEY')
  })
})

describe('katalog funkcji', () => {
  it('dodaje własną funkcję, a użytej w planie nie da się usunąć', async () => {
    const { plans, planStore } = setup()
    await plans.upsertFeature('a', { key: 'nowy-modul', label: 'Nowy moduł', entitlement: 'pro' })
    expect(planStore.features.has('nowy-modul')).toBe(true)
    await plans.createPlan('a', { ...PRO, features: ['nowy-modul'] })
    await expectError(plans.deleteFeature('a', 'nowy-modul'), 409, 'FEATURE_IN_USE')
    await expectError(plans.deleteFeature('a', 'nie-ma'), 404, 'UNKNOWN_FEATURE')
    await plans.upsertFeature('a', { key: 'luzny', label: 'Luźny', entitlement: null })
    await plans.deleteFeature('a', 'luzny')
    expect(planStore.features.has('luzny')).toBe(false)
  })
})
