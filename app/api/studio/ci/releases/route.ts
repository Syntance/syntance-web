import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireCiToken } from '@/lib/studio/ci-auth'
import { StudioHttpError } from '@/lib/studio/license-service'
import { ReleaseInput, registerRelease, setReleasePublished } from '@/lib/studio/releases'
import { errorResponse } from '@/lib/studio/runtime'
import { StorageInputError, presignUpload, r2ConfigFromEnv } from '@/lib/studio/storage'

export const runtime = 'nodejs'

/**
 * Wydania Syntance Studio z CI (folio-pdf, workflow Release): CI wgrywa instalator prosto do R2 (presigned PUT),
 * potem go rejestruje — strona /pobieranie/test pokazuje go od razu. Publikacja na stronie produktu tylko gdy
 * CI wyśle `publish: true` (domyślnie ręcznie w panelu).
 */
const Body = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('presign'),
    version: ReleaseInput.shape.version,
    filename: ReleaseInput.shape.filename,
    size: ReleaseInput.shape.size,
  }),
  ReleaseInput.extend({ action: z.literal('register'), publish: z.boolean().default(false) }),
])

const ACTOR = 'ci:folio-pdf'

export async function POST(req: Request) {
  try {
    requireCiToken(req)
    const input = Body.parse(await req.json().catch(() => null))
    if (input.action === 'presign') {
      const cfg = r2ConfigFromEnv()
      if (!cfg) throw new StudioHttpError(503, 'STORAGE_NOT_CONFIGURED')
      const ref = { kind: 'installer' as const, id: 'app', version: input.version, filename: input.filename }
      return NextResponse.json(await presignUpload(ref, { size: input.size }, cfg), { headers: { 'Cache-Control': 'no-store' } })
    }
    const { action: _action, publish, ...release } = input
    const row = await registerRelease(ACTOR, release)
    if (publish) await setReleasePublished(ACTOR, row.id, true)
    return NextResponse.json({ release: { ...row, published: publish } }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (error instanceof StorageInputError) return errorResponse(new StudioHttpError(400, 'INVALID_INPUT', { message: error.message }))
    return errorResponse(error)
  }
}
