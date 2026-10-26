/**
 * Kontrakt licencji Syntance Studio — kopia 1:1 z aplikacji desktopowej (folio-pdf/src/shared/license.ts, ADR 019).
 * Certyfikat = base64url(JSON LicensePayload) + "." + base64url(podpis Ed25519 nad surowymi bajtami JSON).
 * Zmiana kształtu payloadu wymaga równoległej zmiany w aplikacji — test `license-contract.test.ts` pilnuje formatu.
 */
import { z } from 'zod'

/** Uprawnienia płatne. Plan Free = brak któregokolwiek. */
export const ENTITLEMENTS = ['pro', 'print', 'vector', 'image'] as const
export type Entitlement = (typeof ENTITLEMENTS)[number]

/** Aplikacja ponownie waliduje certyfikat online mniej więcej co miesiąc. */
export const VALIDATION_INTERVAL_DAYS = 30
export const DEFAULT_MAX_DEVICES = 2
export const MAX_DEVICES_LIMIT = 10

export const LICENSE_KEY_PATTERN = /^[A-Z]+(-[A-Z2-9]{5}){4}$/
export const STUDIO_KEY_PREFIX = 'STUDIO'

export const LicensePayloadSchema = z.object({
  v: z.literal(1),
  licenseId: z.uuid(),
  key: z.string().regex(LICENSE_KEY_PATTERN),
  email: z.email().max(254),
  plan: z.enum(['perpetual', 'subscription']),
  entitlements: z.array(z.enum(ENTITLEMENTS)).min(1),
  /** Perpetual: ostatnia data wydania objęta zakupem. Subskrypcja: koniec opłaconego okresu. */
  updatesUntil: z.iso.datetime(),
  /** Subskrypcja: koniec opłaconego okresu. Perpetual: null. */
  expiresAt: z.iso.datetime().nullable(),
  maxDevices: z.number().int().min(1).max(MAX_DEVICES_LIMIT),
  /** SHA-256 (hex) odcisku urządzenia, dla którego wydano certyfikat. */
  deviceId: z.string().regex(/^[0-9a-f]{64}$/),
  issuedAt: z.iso.datetime(),
  validateBy: z.iso.datetime(),
})
export type LicensePayload = z.infer<typeof LicensePayloadSchema>

/** Normalizacja tego, co użytkownik wpisuje lub wkleja: wielkość liter, spacje, warianty myślnika. */
export function normalizeLicenseKey(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/[‐-―−]/g, '-')
    .replace(/\s+/g, '')
}

export function splitCertificate(certificate: string): { payload: string; signature: string } | null {
  const parts = certificate.trim().split('.')
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null
  if (!/^[A-Za-z0-9_-]+$/.test(parts[0]) || !/^[A-Za-z0-9_-]+$/.test(parts[1])) return null
  return { payload: parts[0], signature: parts[1] }
}
