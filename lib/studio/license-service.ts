import { randomUUID, type KeyObject } from 'node:crypto'
import { z } from 'zod'
import { signCertificate } from './certificate'
import {
  DEFAULT_MAX_DEVICES,
  ENTITLEMENTS,
  LICENSE_KEY_PATTERN,
  MAX_DEVICES_LIMIT,
  VALIDATION_INTERVAL_DAYS,
  normalizeLicenseKey,
  type Entitlement,
  type LicensePayload,
} from './license-contract'
import { newLicenseKey } from './license-key'
import type { PaymentEvent } from './payments'
import type { LicenseRecord, StudioStore } from './store'

const DAY = 24 * 60 * 60 * 1000

/** Dostarcza klucz licencji kupującemu (produkcja: e-mail transakcyjny; testy: pamięć). */
export interface Mailer {
  sendLicenseKey(email: string, key: string): Promise<void>
}

export interface AuditEntry {
  actor: string
  action: string
  target: string
  meta?: Record<string, unknown>
}

export class StudioHttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly extra: Record<string, unknown> = {},
  ) {
    super(code)
  }
}

export interface LicenseServiceDeps {
  store: StudioStore
  privateKey: KeyObject
  mailer: Mailer
  audit?: (entry: AuditEntry) => Promise<void>
  now?: () => number
  appSlug?: string
}

const deviceId = z.string().regex(/^[0-9a-f]{64}$/)
const key = z
  .string()
  .max(64)
  .transform(normalizeLicenseKey)
  .refine((k) => LICENSE_KEY_PATTERN.test(k), 'Malformed licence key')

/** Walidacja ciał żądań aplikacji (kontrakt z folio-pdf/server). */
export const ActivateBody = z.object({ key, deviceId, deviceName: z.string().max(120).default('') })
export const DeviceBody = z.object({ key, deviceId })

export const ManualLicenseInput = z.object({
  email: z.email().max(254),
  plan: z.enum(['perpetual', 'subscription']),
  entitlements: z.array(z.enum(ENTITLEMENTS)).min(1),
  updatesUntil: z.iso.datetime(),
  expiresAt: z.iso.datetime().nullable(),
  maxDevices: z.number().int().min(1).max(MAX_DEVICES_LIMIT).default(DEFAULT_MAX_DEVICES),
  note: z.string().max(500).default(''),
  sendEmail: z.boolean().default(true),
})
export type ManualLicenseInput = z.input<typeof ManualLicenseInput>

export class LicenseService {
  private readonly now: () => number
  private readonly appSlug: string

  constructor(private readonly deps: LicenseServiceDeps) {
    this.now = deps.now ?? Date.now
    this.appSlug = deps.appSlug ?? 'studio'
  }

  private async audit(entry: AuditEntry): Promise<void> {
    await this.deps.audit?.(entry)
  }

  private certificateFor(record: LicenseRecord, device: string): string {
    const issued = this.now()
    const payload: LicensePayload = {
      v: 1,
      licenseId: record.id,
      key: record.key,
      email: record.email,
      plan: record.plan,
      entitlements: record.entitlements,
      updatesUntil: record.updatesUntil,
      expiresAt: record.expiresAt,
      maxDevices: record.maxDevices,
      deviceId: device,
      issuedAt: new Date(issued).toISOString(),
      validateBy: new Date(issued + VALIDATION_INTERVAL_DAYS * DAY).toISOString(),
    }
    return signCertificate(payload, this.deps.privateKey)
  }

  private async activeLicense(k: string): Promise<LicenseRecord> {
    const record = await this.deps.store.findByKey(k)
    if (!record) throw new StudioHttpError(404, 'UNKNOWN_KEY')
    if (record.status === 'revoked') throw new StudioHttpError(410, 'REVOKED')
    return record
  }

  /* ───────────── API aplikacji desktopowej ───────────── */

  async activate(body: unknown): Promise<{ certificate: string }> {
    const input = ActivateBody.parse(body)
    const record = await this.activeLicense(input.key)
    const t = new Date(this.now()).toISOString()
    const result = await this.deps.store.addDevice(
      record.id,
      { deviceId: input.deviceId, name: input.deviceName, activatedAt: t, lastSeen: t },
      record.maxDevices,
    )
    if (result === 'limit') {
      const fresh = (await this.deps.store.findById(record.id)) ?? record
      throw new StudioHttpError(409, 'DEVICE_LIMIT', {
        maxDevices: record.maxDevices,
        devices: fresh.devices.map((d) => ({ name: d.name, lastSeen: d.lastSeen })),
      })
    }
    if (result === 'exists') await this.deps.store.touchDevice(record.id, input.deviceId, t)
    else await this.audit({ actor: 'device', action: 'license.device_activated', target: record.id })
    return { certificate: this.certificateFor(record, input.deviceId) }
  }

  async refresh(body: unknown): Promise<{ certificate: string }> {
    const input = DeviceBody.parse(body)
    const record = await this.activeLicense(input.key)
    const known = await this.deps.store.touchDevice(record.id, input.deviceId, new Date(this.now()).toISOString())
    if (!known) throw new StudioHttpError(409, 'NOT_ACTIVATED')
    return { certificate: this.certificateFor(record, input.deviceId) }
  }

  async deactivate(body: unknown): Promise<{ ok: true }> {
    const input = DeviceBody.parse(body)
    const record = await this.deps.store.findByKey(input.key)
    if (!record) throw new StudioHttpError(404, 'UNKNOWN_KEY')
    if (await this.deps.store.removeDevice(record.id, input.deviceId)) {
      await this.audit({ actor: 'device', action: 'license.device_deactivated', target: record.id })
    }
    return { ok: true }
  }

  /* ───────────── Płatności (webhook) ───────────── */

  async applyPayment(provider: string, event: PaymentEvent): Promise<'applied' | 'duplicate'> {
    // Duplikaty i ponowienia webhooków są normalne: każde zdarzenie stosujemy raz.
    if (!(await this.deps.store.claimEvent(provider, event.eventId, event.kind))) return 'duplicate'
    const record = await this.deps.store.findBySource(provider, event.reference)
    const t = new Date(this.now()).toISOString()
    switch (event.kind) {
      case 'purchase': {
        if (record) {
          // Kolejna transakcja tej samej subskrypcji = odnowienie okresu.
          if (event.plan === 'subscription' && event.expiresAt && Date.parse(event.expiresAt) > Date.parse(record.expiresAt ?? record.updatesUntil)) {
            await this.deps.store.updateLicense(record.id, { expiresAt: event.expiresAt, updatesUntil: event.expiresAt })
            await this.audit({ actor: provider, action: 'license.renewed', target: record.id, meta: { expiresAt: event.expiresAt } })
          }
          break
        }
        const created: LicenseRecord = {
          id: randomUUID(),
          appSlug: this.appSlug,
          key: newLicenseKey(),
          email: event.email,
          plan: event.plan,
          entitlements: event.entitlements,
          updatesUntil: event.updatesUntil,
          expiresAt: event.expiresAt,
          maxDevices: DEFAULT_MAX_DEVICES,
          status: 'active',
          devices: [],
          source: { provider, reference: event.reference },
          note: '',
          createdAt: t,
        }
        if (await this.deps.store.insertLicense(created)) {
          await this.deps.store.insertOrder({
            id: randomUUID(),
            licenseId: created.id,
            provider,
            eventId: event.eventId,
            kind: 'purchase',
            reference: event.reference,
            email: event.email,
            amountTotal: event.amount?.total ?? null,
            currency: event.amount?.currency ?? null,
            createdAt: t,
          })
          await this.audit({ actor: provider, action: 'license.created', target: created.id, meta: { plan: event.plan } })
          await this.sendKey(created, provider)
        }
        break
      }
      case 'renewal':
        if (!record) break
        await this.deps.store.updateLicense(record.id, { expiresAt: event.expiresAt, updatesUntil: event.expiresAt })
        await this.deps.store.insertOrder({
          id: randomUUID(),
          licenseId: record.id,
          provider,
          eventId: event.eventId,
          kind: 'renewal',
          reference: event.reference,
          email: record.email,
          amountTotal: null,
          currency: null,
          createdAt: t,
        })
        await this.audit({ actor: provider, action: 'license.renewed', target: record.id, meta: { expiresAt: event.expiresAt } })
        break
      case 'refund':
        if (!record) break
        await this.deps.store.updateLicense(record.id, { status: 'revoked' })
        await this.deps.store.insertOrder({
          id: randomUUID(),
          licenseId: record.id,
          provider,
          eventId: event.eventId,
          kind: 'refund',
          reference: event.reference,
          email: record.email,
          amountTotal: null,
          currency: null,
          createdAt: t,
        })
        await this.audit({ actor: provider, action: 'license.revoked', target: record.id, meta: { reason: 'refund' } })
        break
    }
    await this.deps.store.completeEvent(provider, event.eventId)
    return 'applied'
  }

  /** Awaria poczty nie może blokować webhooka (Paddle ponawiałby go); klucz można wysłać ponownie z panelu. */
  private async sendKey(record: LicenseRecord, actor: string): Promise<boolean> {
    try {
      await this.deps.mailer.sendLicenseKey(record.email, record.key)
      return true
    } catch {
      await this.audit({ actor, action: 'license.mail_failed', target: record.id })
      return false
    }
  }

  /* ───────────── Operacje panelu (właściciel) ───────────── */

  async issueManual(actor: string, input: ManualLicenseInput): Promise<LicenseRecord> {
    const parsed = ManualLicenseInput.parse(input)
    const t = new Date(this.now()).toISOString()
    const { sendEmail, ...fields } = parsed
    const record: LicenseRecord = {
      id: randomUUID(),
      appSlug: this.appSlug,
      key: newLicenseKey(),
      ...fields,
      status: 'active',
      devices: [],
      source: null,
      createdAt: t,
    }
    if (!(await this.deps.store.insertLicense(record))) throw new StudioHttpError(409, 'KEY_COLLISION')
    await this.audit({ actor, action: 'license.issued_manually', target: record.id, meta: { plan: record.plan } })
    if (sendEmail) await this.sendKey(record, actor)
    return record
  }

  /** Licencja próbna: subskrypcja z krótkim okresem (mieści się w kontrakcie aplikacji). */
  issueTrial(actor: string, email: string, entitlements: Entitlement[], days = 14): Promise<LicenseRecord> {
    const end = new Date(this.now() + days * DAY).toISOString()
    return this.issueManual(actor, {
      email,
      plan: 'subscription',
      entitlements,
      updatesUntil: end,
      expiresAt: end,
      maxDevices: 1,
      note: `Trial ${days} dni`,
    })
  }

  private async mustFind(id: string): Promise<LicenseRecord> {
    const record = await this.deps.store.findById(id)
    if (!record) throw new StudioHttpError(404, 'UNKNOWN_LICENSE')
    return record
  }

  async setStatus(actor: string, id: string, status: 'active' | 'revoked'): Promise<void> {
    await this.mustFind(id)
    await this.deps.store.updateLicense(id, { status })
    await this.audit({ actor, action: status === 'revoked' ? 'license.revoked' : 'license.reinstated', target: id })
  }

  async setDeviceLimit(actor: string, id: string, maxDevices: number): Promise<void> {
    const limit = z.number().int().min(1).max(MAX_DEVICES_LIMIT).parse(maxDevices)
    await this.mustFind(id)
    await this.deps.store.updateLicense(id, { maxDevices: limit })
    await this.audit({ actor, action: 'license.device_limit_changed', target: id, meta: { maxDevices: limit } })
  }

  async setEntitlements(actor: string, id: string, entitlements: Entitlement[]): Promise<void> {
    const list = z.array(z.enum(ENTITLEMENTS)).min(1).parse(entitlements)
    await this.mustFind(id)
    await this.deps.store.updateLicense(id, { entitlements: list })
    await this.audit({ actor, action: 'license.entitlements_changed', target: id, meta: { entitlements: list } })
  }

  async extend(actor: string, id: string, until: string): Promise<void> {
    const end = z.iso.datetime().parse(until)
    const record = await this.mustFind(id)
    await this.deps.store.updateLicense(id, { updatesUntil: end, expiresAt: record.plan === 'subscription' ? end : null })
    await this.audit({ actor, action: 'license.extended', target: id, meta: { until: end } })
  }

  async removeDevice(actor: string, id: string, device: string): Promise<void> {
    await this.mustFind(id)
    if (await this.deps.store.removeDevice(id, device)) {
      await this.audit({ actor, action: 'license.device_removed', target: id })
    }
  }

  async resendKey(actor: string, id: string): Promise<boolean> {
    const record = await this.mustFind(id)
    const ok = await this.sendKey(record, actor)
    await this.audit({ actor, action: 'license.key_resent', target: id, meta: { ok } })
    return ok
  }
}
