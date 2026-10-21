import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

/** AES-256-GCM dla sekretów w bazie (np. sekret TOTP). Klucz żyje w env, nigdy w bazie ani repo. */
const VERSION = 'v1'

export function parseEncryptionKey(base64: string | undefined): Buffer {
  const key = Buffer.from(base64 ?? '', 'base64')
  if (key.length !== 32) throw new Error('ADMIN_ENC_KEY must be 32 bytes, base64-encoded')
  return key
}

export function encryptSecret(plain: string, key: Buffer): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  return [VERSION, iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), ct.toString('base64url')].join('.')
}

export function decryptSecret(blob: string, key: Buffer): string {
  const [version, iv, tag, ct] = blob.split('.')
  if (version !== VERSION || !iv || !tag || !ct) throw new Error('Unsupported secret format')
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'))
  decipher.setAuthTag(Buffer.from(tag, 'base64url'))
  return Buffer.concat([decipher.update(Buffer.from(ct, 'base64url')), decipher.final()]).toString('utf8')
}

export const sha256Hex = (input: string): string => createHash('sha256').update(input).digest('hex')

/** Kody zapasowe: 10 jednorazowych, 10 znaków z alfabetu bez dwuznaczności, zapisu XXXXX-XXXXX. */
const BACKUP_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
export function generateBackupCodes(count = 10): string[] {
  return Array.from({ length: count }, () => {
    const bytes = randomBytes(10)
    const chars = Array.from(bytes, (b) => BACKUP_ALPHABET[b % BACKUP_ALPHABET.length]).join('')
    return `${chars.slice(0, 5)}-${chars.slice(5)}`
  })
}

export const normalizeBackupCode = (input: string): string => input.trim().toUpperCase().replace(/\s+/g, '')
export const hashBackupCode = (code: string): string => sha256Hex(`backup:${normalizeBackupCode(code)}`)
