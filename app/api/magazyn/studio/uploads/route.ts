import { z } from 'zod'
import { adminRoute } from '@/lib/studio/admin-api'
import { StudioHttpError } from '@/lib/studio/license-service'
import { ARTIFACT_KINDS, StorageInputError, buildObjectKey, headObject, presignUpload, r2ConfigFromEnv } from '@/lib/studio/storage'

export const runtime = 'nodejs'

const Kind = z.enum(['module', 'installer', 'model'] satisfies (keyof typeof ARTIFACT_KINDS)[])
const Ref = z.object({
  kind: Kind,
  id: z.string().min(2).max(31),
  version: z.string().min(5).max(40),
  filename: z.string().min(3).max(100),
})
const Presign = Ref.extend({
  size: z.number().int().positive(),
  contentType: z.string().max(100).optional(),
})

function config() {
  const cfg = r2ConfigFromEnv()
  if (!cfg) throw new StudioHttpError(503, 'STORAGE_NOT_CONFIGURED')
  return cfg
}

/** Presigned PUT do R2 (przeglądarka właściciela wgrywa plik prosto do bucketu). */
export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null)
  return adminRoute(async () => {
    const input = Presign.parse(body)
    try {
      return await presignUpload(input, { size: input.size, contentType: input.contentType }, config())
    } catch (error) {
      if (error instanceof StorageInputError) throw new StudioHttpError(400, 'INVALID_INPUT', { message: error.message })
      throw error
    }
  })
}

/** Potwierdzenie po wgraniu: obiekt istnieje i ma oczekiwany rozmiar. */
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams
  return adminRoute(async () => {
    const ref = Ref.parse({
      kind: params.get('kind'),
      id: params.get('id'),
      version: params.get('version'),
      filename: params.get('filename'),
    })
    try {
      const head = await headObject(buildObjectKey(ref), config())
      return { exists: head !== null, size: head?.size ?? null }
    } catch (error) {
      if (error instanceof StorageInputError) throw new StudioHttpError(400, 'INVALID_INPUT', { message: error.message })
      throw error
    }
  })
}
