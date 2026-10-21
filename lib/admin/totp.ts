import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

/** TOTP wg RFC 6238 (HMAC-SHA1, 6 cyfr, krok 30 s) — zgodny z Google Authenticator, 1Password, Authy. */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
export const TOTP_STEP_SECONDS = 30
export const TOTP_DIGITS = 6

export function base32Encode(buf: Buffer): string {
  let bits = 0
  let value = 0
  let out = ''
  for (const byte of buf) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31]
  return out
}

export function base32Decode(input: string): Buffer {
  const clean = input.replace(/[\s=-]/g, '').toUpperCase()
  const bytes: number[] = []
  let bits = 0
  let value = 0
  for (const ch of clean) {
    const idx = ALPHABET.indexOf(ch)
    if (idx < 0) throw new Error('Invalid base32')
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }
  return Buffer.from(bytes)
}

/** 160-bitowy sekret (zalecenie RFC 4226) w base32. */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20))
}

export function hotp(secret: Buffer, counter: number, digits = TOTP_DIGITS): string {
  const msg = Buffer.alloc(8)
  msg.writeBigUInt64BE(BigInt(counter))
  const h = createHmac('sha1', secret).update(msg).digest()
  const offset = h[h.length - 1]! & 0xf
  const bin = ((h[offset]! & 0x7f) << 24) | (h[offset + 1]! << 16) | (h[offset + 2]! << 8) | h[offset + 3]!
  return String(bin % 10 ** digits).padStart(digits, '0')
}

export const totpStep = (nowMs: number): number => Math.floor(nowMs / 1000 / TOTP_STEP_SECONDS)

export function totpAt(secretBase32: string, nowMs: number, digits = TOTP_DIGITS): string {
  return hotp(base32Decode(secretBase32), totpStep(nowMs), digits)
}

/**
 * Sprawdza kod w oknie ±`window` kroków. `lastStep` = ostatni zaakceptowany krok: kod z tego samego lub
 * wcześniejszego kroku jest odrzucany (jednorazowość — podejrzany przez ramię kod nie zadziała drugi raz).
 */
export function verifyTotp(
  secretBase32: string,
  code: string,
  nowMs: number,
  lastStep: number | null,
  window = 1,
): { ok: true; step: number } | { ok: false } {
  if (!/^\d{6}$/.test(code)) return { ok: false }
  const secret = base32Decode(secretBase32)
  const current = totpStep(nowMs)
  const given = Buffer.from(code)
  let matched: number | null = null
  // Bez wczesnego wyjścia: czas odpowiedzi nie zależy od tego, który krok pasuje.
  for (let step = current - window; step <= current + window; step++) {
    const expected = Buffer.from(hotp(secret, step))
    if (timingSafeEqual(expected, given) && (lastStep === null || step > lastStep)) matched = step
  }
  return matched === null ? { ok: false } : { ok: true, step: matched }
}

export function otpauthUri(opts: { secret: string; account: string; issuer: string }): string {
  const label = `${encodeURIComponent(opts.issuer)}:${encodeURIComponent(opts.account)}`
  const params = new URLSearchParams({
    secret: opts.secret,
    issuer: opts.issuer,
    algorithm: 'SHA1',
    digits: String(TOTP_DIGITS),
    period: String(TOTP_STEP_SECONDS),
  })
  return `otpauth://totp/${label}?${params.toString()}`
}
