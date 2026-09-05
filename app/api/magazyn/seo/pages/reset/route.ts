import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminSession } from '@/lib/admin-auth'
import { listSeoPages, resetSeoPagesFromCatalog } from '@/lib/db/queries/seo'

/**
 * Przywraca treść SEO podstron z katalogu w kodzie (SEO_PAGE_CATALOG).
 *
 * Wiersze w bazie potrafią być starsze niż kod — po pierwszym włączeniu
 * nadpisywania z CMS na produkcję trafiły nieaktualne ceny i literówki.
 * Ten endpoint pozwala cofnąć podstronę (albo wszystkie) do treści z kodu
 * jednym ruchem, zamiast przepisywania jej ręcznie.
 */
const bodySchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(200)
    .startsWith('/', 'slug musi zaczynać się od "/"')
    .optional(),
})

export async function POST(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    raw = {}
  }

  const parsed = bodySchema.safeParse(raw ?? {})
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Nieprawidłowe dane', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  try {
    const count = await resetSeoPagesFromCatalog(parsed.data.slug)
    const pages = await listSeoPages()
    return NextResponse.json({ restored: count, pages })
  } catch (error) {
    console.error('reset SEO pages:', error)
    return NextResponse.json({ error: 'Nie udało się przywrócić treści' }, { status: 500 })
  }
}
