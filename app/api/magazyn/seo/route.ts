import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { getSeoSettings, saveSeoSettings } from '@/lib/db/queries/seo'
import type { SeoSettings } from '@/lib/data/seo-types'

export async function GET() {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(await getSeoSettings())
}

export async function PUT(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = (await request.json()) as Partial<SeoSettings>
  await saveSeoSettings(body)
  return NextResponse.json(await getSeoSettings())
}
