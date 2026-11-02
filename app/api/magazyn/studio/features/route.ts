import { z } from 'zod'
import { adminRoute } from '@/lib/studio/admin-api'
import { DrizzlePlanStore } from '@/lib/studio/drizzle-plan-store'
import { FeatureInput } from '@/lib/studio/plans'
import { getPlanService } from '@/lib/studio/runtime'

export const runtime = 'nodejs'

export function GET() {
  return adminRoute(async () => ({ features: await new DrizzlePlanStore().listFeatures() }))
}

export async function PUT(req: Request) {
  const body: unknown = await req.json().catch(() => null)
  return adminRoute(async (session) => {
    await getPlanService().upsertFeature(session.email, FeatureInput.parse(body))
    return { ok: true }
  })
}

export async function DELETE(req: Request) {
  const key = z.string().min(1).max(40).parse(new URL(req.url).searchParams.get('key'))
  return adminRoute(async (session) => {
    await getPlanService().deleteFeature(session.email, key)
    return { ok: true }
  })
}
