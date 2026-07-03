import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { replaceAllPortfolioItems } from '@/lib/db/queries/portfolio'
import type { PortfolioProjectType } from '@/lib/portfolio-content'
import type { PortfolioPerformanceReport } from '@/lib/portfolio-performance'

export async function PUT(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = (await request.json()) as {
    items: Array<{
      id?: string
      sanityId?: string | null
      slug: string
      name: string
      url: string
      projectType?: PortfolioProjectType
      description?: string
      highlights?: string[]
      stack?: string[]
      problemStatement?: string | null
      rebuildContext?: string | null
      previewImageFallback?: string | null
      previewImageAlt?: string | null
      logoUrl?: string | null
      logoAlt?: string | null
      performance?: PortfolioPerformanceReport | null
      sortOrder?: number
      disabled?: boolean
      caseStudyEnabled?: boolean
      adminGalleryEnabled?: boolean
    }>
  }
  const items = body.items.map((item) => ({
      id: item.id,
      sanityId: item.sanityId ?? undefined,
      slug: item.slug,
      name: item.name,
      url: item.url,
      projectType: item.projectType,
      description: item.description,
      highlights: item.highlights,
      stack: item.stack,
      problemStatement: item.problemStatement,
      rebuildContext: item.rebuildContext,
      previewImageFallback: item.previewImageFallback,
      previewImageAlt: item.previewImageAlt,
      logoUrl: item.logoUrl ?? undefined,
      logoAlt: item.logoAlt ?? undefined,
      performance: item.performance ?? null,
      sortOrder: item.sortOrder,
      disabled: item.disabled,
      caseStudyEnabled: item.caseStudyEnabled,
      adminGalleryEnabled: item.adminGalleryEnabled,
    }))

  await replaceAllPortfolioItems(items)

  for (const item of items) {
    if (item.slug.trim()) {
      revalidatePath(`/portfolio/${item.slug}`)
    }
  }
  revalidatePath('/portfolio')

  return NextResponse.json({ ok: true })
}
