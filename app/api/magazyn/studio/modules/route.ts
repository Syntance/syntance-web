import { z } from 'zod'
import { adminRoute } from '@/lib/studio/admin-api'
import { RegisterInput, listVersions, registerVersion, setVersionStatus } from '@/lib/studio/modules-store'

export const runtime = 'nodejs'

const Patch = z.object({
  moduleId: z.string().min(2).max(31),
  version: z.string().min(5).max(40),
  status: z.enum(['staged', 'live', 'withdrawn']),
})

export function GET() {
  return adminRoute(async () => ({ versions: await listVersions() }))
}

export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null)
  return adminRoute(async (session) => registerVersion(session.email, RegisterInput.parse(body)))
}

export async function PATCH(req: Request) {
  const body: unknown = await req.json().catch(() => null)
  return adminRoute(async (session) => {
    const input = Patch.parse(body)
    await setVersionStatus(session.email, input.moduleId, input.version, input.status)
    return { ok: true }
  })
}
