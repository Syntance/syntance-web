import { adminRoute } from '@/lib/studio/admin-api'
import { getStudioStats } from '@/lib/studio/admin-queries'

export const runtime = 'nodejs'

export function GET() {
  return adminRoute(async () => getStudioStats('studio'))
}
