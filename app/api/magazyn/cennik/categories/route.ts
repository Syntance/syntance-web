import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { replacePricingCategories, type PricingCategoryAdmin } from '@/lib/db/queries/pricing'

export async function PUT(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = (await request.json()) as { categories: PricingCategoryAdmin[] }
  await replacePricingCategories(body.categories)
  return NextResponse.json({ ok: true, count: body.categories.length })
}
