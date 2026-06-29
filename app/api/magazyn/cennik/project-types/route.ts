import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { replaceProjectTypes, type ProjectTypeAdmin } from '@/lib/db/queries/pricing'

export async function PUT(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = (await request.json()) as { projectTypes: ProjectTypeAdmin[] }
  await replaceProjectTypes(body.projectTypes)
  return NextResponse.json({ ok: true, count: body.projectTypes.length })
}
