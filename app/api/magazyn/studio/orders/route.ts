import { adminRoute } from '@/lib/studio/admin-api'
import { OrderListParams, listOrders } from '@/lib/studio/admin-queries'

export const runtime = 'nodejs'

export function GET(req: Request) {
  const params = Object.fromEntries(new URL(req.url).searchParams)
  return adminRoute(async () => listOrders(OrderListParams.parse(params)))
}
