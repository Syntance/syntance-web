import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminSession } from '@/lib/admin-auth'
import { isValidPortfolioSlug, savePortfolioPreviewImage } from '@/lib/magazyn/portfolio-upload'

export async function POST(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowe dane formularza.' }, { status: 400 })
  }

  const parsed = z
    .object({
      slug: z.string().trim().refine(isValidPortfolioSlug, 'Nieprawidłowy slug.'),
      file: z.instanceof(File).refine((file) => file.size > 0, 'Brak pliku.'),
    })
    .safeParse({
      slug: formData.get('slug'),
      file: formData.get('file'),
    })

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Nieprawidłowe dane.' },
      { status: 400 },
    )
  }

  try {
    const { url } = await savePortfolioPreviewImage(parsed.data.file, parsed.data.slug)
    return NextResponse.json({ url })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload nie powiódł się.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
