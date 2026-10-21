import { getDb, schema } from '@/lib/db'
import type { AuditEntry } from './license-service'

/**
 * Zapis do dziennika audytu. Awaria zapisu nie może przerwać operacji (np. aktywacji u klienta),
 * ale jest głośno logowana. Do `meta` nigdy nie trafiają klucze licencji, hasła ani tokeny.
 */
export async function writeAudit(entry: AuditEntry): Promise<void> {
  try {
    await getDb()
      .insert(schema.studioAuditLog)
      .values({ actor: entry.actor, action: entry.action, target: entry.target, meta: entry.meta ?? {} })
  } catch (error) {
    console.error('[audit] zapis nieudany', entry.action, error)
  }
}
