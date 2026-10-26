import { randomBytes } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  decryptSecret,
  encryptSecret,
  generateBackupCodes,
  hashBackupCode,
  normalizeBackupCode,
  parseEncryptionKey,
} from './crypto'
import { dummyHash, hashPassword, verifyPassword } from './password'
import { base32Decode, base32Encode, generateTotpSecret, hotp, otpauthUri, totpAt, verifyTotp } from './totp'

// Wektory testowe RFC 4226 (sekret "12345678901234567890").
const RFC_SECRET = Buffer.from('12345678901234567890')
const RFC_SECRET_B32 = base32Encode(RFC_SECRET)

describe('TOTP / HOTP', () => {
  it('zgadza się z wektorami RFC 4226', () => {
    const expected = ['755224', '287082', '359152', '969429', '338314', '254676', '287922', '162583', '399871', '520489']
    expected.forEach((code, counter) => expect(hotp(RFC_SECRET, counter)).toBe(code))
  })

  it('zgadza się z wektorem RFC 6238 (T=59 s → 94287082, 8 cyfr)', () => {
    expect(totpAt(RFC_SECRET_B32, 59_000, 8)).toBe('94287082')
    expect(totpAt(RFC_SECRET_B32, 1111111109_000, 8)).toBe('07081804')
  })

  it('base32 jest odwracalny, a sekret ma 160 bitów', () => {
    const secret = generateTotpSecret()
    expect(secret).toMatch(/^[A-Z2-7]{32}$/)
    expect(base32Encode(base32Decode(secret))).toBe(secret)
    expect(() => base32Decode('abc1')).toThrow()
  })

  it('akceptuje kod z okna ±1 krok i odrzuca dalszy', () => {
    const now = 1_700_000_000_000
    const code = totpAt(RFC_SECRET_B32, now)
    expect(verifyTotp(RFC_SECRET_B32, code, now, null).ok).toBe(true)
    expect(verifyTotp(RFC_SECRET_B32, code, now + 30_000, null).ok).toBe(true)
    expect(verifyTotp(RFC_SECRET_B32, code, now + 90_000, null).ok).toBe(false)
  })

  it('blokuje ponowne użycie kodu (lastStep) i śmieci na wejściu', () => {
    const now = 1_700_000_000_000
    const code = totpAt(RFC_SECRET_B32, now)
    const first = verifyTotp(RFC_SECRET_B32, code, now, null)
    expect(first.ok).toBe(true)
    if (first.ok) expect(verifyTotp(RFC_SECRET_B32, code, now, first.step).ok).toBe(false)
    for (const bad of ['', '12345', '1234567', 'abcdef', '12 456']) expect(verifyTotp(RFC_SECRET_B32, bad, now, null).ok).toBe(false)
  })

  it('buduje URI otpauth', () => {
    const uri = otpauthUri({ secret: 'ABC', account: 'kamil@syntance.com', issuer: 'Syntance Magazyn' })
    expect(uri).toBe('otpauth://totp/Syntance%20Magazyn:kamil%40syntance.com?secret=ABC&issuer=Syntance+Magazyn&algorithm=SHA1&digits=6&period=30')
  })
})

describe('szyfrowanie sekretów', () => {
  const key = randomBytes(32)
  it('odszyfrowuje to, co zaszyfrowano; każdy szyfrogram jest inny', () => {
    const a = encryptSecret('JBSWY3DPEHPK3PXP', key)
    expect(decryptSecret(a, key)).toBe('JBSWY3DPEHPK3PXP')
    expect(encryptSecret('JBSWY3DPEHPK3PXP', key)).not.toBe(a)
  })
  it('wykrywa manipulację i zły klucz', () => {
    const blob = encryptSecret('sekret', key)
    const parts = blob.split('.')
    parts[3] = Buffer.from('zmienione').toString('base64url')
    expect(() => decryptSecret(parts.join('.'), key)).toThrow()
    expect(() => decryptSecret(blob, randomBytes(32))).toThrow()
    expect(() => decryptSecret('v2.a.b.c', key)).toThrow()
  })
  it('wymaga klucza 32 B', () => {
    expect(() => parseEncryptionKey(undefined)).toThrow()
    expect(() => parseEncryptionKey(Buffer.alloc(16).toString('base64'))).toThrow()
    expect(parseEncryptionKey(key.toString('base64'))).toHaveLength(32)
  })
})

describe('kody zapasowe', () => {
  it('są unikalne, w formacie XXXXX-XXXXX, a hash ignoruje wielkość liter i spacje', () => {
    const codes = generateBackupCodes()
    expect(new Set(codes).size).toBe(10)
    for (const c of codes) expect(c).toMatch(/^[A-Z2-9]{5}-[A-Z2-9]{5}$/)
    const c = codes[0]!
    expect(hashBackupCode(c.toLowerCase())).toBe(hashBackupCode(` ${c} `))
    expect(normalizeBackupCode(' ab cd ')).toBe('ABCD')
  })
})

describe('hasło Argon2id', () => {
  it('hashuje do PHC argon2id i weryfikuje', async () => {
    const phc = await hashPassword('correct horse battery staple')
    expect(phc.startsWith('$argon2id$')).toBe(true)
    expect(await verifyPassword(phc, 'correct horse battery staple')).toBe(true)
    expect(await verifyPassword(phc, 'zle haslo')).toBe(false)
    expect(await verifyPassword('nie-phc', 'x')).toBe(false)
  })
  it('hash-wabik jest poprawnym hashem (to samo koszty co prawdziwe konto)', async () => {
    expect((await dummyHash()).startsWith('$argon2id$')).toBe(true)
  })
})
