import { adminRoute } from '@/lib/studio/admin-api'
import { ReleaseInput, listReleases, registerRelease } from '@/lib/studio/releases'

export const runtime = 'nodejs'

export function GET() {
  return adminRoute(async () => ({ releases: await listReleases() }))
}

export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null)
  return adminRoute(async (session) => ({ release: await registerRelease(session.email, ReleaseInput.parse(body)) }))
}
