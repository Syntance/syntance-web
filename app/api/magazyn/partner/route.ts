import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { savePartnerSettings } from '@/lib/db/queries/partner'
import { partnerSettingsSchema } from '@/lib/data/partner-schema'

export async function PUT(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = partnerSettingsSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Niepoprawne dane', issues: parsed.error.issues.map((i) => i.message) },
      { status: 400 },
    )
  }

  const ids = parsed.data.levels.map((level) => level.id)
  if (new Set(ids).size !== ids.length) {
    return NextResponse.json({ error: 'Identyfikatory poziomów muszą być unikalne' }, { status: 400 })
  }

  await savePartnerSettings(parsed.data)
  return NextResponse.json({ ok: true })
}
