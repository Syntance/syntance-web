import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminSession } from '@/lib/admin-auth'
import { listSeoPages, upsertSeoPage } from '@/lib/db/queries/seo'

export async function GET() {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(await listSeoPages())
}

/**
 * Pola tekstowe przepuszczają pusty string — to poprawny stan „wyczyszczone",
 * który warstwa odczytu (`blankToUndefined`) zamienia na brak wartości, więc
 * metadana schodzi na wartość z kodu zamiast zostać wykasowana.
 */
const optionalText = (max: number) => z.string().max(max).optional()

/** Adresy trafiają prosto do atrybutów w wyrenderowanym HTML — tylko https, nigdy javascript:/data:. */
const httpsUrl = z
  .union([
    z.literal(''),
    z.string().url().refine((v) => v.startsWith('https://'), 'adres musi zaczynać się od https://'),
  ])
  .optional()

const pageSeoSchema = z.object({
  id: z.string().max(200).optional(),
  pageName: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).startsWith('/', 'slug musi zaczynać się od "/"'),
  isActive: z.boolean(),
  metaTitle: optionalText(300),
  metaDescription: optionalText(1000),
  canonicalUrl: httpsUrl,
  focusKeyword: optionalText(200),
  keywords: z.array(z.string().max(120)).max(50).optional(),
  keywordDensity: optionalText(50),
  ogTitle: optionalText(300),
  ogDescription: optionalText(1000),
  ogImageUrl: httpsUrl,
  twitterTitle: optionalText(300),
  twitterDescription: optionalText(1000),
  seoNotes: optionalText(5000),
  lastUpdated: z.string().optional(),
})

export async function PUT(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy JSON' }, { status: 400 })
  }

  const parsed = pageSeoSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Nieprawidłowe dane SEO', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  await upsertSeoPage(parsed.data)
  const pages = await listSeoPages()
  const saved = pages.find((p) => p.slug === parsed.data.slug)
  return NextResponse.json(saved ?? parsed.data)
}
