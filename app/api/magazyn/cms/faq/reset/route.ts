import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminSession } from '@/lib/admin-auth'
import { fetchFaqSettings, resetFaqSectionFromDefaults } from '@/lib/db/queries/faq'

/**
 * Przywraca sekcję FAQ do treści domyślnej z kodu.
 *
 * Na /dla-agencji produkcja serwowała FAQ ze zdezaktualizowanego modelu
 * white-label, mimo że kod miał już aktualny model partnerski — wiersze
 * w bazie wygrywają z domyślnymi i nikt ich nie odświeżył po zmianie oferty.
 */
const SECTIONS = ['home', 'cennik', 'stronyWww', 'sklepy', 'strategia', 'oNas', 'kontakt', 'agencje'] as const

const bodySchema = z.object({
  section: z.enum(SECTIONS),
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
      { error: 'Nieprawidłowa sekcja FAQ', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  try {
    const count = await resetFaqSectionFromDefaults(parsed.data.section)
    const faq = await fetchFaqSettings()
    return NextResponse.json({ restored: count, faq })
  } catch (error) {
    console.error('reset FAQ section:', error)
    return NextResponse.json({ error: 'Nie udało się przywrócić FAQ' }, { status: 500 })
  }
}
