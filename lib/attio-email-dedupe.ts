/**
 * Deduplikacja maili z webhooka Attio (Upstash Redis).
 *
 * Maile od zmiany **etapu** (umowa / przelew / start / koniec / odrzucenie): jeden raz na parę
 * (dealRecordId + typ) na cały czas życia rekordu — cofnięcie i ponowne ustawienie etapu nie wyśle ponownie.
 *
 * Maile **przypomnienia** (osobne pole select w dealu): cooldown per deal (domyślnie 24 h),
 * konfigurowalny przez ATTIO_REMINDER_COOLDOWN_HOURS.
 *
 * Bez UPSTASH_REDIS_REST_URL + TOKEN dedupe jest wyłączony (wysyłka jak dotychczas; log ostrzegawczy).
 */

import { Redis } from '@upstash/redis'

export type AttioStageEmailAction =
  | 'contracts'
  | 'payment'
  | 'kickoff'
  | 'complete'
  | 'reject'

let redisSingleton: Redis | null | undefined

function getRedis(): Redis | null {
  if (redisSingleton !== undefined) return redisSingleton
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (!url || !token) {
    console.warn(
      '[attio-dedupe] Brak UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN — deduplikacja wyłączona',
    )
    redisSingleton = null
    return null
  }
  redisSingleton = new Redis({ url, token })
  return redisSingleton
}

const STAGE_KEY_PREFIX = 'attio:v1:stage-email:'
const REMINDER_KEY_PREFIX = 'attio:v1:reminder-email:'

/**
 * Rezerwuje „slot” na wysyłkę maila etapowego (SET NX). Przy błędzie Resend wywołaj release.
 */
export async function acquireAttioStageEmailSend(
  dealRecordId: string,
  action: AttioStageEmailAction,
): Promise<boolean> {
  const r = getRedis()
  if (!r) return true
  const key = `${STAGE_KEY_PREFIX}${dealRecordId}:${action}`
  const ok = await r.set(key, String(Date.now()), { nx: true })
  return ok === 'OK'
}

/** Zwalnia slot po nieudanej wysyłce (np. błąd Resend). */
export async function releaseAttioStageEmailSend(
  dealRecordId: string,
  action: AttioStageEmailAction,
): Promise<void> {
  const r = getRedis()
  if (!r) return
  await r.del(`${STAGE_KEY_PREFIX}${dealRecordId}:${action}`)
}

function reminderCooldownSeconds(): number {
  const hoursRaw = process.env.ATTIO_REMINDER_COOLDOWN_HOURS?.trim()
  const hours = hoursRaw === '' || hoursRaw === undefined ? 24 : Number(hoursRaw)
  if (!Number.isFinite(hours) || hours < 0) return 24 * 3600
  return Math.max(60, Math.floor(hours * 3600))
}

/**
 * Cooldown na przypomnienie per deal (SET NX + EX). Przy błędzie wysyłki wywołaj release.
 */
export async function acquireAttioReminderSend(dealRecordId: string): Promise<boolean> {
  const r = getRedis()
  if (!r) return true
  const key = `${REMINDER_KEY_PREFIX}${dealRecordId}`
  const ex = reminderCooldownSeconds()
  const ok = await r.set(key, String(Date.now()), { nx: true, ex })
  return ok === 'OK'
}

export async function releaseAttioReminderSend(dealRecordId: string): Promise<void> {
  const r = getRedis()
  if (!r) return
  await r.del(`${REMINDER_KEY_PREFIX}${dealRecordId}`)
}
