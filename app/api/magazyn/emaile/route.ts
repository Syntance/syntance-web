import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { getEmailTemplates, saveEmailTemplates } from '@/lib/db/queries/settings'
import type { EmailTemplates } from '@/lib/data/email-templates'

export async function GET() {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(await getEmailTemplates())
}

export async function PUT(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = (await request.json()) as EmailTemplates
  await saveEmailTemplates(body)
  return NextResponse.json(await getEmailTemplates())
}
