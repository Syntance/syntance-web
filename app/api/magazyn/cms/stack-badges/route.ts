import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { replaceAllStackBadges } from '@/lib/db/queries/stack-badges'
import type { StackBadgeRecord } from '@/lib/data/stack-badges'

export async function PUT(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as { items?: StackBadgeRecord[] }
  const items = body.items ?? []

  const invalid = items.find((item) => !item.id.trim() || !item.name.trim())
  if (invalid) {
    return NextResponse.json({ error: 'Każdy badge wymaga id i nazwy.' }, { status: 400 })
  }

  await replaceAllStackBadges(items)
  return NextResponse.json({ ok: true })
}
