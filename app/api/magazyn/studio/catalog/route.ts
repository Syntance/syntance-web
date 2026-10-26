import { z } from 'zod'
import { adminRoute } from '@/lib/studio/admin-api'
import { catalogDraft, publishCatalog } from '@/lib/studio/modules-store'

export const runtime = 'nodejs'

const Publish = z.object({ text: z.string().min(2).max(2_000_000), signature: z.string().min(10).max(200) })

/** Szkic katalogu do podpisania lokalnie (pnpm hub:tool sign). */
export function GET() {
  return adminRoute(() => catalogDraft())
}

/** Publikacja: panel sprawdza podpis kluczem publicznym wydawcy i chroni przed cofnięciem. */
export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null)
  return adminRoute(async (session) => {
    const input = Publish.parse(body)
    return publishCatalog(session.email, input.text, input.signature.trim())
  })
}
