import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { replaceAllPortfolioItems } from '@/lib/db/queries/portfolio'

export async function PUT(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = (await request.json()) as {
    items: Array<{
      id?: string
      sanityId?: string
      name: string
      url: string
      logoUrl?: string | null
      logoAlt?: string | null
      sortOrder?: number
      disabled?: boolean
    }>
  }
  await replaceAllPortfolioItems(
    body.items.map((item) => ({
      id: item.id,
      sanityId: item.sanityId ?? undefined,
      name: item.name,
      url: item.url,
      logoUrl: item.logoUrl ?? undefined,
      logoAlt: item.logoAlt ?? undefined,
      sortOrder: item.sortOrder,
      disabled: item.disabled,
    })),
  )
  return NextResponse.json({ ok: true })
}
