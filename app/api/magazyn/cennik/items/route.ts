import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { replaceAllPricingItems } from '@/lib/db/queries/pricing'
import type { PricingItem } from '@/lib/data/pricing'

export async function PUT(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = (await request.json()) as { items: PricingItem[] }
  await replaceAllPricingItems(body.items)
  return NextResponse.json({ ok: true, count: body.items.length })
}
