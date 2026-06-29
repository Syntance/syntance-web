import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { savePricingConfig } from '@/lib/db/queries/pricing'
import type { PricingData } from '@/lib/data/pricing'

export async function PUT(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = (await request.json()) as PricingData['config']
  await savePricingConfig(body)
  return NextResponse.json({ ok: true })
}
