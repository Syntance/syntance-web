import { createPublicKey, verify } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { generateLicenseKeyPair, privateKeyFromPem, publicKeyFromSpki, signCertificate, verifyCertificate } from './certificate'
import { LICENSE_KEY_PATTERN, normalizeLicenseKey, splitCertificate, type LicensePayload } from './license-contract'
import { newLicenseKey } from './license-key'

const payload = (over: Partial<LicensePayload> = {}): LicensePayload => ({
  v: 1,
  licenseId: '3f1b5c3e-8a43-4e0b-9d8e-0d9c2f6a7b11',
  key: 'STUDIO-ABCDE-FGHJK-MNPQR-STUVW',
  email: 'klient@example.com',
  plan: 'perpetual',
  entitlements: ['pro', 'vector'],
  updatesUntil: '2027-10-21T00:00:00.000Z',
  expiresAt: null,
  maxDevices: 2,
  deviceId: 'a'.repeat(64),
  issuedAt: '2026-10-21T10:00:00.000Z',
  validateBy: '2026-11-20T10:00:00.000Z',
  ...over,
})

describe('certyfikat licencji (kontrakt z aplikacją)', () => {
  const pair = generateLicenseKeyPair()
  const priv = privateKeyFromPem(pair.privateKeyPem)
  const pub = publicKeyFromSpki(pair.publicKeySpki)

  it('ma format base64url(JSON).base64url(podpis Ed25519 nad surowymi bajtami JSON)', () => {
    const cert = signCertificate(payload(), priv)
    const parts = splitCertificate(cert)
    expect(parts).not.toBeNull()
    const body = Buffer.from(parts!.payload, 'base64url')
    // Niezależna weryfikacja tak, jak robi to aplikacja (klucz publiczny jako SPKI DER w base64).
    const spki = createPublicKey({ key: Buffer.from(pair.publicKeySpki, 'base64'), format: 'der', type: 'spki' })
    expect(verify(null, body, spki, Buffer.from(parts!.signature, 'base64url'))).toBe(true)
    expect(JSON.parse(body.toString('utf8'))).toEqual(payload())
  })

  it('weryfikuje się i zwraca ten sam payload', () => {
    expect(verifyCertificate(signCertificate(payload(), priv), pub)).toEqual(payload())
  })

  it('odrzuca zmodyfikowany payload', () => {
    const [body, sig] = signCertificate(payload(), priv).split('.')
    const forged = Buffer.from(JSON.stringify(payload({ entitlements: ['pro', 'print', 'vector', 'image'] }))).toString('base64url')
    expect(verifyCertificate(`${forged}.${sig}`, pub)).toBeNull()
    expect(verifyCertificate(`${body}.${sig}`, pub)).not.toBeNull()
  })

  it('odrzuca podpis obcym kluczem i śmieci', () => {
    const other = generateLicenseKeyPair()
    const cert = signCertificate(payload(), privateKeyFromPem(other.privateKeyPem))
    expect(verifyCertificate(cert, pub)).toBeNull()
    expect(verifyCertificate('abc', pub)).toBeNull()
    expect(verifyCertificate('a.b.c', pub)).toBeNull()
    expect(verifyCertificate('', pub)).toBeNull()
  })

  it('nie podpisuje payloadu niezgodnego ze schematem', () => {
    expect(() => signCertificate(payload({ maxDevices: 99 }), priv)).toThrow()
    expect(() => signCertificate(payload({ entitlements: [] }), priv)).toThrow()
    expect(() => signCertificate(payload({ deviceId: 'xyz' }), priv)).toThrow()
  })

  it('przyjmuje PEM z literalnymi \\n (zmienne środowiskowe hostingu)', () => {
    const escaped = pair.privateKeyPem.trim().replace(/\n/g, '\\n')
    expect(verifyCertificate(signCertificate(payload(), privateKeyFromPem(escaped)), pub)).toEqual(payload())
  })
})

describe('klucz licencji', () => {
  it('generuje klucze zgodne ze wzorcem aplikacji', () => {
    for (let i = 0; i < 50; i++) expect(newLicenseKey()).toMatch(LICENSE_KEY_PATTERN)
    expect(newLicenseKey()).toMatch(/^STUDIO-/)
  })
  it('normalizuje wklejony klucz', () => {
    expect(normalizeLicenseKey('  studio–abcde fghjk-mnpqr-stuvw ')).toBe('STUDIO-ABCDEFGHJK-MNPQR-STUVW')
  })
})

describe('wczytywanie klucza prywatnego z env (zniekształcone PEM)', () => {
  const { privateKeyPem, publicKeySpki } = generateLicenseKeyPair()
  const pub = publicKeyFromSpki(publicKeySpki)
  const variants: Record<string, string> = {
    kanoniczny: privateKeyPem,
    crlf: privateKeyPem.replace(/\n/g, '\r\n'),
    'literalne \n': privateKeyPem.trimEnd().replace(/\n/g, '\n'),
    'jedna linia (spacje zamiast nowych linii)': privateKeyPem.trim().replace(/\n/g, ' '),
    'cudzysłowy': `"${privateKeyPem.trimEnd()}"`,
    'spacje z przodu i z tyłu': `  ${privateKeyPem.trimEnd()}   `,
    'wcięte linie': privateKeyPem.trimEnd().replace(/\n/g, '\n   '),
  }
  for (const [name, pem] of Object.entries(variants)) {
    it(`przyjmuje: ${name}`, () => {
      const cert = signCertificate(payload(), privateKeyFromPem(pem))
      expect(verifyCertificate(cert, pub)).toEqual(payload())
    })
  }
  it('odrzuca śmieci zamiast klucza', () => {
    expect(() => privateKeyFromPem('to nie jest klucz')).toThrow()
    expect(() => privateKeyFromPem('')).toThrow()
  })
})
