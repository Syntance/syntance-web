import { randomInt } from 'node:crypto'
import { STUDIO_KEY_PREFIX } from './license-contract'

// Alfabet bez dwuznacznych znaków (bez 0/O, 1/I/L) — taki sam jak w aplikacji.
const KEY_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function newLicenseKey(prefix = STUDIO_KEY_PREFIX): string {
  const group = (): string => Array.from({ length: 5 }, () => KEY_ALPHABET[randomInt(KEY_ALPHABET.length)]).join('')
  return [prefix, group(), group(), group(), group()].join('-')
}
