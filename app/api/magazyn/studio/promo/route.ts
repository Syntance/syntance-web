import { adminRoute } from '@/lib/studio/admin-api'
import { listPromoCodes } from '@/lib/studio/admin-queries'
import { PromoInput } from '@/lib/studio/promo'
import { getPromoService } from '@/lib/studio/runtime'

export const runtime = 'nodejs'

export function GET() {
  return adminRoute(async () => ({ codes: await listPromoCodes('studio') }))
}

export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null)
  return adminRoute(async (session) => ({ code: await getPromoService().create(session.email, PromoInput.parse(body)) }))
}
