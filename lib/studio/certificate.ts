import { createPrivateKey, createPublicKey, generateKeyPairSync, sign, verify, type KeyObject } from 'node:crypto'
import { LicensePayloadSchema, splitCertificate, type LicensePayload } from './license-contract'

/** Para kluczy Ed25519. Klucz prywatny trafia do sekretów Vercel (LICENSE_PRIVATE_KEY), publiczny do buildu aplikacji. */
export function generateLicenseKeyPair(): { privateKeyPem: string; publicKeySpki: string } {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519')
  return {
    privateKeyPem: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
    // To, co aplikacja wkompilowuje: base64 SPKI DER.
    publicKeySpki: publicKey.export({ type: 'spki', format: 'der' }).toString('base64'),
  }
}

/** PEM z env bywa zapisany z literalnymi "\n" (panele hostingowe) — normalizujemy. */
export function privateKeyFromPem(pem: string): KeyObject {
  return createPrivateKey(pem.includes('\\n') ? pem.replace(/\\n/g, '\n') : pem)
}

export function publicKeyFromSpki(spkiBase64: string): KeyObject {
  return createPublicKey({ key: Buffer.from(spkiBase64, 'base64'), format: 'der', type: 'spki' })
}

export function signCertificate(payload: LicensePayload, privateKey: KeyObject): string {
  const body = Buffer.from(JSON.stringify(LicensePayloadSchema.parse(payload)), 'utf8')
  return `${body.toString('base64url')}.${sign(null, body, privateKey).toString('base64url')}`
}

/** Najpierw podpis Ed25519, potem schemat payloadu. Null dla czegokolwiek nieprawidłowego. */
export function verifyCertificate(certificate: string, publicKey: KeyObject): LicensePayload | null {
  const parts = splitCertificate(certificate)
  if (!parts) return null
  const body = Buffer.from(parts.payload, 'base64url')
  try {
    if (!verify(null, body, publicKey, Buffer.from(parts.signature, 'base64url'))) return null
    const parsed = LicensePayloadSchema.safeParse(JSON.parse(body.toString('utf8')))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
