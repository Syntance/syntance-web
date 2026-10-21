import type { Entitlement } from './license-contract'

export type LicenseStatus = 'active' | 'revoked'
export type LicensePlan = 'perpetual' | 'subscription'

export interface DeviceRecord {
  deviceId: string
  name: string
  activatedAt: string
  lastSeen: string
}

export interface LicenseRecord {
  id: string
  /** Slug aplikacji w panelu (zakładka), np. "studio". */
  appSlug: string
  key: string
  email: string
  plan: LicensePlan
  entitlements: Entitlement[]
  updatesUntil: string
  expiresAt: string | null
  maxDevices: number
  status: LicenseStatus
  devices: DeviceRecord[]
  /** Referencja płatności (dostawca + id transakcji/subskrypcji) — dla zwrotów i odnowień. Null = wystawiona ręcznie. */
  source: { provider: string; reference: string } | null
  note: string
  createdAt: string
}

export interface OrderRecord {
  id: string
  licenseId: string | null
  provider: string
  eventId: string
  kind: 'purchase' | 'renewal' | 'refund' | 'manual'
  reference: string
  email: string
  /** Jednostki najmniejsze (grosze/centy); null, gdy nieznana. */
  amountTotal: number | null
  currency: string | null
  createdAt: string
}

export type AddDeviceResult = 'added' | 'exists' | 'limit'

export type LicensePatch = Partial<
  Pick<LicenseRecord, 'status' | 'expiresAt' | 'updatesUntil' | 'maxDevices' | 'entitlements' | 'plan' | 'note'>
>

/**
 * Port magazynu licencji. Implementacje: Drizzle/Neon (produkcja) i pamięć (testy).
 * `addDevice` MUSI być atomowe względem limitu urządzeń (dwie równoległe aktywacje nie mogą go przekroczyć).
 */
export interface StudioStore {
  findByKey(key: string): Promise<LicenseRecord | null>
  findById(id: string): Promise<LicenseRecord | null>
  findBySource(provider: string, reference: string): Promise<LicenseRecord | null>
  /** False, gdy naruszono unikalność (klucz albo źródło płatności). */
  insertLicense(record: LicenseRecord): Promise<boolean>
  updateLicense(id: string, patch: LicensePatch): Promise<void>
  addDevice(licenseId: string, device: DeviceRecord, maxDevices: number): Promise<AddDeviceResult>
  touchDevice(licenseId: string, deviceId: string, lastSeen: string): Promise<boolean>
  removeDevice(licenseId: string, deviceId: string): Promise<boolean>
  insertOrder(order: OrderRecord): Promise<void>
  /** True = zdarzenie do przetworzenia (nowe albo wcześniej niedokończone); false = już przetworzone. */
  claimEvent(provider: string, eventId: string, type: string): Promise<boolean>
  completeEvent(provider: string, eventId: string): Promise<void>
}
