import { adminRoute } from '@/lib/studio/admin-api'
import { listAudit } from '@/lib/studio/admin-queries'

export const runtime = 'nodejs'

export function GET() {
  return adminRoute(async () => ({ entries: await listAudit() }))
}
