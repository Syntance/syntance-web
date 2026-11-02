import { z } from 'zod'
import { adminRoute } from '@/lib/studio/admin-api'
import { getPromoDetail } from '@/lib/studio/admin-queries'
import { StudioHttpError } from '@/lib/studio/license-service'
import { PromoPatchInput } from '@/lib/studio/promo'
import { getPromoService } from '@/lib/studio/runtime'

export const runtime = 'nodejs'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params
  return adminRoute(async () => {
    const detail = z.uuid().safeParse(id).success ? await getPromoDetail(id) : null
    if (!detail) throw new StudioHttpError(404, 'UNKNOWN_CODE')
    return detail
  })
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const body: unknown = await req.json().catch(() => null)
  return adminRoute(async (session) => {
    await getPromoService().update(session.email, z.uuid().parse(id), PromoPatchInput.parse(body))
    return { ok: true }
  })
}
