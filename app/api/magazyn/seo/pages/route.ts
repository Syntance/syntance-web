import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { listSeoPages, upsertSeoPage } from '@/lib/db/queries/seo'
import type { PageSeo } from '@/lib/data/seo-types'

export async function GET() {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(await listSeoPages())
}

export async function PUT(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = (await request.json()) as PageSeo
  if (!body.slug || !body.pageName) {
    return NextResponse.json({ error: 'slug and pageName required' }, { status: 400 })
  }
  await upsertSeoPage(body)
  const pages = await listSeoPages()
  const saved = pages.find((p) => p.slug === body.slug)
  return NextResponse.json(saved ?? body)
}
