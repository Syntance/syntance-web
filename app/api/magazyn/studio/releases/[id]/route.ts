import { z } from 'zod'
import { adminRoute } from '@/lib/studio/admin-api'
import { deleteRelease, setReleasePublished } from '@/lib/studio/releases'

export const runtime = 'nodejs'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const body: unknown = await req.json().catch(() => null)
  return adminRoute(async (session) => {
    const { published } = z.object({ published: z.boolean() }).parse(body)
    await setReleasePublished(session.email, z.uuid().parse(id), published)
    return { ok: true }
  })
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params
  return adminRoute(async (session) => {
    await deleteRelease(session.email, z.uuid().parse(id))
    return { ok: true }
  })
}
