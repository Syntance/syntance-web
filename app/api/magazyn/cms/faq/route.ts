import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { replaceFaqSettings } from '@/lib/db/queries/faq'
import type { FaqSettingsDocument } from '@/lib/data/faq'

export async function PUT(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = (await request.json()) as FaqSettingsDocument
  await replaceFaqSettings(body)
  return NextResponse.json({ ok: true })
}
