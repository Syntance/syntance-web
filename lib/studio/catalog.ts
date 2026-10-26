import { createPublicKey, verify } from 'node:crypto'
import {
  CatalogEnvelopeSchema,
  CatalogSchema,
  MANIFEST_FILE,
  PackageManifestSchema,
  compareVersions,
  manifestProblems,
  type Catalog,
  type PackageManifest,
} from './hub-contract'

/**
 * Katalog modułów i weryfikacja pakietów po stronie panelu (ADR 001 §2, ADR 002).
 * Panel NIE ma klucza prywatnego wydawcy: buduje szkic katalogu, a podpis (Ed25519 nad dokładnym tekstem JSON)
 * wykonuje właściciel lokalnie. Panel sprawdza podpis kluczem PUBLICZNYM i dopiero wtedy publikuje.
 */

export class CatalogError extends Error {
  constructor(
    readonly code: 'SIGNATURE' | 'SCHEMA' | 'ROLLBACK' | 'MANIFEST' | 'MISMATCH',
    detail = '',
  ) {
    super(`${code}${detail ? `: ${detail}` : ''}`)
  }
}

export type VersionStatus = 'staged' | 'live' | 'withdrawn'

export interface VersionRow {
  moduleId: string
  version: string
  channel: 'stable' | 'beta'
  status: VersionStatus
  url: string
  size: number
  sha256: string
  hubApi: { min: number; max: number }
  notes: { pl: string; en: string } | null
}

/** Ed25519 (klucz publiczny: base64 SPKI DER; podpis: base64). Nigdy nie rzuca. */
export function verifySignature(data: string | Uint8Array, signatureB64: string, publicKeyB64: string): boolean {
  try {
    const key = createPublicKey({ key: Buffer.from(publicKeyB64, 'base64'), format: 'der', type: 'spki' })
    return verify(null, typeof data === 'string' ? Buffer.from(data) : data, key, Buffer.from(signatureB64, 'base64'))
  } catch {
    return false
  }
}

/**
 * Szkic katalogu: tylko wersje `live`, deterministyczna kolejność (moduły alfabetycznie, wersje malejąco).
 * Zwraca dokładny tekst, który właściciel podpisuje (`catalog` w kopercie). `issuedAt` rośnie monotonicznie.
 */
export function buildCatalogText(rows: readonly VersionRow[], issuedAt: Date): string {
  const modules: Catalog['modules'] = {}
  const live = rows.filter((r) => r.status === 'live')
  for (const id of [...new Set(live.map((r) => r.moduleId))].sort()) {
    const pick = (channel: 'stable' | 'beta') =>
      live
        .filter((r) => r.moduleId === id && r.channel === channel)
        .sort((a, b) => compareVersions(b.version, a.version))
        .map((r) => ({
          version: r.version,
          url: r.url,
          size: r.size,
          sha256: r.sha256,
          hubApi: r.hubApi,
          ...(r.notes ? { notes: r.notes } : {}),
        }))
    modules[id] = { channels: { stable: pick('stable'), beta: pick('beta') } }
  }
  const parsed = CatalogSchema.safeParse({ schema: 1, issuedAt: issuedAt.toISOString(), modules })
  if (!parsed.success) throw new CatalogError('SCHEMA', parsed.error.issues[0]?.message ?? '')
  return JSON.stringify(parsed.data)
}

/**
 * Walidacja przed publikacją: podpis (klucz publiczny wydawcy), schemat i ochrona przed cofnięciem
 * (`issuedAt` musi być nowszy niż ostatnio opublikowany — aplikacja odrzuca starszy katalog).
 */
export function validatePublish(text: string, signatureB64: string, publicKeyB64: string, lastIssuedAt: string | null): Catalog {
  if (!verifySignature(text, signatureB64, publicKeyB64)) throw new CatalogError('SIGNATURE')
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    throw new CatalogError('SCHEMA', 'JSON')
  }
  const parsed = CatalogSchema.safeParse(json)
  if (!parsed.success) throw new CatalogError('SCHEMA', parsed.error.issues[0]?.message ?? '')
  if (lastIssuedAt !== null && Date.parse(parsed.data.issuedAt) <= Date.parse(lastIssuedAt)) throw new CatalogError('ROLLBACK')
  return parsed.data
}

/** Koperta publikowana w `/api/studio/catalog` (format `CatalogEnvelope` z aplikacji). */
export function toEnvelope(text: string, signatureB64: string): { catalog: string; signature: string } {
  return CatalogEnvelopeSchema.parse({ catalog: text, signature: signatureB64 })
}

/**
 * Rejestracja pakietu: `module.json` musi mieć ważny podpis wydawcy (`module.sig`), poprawny schemat i spójność strukturalną.
 * Zwraca manifest; sumę SHA-256 całego pliku `.fmod` podaje właściciel (aplikacja i tak weryfikuje ją przy instalacji).
 */
export function verifyManifest(moduleJson: string, signatureB64: string, publicKeyB64: string): PackageManifest {
  if (!verifySignature(moduleJson, signatureB64.trim(), publicKeyB64)) throw new CatalogError('SIGNATURE', MANIFEST_FILE)
  let json: unknown
  try {
    json = JSON.parse(moduleJson)
  } catch {
    throw new CatalogError('MANIFEST', 'JSON')
  }
  const parsed = PackageManifestSchema.safeParse(json)
  if (!parsed.success) throw new CatalogError('MANIFEST', parsed.error.issues[0]?.message ?? '')
  const problems = manifestProblems(parsed.data)
  if (problems.length > 0) throw new CatalogError('MANIFEST', problems.join('; '))
  return parsed.data
}
