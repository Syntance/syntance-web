import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { getEmailTemplates, saveEmailTemplates } from '@/lib/db/queries/settings'
import type { EmailTemplates } from '@/lib/data/email-templates'
import { TEMPLATE_META } from '@/lib/magazyn/email-meta'

type Ctx = { params: Promise<{ key: string }> }

export async function PUT(request: Request, { params }: Ctx) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { key } = await params
  const validKey = TEMPLATE_META.find((m) => m.key === key)?.key
  if (!validKey) {
    return NextResponse.json({ error: 'Unknown template key' }, { status: 400 })
  }

  const body = (await request.json()) as Record<string, unknown>

  const current = await getEmailTemplates()
  const updated: EmailTemplates = {
    ...current,
    [validKey]: { ...current[validKey as keyof EmailTemplates], ...body },
  }
  await saveEmailTemplates(updated)
  return NextResponse.json({ ok: true, key: validKey })
}
