import { hash, verify } from '@node-rs/argon2'

/** Argon2id (domyślny wariant @node-rs/argon2), parametry wg OWASP: 19 MiB, 2 iteracje, 1 wątek. */
const OPTIONS = { memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const

/** Decyzja właściciela (2026-10-27): minimum 6 znaków; dodatkową ochronę dają obowiązkowy TOTP i limity prób (ADR 001 §4). */
export const MIN_PASSWORD_LENGTH = 6
export const MAX_PASSWORD_LENGTH = 128

export function hashPassword(password: string): Promise<string> {
  return hash(password, OPTIONS)
}

export async function verifyPassword(phc: string, password: string): Promise<boolean> {
  try {
    return await verify(phc, password)
  } catch {
    return false
  }
}

let dummy: Promise<string> | null = null
/** Hash-wabik: weryfikacja nieistniejącego konta trwa tyle samo co istniejącego (brak enumeracji po czasie). */
export function dummyHash(): Promise<string> {
  dummy ??= hashPassword('dummy-password-for-timing-equalisation')
  return dummy
}
