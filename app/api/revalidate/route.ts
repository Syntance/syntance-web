import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { clientWithoutToken } from '@/sanity/lib/client'
import {
  PRICING_REVALIDATE_PATHS,
  shouldRevalidatePricing,
} from '@/lib/sanity-revalidate'

type SanityWebhookBody = {
  _type?: string
  ids?: {
    created?: string[]
    updated?: string[]
    deleted?: string[]
  }
  transactionId?: string
  projectId?: string
  dataset?: string
}

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) return true
  return request.nextUrl.searchParams.get('secret') === secret
}

async function resolveDocumentTypes(ids: string[]): Promise<Set<string>> {
  const uniqueIds = [...new Set(ids.map((id) => id.replace(/^drafts\./, '')))]
  if (uniqueIds.length === 0) return new Set()

  const rows = await clientWithoutToken.fetch<Array<{ _type: string }>>(
    `*[_id in $ids]{ _type }`,
    { ids: uniqueIds }
  )

  return new Set(rows.map((row) => row._type))
}

function revalidatePricingSurfaces() {
  revalidateTag('pricing', { expire: 0 })
  revalidateTag('faq', { expire: 0 })
  for (const path of PRICING_REVALIDATE_PATHS) {
    revalidatePath(path, 'page')
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
    }

    const tag = request.nextUrl.searchParams.get('tag')
    if (tag) {
      revalidateTag(tag, { expire: 0 })
      return NextResponse.json({ revalidated: true, tag, now: Date.now() })
    }

    const body = (await request.json().catch(() => ({}))) as SanityWebhookBody
    const changedIds = [
      ...(body.ids?.created ?? []),
      ...(body.ids?.updated ?? []),
      ...(body.ids?.deleted ?? []),
    ]

    let documentTypes: Set<string>
    if (changedIds.length > 0) {
      documentTypes = await resolveDocumentTypes(changedIds)
    } else if (body._type) {
      documentTypes = new Set([body._type])
    } else {
      documentTypes = new Set()
    }

    const revalidatePricing =
      documentTypes.size === 0 ||
      [...documentTypes].some((documentType) =>
        shouldRevalidatePricing(documentType)
      )

    if (revalidatePricing) {
      revalidatePricingSurfaces()
    }

    return NextResponse.json({
      revalidated: revalidatePricing,
      documentTypes: [...documentTypes],
      paths: revalidatePricing ? [...PRICING_REVALIDATE_PATHS] : [],
      now: Date.now(),
    })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  const tag = request.nextUrl.searchParams.get('tag')
  const all = request.nextUrl.searchParams.get('all')

  try {
    if (all === 'pricing') {
      revalidatePricingSurfaces()
      return NextResponse.json({
        revalidated: true,
        paths: [...PRICING_REVALIDATE_PATHS],
        now: Date.now(),
      })
    }

    if (!tag) {
      return NextResponse.json({
        message: 'Provide ?tag=pricing or ?all=pricing',
        availableTags: ['pricing', 'faq'],
      })
    }

    revalidateTag(tag, { expire: 0 })
    return NextResponse.json({ revalidated: true, tag, now: Date.now() })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}
