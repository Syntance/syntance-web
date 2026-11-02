import { z } from 'zod'
import { adminRoute } from '@/lib/studio/admin-api'
import { PlanPatchInput } from '@/lib/studio/plans'
import { getPlanService } from '@/lib/studio/runtime'

export const runtime = 'nodejs'

type Ctx = { params: Promise<{ id: string }> }

const IssueBody = z.object({
  email: z.email().max(254),
  note: z.string().max(500).optional(),
  sendEmail: z.boolean().optional(),
  features: z.array(z.string().min(1).max(40)).max(64).optional(),
  maxDevices: z.number().int().min(1).max(10).optional(),
  untilIso: z.iso.datetime().optional(),
})

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const body: unknown = await req.json().catch(() => null)
  return adminRoute(async (session) => {
    await getPlanService().updatePlan(session.email, z.uuid().parse(id), PlanPatchInput.parse(body))
    return { ok: true }
  })
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params
  return adminRoute(async (session) => {
    await getPlanService().deletePlan(session.email, z.uuid().parse(id))
    return { ok: true }
  })
}

/** Wystawienie licencji z planu (POST /plans/{id}). */
export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const body: unknown = await req.json().catch(() => null)
  return adminRoute(async (session) => ({
    license: await getPlanService().issueFromPlan(session.email, z.uuid().parse(id), IssueBody.parse(body)),
  }))
}
