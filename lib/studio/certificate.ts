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

const PEM_BODY = /-----BEGIN PRIVATE KEY-----([\s\S]*?)-----END PRIVATE KEY-----/

/**
 * PEM z env bywa zniekształcony przez panele hostingowe i schowek: literalne "\n", jedna linia, cudzysłowy,
 * spacje lub CRLF. Wyciągamy treść base64 spomiędzy znaczników i odbudowujemy kanoniczny PEM (PKCS#8).
 */
export function normalizePrivateKeyPem(input: string): string {
  const cleaned = input.trim().replace(/^["']+|["']+$/g, '').replace(/\\r/g, '').replace(/\\n/g, '\n')
  const match = PEM_BODY.exec(cleaned)
  if (!match?.[1]) return cleaned
  const body = match[1].replace(/\s+/g, '')
  return `-----BEGIN PRIVATE KEY-----\n${body.match(/.{1,64}/g)?.join('\n') ?? ''}\n-----END PRIVATE KEY-----\n`
}

export function privateKeyFromPem(pem: string): KeyObject {
  return createPrivateKey(normalizePrivateKeyPem(pem))
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
