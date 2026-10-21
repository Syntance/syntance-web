import type { AddDeviceResult, DeviceRecord, LicensePatch, LicenseRecord, OrderRecord, StudioStore } from '../store'

/** Magazyn w pamięci — tylko do testów logiki licencji. */
export class MemoryStudioStore implements StudioStore {
  readonly licenses = new Map<string, LicenseRecord>()
  readonly orders: OrderRecord[] = []
  readonly events = new Map<string, { done: boolean }>()

  private clone(r: LicenseRecord | undefined): LicenseRecord | null {
    return r ? structuredClone(r) : null
  }
  findByKey(key: string): Promise<LicenseRecord | null> {
    return Promise.resolve(this.clone([...this.licenses.values()].find((l) => l.key === key)))
  }
  findById(id: string): Promise<LicenseRecord | null> {
    return Promise.resolve(this.clone(this.licenses.get(id)))
  }
  findBySource(provider: string, reference: string): Promise<LicenseRecord | null> {
    return Promise.resolve(
      this.clone([...this.licenses.values()].find((l) => l.source?.provider === provider && l.source.reference === reference)),
    )
  }
  insertLicense(record: LicenseRecord): Promise<boolean> {
    const clash = [...this.licenses.values()].some(
      (l) =>
        l.key === record.key ||
        (record.source !== null && l.source?.provider === record.source.provider && l.source.reference === record.source.reference),
    )
    if (clash) return Promise.resolve(false)
    this.licenses.set(record.id, structuredClone(record))
    return Promise.resolve(true)
  }
  updateLicense(id: string, patch: LicensePatch): Promise<void> {
    const r = this.licenses.get(id)
    if (r) Object.assign(r, patch)
    return Promise.resolve()
  }
  addDevice(licenseId: string, device: DeviceRecord, maxDevices: number): Promise<AddDeviceResult> {
    const r = this.licenses.get(licenseId)
    if (!r) return Promise.resolve('limit')
    if (r.devices.some((d) => d.deviceId === device.deviceId)) return Promise.resolve('exists')
    if (r.devices.length >= maxDevices) return Promise.resolve('limit')
    r.devices.push({ ...device })
    return Promise.resolve('added')
  }
  touchDevice(licenseId: string, deviceId: string, lastSeen: string): Promise<boolean> {
    const d = this.licenses.get(licenseId)?.devices.find((x) => x.deviceId === deviceId)
    if (d) d.lastSeen = lastSeen
    return Promise.resolve(Boolean(d))
  }
  removeDevice(licenseId: string, deviceId: string): Promise<boolean> {
    const r = this.licenses.get(licenseId)
    if (!r) return Promise.resolve(false)
    const before = r.devices.length
    r.devices = r.devices.filter((d) => d.deviceId !== deviceId)
    return Promise.resolve(r.devices.length < before)
  }
  insertOrder(order: OrderRecord): Promise<void> {
    this.orders.push(structuredClone(order))
    return Promise.resolve()
  }
  claimEvent(provider: string, eventId: string): Promise<boolean> {
    const k = `${provider}:${eventId}`
    if (this.events.get(k)?.done) return Promise.resolve(false)
    this.events.set(k, { done: false })
    return Promise.resolve(true)
  }
  completeEvent(provider: string, eventId: string): Promise<void> {
    this.events.set(`${provider}:${eventId}`, { done: true })
    return Promise.resolve()
  }
}
