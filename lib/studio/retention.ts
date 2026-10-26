import { and, eq, isNotNull, lt, sql } from 'drizzle-orm'
import { getDb, schema } from '@/lib/db'

/** Retencja danych (ADR 001 §6): audyt 12 mies., licencje wygasłe 12 mies. → anonimizacja, sesje i webhooki — krótko. */
export const RETENTION_DAYS = {
  audit: 365,
  licenseAfterExpiry: 365,
  webhookEvents: 90,
  adminSessions: 30,
} as const

const DAY_MS = 24 * 60 * 60 * 1000
export const cutoff = (now: number, days: number): Date => new Date(now - days * DAY_MS)

export interface RetentionResult {
  auditDeleted: number
  licensesAnonymised: number
  webhookEventsDeleted: number
  sessionsDeleted: number
}

export async function runRetention(now = Date.now()): Promise<RetentionResult> {
  const db = getDb()
  const audit = await db
    .delete(schema.studioAuditLog)
    .where(lt(schema.studioAuditLog.at, cutoff(now, RETENTION_DAYS.audit)))
    .returning({ id: schema.studioAuditLog.id })
  const events = await db
    .delete(schema.studioWebhookEvents)
    .where(and(isNotNull(schema.studioWebhookEvents.processedAt), lt(schema.studioWebhookEvents.receivedAt, cutoff(now, RETENTION_DAYS.webhookEvents))))
    .returning({ id: schema.studioWebhookEvents.eventId })
  const sessions = await db
    .delete(schema.adminSessions)
    .where(lt(schema.adminSessions.expiresAt, cutoff(now, RETENTION_DAYS.adminSessions)))
    .returning({ id: schema.adminSessions.id })

  // Subskrypcje, których okres skończył się dawno: anonimizacja e-maila i nazw urządzeń (zamówienia zostają bez e-maila).
  const expired = cutoff(now, RETENTION_DAYS.licenseAfterExpiry)
  const stale = await db
    .select({ id: schema.studioLicenses.id })
    .from(schema.studioLicenses)
    .where(
      and(
        isNotNull(schema.studioLicenses.expiresAt),
        lt(schema.studioLicenses.expiresAt, expired),
        sql`${schema.studioLicenses.email} not like 'erased-%@invalid.local'`,
      ),
    )
  for (const { id } of stale) {
    const anon = `erased-${id.slice(0, 8)}@invalid.local`
    await db.update(schema.studioLicenses).set({ email: anon, note: '', status: 'revoked' }).where(eq(schema.studioLicenses.id, id))
    await db.update(schema.studioDevices).set({ name: '' }).where(eq(schema.studioDevices.licenseId, id))
    await db.update(schema.studioOrders).set({ email: anon }).where(eq(schema.studioOrders.licenseId, id))
  }
  return { auditDeleted: audit.length, licensesAnonymised: stale.length, webhookEventsDeleted: events.length, sessionsDeleted: sessions.length }
}
