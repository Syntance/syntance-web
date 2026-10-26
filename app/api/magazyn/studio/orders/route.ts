import { adminRoute } from '@/lib/studio/admin-api'
import { listOrders } from '@/lib/studio/admin-queries'

export const runtime = 'nodejs'

export function GET() {
  return adminRoute(async () => ({ orders: await listOrders() }))
}
