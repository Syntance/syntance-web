import { adminRoute } from '@/lib/studio/admin-api'
import { listPlansWithUsage } from '@/lib/studio/admin-queries'
import { PlanInput } from '@/lib/studio/plans'
import { getPlanService } from '@/lib/studio/runtime'

export const runtime = 'nodejs'

export function GET() {
  return adminRoute(async () => ({ plans: await listPlansWithUsage() }))
}

export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null)
  return adminRoute(async (session) => ({ plan: await getPlanService().createPlan(session.email, PlanInput.parse(body)) }))
}
