import { eq } from 'drizzle-orm'
import { getDb, hasDb } from '@/lib/db'
import { partnerSettings } from '@/lib/db/schema'
import { defaultPartnerSettings, type PartnerSettings } from '@/lib/data/partner'
import { mergePartnerSettings } from '@/lib/data/partner-schema'

export async function fetchPartnerSettings(): Promise<PartnerSettings> {
  if (!hasDb()) return defaultPartnerSettings
  try {
    const db = getDb()
    const row = await db.query.partnerSettings.findFirst({
      where: eq(partnerSettings.id, 'default'),
    })
    return mergePartnerSettings(row?.data ?? null)
  } catch (error) {
    console.error('[partnerSettings] DB fetch failed, using defaults:', error)
    return defaultPartnerSettings
  }
}

export async function savePartnerSettings(data: PartnerSettings): Promise<void> {
  const db = getDb()
  const payload = data as unknown as Record<string, unknown>
  await db
    .insert(partnerSettings)
    .values({ id: 'default', data: payload })
    .onConflictDoUpdate({ target: partnerSettings.id, set: { data: payload } })
}
